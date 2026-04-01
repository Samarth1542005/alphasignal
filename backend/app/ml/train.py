import numpy as np
import pandas as pd
import yfinance as yf
import pickle
import os
from datetime import date
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam

# ── Constants ────────────────────────────────────────────────────────────────
SEQ_LEN    = 120        # 2x original (60), still lightweight
N_FEATURES = 5          # Close, Volume, RSI, MACD, MACD_Signal
DATA_PERIOD = "3y"      # good balance of history vs. download/training time
CACHE_DIR  = os.path.join(os.path.dirname(__file__), "..", "cache", "models")


# ── Cache helpers (daily key so model auto-refreshes each day) ───────────────
def get_cache_paths(ticker):
    safe  = ticker.replace(".", "_")
    today = date.today().strftime("%Y%m%d")
    base  = os.path.join(CACHE_DIR, f"{safe}_{today}")
    return base + "_model.keras", base + "_scaler.pkl", base + "_feat_scaler.pkl"

def is_cached(ticker):
    mp, sp, fp = get_cache_paths(ticker)
    return os.path.exists(mp) and os.path.exists(sp) and os.path.exists(fp)


# ── Feature engineering ──────────────────────────────────────────────────────
def add_features(df: pd.DataFrame) -> pd.DataFrame:
    close = df["Close"]

    delta = close.diff()
    gain  = delta.clip(lower=0).rolling(14).mean()
    loss  = (-delta.clip(upper=0)).rolling(14).mean()
    df["RSI"] = 100 - (100 / (1 + gain / (loss + 1e-9)))

    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    df["MACD"]        = ema12 - ema26
    df["MACD_Signal"] = df["MACD"].ewm(span=9, adjust=False).mean()

    return df.dropna()

def download_and_engineer(ticker: str) -> pd.DataFrame:
    raw = yf.download(ticker, period=DATA_PERIOD, interval="1d", auto_adjust=True)
    df  = raw[["Close", "Volume"]].copy()
    return add_features(df)


# ── Sequence builder ─────────────────────────────────────────────────────────
def build_sequences(scaled_features, scaled_close):
    X, y = [], []
    for i in range(SEQ_LEN, len(scaled_features)):
        X.append(scaled_features[i - SEQ_LEN:i])
        y.append(scaled_close[i, 0])
    return np.array(X), np.array(y)


# ── Lightweight 2-layer model (M4 Air friendly) ──────────────────────────────
def build_model():
    model = Sequential([
        LSTM(128, return_sequences=True, input_shape=(SEQ_LEN, N_FEATURES)),
        BatchNormalization(),
        Dropout(0.2),

        LSTM(64, return_sequences=False),
        BatchNormalization(),
        Dropout(0.2),

        Dense(32, activation="relu"),
        Dense(1)
    ])
    model.compile(optimizer=Adam(learning_rate=1e-3), loss="huber")
    return model


# ── Train + cache ────────────────────────────────────────────────────────────
def train_and_cache(ticker: str):
    os.makedirs(CACHE_DIR, exist_ok=True)

    df = download_and_engineer(ticker)
    if len(df) < SEQ_LEN + 50:
        raise ValueError(f"Not enough data for {ticker}")

    feat_cols    = ["Close", "Volume", "RSI", "MACD", "MACD_Signal"]
    feat_scaler  = MinMaxScaler()
    close_scaler = MinMaxScaler()

    scaled_features = feat_scaler.fit_transform(df[feat_cols].values)
    scaled_close    = close_scaler.fit_transform(df[["Close"]].values)

    X, y  = build_sequences(scaled_features, scaled_close)
    split = int(len(X) * 0.8)

    model = build_model()
    model.fit(
        X[:split], y[:split],
        epochs=50,                          # reduced from 100
        batch_size=64,                      # larger batch = fewer steps = faster
        validation_data=(X[split:], y[split:]),
        callbacks=[
            EarlyStopping(monitor="val_loss", patience=8, restore_best_weights=True),
            ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=4, min_lr=1e-5),
        ],
        verbose=0,
    )

    model_path, scaler_path, feat_scaler_path = get_cache_paths(ticker)
    model.save(model_path)
    with open(scaler_path, "wb") as f:
        pickle.dump(close_scaler, f)
    with open(feat_scaler_path, "wb") as f:
        pickle.dump(feat_scaler, f)

    return model, close_scaler, feat_scaler, df