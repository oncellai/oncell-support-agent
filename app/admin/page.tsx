"use client";

import { useState, useEffect } from "react";

export default function Admin() {
  const [docs, setDocs] = useState<string[]>([]);
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  async function fetchDocs() {
    setDocsLoading(true);
    try {
      const res = await fetch("/api/admin/docs");
      const data = await res.json();
      setDocs(data.docs || []);
    } catch {
      setDocs([]);
    }
    setDocsLoading(false);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!filename || !content) return;
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/admin/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, content }),
      });
      const data = await res.json();

      if (data.error) {
        setStatus({ type: "error", text: data.error });
      } else {
        setStatus({ type: "success", text: `${data.added} uploaded — ${data.chunks} chunks indexed` });
        setFilename("");
        setContent("");
        fetchDocs();
      }
    } catch {
      setStatus({ type: "error", text: "Upload failed" });
    }
    setLoading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFilename(file.name);
    file.text().then(setContent);
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="font-medium text-[15px]">Knowledge Base</span>
          </div>
          <a
            href="/"
            className="text-[11px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-dim)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat
          </a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-xl font-semibold mb-1.5">Knowledge Base</h1>
          <p className="text-[13px]" style={{ color: "var(--text-dim)" }}>
            Upload markdown docs to power the support agent. Sections split by <code className="px-1 py-0.5 rounded text-[12px]" style={{ background: "rgba(255,255,255,0.04)" }}>##</code> headings become searchable chunks.
          </p>
        </div>

        {/* Docs list */}
        <div className="mb-10">
          <h2 className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Indexed Documents
          </h2>
          {docsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-11 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-10 rounded-xl" style={{ background: "rgba(255,255,255,0.01)", border: "1px dashed var(--border)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2" style={{ color: "var(--text-muted)" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>No documents yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {docs.map((doc) => (
                <div
                  key={doc}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span className="text-[13px]" style={{ color: "var(--text-dim)" }}>{doc}</span>
                  <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--green)" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)" }}>
          <h2 className="text-[11px] font-medium uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>
            Upload Document
          </h2>

          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>Filename</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="faq.md"
                className="w-full rounded-xl px-4 py-3 text-[13px] transition-all focus:outline-none"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text)" }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent-border)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>Content</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className="relative rounded-xl transition-all"
                style={dragOver ? { boxShadow: "0 0 0 2px var(--accent)" } : {}}
              >
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={"## Getting Started\n\nWrite your docs here.\nUse ## headings to create searchable sections."}
                  rows={14}
                  className="w-full rounded-xl px-4 py-3 text-[13px] transition-all focus:outline-none font-mono leading-relaxed resize-none"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text)" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent-border)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                />
                {!content && (
                  <div className="absolute bottom-4 right-4 text-[11px] pointer-events-none" style={{ color: "var(--text-muted)" }}>
                    or drop a .md file
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading || !filename || !content}
                className="px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all disabled:opacity-25 flex items-center gap-2"
                style={{ background: "var(--accent)", color: "#0a0a0a" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Indexing...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload &amp; Index
                  </>
                )}
              </button>
              {status && (
                <p className="text-[13px] animate-fade-in" style={{ color: status.type === "success" ? "var(--green)" : "#ef4444" }}>
                  {status.text}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Powered by{" "}
            <a href="https://oncell.ai" target="_blank" rel="noopener noreferrer" className="transition-colors hover:opacity-60" style={{ color: "var(--accent)" }}>
              oncell
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
