from app.services.indicators import get_all_indicators

def get_decision(ticker: str, period: str = "1y"):
    data = get_all_indicators(ticker, period)

    if data is None:
        return None

    latest = data["latest"]
    score = 0
    reasons = []

    rsi = latest["rsi"]
    macd_line = latest["macd_line"]
    signal_line = latest["signal_line"]
    histogram = latest["histogram"]
    close = latest["close"]
    upper_band = latest["upper_band"]
    lower_band = latest["lower_band"]
    middle_band = latest["middle_band"]
    sma20 = latest["sma20"]
    sma50 = latest["sma50"]

    if rsi is not None:
        if rsi < 30:
            score += 2
            reasons.append(f"RSI is {rsi} — stock is oversold, potential BUY opportunity")
        elif rsi > 70:
            score -= 2
            reasons.append(f"RSI is {rsi} — stock is overbought, potential SELL signal")
        else:
            reasons.append(f"RSI is {rsi} — stock is in neutral zone")

    if histogram is not None and macd_line is not None and signal_line is not None:
        if histogram > 0 and macd_line > signal_line:
            score += 2
            reasons.append(f"MACD is bullish — momentum is increasing, BUY signal")
        elif histogram < 0 and macd_line < signal_line:
            score -= 2
            reasons.append(f"MACD is bearish — momentum is decreasing, SELL signal")
        else:
            reasons.append(f"MACD is neutral — no clear momentum signal")

    if close is not None and sma20 is not None and sma50 is not None:
        if close > sma20 and close > sma50:
            score += 2
            reasons.append(f"Price is above SMA20 and SMA50 — strong uptrend, bullish signal")
        elif close < sma20 and close < sma50:
            score -= 2
            reasons.append(f"Price is below SMA20 and SMA50 — strong downtrend, bearish signal")
        else:
            reasons.append(f"Price is between SMA20 and SMA50 — mixed trend signals")

    if close is not None and upper_band is not None and lower_band is not None and middle_band is not None:
        band_range = upper_band - lower_band
        if band_range > 0:
            position = (close - lower_band) / band_range
            if position < 0.2:
                score += 1
                reasons.append(f"Price is near lower Bollinger Band — possible reversal upward")
            elif position > 0.8:
                score -= 1
                reasons.append(f"Price is near upper Bollinger Band — possible reversal downward")
            else:
                reasons.append(f"Price is within Bollinger Bands — normal volatility range")

    if upper_band is not None and lower_band is not None and middle_band is not None:
        band_width = (upper_band - lower_band) / middle_band * 100
        if band_width > 10:
            risk = "HIGH"
        elif band_width > 5:
            risk = "MEDIUM"
        else:
            risk = "LOW"
    else:
        risk = "MEDIUM"

    if score >= 4:
        decision = "BUY"
        confidence = min(50 + (score * 8), 95)
    elif score <= -4:
        decision = "SELL"
        confidence = min(50 + (abs(score) * 8), 95)
    else:
        decision = "HOLD"
        confidence = 50 + (abs(score) * 5)

    return {
        "ticker": ticker,
        "decision": decision,
        "confidence": round(confidence, 1),
        "score": score,
        "risk": risk,
        "reasons": reasons,
        "latest": latest
    }