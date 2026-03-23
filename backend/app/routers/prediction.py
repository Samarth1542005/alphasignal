from fastapi import APIRouter, HTTPException
from app.ml.predict import get_predictions

router = APIRouter()

@router.get("/api/stock/{ticker}/predict")
def predict_stock(ticker: str):
    try:
        predictions = get_predictions(ticker)
        return {
            "ticker": ticker,
            "predictions": predictions,
            "days": 7
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")