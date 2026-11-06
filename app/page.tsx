"use client";

import { useState } from "react";
import SetupForm, { type SetupValues } from "@/components/SetupForm";
import HighlightList from "@/components/HighlightList";
import DesignStep from "@/components/DesignStep";
import ResultList, { type RenderedItem } from "@/components/ResultList";
import { analyze, renderShort } from "@/lib/client";
import type { AnalyzeResult, Highlight, SubtitleOptions, TemplateId } from "@/lib/types";
import { DEFAULT_TITLE_STYLE } from "@/lib/types";

// 4단계: 1 링크 입력 → 2 쇼츠 목록 → 3 디자인 선택 → 4 다운로드·올리기
type Step = "setup" | "analyzing" | "select" | "design" | "publish";

const STEP_LABELS = ["1 링크", "2 쇼츠 목록", "3 디자인", "4 다운로드·올리기"];

function stepIndex(step: Step): number {
  if (step === "setup" || step === "analyzing") return 0;
  if (step === "select") return 1;
  if (step === "design") return 2;
  return 3;
}

export default function Home() {
  const [step, setStep] = useState<Step>("setup");
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState("");

  const [setup, setSetup] = useState<SetupValues | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [subtitles, setSubtitles] = useState<SubtitleOptions>({
    enabled: true,
    size: "large",
    position: "band",
  });
  // 3단계에서 고른 디자인 (기본 다크). 렌더링은 이 디자인 하나로 한다.
  const [design, setDesign] = useState<TemplateId>("dark");
  const [items, setItems] = useState<RenderedItem[]>([]);

  // Back to a clean start for a different sermon link. Everything here belongs
  // to the previous video, so stale highlights/results can't leak across.
  function handleHome() {
    setItems([]);
    setAnalysis(null);
    setHighlights([]);
    setError("");
    setProgress(0);
    setProgressMsg("");
    setStep("setup");
  }

  async function handleAnalyze(v: SetupValues) {
    setSetup(v);
    setError("");
    setStep("analyzing");
    setProgress(0);
    try {
      const res = await analyze(v.url, v.apiKey, v.targetSec, (p, m) => {
        setProgress(p);
        setProgressMsg(m);
      });
      setAnalysis(res);
      setHighlights(res.highlights);
      setStep("select");
    } catch (e) {
      setError(String((e as Error).message));
      setStep("setup");
    }
  }

  async function renderOne(h: Highlight, v: SetupValues, template: TemplateId) {
    const update = (patch: Partial<RenderedItem>) =>
      setItems((prev) => prev.map((it) => (it.highlight.id === h.id ? { ...it, ...patch } : it)));
    try {
      update({ status: "rendering", progress: 0, message: "준비 중..." });
      const out = await renderShort(
        {
          url: v.url,
          videoId: analysis!.meta.videoId,
          highlight: h,
          template,
          churchName: v.churchName,
          // The clip's own look wins; this is only a fallback.
          subtitles: h.subtitles ?? subtitles,
        },
        (p, m) => update({ progress: p, message: m }),
      );
      // cache-bust so re-renders refresh the player
      update({ status: "done", url: `${out.url}?t=${Date.now()}`, name: out.name });
    } catch (e) {
      update({ status: "error", error: String((e as Error).message) });
    }
  }

  // 2단계에서 고른 쇼츠를 확정하고 3단계(디자인 선택)로 간다. 아직 렌더링하지 않는다.
  function handleCreate(selected: Highlight[]) {
    if (!setup || !analysis) return;
    // Freeze the current settings onto each clip. From here on every clip owns
    // its own look, so the result screen can tweak one without touching the rest.
    const baked = selected.map((h) => ({
      ...h,
      subtitles: h.subtitles ?? subtitles,
      titleStyle: h.titleStyle ?? DEFAULT_TITLE_STYLE,
    }));
    setItems(
      baked.map((h) => ({ highlight: h, status: "pending", progress: 0, message: "대기 중" })),
    );
    setStep("design");
  }

  // 3단계에서 디자인을 확정하면 그 디자인 하나로 모두 렌더링하고 4단계로 간다.
  async function handleDesignConfirm(designId: TemplateId) {
    if (!setup) return;
    setDesign(designId);
    setStep("publish");
    // render sequentially (source download is shared/cached; ffmpeg is CPU-bound)
    for (const it of items) {
      await renderOne(it.highlight, setup, designId);
    }
  }

  async function handleRerender(highlightId: string, patch: Partial<Highlight>) {
    if (!setup) return;
    const item = items.find((it) => it.highlight.id === highlightId);
    if (!item) return;
    const updated: Highlight = { ...item.highlight, ...patch };
    setItems((prev) =>
      prev.map((it) => (it.highlight.id === highlightId ? { ...it, highlight: updated } : it)),
    );
    setHighlights((prev) => prev.map((h) => (h.id === highlightId ? updated : h)));
    await renderOne(updated, setup, design);
  }

  const idx = stepIndex(step);

  return (
    <main className="min-h-screen bg-ink px-4 py-10 sm:py-16">
      {/* 4단계 진행 표시 */}
      <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${
                i === idx
                  ? "bg-accent text-black"
                  : i < idx
                    ? "bg-accent/30 text-accent"
                    : "bg-panel2 text-muted"
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-xs font-bold ${i === idx ? "text-white" : "text-muted"}`}>
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && <span className="mx-1 text-muted">›</span>}
          </div>
        ))}
      </div>

      {error && step === "setup" && (
        <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {step === "setup" && <SetupForm onSubmit={handleAnalyze} busy={false} />}

      {step === "analyzing" && (
        <div className="mx-auto max-w-md pt-20 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-line border-t-accent" />
          <h2 className="mt-6 text-xl font-bold">영상에서 쇼츠 구간을 찾는 중...</h2>
          <p className="mt-2 text-muted">{progressMsg}</p>
          <div className="mx-auto mt-5 h-2 w-64 overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {step === "select" && analysis && (
        <HighlightList
          highlights={highlights}
          setHighlights={setHighlights}
          videoId={analysis.meta.videoId}
          apiKey={setup?.apiKey ?? ""}
          subtitles={subtitles}
          setSubtitles={setSubtitles}
          onCreate={handleCreate}
          onBack={() => setStep("setup")}
          busy={false}
        />
      )}

      {step === "design" && (
        <DesignStep
          selected={design}
          clipCount={items.length}
          onConfirm={handleDesignConfirm}
          onBack={() => setStep("select")}
        />
      )}

      {step === "publish" && (
        <ResultList
          items={items}
          onRerender={handleRerender}
          onBack={() => setStep("design")}
          onHome={handleHome}
          churchName={setup?.churchName}
          sourceUrl={setup?.url}
        />
      )}
    </main>
  );
}
