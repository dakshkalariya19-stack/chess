import type { Color, PieceSymbol } from "chess.js";

/* Custom flat "Soviet club" piece set — geometric, all angles, no mercy. */

const PALETTE: Record<Color, { base: string; detail: string; shade: string }> = {
  w: { base: "#f2e8cf", detail: "#241708", shade: "#cbb17e" },
  b: { base: "#33241a", detail: "#e9b96c", shade: "#20150d" },
};

function Shapes({ t, d }: { t: PieceSymbol; d: string }) {
  switch (t) {
    case "p":
      return (
        <>
          <circle cx="50" cy="27" r="10.5" />
          <path d="M41 37 Q50 31 59 37 L62 66 Q63 71 59 75 H41 Q37 71 38 66 Z" />
          <rect x="26" y="74" width="48" height="9" rx="4.5" />
        </>
      );
    case "r":
      return (
        <>
          <rect x="30" y="26" width="40" height="7" rx="1.5" />
          <rect x="30" y="15" width="9" height="11" />
          <rect x="45" y="15" width="10" height="11" />
          <rect x="61" y="15" width="9" height="11" />
          <path d="M34 33 L32 74 H68 L66 33 Z" />
          <rect x="22" y="74" width="56" height="9" rx="4.5" />
          <rect x="36" y="42" width="28" height="3" fill={d} stroke="none" opacity="0.55" />
        </>
      );
    case "n":
      return (
        <>
          <path d="M36 74 V60 Q30 49 36 39 Q40 29 48 24 L47 13 L53 18 L57 11 L61 19 L68 22 Q75 26 73 33 L70 38 L61 36 Q60 44 53 48 Q50 55 52 62 Q53 68 50 74 Z" />
          <circle cx="56" cy="28" r="2.6" fill={d} stroke="none" />
          <path d="M50 34 Q44 42 45 54" fill="none" stroke={d} strokeWidth="2.4" />
          <rect x="30" y="74" width="40" height="9" rx="4.5" />
        </>
      );
    case "b":
      return (
        <>
          <circle cx="50" cy="24" r="10.5" />
          <rect x="48" y="15" width="4" height="16" fill={d} stroke="none" transform="rotate(30 50 24)" />
          <rect x="40" y="36" width="20" height="6" rx="3" />
          <path d="M44 42 C40 52 39 60 40 74 H60 C61 60 60 52 56 42 Z" />
          <rect x="22" y="74" width="56" height="9" rx="4.5" />
        </>
      );
    case "q":
      return (
        <>
          <circle cx="36" cy="15" r="3.4" />
          <circle cx="50" cy="11" r="3.4" />
          <circle cx="64" cy="15" r="3.4" />
          <path d="M30 42 L36 18 L42 42 Z" />
          <path d="M43 42 L50 15 L57 42 Z" />
          <path d="M58 42 L64 18 L70 42 Z" />
          <rect x="30" y="40" width="40" height="8" rx="3" />
          <path d="M34 48 L31 74 H69 L66 48 Z" />
          <circle cx="50" cy="59" r="4.6" fill={d} stroke="none" opacity="0.6" />
          <rect x="22" y="74" width="56" height="9" rx="4.5" />
        </>
      );
    case "k":
      return (
        <>
          <rect x="47.4" y="9" width="5.2" height="17" rx="1.5" />
          <rect x="42.6" y="13.6" width="14.8" height="5.2" rx="1.5" />
          <path d="M30 44 L36 27 L42 44 Z" />
          <path d="M58 44 L64 27 L70 44 Z" />
          <rect x="30" y="42" width="40" height="8" rx="3" />
          <path d="M34 50 L32 74 H68 L66 50 Z" />
          <rect x="22" y="74" width="56" height="9" rx="4.5" />
        </>
      );
  }
}

export function PieceGlyph({
  type,
  color,
  className = "",
}: {
  type: PieceSymbol;
  color: Color;
  className?: string;
}) {
  const p = PALETTE[color];
  return (
    <svg viewBox="0 0 90 90" className={`piece-svg ${className}`} aria-hidden>
      <g
        fill={p.base}
        stroke={p.detail}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <Shapes t={type} d={p.detail} />
      </g>
    </svg>
  );
}
