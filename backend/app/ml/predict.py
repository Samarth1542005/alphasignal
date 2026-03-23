import numpy as np
import pandas as pd
import yfinance as yf
import pickle
import os
from tensorflow.keras.models import load_model
from .train import get_cache_paths, is_cached, train_and_cache, SEQ_LEN, CACHE_DIR

def get_predictions(ticker):
    if is_cached(ticker):
        model_path, scaler_path = get_cache_paths(ticker)
        model = load_model(model_path)

        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)

        df = yf.download(ticker, period="2y", interval="1d")
        df = df[["Close"]].dropna()
        scaled = scaler.transform(df[["Close"]])
    else:
        model, scaler, df = train_and_cache(ticker)
        scaled = scaler.transform(df[["Close"]])

    last_seq = scaled[-SEQ_LEN:]
    predictions = []
    current_seq = last_seq.copy()

    for _ in range(7):
        input_seq = current_seq[-SEQ_LEN:].reshape(1, SEQ_LEN, 1)
        pred = model.predict(input_seq, verbose=0)[0][0]
        predictions.append(pred)
        current_seq = np.append(current_seq, [[pred]], axis=0)

    predicted_prices = scaler.inverse_transform(
        np.array(predictions).reshape(-1, 1)
    ).flatten()

    last_date = df.index[-1]
    future_dates = pd.bdate_range(start=last_date + pd.Timedelta(days=1), periods=7)

    result = []
    for date, price in zip(future_dates, predicted_prices):
        result.append({
            "date": date.strftime("%Y-%m-%d"),
            "predicted_price": round(float(price), 2)
        })

    return result