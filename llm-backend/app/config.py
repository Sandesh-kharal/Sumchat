"""
Central place for all configuration/settings.

Why a separate config file?
- Keeps secrets (API keys) out of your code and out of git.
- Gives you ONE place to change settings instead of hunting through files.
"""
import os
from dotenv import load_dotenv

# Loads variables from a ".env" file in the project root into the environment.
# This means you can keep secrets in ".env" (which you NEVER commit to git)
# instead of pasting them into your code.
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    # Fail loudly and early rather than getting a confusing error later
    # when the first request tries to call Gemini.
    raise RuntimeError(
        "GEMINI_API_KEY is not set. Create a .env file (see .env.example) "
        "and add your key there."
    )

# The Gemini model to use. "gemini-2.0-flash" is fast and cheap - good for
# summarization and chat. You can swap this for a more powerful model later.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

# Rate limiting settings - how many requests a single client (by IP) can
# make in a given time window. Tune these based on your API quota/budget.
RATE_LIMIT_CHAT = os.getenv("RATE_LIMIT_CHAT", "10/minute")
RATE_LIMIT_SUMMARIZE = os.getenv("RATE_LIMIT_SUMMARIZE", "20/minute")
