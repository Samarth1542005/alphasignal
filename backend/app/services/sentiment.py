import os
from newsapi import NewsApiClient
from transformers import pipeline
import yfinance as yf
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

finbert = None

IRRELEVANT_KEYWORDS = [
    "toothpick", "chicken", "hair dryer", "freezer bag", "macbook",
    "walgreens", "declutter", "spring clean", "wallpaper", "slickdeals",
    "coupon", "deal", "recipe", "fashion", "beauty", "lifestyle",
    "dealnews", "amazon deal", "sale", "discount"
]

def get_finbert():
    global finbert
    if finbert is None:
        finbert = pipeline("sentiment-analysis", model="ProsusAI/finbert")
    return finbert

def get_company_name(ticker):
    try:
        info = yf.Ticker(ticker).info
        return info.get("shortName") or info.get("longName") or ticker
    except:
        return ticker

def is_relevant(title, clean_ticker, short_name):
    title_lower = title.lower()
    if any(kw in title_lower for kw in IRRELEVANT_KEYWORDS):
        return False
    if clean_ticker.lower() in title_lower:
        return True
    if short_name.lower() in title_lower:
        return True
    return False

def analyze_sentiment(ticker):
    company = get_company_name(ticker)
    clean_ticker = ticker.replace(".NS", "").replace(".BO", "")
    short_name = company.split(" ")[0]

    newsapi = NewsApiClient(api_key=NEWS_API_KEY)

    response = newsapi.get_everything(
        q=f'"{clean_ticker}" OR "{short_name} stock" OR "{short_name} shares" OR "{short_name} NSE"',
        language="en",
        sort_by="relevancy",
        page_size=20
    )

    articles = response.get("articles", [])

    if not articles:
        return {
            "ticker": ticker,
            "company": company,
            "overall_sentiment": "neutral",
            "positive_pct": 0,
            "negative_pct": 0,
            "neutral_pct": 100,
            "headline_count": 0,
            "headlines": [],
            "message": "No news found for this stock."
        }

    model = get_finbert()

    headlines = []
    scores = {"positive": 0, "negative": 0, "neutral": 0}

    for article in articles:
        title = article.get("title", "")
        if not title or title == "[Removed]":
            continue

        if not is_relevant(title, clean_ticker, short_name):
            continue

        result = model(title[:512])[0]
        label = result["label"].lower()
        score = round(result["score"], 4)

        scores[label] += 1

        headlines.append({
            "title": title,
            "sentiment": label,
            "score": score,
            "source": article.get("source", {}).get("name", ""),
            "url": article.get("url", ""),
            "published_at": article.get("publishedAt", "")
        })

    total = len(headlines)

    if total == 0:
        return {
            "ticker": ticker,
            "company": company,
            "overall_sentiment": "neutral",
            "positive_pct": 0,
            "negative_pct": 0,
            "neutral_pct": 100,
            "headline_count": 0,
            "headlines": [],
            "message": "No relevant news found for this stock."
        }

    overall = max(scores, key=scores.get)
    positive_pct = round((scores["positive"] / total) * 100)
    negative_pct = round((scores["negative"] / total) * 100)
    neutral_pct = round((scores["neutral"] / total) * 100)

    return {
        "ticker": ticker,
        "company": company,
        "overall_sentiment": overall,
        "positive_pct": positive_pct,
        "negative_pct": negative_pct,
        "neutral_pct": neutral_pct,
        "headline_count": total,
        "headlines": headlines
    }