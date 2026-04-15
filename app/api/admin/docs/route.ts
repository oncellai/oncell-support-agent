import { NextRequest, NextResponse } from "next/server";
import { getOnCell, getCellId } from "@/lib/oncell";

export async function GET() {
  try {
    const oncell = getOnCell();
    const cellId = getCellId();
    const result = await oncell.cells.request<{ docs: string[] }>(cellId, "list_docs");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { filename, content } = await req.json();
    if (!filename || !content) {
      return NextResponse.json({ error: "filename and content required" }, { status: 400 });
    }

    const oncell = getOnCell();
    const cellId = getCellId();
    const result = await oncell.cells.request<{ added: string; chunks: number }>(
      cellId, "add_doc", { filename, content }
    );
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
