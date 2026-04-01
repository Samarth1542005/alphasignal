"""
sentiment_service.py
~~~~~~~~~~~~~~~~~~~~
Robust news sentiment for any ticker using a tiered approach:

Tier 1 — NewsAPI  (fast, broad coverage)
Tier 2 — Yahoo Finance RSS  (free, no key needed, good for US stocks)
Tier 3 — Finnhub  (great for less-covered stocks, needs free API key)

Each headline is scored with FinBERT. Returns a full response matching
the SentimentPanel frontend component.
"""

from __future__ import annotations

import os
import logging
import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET
from functools import lru_cache
from typing import List

import numpy as np

logger = logging.getLogger(__name__)


# ── Lazy-load FinBERT ───────────────────────────────────────────────────────────
@lru_cache(maxsize=1)
def _get_finbert():
    from transformers import pipeline
    return pipeline(
        "text-classification",
        model="ProsusAI/finbert",
        tokenizer="ProsusAI/finbert",
        device=-1,
        top_k=None,
        truncation=True,
        max_length=512,
    )

LABEL_MAP = {"positive": 1.0, "negative": -1.0, "neutral": 0.0}


# ── Score a single headline → (weighted_score, label, confidence) ───────────────
def _score_one(text: str):
    pipe     = _get_finbert()
    result   = pipe(text[:512])[0]          # list of {label, score}
    weighted = sum(LABEL_MAP[r["label"]] * r["score"] for r in result)
    top      = max(result, key=lambda r: r["score"])
    return weighted, top["label"], round(top["score"], 4)


# ── Fetchers ────────────────────────────────────────────────────────────────────
def _fetch_newsapi(ticker: str, company_name: str = "") -> List[dict]:
    api_key = os.getenv("NEWSAPI_KEY", "")
    if not api_key:
        return []
    query = urllib.parse.quote(f"{ticker} OR {company_name}" if company_name else ticker)
    url   = (
        f"https://newsapi.org/v2/everything"
        f"?q={query}&language=en&sortBy=publishedAt&pageSize=10"
        f"&apiKey={api_key}"
    )
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read())
            return [
                {
                    "title":        a.get("title", ""),
                    "url":          a.get("url", ""),
                    "source":       a.get("source", {}).get("name", "NewsAPI"),
                    "published_at": a.get("publishedAt", ""),
                }
                for a in data.get("articles", []) if a.get("title")
            ]
    except Exception as e:
        logger.warning("NewsAPI failed for %s: %s", ticker, e)
        return []


def _fetch_yahoo_rss(ticker: str) -> List[dict]:
    url = f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={ticker}&region=US&lang=en-US"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AlphaSignal/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            root    = ET.fromstring(resp.read())
            results = []
            for item in root.findall(".//item")[:15]:
                title = item.findtext("title") or ""
                if title:
                    results.append({
                        "title":        title,
                        "url":          item.findtext("link") or "",
                        "source":       "Yahoo Finance",
                        "published_at": item.findtext("pubDate") or "",
                    })
            return results
    except Exception as e:
        logger.warning("Yahoo RSS failed for %s: %s", ticker, e)
        return []


def _fetch_finnhub(ticker: str) -> List[dict]:
    api_key = os.getenv("FINNHUB_KEY", "")
    if not api_key:
        return []
    from datetime import date, timedelta
    today = date.today().strftime("%Y-%m-%d")
    week  = (date.today() - timedelta(days=7)).strftime("%Y-%m-%d")
    url   = (
        f"https://finnhub.io/api/v1/company-news"
        f"?symbol={ticker}&from={week}&to={today}&token={api_key}"
    )
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            return [
                {
                    "title":        a.get("headline", ""),
                    "url":          a.get("url", ""),
                    "source":       a.get("source", "Finnhub"),
                    "published_at": str(a.get("datetime", "")),
                }
                for a in json.loads(resp.read())[:15] if a.get("headline")
            ]
    except Exception as e:
        logger.warning("Finnhub failed for %s: %s", ticker, e)
        return []


def _dedupe(articles: List[dict]) -> List[dict]:
    seen, out = set(), []
    for a in articles:
        key = a["title"].lower().strip()
        if key not in seen:
            seen.add(key)
            out.append(a)
    return out


# ── Neutral response helper ─────────────────────────────────────────────────────
def _neutral_response(ticker: str, message: str = "No relevant news found.") -> dict:
    return {
        "ticker":            ticker,
        "headline_count":    0,
        "overall_sentiment": "neutral",
        "positive_pct":      0,
        "neutral_pct":       100,
        "negative_pct":      0,
        "score":             0.0,
        "source":            "none",
        "message":           message,
        "headlines":         [],
    }


# ── Public API ──────────────────────────────────────────────────────────────────
def get_sentiment_score(ticker: str, company_name: str = "") -> dict:
    """
    Returns a dict matching SentimentPanel.jsx:
    {
        ticker, headline_count, overall_sentiment,
        positive_pct, neutral_pct, negative_pct,
        score, source,
        headlines: [{ title, url, source, published_at, sentiment, score }]
    }
    """
    articles: List[dict] = []
    articles.extend(_fetch_newsapi(ticker, company_name))
    articles.extend(_fetch_yahoo_rss(ticker))
    if len(articles) < 5:
        articles.extend(_fetch_finnhub(ticker))

    articles = _dedupe(articles)

    if len(articles) < 3:
        return _neutral_response(ticker)

    # Score each headline
    scored = []
    for a in articles:
        try:
            weighted, label, confidence = _score_one(a["title"])
            scored.append({
                "title":        a["title"],
                "url":          a["url"],
                "source":       a["source"],
                "published_at": a["published_at"],
                "sentiment":    label,        # "positive" | "negative" | "neutral"
                "score":        confidence,   # shown as "XX% Conf." in the UI
            })
        except Exception as e:
            logger.warning("Scoring failed: %s", e)

    if not scored:
        return _neutral_response(ticker, "Sentiment scoring failed.")

    # Aggregate
    n            = len(scored)
    pos_count    = sum(1 for s in scored if s["sentiment"] == "positive")
    neu_count    = sum(1 for s in scored if s["sentiment"] == "neutral")
    neg_count    = sum(1 for s in scored if s["sentiment"] == "negative")
    positive_pct = round(pos_count / n * 100)
    neutral_pct  = round(neu_count / n * 100)
    negative_pct = round(neg_count / n * 100)

    overall_score = float(np.mean([LABEL_MAP[s["sentiment"]] * s["score"] for s in scored]))

    if overall_score >= 0.15:
        overall_sentiment = "positive"
    elif overall_score <= -0.15:
        overall_sentiment = "negative"
    else:
        overall_sentiment = "neutral"

    return {
        "ticker":            ticker,
        "headline_count":    n,
        "overall_sentiment": overall_sentiment,
        "positive_pct":      positive_pct,
        "neutral_pct":       neutral_pct,
        "negative_pct":      negative_pct,
        "score":             round(overall_score, 4),
        "source":            "+".join(sorted({a["source"] for a in articles})),
        "headlines":         scored,
    }