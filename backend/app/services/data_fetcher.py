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


def _safe_fi(fi, *attrs):
    """Try multiple attribute names on fast_info, return first non-None non-zero value."""
    for attr in attrs:
        try:
            val = getattr(fi, attr, None)
            if val is not None and val != 0:
                return val
        except Exception:
            pass
    return None


def get_stock_info(ticker: str):
    try:
        stock = yf.Ticker(ticker)

        # fast_info is lightweight and doesn't hang
        fi = stock.fast_info
        # info can hang for slow tickers; cap at 12 s then fall back to {}
        info = _fetch_info_with_timeout(stock, timeout=12)

        # Try both snake_case and camelCase attribute names across yfinance versions
        current_price = (
            _safe_fi(fi, "last_price", "lastPrice", "regularMarketPrice")
            or info.get("currentPrice", info.get("regularMarketPrice", 0))
        )

        # If we still have no price, the ticker is invalid — return None
        if not current_price:
            print(f"No price found for {ticker} — likely invalid ticker")
            return None

        return {
            "ticker": ticker,
            "name": info.get("longName", info.get("shortName", ticker)),
            "sector": info.get("sector", "N/A"),
            "current_price": current_price,
            "currency": (
                _safe_fi(fi, "currency")
                or info.get("currency", "USD")
            ),
            "market_cap": (
                _safe_fi(fi, "market_cap", "marketCap")
                or info.get("marketCap", 0)
            ),
            "pe_ratio": info.get("trailingPE", 0),
            "52_week_high": (
                _safe_fi(fi, "year_high", "yearHigh", "fiftyTwoWeekHigh")
                or info.get("fiftyTwoWeekHigh", 0)
            ),
            "52_week_low": (
                _safe_fi(fi, "year_low", "yearLow", "fiftyTwoWeekLow")
                or info.get("fiftyTwoWeekLow", 0)
            ),
        }

    except Exception as e:
        print(f"Error fetching info for {ticker}: {e}")
        return None