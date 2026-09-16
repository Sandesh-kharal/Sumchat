"""
Thin wrapper around the Gemini API.

WHY WRAP IT AT ALL?
Every route (chat, summarize, future features) needs to "talk to an LLM".
If every route imports google.generativeai directly, then:
  - Switching providers (e.g. adding Ollama) means editing every route.
  - Testing is harder (you can't easily fake the LLM call).
By centralizing it here, routes just call `generate()` or `stream_generate()`
and don't care what's underneath.
"""
from typing import AsyncGenerator
from google import genai
from app.config import GEMINI_API_KEY, GEMINI_MODEL

# One client instance, reused across requests (creating a new client per
# request would be wasteful - it manages HTTP connections internally).
_client = genai.Client(api_key=GEMINI_API_KEY)


async def generate(prompt: str, system_instruction: str | None = None) -> str:
    """
    Non-streaming call: waits for the FULL response, then returns it as a string.
    Good for: summarization, where you want the whole result at once anyway.
    """
    response = _client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config={"system_instruction": system_instruction} if system_instruction else None,
    )
    return response.text


async def stream_generate(
    prompt: str, system_instruction: str | None = None
) -> AsyncGenerator[str, None]:
    """
    Streaming call: yields chunks of text AS THEY ARRIVE from Gemini,
    instead of waiting for the full response.

    WHY STREAM?
    For chat, users don't want to stare at a blank screen for 5 seconds
    while the model "thinks". Streaming lets you show text appearing
    word-by-word, like ChatGPT does. This function is an async generator
    (uses `yield`) so FastAPI can forward each chunk to the client the
    moment it arrives.
    """
    stream = _client.models.generate_content_stream(
        model=GEMINI_MODEL,
        contents=prompt,
        config={"system_instruction": system_instruction} if system_instruction else None,
    )
    for chunk in stream:
        if chunk.text:
            yield chunk.text
