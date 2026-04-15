import { NextRequest, NextResponse } from "next/server";
import { getOnCell, getCellId } from "@/lib/oncell";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const oncell = getOnCell();
    const cellId = getCellId();
    const result = await oncell.cells.readFile(cellId, `docs/${filename}`);
    return NextResponse.json({ filename, content: result.content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
