"use client";

// Client-side API helpers with job polling.

import type { AnalyzeResult, Highlight, SubtitleOptions, TemplateId } from "./types";

// Read a JSON response defensively.
//
// If the server ever returns an empty body (e.g. an unhandled route error),
// plain r.json() throws the raw English "Unexpected end of JSON input" and the
// user sees a message they cannot act on. Read text first and fail in Korean
// with something actionable instead. The user must never see that raw error.
async function readJson(r: Response): Promise<any> {
  const text = await r.text();
  if (!text) {
    throw new Error(`서버 응답이 없습니다 (HTTP ${r.status}). 앱을 다시 시작해 주세요.`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`서버 응답을 읽지 못했습니다 (HTTP ${r.status}). 앱을 다시 시작해 주세요.`);
  }
}

async function pollJob<T>(jobId: string, onProgress?: (p: number, msg: string) => void): Promise<T> {
  for (;;) {
    const r = await fetch(`/api/jobs/${jobId}`);
    if (!r.ok) throw new Error("작업 상태를 가져오지 못했습니다.");
    const j = await readJson(r);
    onProgress?.(j.progress ?? 0, j.message ?? "");
    if (j.status === "done") return j.result as T;
    if (j.status === "error") throw new Error(j.error || "작업 실패");
    await new Promise((res) => setTimeout(res, 900));
  }
}

export async function analyze(
  url: string,
  apiKey: string,
  targetSec: number,
  onProgress?: (p: number, msg: string) => void,
): Promise<AnalyzeResult> {
  const r = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, apiKey, targetSec }),
  });
  const data = await readJson(r);
  if (!r.ok) throw new Error(data.error || "분석 요청 실패");
  return pollJob<AnalyzeResult>(data.jobId, onProgress);
}

export async function renderShort(
  args: {
    url: string;
    videoId: string;
    highlight: Highlight;
    template: TemplateId;
    subtitles: SubtitleOptions;
    churchName?: string;
  },
  onProgress?: (p: number, msg: string) => void,
): Promise<{ url: string; name: string }> {
  const r = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const data = await readJson(r);
  if (!r.ok) throw new Error(data.error || "렌더 요청 실패");
  return pollJob(data.jobId, onProgress);
}

export async function verifyKey(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch("/api/verify-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  const data = await readJson(r);
  return { ok: !!data.ok, error: data.error as string | undefined };
}

export async function addCustomRange(args: {
  videoId: string;
  startSec: number;
  endSec: number;
  apiKey: string;
}): Promise<Highlight> {
  const r = await fetch("/api/custom-range", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const data = await readJson(r);
  if (!r.ok) throw new Error(data.error || "구간 추가 실패");
  return data.highlight as Highlight;
}
