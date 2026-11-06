import { NextResponse } from "next/server";

// Every API route must always answer with JSON — even when it fails.
//
// If a handler throws, Next.js returns an empty 500 body and the client shows
// the raw English "Unexpected end of JSON input" (reported 2026-11-07: the
// analyze route 500'd because yt-dlp-wrap's dist was missing from the
// standalone build). Catch everything here and answer with a Korean error
// instead, so the user always gets something readable and actionable.
export async function guardJson(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn();
  } catch (e) {
    console.error("[api]", e);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 앱을 다시 시작해 주세요." },
      { status: 500 },
    );
  }
}
