from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_NAME
from app.routers import stock         
from app.routers import prediction
from app.routers import sentiment

app = FastAPI(
    title=APP_NAME,
    description="AI-powered Stock Prediction & Decision Support System",
    version="1.0.0"
)

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(stock.router)       # ← ADD THIS

@app.get("/")
def root():
    return {
        "app": APP_NAME,
        "status": "AlphaSignal is running 🚀",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

app.include_router(prediction.router)
app.include_router(sentiment.router)

from app.routers import backtest
app.include_router(backtest.router)