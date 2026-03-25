import numpy as np
import yfinance as yf
from .train import get_cache_paths, is_cached, train_and_cache, SEQ_LEN
from .predict import get_predictions
from tensorflow.keras.models import load_model
import pickle

def run_backtest(ticker):
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

    actual_prices = df["Close"].values.flatten()
    actual_dates = df.index

    backtest_days = 30
    results = []

    for i in range(backtest_days, 0, -1):
        end_idx = len(scaled) - i
        if end_idx < SEQ_LEN:
            continue

        input_seq = scaled[end_idx - SEQ_LEN:end_idx].reshape(1, SEQ_LEN, 1)
        pred_scaled = model.predict(input_seq, verbose=0)[0][0]
        pred_price = scaler.inverse_transform([[pred_scaled]])[0][0]
        actual_price = float(actual_prices[end_idx])
        date_str = actual_dates[end_idx].strftime("%Y-%m-%d")

        results.append({
            "date": date_str,
            "actual": round(actual_price, 2),
            "predicted": round(float(pred_price), 2)
        })

    if not results:
        raise ValueError("Not enough data for backtest")

    actuals = np.array([r["actual"] for r in results])
    preds = np.array([r["predicted"] for r in results])

    rmse = round(float(np.sqrt(np.mean((actuals - preds) ** 2))), 2)
    mae = round(float(np.mean(np.abs(actuals - preds))), 2)
    mape = round(float(np.mean(np.abs((actuals - preds) / actuals)) * 100), 2)

    correct_direction = 0
    total_direction = 0
    for i in range(1, len(results)):
        actual_dir = results[i]["actual"] - results[i-1]["actual"]
        pred_dir = results[i]["predicted"] - results[i-1]["predicted"]
        if actual_dir * pred_dir > 0:
            correct_direction += 1
        total_direction += 1

    directional_accuracy = round((correct_direction / total_direction) * 100, 1) if total_direction > 0 else 0

    if directional_accuracy >= 60 and mape <= 2:
        verdict = "good"
    elif directional_accuracy >= 50 and mape <= 5:
        verdict = "moderate"
    else:
        verdict = "poor"

    return {
        "ticker": ticker,
        "rmse": rmse,
        "mae": mae,
        "mape": mape,
        "directional_accuracy": directional_accuracy,
        "verdict": verdict,
        "data_points": results
    }