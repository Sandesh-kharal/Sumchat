# LLM Console — React + Tailwind + shadcn-style frontend

A minimal frontend for the `llm-backend` FastAPI project: a Chat tab
(streaming) and a Summarize tab (one-shot), styled as a small dev console.

## Project structure

```
llm-frontend/
├── index.html                 # HTML shell, loads src/main.jsx
├── vite.config.js             # build tool config + "@" import alias
├── tailwind.config.js         # which files Tailwind scans for classes
├── postcss.config.js          # wires Tailwind into the CSS build step
├── package.json                # dependency list + npm scripts
├── .env.example                 # backend URL config
└── src/
    ├── main.jsx                 # mounts <App /> into the page
    ├── App.jsx                  # page layout: header + tabs
    ├── index.css                 # Tailwind imports + small global styles
    ├── lib/
    │   ├── utils.js               # `cn()` helper used by every UI component
    │   └── api.js                  # reads the backend URL from env
    └── components/
        ├── ChatPanel.jsx            # streaming chat logic
        ├── SummarizePanel.jsx        # one-shot summarize logic
        └── ui/                        # shadcn-style primitives you own
            ├── button.jsx
            ├── textarea.jsx
            ├── card.jsx
            └── tabs.jsx
```

## Setup

1. **Make sure your backend is running first** (see the `llm-backend`
   project's README) at `http://127.0.0.1:8000`.

2. **Install Node.js** if you don't have it: https://nodejs.org (LTS
   version). Check with `node --version` - you want 18 or newer.

3. **Install dependencies:**
   ```bash
   cd llm-frontend
   npm install
   ```
   This reads `package.json` and downloads React, Tailwind, Radix UI,
   etc. into a `node_modules` folder (this can take a minute, and you'll
   never need to look inside that folder).

4. **(Optional) Set up your `.env`:**
   ```bash
   cp .env.example .env
   ```
   Only needed if your backend runs somewhere other than
   `http://127.0.0.1:8000`.

5. **Start the dev server:**
   ```bash
   npm run dev
   ```
   Vite will print a URL, usually `http://localhost:5173`. Open it in
   your browser.

You should now have both servers running at once, in two terminal tabs:
- Terminal 1: `uvicorn app.main:app --reload` (backend, port 8000)
- Terminal 2: `npm run dev` (frontend, port 5173)

