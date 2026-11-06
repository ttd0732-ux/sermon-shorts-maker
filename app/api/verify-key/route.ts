import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { guardJson } from "@/lib/routeGuard";

export const runtime = "nodejs";

// Lightweight key check: list models (validates the key, no generation cost).
// Returns { ok: true } for a valid key, { ok: false } otherwise — never throws
// a bare error, so the client always gets JSON.
export async function POST(req: NextRequest) {
  return guardJson(async () => {
    const { apiKey } = await req.json();
    const key = (apiKey as string) || process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ ok: false, error: "키를 입력하세요." });
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const pager = await ai.models.list({ config: { pageSize: 1 } });
      for await (const _m of pager) break; // force the first page fetch
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false, error: "키가 올바르지 않습니다. 키를 확인해 주세요." });
    }
  });
}
