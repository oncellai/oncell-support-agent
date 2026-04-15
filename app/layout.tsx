import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support Agent — Powered by OnCell",
  description: "AI customer support with RAG over your docs. Open source.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
        {children}
      </body>
    </html>
  );
}
