"use client";

import { useEffect, useState } from "react";
import { loadSetting, saveSetting } from "@/lib/settings";
import UserGuide from "./UserGuide";

export interface SetupValues {
  apiKey: string;
  url: string;
  targetSec: number;
  churchName: string;
}

const TARGETS = [
  { sec: 30, label: "30초" },
  { sec: 60, label: "1분" },
  { sec: 120, label: "2분" },
];

export default function SetupForm({
  onSubmit,
  busy,
}: {
  onSubmit: (v: SetupValues) => void;
  busy: boolean;
}) {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState(false);
  const [url, setUrl] = useState("");
  const [targetSec, setTargetSec] = useState(60);
  const [churchName, setChurchName] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const k = await loadSetting("gemini_api_key");
      if (cancelled) return;
      if (k) {
        setApiKey(k);
        setSavedKey(true);
      }
      const c = await loadSetting("church_name");
      if (!cancelled && c) setChurchName(c);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function submit() {
    if (!url.trim()) return;
    void saveSetting("gemini_api_key", apiKey.trim());
    void saveSetting("church_name", churchName.trim());
    onSubmit({ apiKey: apiKey.trim(), url: url.trim(), targetSec, churchName: churchName.trim() });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
          설교 전체 영상을
          <br />
          <span className="text-accent">쇼츠 영상</span>으로
        </h1>
        <p className="mt-4 text-muted">
          설교(예배) 유튜브 링크를 넣으면 AI가 하이라이트를 찾아
          <br className="hidden sm:block" /> 쇼츠를 만들어 드립니다 (자막 on/off 가능).
        </p>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="mt-4 rounded-xl border border-line bg-panel2 px-5 py-2.5 font-bold text-white transition hover:border-accent/60"
        >
          📖 사용 설명서
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-6 shadow-xl sm:p-8">
        {/* API key */}
        <Field n={1} label="Gemini API 키" hint={savedKey ? "✓ 저장됨" : undefined}>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setSavedKey(false);
              }}
              placeholder="AIza..."
              className="input pr-12"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
            >
              {showKey ? "숨기기" : "보기"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            이 브라우저에만 저장됩니다. 키가 없으면{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline"
            >
              여기서 무료 발급
            </a>
            받으세요.
          </p>
        </Field>

        {/* URL */}
        <Field n={2} label="설교 유튜브 링크">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="input"
          />
          <p className="mt-2 text-xs text-muted">
            찬양·광고가 포함된 예배 전체 영상도 괜찮아요. 설교 부분을 자동으로 찾습니다.
          </p>
        </Field>

        {/* target length */}
        <Field n={3} label="쇼츠 길이">
          <div className="grid grid-cols-3 gap-2">
            {TARGETS.map((t) => (
              <button
                key={t.sec}
                onClick={() => setTargetSec(t.sec)}
                className={`rounded-xl border py-3 font-bold transition ${
                  targetSec === t.sec
                    ? "border-accent bg-accent text-black"
                    : "border-line bg-panel2 text-muted hover:border-accent/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        {/* church name */}
        <Field n={4} label="교회명 (선택)" hint="영상 맨 아래에 작게 표시돼요">
          <input
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            placeholder="예) 사랑교회"
            className="input"
          />
        </Field>

        <button
          onClick={submit}
          disabled={busy || !url.trim()}
          className="mt-2 w-full rounded-xl bg-accent py-4 text-lg font-extrabold text-black transition hover:bg-accent2 disabled:opacity-40"
        >
          {busy ? "분석 중..." : "✦ 하이라이트 찾아 쇼츠 만들기"}
        </button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
          본인이 권리를 가진 설교 영상(예: 소속 교회가 업로드한 영상)에만 사용하세요.
        </p>
      </div>
      {showGuide && <UserGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}

function Field({
  n,
  label,
  hint,
  children,
}: {
  n: number;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
          {n}
        </span>
        <span className="font-bold">{label}</span>
        {hint && <span className="text-xs font-medium text-emerald-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
