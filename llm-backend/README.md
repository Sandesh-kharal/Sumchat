# LLM Backend — Gemini + FastAPI

A learning-oriented FastAPI backend that connects to Google's Gemini API to
provide:
- **Streaming chat** (Server-Sent Events)
- **Text summarization** with prompt-controlled styles
- **Rate limiting** per client IP

## Project structure

```
llm-backend/
├── app/
│   ├── main.py            # FastAPI app setup, CORS, rate-limit error handler
│   ├── config.py           # Loads env vars (API key, model name, rate limits)
│   ├── gemini_client.py     # Single wrapper around the Gemini API
│   ├── rate_limiter.py      # slowapi Limiter instance
│   └── routers/
│       ├── chat.py          # POST /chat/stream  (SSE streaming)
│       └── summarize.py     # POST /summarize     (one-shot summary)
├── test_client.html         # Browser page to watch streaming happen live
├── requirements.txt
├── .env.example
└── README.md
```

## Setup

1. **Create a virtual environment** (keeps this project's packages separate
   from other Python projects on your machine):
   ```bash
   python3 -m venv venv
   source venv/bin/activate     

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Get a Gemini API key:** https://aistudio.google.com/apikey

4. **Set up your environment file:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and paste in your real API key.

5. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   You should see it running at `http://127.0.0.1:8000`.

6. **Check it's alive:**
   ```bash
   curl http://127.0.0.1:8000/health
   ```

## Trying it out

### Summarizer
```bash
curl -X POST http://127.0.0.1:8000/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Paste a long paragraph here...", "style": "bullet_points"}'
```
`style` can be `concise`, `bullet_points`, or `detailed`.

### Streaming chat
Open `test_client.html` directly in your browser (double-click it, or
`open test_client.html` on Mac) while the server is running, type a message,
and watch the response stream in word-by-word.

Or via curl (curl will print chunks as they arrive with `-N` for
no-buffering):
```bash
curl -N -X POST http://127.0.0.1:8000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me a short story about a robot."}'
```

### Rate limiting
Hit `/summarize` more than the configured limit (default 20/minute) in
quick succession and you'll get an HTTP `429 Too Many Requests` response.
Try lowering `RATE_LIMIT_SUMMARIZE=2/minute` in `.env` to see it trigger
quickly while testing.

## Key concepts explained

**Why a separate `gemini_client.py`?**
Every feature (chat, summarize, and whatever you add later) needs to call
an LLM. Centralizing that call means you change ONE file if you ever swap
providers or add Ollama support alongside Gemini, instead of hunting
through every route.

**How does streaming actually work?**
The Gemini SDK gives you a Python generator that yields text chunks as the
model produces them. FastAPI's `StreamingResponse` forwards each chunk to
the client immediately over an open HTTP connection, using the
Server-Sent Events (SSE) format (`data: ...\n\n`). The browser reads these
chunks as they arrive instead of waiting for the whole response — that's
what gives you the "typing" effect you see in tools like ChatGPT.

**What is "prompt-controlled"?**
Instead of letting the user write raw prompts (risky — they could try to
override your instructions), you expose *controlled options* (like
`style: "bullet_points"`) and translate those into a system instruction
server-side. See `STYLE_INSTRUCTIONS` in `summarize.py` for the pattern.

**Why rate limit?**
Gemini calls cost money and are subject to quota. Without limits, one
buggy frontend loop or one impatient user clicking a button 50 times can
blow through your budget or quota in minutes. `slowapi` tracks how many
requests each client IP has made recently and rejects excess requests with
a 429 status, cheaply, before you ever call Gemini.

## Next steps to extend this project for free ai api integration

- **Add Ollama support**: create `app/ollama_client.py` with the same
  `generate()` / `stream_generate()` function signatures as
  `gemini_client.py`, then add a `provider` field to requests to choose
  between them at runtime.
- **Add authentication**: rate limit by user ID (from a JWT) instead of
  IP, so limits survive across shared networks/VPNs.
- **Add Redis-backed rate limiting**: needed once you run more than one
  server process, since in-memory counters aren't shared across processes.
- **Add conversation history**: currently each chat request is stateless
  (no memory of previous messages) — you'd store a conversation ID and
  message history, likely in Redis or a database.
