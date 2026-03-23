import yfinance as yf
import pandas as pd

def get_stock_history(ticker: str, period: str = "1y", interval: str = None):
    try:
        stock = yf.Ticker(ticker)

        if interval is None:
            if period == "1d":
                interval = "5m"
            elif period == "5d":
                interval = "1h"
            elif period == "1mo":
                interval = "1h"
            else:
                interval = "1d"

        if period == "1d":
            df = stock.history(period="1d", interval="5m")
        else:
            df = stock.history(period=period, interval=interval)

        if df.empty:
            return None

        df = df.reset_index()

        date_col = "Datetime" if "Datetime" in df.columns else "Date"
        df = df.rename(columns={date_col: "Date"})

        df["Date"] = pd.to_datetime(df["Date"])

        if hasattr(df["Date"].dt, "tz") and df["Date"].dt.tz is not None:
            df["Date"] = df["Date"].dt.tz_localize(None)

        if period == "1d":
            df["Date"] = df["Date"].dt.strftime("%H:%M")
        elif period in ["5d", "1mo"]:
            df["Date"] = df["Date"].dt.strftime("%d %b %H:%M")
        else:
            df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")

        df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]
        df = df.round(2)

        return df.to_dict(orient="records")

    except Exception as e:
        print(f"Error fetching history for {ticker}: {e}")
        return None


def get_stock_info(ticker: str):
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