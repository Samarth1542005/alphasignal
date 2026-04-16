import numpy as np
import pandas as pd
import pickle
from tensorflow.keras.models import load_model

from .train import (
    get_cache_paths, is_cached, train_and_cache,
    download_and_engineer, SEQ_LEN, N_FEATURES, FEAT_COLS
)


def _load_artifacts(ticker: str):
    if is_cached(ticker):
        mp, sp, fp = get_cache_paths(ticker)
        model = load_model(mp)
        with open(sp, "rb") as f:
            close_scaler = pickle.load(f)
        with open(fp, "rb") as f:
            feat_scaler = pickle.load(f)
        df = download_and_engineer(ticker)
    else:
        model, close_scaler, feat_scaler, df = train_and_cache(ticker)
    return model, close_scaler, feat_scaler, df


def get_predictions(ticker: str, sentiment_score: float = 0.0):
    """
    Predict 7 business days ahead.
    sentiment_score: float [-1, 1] from FinBERT (0.0 = ignore)
    """
    model, close_scaler, feat_scaler, df = _load_artifacts(ticker)

    scaled_features = feat_scaler.transform(df[FEAT_COLS].values)

    current_window  = scaled_features[-SEQ_LEN:].copy()
    last_aux        = scaled_features[-1, 1:].copy()   # Volume, RSI, MACD, Signal, BB_PCT, VOLATILITY, VOL_RATIO
    raw_preds       = []

    for _ in range(7):
        inp  = current_window[-SEQ_LEN:].reshape(1, SEQ_LEN, N_FEATURES)
        pred = model.predict(inp, verbose=0)[0][0]
        raw_preds.append(pred)
        current_window = np.vstack([current_window, np.concatenate([[pred], last_aux])])

    predicted_prices = close_scaler.inverse_transform(
        np.array(raw_preds).reshape(-1, 1)
    ).flatten()

    # Gentle sentiment nudge (max ±1.5%, decays over 7 days)
    if sentiment_score != 0.0:
        for i in range(len(predicted_prices)):
            decay = 1 - (i / len(predicted_prices))
            predicted_prices[i] *= (1 + sentiment_score * 0.015 * decay)

    last_date    = df.index[-1]
    future_dates = pd.bdate_range(start=last_date + pd.Timedelta(days=1), periods=7)

    return [
        {"date": d.strftime("%Y-%m-%d"), "predicted_price": round(float(p), 2)}
        for d, p in zip(future_dates, predicted_prices)
    ]
