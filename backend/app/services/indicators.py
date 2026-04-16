import pandas as pd
import numpy as np
import yfinance as yf
import math
import concurrent.futures


def _fetch_history_with_timeout(ticker: str, period: str, timeout: int = 20):
    """Fetch stock history with a hard timeout to avoid hanging requests."""
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(lambda: yf.Ticker(ticker).history(period=period))
        try:
            return future.result(timeout=timeout)
        except concurrent.futures.TimeoutError:
            return None

def clean_nan(value):
    """Replace NaN/Inf with None so JSON doesn't crash"""
    if value is None:
        return None
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    return value

def clean_list(lst):
    """Clean an entire list of values"""
    return [clean_nan(x) for x in lst]

def calculate_rsi(closes: pd.Series, period: int = 14) -> pd.Series:
    """
    RSI — Relative Strength Index
    - Above 70 = Overbought (possible SELL signal)
    - Below 30 = Oversold (possible BUY signal)
    - Between 30-70 = Neutral
    """
    delta = closes.diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.round(2)


def calculate_macd(closes: pd.Series):
    """
    MACD — Moving Average Convergence Divergence
    - MACD crossing above signal = BUY signal
    - MACD crossing below signal = SELL signal
    """
    ema12 = closes.ewm(span=12, adjust=False).mean()
    ema26 = closes.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    histogram = macd_line - signal_line
    return (
        macd_line.round(2),
        signal_line.round(2),
        histogram.round(2)
    )


def calculate_bollinger_bands(closes: pd.Series, period: int = 20):
    """
    Bollinger Bands
    - Price above upper band = Overbought
    - Price below lower band = Oversold
    """
    sma = closes.rolling(window=period).mean()
    std = closes.rolling(window=period).std()
    upper_band = sma + (2 * std)
    lower_band = sma - (2 * std)
    return (
        upper_band.round(2),
        sma.round(2),
        lower_band.round(2)
    )


def calculate_sma(closes: pd.Series, period: int) -> pd.Series:
    """
    Simple Moving Average
    - SMA20 = short term trend
    - SMA50 = long term trend
    """
    return closes.rolling(window=period).mean().round(2)


def get_all_indicators(ticker: str, period: str = "1y"):
    """
    Master function — fetches stock data and calculates
    ALL indicators in one go.
    """
    try:
        df = _fetch_history_with_timeout(ticker, period, timeout=20)

        if df is None or df.empty:
            return None

        closes = df["Close"]

        # Calculate all indicators
        rsi = calculate_rsi(closes)
        macd_line, signal_line, histogram = calculate_macd(closes)
        upper_band, middle_band, lower_band = calculate_bollinger_bands(closes)
        sma20 = calculate_sma(closes, 20)
        sma50 = calculate_sma(closes, 50)

        # Reset index so Date becomes a column
        df = df.reset_index()
        df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")

        dates = df["Date"].tolist()
        close_prices = clean_list(closes.round(2).tolist())

        # Get latest non-NaN values safely
        def latest(series):
            val = series.dropna().iloc[-1] if not series.dropna().empty else None
            return clean_nan(float(val)) if val is not None else None

        return {
            "ticker": ticker,
            "dates": dates,
            "closes": close_prices,
            "rsi": clean_list(rsi.tolist()),
            "macd": {
                "macd_line": clean_list(macd_line.tolist()),
                "signal_line": clean_list(signal_line.tolist()),
                "histogram": clean_list(histogram.tolist())
            },
            "bollinger_bands": {
                "upper": clean_list(upper_band.tolist()),
                "middle": clean_list(middle_band.tolist()),
                "lower": clean_list(lower_band.tolist())
            },
            "sma": {
                "sma20": clean_list(sma20.tolist()),
                "sma50": clean_list(sma50.tolist())
            },
            # Latest values for decision engine
            "latest": {
                "close": latest(closes),
                "rsi": latest(rsi),
                "macd_line": latest(macd_line),
                "signal_line": latest(signal_line),
                "histogram": latest(histogram),
                "upper_band": latest(upper_band),
                "middle_band": latest(middle_band),
                "lower_band": latest(lower_band),
                "sma20": latest(sma20),
                "sma50": latest(sma50),
            }
        }

    except Exception as e:
        print(f"Error calculating indicators for {ticker}: {e}")
        return None
