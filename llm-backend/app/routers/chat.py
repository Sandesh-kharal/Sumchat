"""
Real-time streaming chat endpoint.

CONCEPT: Server-Sent Events (SSE)
SSE is a simple, one-way streaming protocol built on plain HTTP. The server
keeps the HTTP connection open and sends small chunks of data as they
become ready, each prefixed with "data: ". The browser's EventSource API
(or a simple fetch + reader on the frontend) can read these as they arrive.

Why SSE instead of WebSockets here?
- WebSockets are two-way (client can send anytime) - overkill for
  "one prompt in, streamed text out".
- SSE works over plain HTTP, is simpler to implement and debug, and is
  exactly what ChatGPT-style streaming UIs typically use under the hood.
"""
import json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.gemini_client import stream_generate
from app.rate_limiter import limiter
from app.config import RATE_LIMIT_CHAT

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    # Optional system instruction lets the CALLER shape the assistant's
    # behavior per-request (e.g. "reply only in French") - another example
    # of a prompt-controlled feature.
    system_instruction: str | None = None


async def sse_event_stream(message: str, system_instruction: str | None):
    """
    Wraps stream_generate() chunks into the SSE wire format:
        data: <json>\n\n
    Each chunk is JSON so the frontend can parse it reliably (raw text
    could contain characters that break naive parsing).
    """
    try:
        async for chunk in stream_generate(message, system_instruction):
            payload = json.dumps({"type": "chunk", "text": chunk})
            yield f"data: {payload}\n\n"
        # A final event tells the client "the model is done talking" -
        # without this, the frontend has no clean way to know when to
        # stop showing a "typing" indicator.
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    except Exception as exc:
        error_payload = json.dumps({"type": "error", "message": str(exc)})
        yield f"data: {error_payload}\n\n"


@router.post("/stream")
@limiter.limit(RATE_LIMIT_CHAT)
async def chat_stream(request: Request, body: ChatRequest):
    return StreamingResponse(
        sse_event_stream(body.message, body.system_instruction),
        media_type="text/event-stream",
        headers={
            # Prevents proxies/browsers from buffering the stream, which
            # would defeat the purpose of streaming.
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
