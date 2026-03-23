from fastapi import APIRouter, HTTPException
from app.services.data_fetcher import get_stock_history, get_stock_info
from app.services.indicators import get_all_indicators
from app.services.decision_engine import get_decision

router = APIRouter(
    prefix="/api/stock",
    tags=["Stock Data"]
)

@router.get("/{ticker}/history")
def stock_history(ticker: str, period: str = "1y"):
    data = get_stock_history(ticker.upper(), period)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found or no data available")
    return {
        "ticker": ticker.upper(),
        "period": period,
        "count": len(data),
        "data": data
    }


@router.get("/{ticker}/info")
def stock_info(ticker: str):
    data = get_stock_info(ticker.upper())
    if data is None:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")
    return data


@router.get("/{ticker}/indicators")
def stock_indicators(ticker: str, period: str = "1y"):
    data = get_all_indicators(ticker.upper(), period)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Could not calculate indicators for '{ticker}'")
    return data


@router.get("/{ticker}/decision")
def stock_decision(ticker: str):
    data = get_decision(ticker.upper())
    if data is None:
        raise HTTPException(status_code=404, detail=f"Could not generate decision for '{ticker}'")
    return data


@router.get("/{ticker}/summary")
def stock_summary(ticker: str, period: str = "1y"):
    ticker = ticker.upper()
    decision_data = get_decision(ticker, period)
    if decision_data is None:
        raise HTTPException(status_code=404, detail=f"Could not generate summary for '{ticker}'")
    info_data = get_stock_info(ticker)
    return {
        "ticker": ticker,
        "info": info_data,
        "decision": decision_data["decision"],
        "confidence": decision_data["confidence"],
        "score": decision_data["score"],
        "risk": decision_data["risk"],
        "reasons": decision_data["reasons"],
        "indicators": decision_data["latest"]
    }
