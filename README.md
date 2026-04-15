# Build an AI Support Agent in 5 Minutes — Without Touching Infra

No vector database. No file storage. No conversation store. No infrastructure to manage.

Upload your docs, get a support chatbot that answers customer questions with citations — powered by [OnCell](https://oncell.ai).

[![Demo](https://img.youtube.com/vi/rWIU43pOH5Y/maxresdefault.jpg)](https://youtu.be/rWIU43pOH5Y)

**[Watch the demo (5 min)](https://youtu.be/rWIU43pOH5Y)**

## What you get

- **RAG over your docs** — upload markdown, ask questions, get answers with sources
- **Citations** — every answer shows which doc it came from, click to read the full source
- **Per-customer memory** — conversation history tracked per visitor, automatically
- **Admin panel** — upload and manage docs at `/admin`
- **Zero infra** — storage, search, database, and agent runtime are all handled by OnCell

## How OnCell makes this possible

Traditional support bots need you to stitch together a vector database, file storage, a runtime, and a conversation store. That's four services before you write a single line of agent logic.

OnCell gives you all of that in one call:

```javascript
const cell = await oncell.cells.create({
  customerId: "support-agent",
  agent: agentCode,
});
// cell.store   → file storage (local NVMe)
// cell.search  → full-text + vector search
// cell.db      → key-value database
// All local. All included. Zero config.
```

The agent code in this repo is **one file** (`lib/agent-raw.js`). It reads docs from storage, searches them, calls an LLM, and saves conversation history. That's the entire backend.

## Quick start

```bash
git clone https://github.com/oncellai/oncell-support-agent.git
cd oncell-support-agent
npm install
```

### 1. Get your keys

- **OnCell** — sign up at [oncell.ai](https://oncell.ai), create an API key
- **OpenRouter** — sign up at [openrouter.ai](https://openrouter.ai), create an API key

Add them to `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

### 2. Run setup

Creates an OnCell cell, uploads example docs, indexes them:

```bash
node scripts/setup.js
```

The cell ID is automatically saved to `.env.local`.

### 3. Run

```bash
npm run dev
```

- **Chat** — http://localhost:3000
- **Admin** — http://localhost:3000/admin

That's it. Your support agent is live.

## How it works

```
User asks question
    → search knowledge base
    → build prompt with top results
    → call LLM (OpenRouter)
    → return answer with source citations
```

The agent runs inside an [OnCell](https://oncell.ai) cell — an isolated environment with built-in storage, database, and search. The Next.js app is just the UI. All the heavy lifting happens in the cell.

## Adding your docs

**Option A** — go to `/admin`, paste markdown, click upload.

**Option B** — drop `.md` files in `example-docs/` and re-run `node scripts/setup.js`.

Docs are chunked by `##` and `###` headings. Each section becomes independently searchable. Write your docs with clear headings for best results.

## Architecture

```
Next.js (your app)
├── /              Chat UI
├── /admin         Upload & manage docs
├── /api/chat      POST → calls OnCell cell
└── /api/admin/*   Doc management → calls OnCell cell

OnCell cell (agent infrastructure)
├── store          Docs on local NVMe
├── search         Full-text + vector search
├── db             Per-customer conversation history
└── agent          RAG logic (search → prompt → LLM → answer)
```

## Customization

**Change the LLM** — set `LLM_MODEL` in cell secrets (default: `google/gemini-2.5-flash`). Any [OpenRouter model](https://openrouter.ai/models) works.

**Change the prompt** — edit `lib/agent-raw.js`, the `ask` method. Re-run setup to update the cell.

**Style the chat** — edit `app/page.tsx`. Standard Next.js + Tailwind.

## Project structure

```
app/
  page.tsx                 Chat widget
  admin/page.tsx           Doc management UI
  api/chat/route.ts        Chat endpoint → OnCell cell
  api/admin/docs/          Doc CRUD → OnCell cell
lib/
  oncell.ts                OnCell SDK wrapper
  agent-raw.js             Agent code (runs inside the cell)
scripts/
  setup.js                 One-time cell creation + doc upload
example-docs/              Sample docs
```

## Learn more

- [OnCell](https://oncell.ai) — build AI agents without building infra
- [OnCell docs](https://oncell.ai/docs) — SDK reference, quickstart, pricing
- [Demo video](https://youtu.be/rWIU43pOH5Y) — watch this project built in 5 minutes

## License

Apache-2.0
