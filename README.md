# oncell-support-agent

AI customer support agent that answers questions from your docs — with citations.

Upload markdown files, and your customers get instant answers sourced directly from your documentation. Each customer gets their own conversation history. Every answer links back to the source.

Built with [Next.js](https://nextjs.org) and [OnCell](https://oncell.ai).

![chat screenshot](https://oncell.ai/oss/support-agent-chat.png)

## What it does

- **RAG over your docs** — upload markdown, it gets chunked by heading and indexed for search
- **Citations** — every answer shows which doc it came from, click to see the full source
- **Per-customer memory** — conversation history is tracked per visitor, automatically
- **Admin panel** — upload and manage docs from `/admin`
- **One API call** — the entire backend (storage, search, database, agent runtime) is a single OnCell cell

## How it works

```
User asks question
    → search knowledge base (vector + text)
    → build prompt with top 5 results
    → call LLM (OpenRouter)
    → return answer with source citations
```

The agent code runs inside an [OnCell](https://oncell.ai) cell — an isolated environment with built-in storage, database, and search. No infrastructure to set up. No vector database to manage. No file storage to configure.

OnCell handles all of that in one primitive: the cell.

## Quick start

```bash
git clone https://github.com/oncellai/oncell-support-agent.git
cd oncell-support-agent
npm install
```

### 1. Get your keys

- **OnCell** — sign up at [oncell.ai](https://oncell.ai), create an API key
- **OpenRouter** — sign up at [openrouter.ai](https://openrouter.ai), create an API key

### 2. Run setup

This creates an OnCell cell, uploads the example docs, and indexes them:

```bash
ONCELL_API_KEY=oncell_sk_... OPENROUTER_API_KEY=sk-or-... node scripts/setup.js
```

### 3. Configure

Copy the cell ID from the setup output into `.env.local`:

```bash
cp .env.example .env.local
```

```
ONCELL_API_KEY=oncell_sk_...
ONCELL_CELL_ID=dev-xxxxxxxx--support-agent
```

### 4. Run

```bash
npm run dev
```

- **Chat** — http://localhost:3000
- **Admin** — http://localhost:3000/admin

## Adding your docs

**Option A: Admin UI** — go to `/admin`, paste markdown, click upload.

**Option B: File system** — drop `.md` files in `example-docs/` and re-run `node scripts/setup.js`.

Docs are chunked by `##` and `###` headings. Each section becomes independently searchable. Write your docs with clear headings for best results.

## Architecture

```
Next.js (your app)
├── /              Chat UI
├── /admin         Upload & manage docs
├── /api/chat      POST → calls OnCell cell
└── /api/admin/*   Doc management → calls OnCell cell

OnCell cell (agent infrastructure)
├── store          Docs stored on local NVMe
├── search         Full-text + vector search index
├── db             Per-customer conversation history
└── agent          RAG logic (search → prompt → LLM → answer)
```

Everything the agent needs — storage, search, database — lives inside the cell. The Next.js app is just the UI layer. You can swap it for any frontend, or skip it entirely and call the cell directly.

## Customization

**Change the LLM** — set `LLM_MODEL` in your cell secrets (default: `google/gemini-2.5-flash`). Any [OpenRouter model](https://openrouter.ai/models) works.

**Change the system prompt** — edit `lib/agent-raw.js`, the `ask` method. Re-run setup to update the cell.

**Style the chat** — it's a standard Next.js app with Tailwind. Edit `app/page.tsx`.

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
example-docs/              Sample docs (account, billing, API, etc.)
```

## Why OnCell

Traditional support bots need you to stitch together a vector database, file storage, a runtime, and a conversation store. That's four services before you write a single line of agent logic.

OnCell gives you all of that in one call:

```javascript
const cell = await oncell.cells.create({
  customerId: "support-agent",
  agent: agentCode,
});
// cell.store   → file storage
// cell.search  → vector search
// cell.db      → key-value database
// All local. All included. Zero config.
```

Learn more at [oncell.ai](https://oncell.ai).

## License

Apache-2.0
