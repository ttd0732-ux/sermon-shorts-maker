"use client";

// 3단계: 24종 디자인 선택 (전용 단계).
// 1단계(setup)와 결과 화면에 흩어져 있던 디자인 선택을 이 단계로 모았다.
// 여기서 고른 디자인 하나로 선택된 쇼츠를 모두 렌더링한다.

import { useState } from "react";
import { TEMPLATES } from "@/lib/layout";
import type { TemplateId } from "@/lib/types";

export default function DesignStep({
  selected,
  onConfirm,
  onBack,
  clipCount,
}: {
  selected: TemplateId;
  onConfirm: (design: TemplateId) => void;
  onBack: () => void;
  clipCount: number;
}) {
  const [design, setDesign] = useState<TemplateId>(selected);
  const ids = Object.keys(TEMPLATES) as TemplateId[];

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">3단계: 디자인 고르기</h2>
          <p className="mt-1 text-sm text-muted">
            {clipCount}개 쇼츠에 입힐 디자인을 고르세요. 고른 디자인으로 모두 만들어집니다.
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex-shrink-0 rounded-lg px-3 py-2 text-sm text-muted hover:text-white"
        >
          ← 구간 다시 고르기
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ids.map((id) => (
          <DesignSwatch
            key={id}
            id={id}
            active={design === id}
            onClick={() => setDesign(id)}
          />
        ))}
      </div>

      <button
        onClick={() => onConfirm(design)}
        className="mt-6 w-full rounded-xl bg-accent py-4 text-lg font-extrabold text-black transition hover:bg-accent2"
      >
        ✦ 이 디자인으로 {clipCount}개 쇼츠 만들기
      </button>
    </div>
  );
}

function DesignSwatch({
  id,
  active,
  onClick,
}: {
  id: TemplateId;
  active: boolean;
  onClick: () => void;
}) {
  const t = TEMPLATES[id];
  return (
    <button
      onClick={onClick}
      className={`overflow-hidden rounded-xl border-2 transition ${
        active ? "border-accent" : "border-line hover:border-accent/40"
      }`}
    >
      <div className="aspect-[9/16] w-full p-3 text-center" style={{ background: t.bg }}>
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="text-[11px] font-extrabold leading-tight" style={{ color: t.titleLine1 }}>
              내 열심보다
            </div>
            <div className="text-[13px] font-extrabold leading-tight" style={{ color: t.titleLine2 }}>
              하나님의 이끄심
            </div>
          </div>
          <div className="mx-auto h-8 w-full rounded bg-black/20" />
          <div className="text-[9px] font-medium" style={{ color: t.subtitle }}>
            하나님이 나를 이끄십니다
          </div>
        </div>
      </div>
      <div className="bg-panel2 py-1.5 text-xs font-bold">{t.label}</div>
    </button>
  );
}
