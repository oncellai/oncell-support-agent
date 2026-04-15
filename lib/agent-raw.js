// oncell-support-agent — AI customer support with RAG over your docs
// Runs inside an OnCell cell. All primitives (store, db, search) are local (0ms).

module.exports = {
  // Index all uploaded docs for search
  async index_docs(ctx) {
    const files = ctx.store.list("docs");
    let totalChunks = 0;

    for (const file of files) {
      const content = ctx.store.read(`docs/${file}`);
      if (!content) continue;

      const chunks = chunkMarkdown(content, file);
      for (const chunk of chunks) {
        ctx.search.index(`docs/${file}#${chunk.heading}`, chunk.text);
        totalChunks++;
      }
    }

    return { indexed: totalChunks, files: files.length };
  },

  // Main RAG endpoint: search docs + LLM + conversation history
  async ask(ctx, params) {
    const { question, customer_id } = params;
    if (!question) return { error: "question is required" };
    if (!customer_id) return { error: "customer_id is required" };

    // 1. Load conversation history
    const history = ctx.db.get(`conv:${customer_id}`) || [];

    // 2. Search knowledge base
    const results = ctx.search.query(question, 5);

    // 3. Build sources block
    const sourcesBlock = results.length > 0
      ? results.map((r, i) => `[Source ${i + 1}: ${r.path}]\n${r.content}`).join("\n\n---\n\n")
      : "No relevant sources found in the knowledge base.";

    // 4. Build LLM messages
    const messages = [
      {
        role: "system",
        content: `You are a helpful customer support agent. Answer using ONLY the provided sources. If the sources don't contain the answer, say "I don't have information about that in our docs. Let me connect you with our team."

Cite sources using [Source N] notation. Be concise and friendly.

## Knowledge Base

${sourcesBlock}`
      },
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: question }
    ];

    // 5. Call LLM
    const model = process.env.LLM_MODEL || "google/gemini-2.5-flash";
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 1024 })
    });

    if (!res.ok) {
      const err = await res.text();
      return { error: `LLM call failed: ${res.status}`, details: err };
    }

    const data = await res.json();
    const answer = data.choices[0].message.content;

    // 6. Extract citations actually referenced in the answer
    const citations = results
      .map((r, i) => ({ index: i + 1, source: r.path, excerpt: r.content.slice(0, 200) }))
      .filter(c => answer.includes(`[Source ${c.index}]`));

    // 7. Save conversation history (keep last 20 messages)
    history.push(
      { role: "user", content: question, ts: new Date().toISOString() },
      { role: "assistant", content: answer, ts: new Date().toISOString() }
    );
    ctx.db.set(`conv:${customer_id}`, history.slice(-20));

    return { answer, citations, sources_found: results.length };
  },

  async get_history(ctx, params) {
    return { messages: ctx.db.get(`conv:${params.customer_id}`) || [] };
  },

  async clear_history(ctx, params) {
    ctx.db.delete(`conv:${params.customer_id}`);
    return { cleared: true };
  },

  async list_docs(ctx) {
    return { docs: ctx.store.list("docs") };
  },

  async add_doc(ctx, params) {
    const { filename, content } = params;
    if (!filename || !content) return { error: "filename and content are required" };
    ctx.store.write(`docs/${filename}`, content);
    const chunks = chunkMarkdown(content, filename);
    for (const chunk of chunks) {
      ctx.search.index(`docs/${filename}#${chunk.heading}`, chunk.text);
    }
    return { added: filename, chunks: chunks.length };
  },
};

function chunkMarkdown(content, filename) {
  const lines = content.split("\n");
  const chunks = [];
  let current = { heading: "intro", lines: [] };

  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("### ")) {
      if (current.lines.length > 0) {
        chunks.push({ heading: current.heading, text: current.lines.join("\n") });
      }
      current = { heading: line.replace(/^#+\s*/, "").trim(), lines: [line] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length > 0) {
    chunks.push({ heading: current.heading, text: current.lines.join("\n") });
  }
  return chunks;
}
