"""
Application entrypoint. Run with:
    uvicorn app.main:app --reload

WHAT THIS FILE DOES:
1. Creates the FastAPI app.
2. Registers the rate limiter with the app (so @limiter.limit works).
3. Registers a handler for when a rate limit is exceeded (returns a clean
   429 "Too Many Requests" response instead of a crash).
4. Includes the chat and summarize routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.rate_limiter import limiter
from app.routers import chat, summarize

app = FastAPI(
    title="LLM Backend (Gemini)",
    description="Streaming chat, summarization, and rate-limited LLM access.",
    version="0.1.0",
)

# --- Rate limiting wiring ---
# `app.state.limiter` is where slowapi expects to find the limiter instance.
app.state.limiter = limiter
# When a client exceeds their limit, slowapi raises RateLimitExceeded.
# This handler turns that into a proper HTTP 429 response.
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS ---
# Allows a frontend running on a different origin (e.g. localhost:3000)
# to call this API from the browser. Tighten allow_origins in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---
app.include_router(chat.router)
app.include_router(summarize.router)


@app.get("/health")
async def health_check():
    """Simple endpoint to confirm the server is running."""
    return {"status": "ok"}
