import numpy as np
import pickle
from tensorflow.keras.models import load_model

from .train import (
    get_cache_paths, is_cached, train_and_cache,
    download_and_engineer, SEQ_LEN, N_FEATURES, FEAT_COLS
)


def run_backtest(ticker: str):
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

    scaled_features = feat_scaler.transform(df[FEAT_COLS].values)
    actual_prices   = df["Close"].values.flatten()
    actual_dates    = df.index

    results = []
    for i in range(90, 0, -1):
        end_idx = len(scaled_features) - i
        if end_idx < SEQ_LEN:
            continue

        inp         = scaled_features[end_idx - SEQ_LEN:end_idx].reshape(1, SEQ_LEN, N_FEATURES)
        pred_scaled = model.predict(inp, verbose=0)[0][0]
        pred_price  = close_scaler.inverse_transform([[pred_scaled]])[0][0]

        results.append({
            "date":      actual_dates[end_idx].strftime("%Y-%m-%d"),
            "actual":    round(float(actual_prices[end_idx]), 2),
            "predicted": round(float(pred_price), 2),
        })

    if not results:
        raise ValueError("Not enough data for backtest")

    actuals = np.array([r["actual"]    for r in results])
    preds   = np.array([r["predicted"] for r in results])

    rmse = round(float(np.sqrt(np.mean((actuals - preds) ** 2))), 2)
    mae  = round(float(np.mean(np.abs(actuals - preds))), 2)
    mape = round(float(np.mean(np.abs((actuals - preds) / actuals)) * 100), 2)

    correct_dir = sum(
        1 for i in range(1, len(results))
        if (results[i]["actual"] - results[i-1]["actual"]) *
           (results[i]["predicted"] - results[i-1]["predicted"]) > 0
    )
    directional_accuracy = round(correct_dir / (len(results) - 1) * 100, 1) if len(results) > 1 else 0

    within_2pct = round(
        sum(1 for r in results if abs(r["actual"] - r["predicted"]) / r["actual"] < 0.02)
        / len(results) * 100, 1
    )

    verdict = (
        "good"     if directional_accuracy >= 60 and mape <= 2 else
        "moderate" if directional_accuracy >= 50 and mape <= 5 else
        "poor"
    )

    return {
        "ticker":               ticker,
        "rmse":                 rmse,
        "mae":                  mae,
        "mape":                 mape,
        "directional_accuracy": directional_accuracy,
        "within_2pct":          within_2pct,
        "verdict":              verdict,
        "data_points":          results,
    }