// Layout constants — MEASURED pixel-for-pixel from the two sample videos
// (설교쇼츠 (1).mp4 dark, 설교쇼츠 (2).mp4 light). Do not eyeball; these are the spec.
//
// Canvas 1080x1920, split exactly 25% / 50% / 25%:
//   title band  y 0    - 479   (480px)
//   video       y 480  - 1439  (960px, 1080x960 = 9:8, center-cropped)
//   subtitle    y 1440 - 1919  (480px)

import type { SubtitlePosition, SubtitleSize, TemplateId, TitleSize } from "./types";

export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

export const TITLE_BAND = { top: 0, height: 480 };
export const VIDEO_BAND = { top: 480, height: 960 };
export const SUB_BAND = { top: 1440, height: 480 };

// Title text (measured): line1 y≈197-287, line2 y≈313-402, glyph height ≈90, gap ≈26.
// We render title centered in the top band.
export const TITLE = {
  centerX: CANVAS_W / 2, // 540
  line1CenterY: 242, // (197+287)/2
  line2CenterY: 357, // (313+402)/2
  fontSize: 116, // tuned so glyph height ≈90 (measured render at 96 gave ~72)
  maxTextWidth: 900, // observed max 727; keep 90px side margins
  minFontSize: 56,
};

// Derived from the measurements above: the two lines sit 115px apart, and their
// block is centred on y=299.5 (notably NOT the band's own centre of 240 — the
// samples leave more air above the title than below).
const TITLE_BLOCK_CENTER_Y = (TITLE.line1CenterY + TITLE.line2CenterY) / 2; // 299.5
const TITLE_LINE_GAP = TITLE.line2CenterY - TITLE.line1CenterY; // 115

export const TITLE_FONT_SIZE: Record<TitleSize, number> = {
  small: 88,
  medium: TITLE.fontSize, // 116 — the measured default
  large: 142,
  xlarge: 168,
};

// Line spacing has to grow with the font, or bigger titles collide: at size 168
// a glyph is ~130px tall but the measured gap is only 115. Scaling the gap by
// the same factor keeps the block centred and inside the 480px band.
export function titlePlacement(size: TitleSize = "medium"): {
  fontSize: number;
  line1CenterY: number;
  line2CenterY: number;
} {
  const fontSize = TITLE_FONT_SIZE[size];
  const gap = TITLE_LINE_GAP * (fontSize / TITLE.fontSize);
  return {
    fontSize,
    line1CenterY: Math.round(TITLE_BLOCK_CENTER_Y - gap / 2),
    line2CenterY: Math.round(TITLE_BLOCK_CENTER_Y + gap / 2),
  };
}

// Swatches offered for title colors. Chosen to stay legible on both the black
// and the cream template background.
export const TITLE_COLOR_PRESETS: { hex: string; label: string }[] = [
  { hex: "#FFFFFF", label: "흰색" },
  { hex: "#FFFF5A", label: "노랑" },
  { hex: "#FF9F1C", label: "주황" },
  { hex: "#C1392B", label: "빨강" },
  { hex: "#4DA6FF", label: "파랑" },
  { hex: "#3DD68C", label: "초록" },
  { hex: "#1B243D", label: "남색" },
  { hex: "#000000", label: "검정" },
];

export interface Template {
  id: TemplateId;
  label: string;
  bg: string; // hex, used as ffmpeg pad color and ASS背景
  titleLine1: string; // hex
  titleLine2: string; // hex (accent)
  subtitle: string; // hex — subtitle text color
  subtitleOutline: string; // hex — subtitle outline
}

export const TEMPLATES: Record<TemplateId, Template> = {
  dark: {
    id: "dark",
    label: "기본 (다크)",
    bg: "#000000",
    titleLine1: "#FFFFFF",
    titleLine2: "#FFFF5A",
    subtitle: "#FFFFFF",
    subtitleOutline: "#000000",
  },
  light: {
    id: "light",
    label: "라이트",
    bg: "#F2EEE6",
    titleLine1: "#1B243D",
    titleLine2: "#C1392B",
    subtitle: "#1B243D",
    subtitleOutline: "#F2EEE6",
  },
  // 24종 디자인 (설교 쇼츠 스튜디오 designs.json의 이름·아이디를 바탕으로,
  // 색상·분위기는 창의적으로 다듬음 — 서로 겹치지 않게 구성).
  // 네 갈래: ① 어두운 배경(강단·밤·바다) ② 밝은 배경(뉴스·종이·민트·카드)
  // ③ 강렬한 단색(핑크·오렌지·바이올렛·자홍) ④ 따뜻한 톤(새벽·노을·우드·추수).
  // 제목 1줄·제목 2줄(강조)·자막 색을 디자인마다 다르게 해서,
  // 고르면 확실히 다른 화면이 나온다. 제목은 외곽선이 없어 배경과
  // 명암 대비가 커야 하고, 자막은 외곽선 색과 대비가 커야 한다.
  "gold-pulpit": {
    id: "gold-pulpit",
    label: "은혜로운 강단 골드",
    bg: "#020617",
    titleLine1: "#FACC15",
    titleLine2: "#FFFFFF",
    subtitle: "#FEF3C7",
    subtitleOutline: "#000000",
  },
  "royal-navy": {
    id: "royal-navy",
    label: "로얄 네이비 강단",
    bg: "#172554",
    titleLine1: "#FFFFFF",
    titleLine2: "#38BDF8",
    subtitle: "#DBEAFE",
    subtitleOutline: "#0B1530",
  },
  "classic-crimson": {
    id: "classic-crimson",
    label: "보혈의 크림슨 레드",
    bg: "#4C0519",
    titleLine1: "#FFFFFF",
    titleLine2: "#FB7185",
    subtitle: "#FFE4E6",
    subtitleOutline: "#1F0208",
  },
  "emerald-grace": {
    id: "emerald-grace",
    label: "생명나무 에메랄드",
    bg: "#022C22",
    titleLine1: "#A7F3D0",
    titleLine2: "#34D399",
    subtitle: "#D1FAE5",
    subtitleOutline: "#000000",
  },
  "broadcast-tv": {
    id: "broadcast-tv",
    label: "기독교 방송국 뉴스형",
    bg: "#F8FAFC",
    titleLine1: "#0F172A",
    titleLine2: "#DC2626",
    subtitle: "#1E293B",
    subtitleOutline: "#F8FAFC",
  },
  "black-gold-lux": {
    id: "black-gold-lux",
    label: "블랙 & 골드 명품강해",
    bg: "#000000",
    titleLine1: "#EAB308",
    titleLine2: "#FEF9C3",
    subtitle: "#FDE68A",
    subtitleOutline: "#000000",
  },
  "youth-neon": {
    id: "youth-neon",
    label: "청년부 모던 임팩트",
    bg: "#4C1D95",
    titleLine1: "#FDE047",
    titleLine2: "#F0ABFC",
    subtitle: "#FEF08A",
    subtitleOutline: "#1E1B4B",
  },
  "sns-viral-reel": {
    id: "sns-viral-reel",
    label: "SNS 바이럴 말풍선형",
    bg: "#EC4899",
    titleLine1: "#FFFFFF",
    titleLine2: "#3B0764",
    subtitle: "#FFF1F2",
    subtitleOutline: "#831843",
  },
  "cyber-worship": {
    id: "cyber-worship",
    label: "워십 콘서트 네온퍼플",
    bg: "#2E1065",
    titleLine1: "#E9D5FF",
    titleLine2: "#C084FC",
    subtitle: "#F3E8FF",
    subtitleOutline: "#150829",
  },
  "minimal-typo": {
    id: "minimal-typo",
    label: "모던 타이포 화이트",
    bg: "#FAFAF9",
    titleLine1: "#111827",
    titleLine2: "#6B7280",
    subtitle: "#1F2937",
    subtitleOutline: "#FAFAF9",
  },
  "energetic-orange": {
    id: "energetic-orange",
    label: "비전 오렌지 임팩트",
    bg: "#EA580C",
    titleLine1: "#FFFFFF",
    titleLine2: "#1F2937",
    subtitle: "#FFF7ED",
    subtitleOutline: "#7C2D12",
  },
  "mint-fresh": {
    id: "mint-fresh",
    label: "산뜻한 민트 복음",
    bg: "#CCFBF1",
    titleLine1: "#134E4A",
    titleLine2: "#0D9488",
    subtitle: "#115E59",
    subtitleOutline: "#CCFBF1",
  },
  "dawn-prayer": {
    id: "dawn-prayer",
    label: "따뜻한 새벽묵상",
    bg: "#451A03",
    titleLine1: "#FDE68A",
    titleLine2: "#FDBA74",
    subtitle: "#FFEDD5",
    subtitleOutline: "#1C0A00",
  },
  "starlight-night": {
    id: "starlight-night",
    label: "밤하늘 별빛 기도",
    bg: "#0B1026",
    titleLine1: "#A5B4FC",
    titleLine2: "#E0E7FF",
    subtitle: "#C7D2FE",
    subtitleOutline: "#000000",
  },
  "olive-garden": {
    id: "olive-garden",
    label: "겟세마네 올리브 그린",
    bg: "#1A2E05",
    titleLine1: "#ECFCCB",
    titleLine2: "#BEF264",
    subtitle: "#F7FEE7",
    subtitleOutline: "#09090B",
  },
  "warm-sunset": {
    id: "warm-sunset",
    label: "은혜의 노을 코랄",
    bg: "#9A3412",
    titleLine1: "#FFF7ED",
    titleLine2: "#FDBA74",
    subtitle: "#FFEDD5",
    subtitleOutline: "#431407",
  },
  "calm-ocean": {
    id: "calm-ocean",
    label: "갈릴리 호수 블루",
    bg: "#082F49",
    titleLine1: "#FFFFFF",
    titleLine2: "#7DD3FC",
    subtitle: "#BAE6FD",
    subtitleOutline: "#082F49",
  },
  "wood-bible": {
    id: "wood-bible",
    label: "강대상 우드 클래식",
    bg: "#78350F",
    titleLine1: "#FEF3C7",
    titleLine2: "#F59E0B",
    subtitle: "#FFFBEB",
    subtitleOutline: "#292524",
  },
  "bible-card": {
    id: "bible-card",
    label: "성경말씀 카드뉴스형",
    bg: "#FEF9C3",
    titleLine1: "#1C1917",
    titleLine2: "#B45309",
    subtitle: "#44403C",
    subtitleOutline: "#FEF9C3",
  },
  "chalkboard-note": {
    id: "chalkboard-note",
    label: "주일설교 칠판노트형",
    bg: "#14532D",
    titleLine1: "#FEF9C3",
    titleLine2: "#FEF08A",
    subtitle: "#F0FDF4",
    subtitleOutline: "#052E16",
  },
  "thanksgiving-harvest": {
    id: "thanksgiving-harvest",
    label: "추수감사·절기 골드",
    bg: "#92400E",
    titleLine1: "#FFFBEB",
    titleLine2: "#FACC15",
    subtitle: "#FEF3C7",
    subtitleOutline: "#451A03",
  },
  "cinematic-worship": {
    id: "cinematic-worship",
    label: "시네마틱 와이드 레터박스",
    bg: "#111827",
    titleLine1: "#F8FAFC",
    titleLine2: "#FBBF24",
    subtitle: "#E5E7EB",
    subtitleOutline: "#000000",
  },
  "passion-cross": {
    id: "passion-cross",
    label: "십자가 은혜 바이올렛",
    bg: "#701A75",
    titleLine1: "#FAE8FF",
    titleLine2: "#F0ABFC",
    subtitle: "#F5D0FE",
    subtitleOutline: "#3B0764",
  },
  "revival-fire": {
    id: "revival-fire",
    label: "성령의 불꽃 다이나믹",
    bg: "#7F1D1D",
    titleLine1: "#FFFFFF",
    titleLine2: "#FBBF24",
    subtitle: "#FEE2E2",
    subtitleOutline: "#450A0A",
  },
};

// Subtitle font sizes per level (ASS Fontsize, canvas-relative).
export const SUB_FONT_SIZE: Record<SubtitleSize, number> = {
  small: 46,
  medium: 58,
  large: 70,
  xlarge: 84,
};

// Vertical placement per position preset.
// Returns ASS alignment (numpad) + marginV (px from the aligned edge).
export function subtitlePlacement(pos: SubtitlePosition): {
  alignment: number;
  marginV: number;
} {
  switch (pos) {
    case "band":
      // centered inside bottom band (1440-1919). Anchor bottom, lift up to band center-ish.
      return { alignment: 2, marginV: 190 };
    case "video-under":
      // just under the video (y ~1440), anchor bottom of screen but high margin
      return { alignment: 2, marginV: 430 };
    case "video-bottom":
      // inside the video area, near its bottom edge
      return { alignment: 2, marginV: 500 };
    case "screen-bottom":
      return { alignment: 2, marginV: 70 };
  }
}

// Church name — a small credit line at the very bottom of the subtitle band.
// Deliberately quiet: it identifies the source without competing with the
// message. The samples this layout was measured from had no badge, so these
// values are chosen rather than measured, and verified by rendering.
export const CHURCH = {
  fontSize: 38,
  marginV: 46, // from the bottom edge
  opacityHex: "60", // ASS alpha: 00 opaque, FF invisible
  // Height the label occupies, used to lift bottom-anchored subtitles clear.
  reservedHeight: 96,
};
