from fastapi import APIRouter, HTTPException
from app.services.sentiment import analyze_sentiment

router = APIRouter()

@router.get("/api/stock/{ticker}/sentiment")
def get_sentiment(ticker: str):
    try:
        result = analyze_sentiment(ticker)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")