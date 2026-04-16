import yfinance as yf
import pandas as pd
import concurrent.futures

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


def _fetch_info_with_timeout(stock, timeout: int = 12):
    """Fetch stock.info with a hard timeout to avoid hanging requests."""
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(lambda: stock.info)
        try:
            return future.result(timeout=timeout)
        except concurrent.futures.TimeoutError:
            return {}


def get_stock_info(ticker: str):
    try:
        stock = yf.Ticker(ticker)

        # fast_info is lightweight — no heavy HTTP calls
        fi   = stock.fast_info
        # info can hang; cap it at 12 seconds then fall back to empty dict
        info = _fetch_info_with_timeout(stock, timeout=12)

        return {
            "ticker": ticker,
            "name": info.get("longName", ticker),
            "sector": info.get("sector", "N/A"),
            "current_price": (
                getattr(fi, "last_price", None)
                or info.get("currentPrice", info.get("regularMarketPrice", 0))
            ),
            "currency": (
                getattr(fi, "currency", None)
                or info.get("currency", "USD")
            ),
            "market_cap": (
                getattr(fi, "market_cap", None)
                or info.get("marketCap", 0)
            ),
            "pe_ratio": info.get("trailingPE", 0),
            "52_week_high": (
                getattr(fi, "year_high", None)
                or info.get("fiftyTwoWeekHigh", 0)
            ),
            "52_week_low": (
                getattr(fi, "year_low", None)
                or info.get("fiftyTwoWeekLow", 0)
            ),
        }

    except Exception as e:
        print(f"Error fetching info for {ticker}: {e}")
        return None