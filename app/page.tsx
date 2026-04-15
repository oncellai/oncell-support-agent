"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Citation {
  index: number;
  source: string;
  excerpt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

interface ModalState {
  filename: string;
  content: string | null;
  loading: boolean;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [customerId] = useState(() => {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("oncell_customer_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("oncell_customer_id", id);
    }
    return id;
  });

  const scrollToBottom = useCallback(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, customer_id: customerId }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
      } else {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.answer,
          citations: data.citations,
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function sendSuggestion(q: string) {
    setInput(q);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function resetChat() {
    setMessages([]);
    setInput("");
  }

  async function openSource(filename: string) {
    // Extract just the filename (e.g. "docs/billing.md#Pricing Plans" → "billing.md")
    const clean = filename.split("/").pop()?.split("#")[0] || filename;
    setModal({ filename: clean, content: null, loading: true });

    try {
      const res = await fetch(`/api/admin/docs/${encodeURIComponent(clean)}`);
      const data = await res.json();
      setModal({ filename: clean, content: data.content || data.error || "Could not load document", loading: false });
    } catch {
      setModal({ filename: clean, content: "Failed to load document", loading: false });
    }
  }

  function renderMarkdown(text: string) {
    return text
      .replace(/\s*\[Source \d+\]/g, '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*\s+/g, '<br>- ')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.06);padding:1px 4px;border-radius:3px;font-size:12px">$1</code>')
      .replace(/\n/g, '<br>');
  }

  function renderDocContent(text: string) {
    return text
      .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) =>
        `<pre style="background:rgba(255,255,255,0.04);padding:12px 14px;border-radius:8px;margin:8px 0;font-size:12px;overflow-x:auto;border:1px solid var(--border)"><code>${code.trim()}</code></pre>`
      )
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.06);padding:1px 5px;border-radius:3px;font-size:12px">$1</code>')
      .replace(/^# (.+)/gm, '<h1 style="font-size:18px;font-weight:600;color:var(--text);margin:16px 0 8px">$1</h1>')
      .replace(/^## (.+)/gm, '<h2 style="font-size:15px;font-weight:600;color:var(--text);margin:14px 0 6px">$1</h2>')
      .replace(/^### (.+)/gm, '<h3 style="font-size:13px;font-weight:600;color:var(--text);margin:10px 0 4px">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)/gm, '<div style="padding-left:12px">&bull; $1</div>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div
        className="w-full max-w-[640px] flex flex-col h-[calc(100vh-2rem)] max-h-[820px] rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.02), 0 24px 80px -12px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
              >
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="6" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                  <circle cx="16" cy="16" r="3.5" fill="var(--accent)"/>
                </svg>
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: "var(--green)", borderColor: "var(--surface)" }}
              />
            </div>
            <div>
              <div className="font-medium text-[15px]" style={{ color: "var(--text)" }}>Support</div>
              <div className="text-[11px]" style={{ color: "var(--text-dim)" }}>Online</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                className="text-[11px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-dim)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                New chat
              </button>
            )}
            <a
              href="/admin"
              className="text-[11px] px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-dim)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              Admin
            </a>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="6" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                  <circle cx="16" cy="16" r="3.5" fill="var(--accent)"/>
                </svg>
              </div>
              <h2 className="text-[17px] font-medium mb-1.5" style={{ color: "var(--text)" }}>How can we help?</h2>
              <p className="text-[13px] max-w-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                Ask anything about our product. I&apos;ll search our docs and give you an answer with sources.
              </p>
              <div className="flex flex-col gap-2 mt-7 w-full max-w-sm">
                {["How do I reset my password?", "What are the pricing plans?", "How do I use the API?"].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendSuggestion(q)}
                    className="text-[13px] text-left px-4 py-3 rounded-xl transition-all"
                    style={{ color: "var(--text-dim)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--text)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-slide-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              style={{ animationDelay: `${Math.min(i, 2) * 40}ms` }}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
                  <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="4" width="24" height="24" rx="6" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                    <circle cx="16" cy="16" r="3.5" fill="var(--accent)"/>
                  </svg>
                </div>
              )}
              <div
                className={`px-4 py-3 max-w-[80%] ${msg.role === "user" ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-tl-md"}`}
                style={msg.role === "user" ? { background: "var(--accent)", color: "#0a0a0a" } : { background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
              >
                <div className="text-[14px] leading-[1.7]" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    {msg.citations.map((c) => {
                      const name = c.source.split("/").pop()?.split("#")[0] || c.source;
                      return (
                        <button
                          key={c.index}
                          onClick={() => openSource(c.source)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md transition-all hover:opacity-80"
                          style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                        >
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
                <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="6" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                  <circle cx="16" cy="16" r="3.5" fill="var(--accent)"/>
                </svg>
              </div>
              <div className="rounded-2xl rounded-tl-md px-4 py-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-typing" style={{ background: "var(--accent)" }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-typing-2" style={{ background: "var(--accent)" }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-typing-3" style={{ background: "var(--accent)" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              autoComplete="off"
              className="w-full rounded-xl pl-4 pr-12 py-3.5 text-[14px] transition-all focus:outline-none"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text)" }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent-border)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-15"
              style={{ background: "var(--accent)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Powered by{" "}
              <a href="https://oncell.ai" target="_blank" rel="noopener noreferrer" className="transition-colors hover:opacity-60" style={{ color: "var(--accent)" }}>
                oncell
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* Source Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col animate-slide-up"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 24px 80px -12px rgba(0,0,0,0.8)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-[14px] font-medium" style={{ color: "var(--text)" }}>{modal.filename}</span>
              </div>
              <button
                onClick={() => setModal(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-dim)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
              {modal.loading ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : (
                <div
                  className="text-[13px] leading-[1.8]"
                  style={{ color: "var(--text-dim)" }}
                  dangerouslySetInnerHTML={{ __html: renderDocContent(modal.content || "") }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
