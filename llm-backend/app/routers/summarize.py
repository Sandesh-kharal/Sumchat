"""
Text summarization endpoint.

This is a NON-streaming endpoint: the client sends text, waits, and gets
back one complete summary. Summaries are usually short enough that
streaming doesn't add much value, and it's simpler to build first.
"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field

from app.gemini_client import generate
from app.rate_limiter import limiter
from app.config import RATE_LIMIT_SUMMARIZE

router = APIRouter(prefix="/summarize", tags=["summarize"])


class SummarizeRequest(BaseModel):
    # Pydantic validates incoming JSON automatically. If the client sends
    # bad data (e.g. missing "text"), FastAPI returns a clean 422 error
    # WITHOUT you writing any manual validation code.
    text: str = Field(..., min_length=1, max_length=20000)
    style: str = Field(
        default="concise",
        description="One of: concise, bullet_points, detailed",
    )


class SummarizeResponse(BaseModel):
    summary: str


# HOW PROMPT-CONTROLLED FEATURES WORK:
# The client picks a "style", and we translate that into a system
# instruction that steers the model's behavior. This is the core pattern
# behind "prompt-controlled features": user-facing options map to
# different prompts under the hood, without exposing raw prompts to users.
STYLE_INSTRUCTIONS = {
    "concise": "Summarize the text in 2-3 sentences. Be direct and clear.",
    "bullet_points": "Summarize the text as 3-6 short bullet points.",
    "detailed": "Write a thorough paragraph summary covering all key points.",
}


@router.post("", response_model=SummarizeResponse)
@limiter.limit(RATE_LIMIT_SUMMARIZE)
async def summarize_text(request: Request, body: SummarizeRequest):
    # NOTE: `request: Request` is required as the first param for slowapi's
    # @limiter.limit decorator to work - it inspects the request to find
    # the caller's IP address.
    instruction = STYLE_INSTRUCTIONS.get(body.style)
    if instruction is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown style '{body.style}'. Choose from: {list(STYLE_INSTRUCTIONS)}",
        )

    try:
        summary = await generate(prompt=body.text, system_instruction=instruction)
    except Exception as exc:
        # In production you'd log `exc` properly (not just return it to the
        # client) - but for learning purposes seeing the real error helps.
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {exc}")

    return SummarizeResponse(summary=summary)
