from fastapi import APIRouter, HTTPException
from app.ml.backtest import run_backtest
import traceback

router = APIRouter()

@router.get("/api/stock/{ticker}/backtest")
def backtest_stock(ticker: str):
    try:
        result = run_backtest(ticker)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("BACKTEST ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")