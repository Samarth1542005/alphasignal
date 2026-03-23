import yfinance as yf
import pandas as pd
from datetime import datetime

def get_stock_history(ticker: str, period: str = "1y"):
    """
    Fetch historical OHLCV data for a given stock ticker.
    
    ticker: e.g. "TCS.NS" or "AAPL"
    period: "1mo", "3mo", "6mo", "1y", "2y"
    """
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period=period)

        if df.empty:
            return None

        # Reset index so Date becomes a column
        df = df.reset_index()

        # Keep only the columns we need
        df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]

        # Format date to string so it can be sent as JSON
        df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")

        # Round prices to 2 decimal places
        df = df.round(2)

        return df.to_dict(orient="records")

    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None


def get_stock_info(ticker: str):
    """
    Fetch basic stock info — name, sector, current price etc.
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        return {
            "ticker": ticker,
            "name": info.get("longName", ticker),
            "sector": info.get("sector", "N/A"),
            "current_price": info.get("currentPrice", info.get("regularMarketPrice", 0)),
            "currency": info.get("currency", "USD"),
            "market_cap": info.get("marketCap", 0),
            "pe_ratio": info.get("trailingPE", 0),
            "52_week_high": info.get("fiftyTwoWeekHigh", 0),
            "52_week_low": info.get("fiftyTwoWeekLow", 0),
        }

    except Exception as e:
        print(f"Error fetching info for {ticker}: {e}")
        return None