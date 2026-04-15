import { NextRequest, NextResponse } from "next/server";
import { getOnCell, getCellId } from "@/lib/oncell";

export async function POST(req: NextRequest) {
  try {
    const { question, customer_id } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const oncell = getOnCell();
    const cellId = getCellId();

    const result = await oncell.cells.request<{
      answer: string;
      citations: { index: number; source: string; excerpt: string }[];
      sources_found: number;
      error?: string;
    }>(cellId, "ask", {
      question,
      customer_id: customer_id || "anonymous",
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("chat error:", err.message);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
