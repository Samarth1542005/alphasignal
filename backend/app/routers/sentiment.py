from fastapi import APIRouter, HTTPException
from app.services.sentiment import get_sentiment_score

router = APIRouter()

@router.get("/api/stock/{ticker}/sentiment")
def get_sentiment(ticker: str):
    try:
        result = get_sentiment_score(ticker)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")