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
    """
    Get historical price data for a stock.
    Example: /api/stock/TCS.NS/history
    Example: /api/stock/AAPL/history?period=6mo
    """
    data = get_stock_history(ticker.upper(), period)

    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Stock '{ticker}' not found or no data available"
        )

    return {
        "ticker": ticker.upper(),
        "period": period,
        "count": len(data),
        "data": data
    }


@router.get("/{ticker}/info")
def stock_info(ticker: str):
    """
    Get basic stock information.
    Example: /api/stock/TCS.NS/info
    """
    data = get_stock_info(ticker.upper())

    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Stock '{ticker}' not found"
        )

    return data


@router.get("/{ticker}/indicators")
def stock_indicators(ticker: str, period: str = "1y"):
    """
    Get all technical indicators for a stock.
    Example: /api/stock/TCS.NS/indicators
    """
    data = get_all_indicators(ticker.upper(), period)

    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Could not calculate indicators for '{ticker}'"
        )

    return data

@router.get("/{ticker}/decision")
def stock_decision(ticker: str):
    data = get_decision(ticker.upper())

    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Could not generate decision for '{ticker}'"
        )

    return data