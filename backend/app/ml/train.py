import numpy as np
import pandas as pd
import yfinance as yf
import pickle
import os
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

SEQ_LEN = 60
CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "cache", "models")

def get_cache_paths(ticker):
    safe_ticker = ticker.replace(".", "_")
    model_path = os.path.join(CACHE_DIR, f"{safe_ticker}_model.h5")
    scaler_path = os.path.join(CACHE_DIR, f"{safe_ticker}_scaler.pkl")
    return model_path, scaler_path

def is_cached(ticker):
    model_path, scaler_path = get_cache_paths(ticker)
    return os.path.exists(model_path) and os.path.exists(scaler_path)

def train_and_cache(ticker):
    os.makedirs(CACHE_DIR, exist_ok=True)

    df = yf.download(ticker, period="2y", interval="1d")
    df = df[["Close"]].dropna()

    if len(df) < SEQ_LEN + 10:
        raise ValueError(f"Not enough data for {ticker}")

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled = scaler.fit_transform(df[["Close"]])

    X, y = [], []
    for i in range(SEQ_LEN, len(scaled)):
        X.append(scaled[i - SEQ_LEN:i, 0])
        y.append(scaled[i, 0])

    X, y = np.array(X), np.array(y)
    X = X.reshape((X.shape[0], X.shape[1], 1))

    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(SEQ_LEN, 1)),
        Dropout(0.2),
        LSTM(64, return_sequences=False),
        Dropout(0.2),
        Dense(32, activation="relu"),
        Dense(1)
    ])

    model.compile(optimizer="adam", loss="mean_squared_error")

    early_stop = EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)

    model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=32,
        validation_data=(X_test, y_test),
        callbacks=[early_stop],
        verbose=0
    )

    model_path, scaler_path = get_cache_paths(ticker)
    model.save(model_path)

    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)

    return model, scaler, df