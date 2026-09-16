"""
Rate limiting setup.

CONCEPT: A rate limiter tracks "how many requests has this client made
recently?" and rejects requests once they cross a threshold (e.g. "10 per
minute"). We identify "a client" by IP address here - simple and works
without requiring login. If you add user accounts later, you'd key on
user ID instead for more accuracy.

We use `slowapi`, which stores counters in memory by default (fine for a
single-process app/learning project). For production with multiple server
processes, you'd point it at Redis instead so all processes share counts.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# get_remote_address reads the client's IP from the incoming request.
# This becomes the "key" the limiter uses to track request counts per-client.
limiter = Limiter(key_func=get_remote_address)
