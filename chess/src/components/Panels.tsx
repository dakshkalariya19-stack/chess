import type { Color, PieceSymbol } from "chess.js";
import {
  Brain,
  Flag,
  Handshake,
  PawPrint,
  GraduationCap,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { PieceGlyph } from "./PieceGlyph";
import { TICKER_ITEMS } from "../engine/dialogue";

/* ------------------------- ticker ------------------------- */
export function Ticker() {
  const row = TICKER_ITEMS.map((t, i) => (
    <span key={i} className="mx-5 inline-flex items-center gap-5">
      <span>{t}</span>
      <span className="text-[#e2a24a]">///</span>
    </span>
  ));
  return (
    <div className="overflow-hidden border-b border-[#e2a24a]/12 bg-[#120d08] py-2 font-mono2 text-[10px] uppercase tracking-[0.22em] text-[#a8977a]">
      <div className="marquee-track">
        <span className="flex items-center">{row}</span>
        <span className="flex items-center">{row}</span>
      </div>
    </div>
  );
}

/* ------------------------- shawn card ------------------------- */
export function ShawnCard({
  focus,
  bandLabel,
  bandColor,
  mood,
  thinking,
  captured,
  capturedColor,
  material,
}: {
  focus: number;
  bandLabel: string;
  bandColor: string;
  mood: string;
  thinking: boolean;
  captured: PieceSymbol[];
  capturedColor: Color;
  material: number; // shawn's material edge in pawns
}) {
  return (
    <div className="bg-[#16110b] border border-[#e2a24a]/15 rounded-xl overflow-hidden">
      <div className="p-4 flex gap-3.5 items-center">
        <div className="relative shrink-0">
          <img
            src="/img/shawn.png"
            alt="Shawn"
            className="size-16 rounded-lg object-cover ring-1 ring-[#e2a24a]/40"
          />
          <span
            className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-[#16110b] ${thinking ? "bg-[#e2a24a] pulse-soft" : "bg-[#7fb069]"}`}
          />
        </div>
        <div className="min-w-0">
          <div className="font-display text-xl leading-none font-semibold">Shawn</div>
          <div className="font-mono2 text-[9.5px] uppercase tracking-[0.16em] text-[#a8977a] mt-1.5 flex items-center gap-1.5">
            <GraduationCap className="size-3 text-[#e2a24a] shrink-0" />
            Russian School of Chess
          </div>
          <div className="font-mono2 text-[9.5px] text-[#a8977a]/70 mt-1">
            Peak Elo 2147 <span className="italic">(claimed)</span>
          </div>
        </div>
      </div>

      {/* adaptive focus meter */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono2 text-[9px] uppercase tracking-[0.2em] text-[#a8977a] flex items-center gap-1.5">
            <Gauge className="size-3" /> Adaptive focus
          </span>
          <span
            className="font-mono2 text-[10px] px-1.5 py-0.5 rounded border"
            style={{ color: bandColor, borderColor: `${bandColor}55`, backgroundColor: `${bandColor}14` }}
          >
            {bandLabel}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width,background-color] duration-700 ease-out"
            style={{ width: `${focus}%`, backgroundColor: bandColor }}
          />
        </div>
        <div className="mt-1.5 flex justify-between font-mono2 text-[9px] text-[#a8977a]/70">
          <span className="italic">{mood}</span>
          <span>{Math.round(focus)}%</span>
        </div>

        <div className="mt-3 flex items-center gap-2 min-h-5">
          {thinking ? (
            <span className="flex items-center gap-2 text-[11px] text-[#e2a24a] font-mono2">
              <Brain className="size-3.5 pulse-soft" />
              calculating
              <span className="flex gap-0.5">
                <span className="typing-dot size-1 rounded-full bg-[#e2a24a]" />
                <span className="typing-dot size-1 rounded-full bg-[#e2a24a]" />
                <span className="typing-dot size-1 rounded-full bg-[#e2a24a]" />
              </span>
            </span>
          ) : (
            <span className="text-[11px] text-[#a8977a]/70 font-mono2">watching your pieces…</span>
          )}
        </div>
      </div>

      {/* trophies */}
      <div className="px-4 py-3 border-t border-[#e2a24a]/10 bg-[#120d08]">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono2 text-[9px] uppercase tracking-[0.18em] text-[#a8977a]">
            Shawn's trophies
          </span>
          {material !== 0 && (
            <span className={`font-mono2 text-[10px] ${material > 0 ? "text-[#e2a24a]" : "text-[#7fb069]"}`}>
              {material > 0 ? `Shawn +${material}` : `You +${-material}`}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center min-h-6">
          {captured.length === 0 ? (
            <span className="text-[10px] text-[#a8977a]/50 italic">empty shelf. for now.</span>
          ) : (
            captured.map((t, i) => (
              <PieceGlyph key={i} type={t} color={capturedColor} className="size-6 -ml-1 first:ml-0" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------- bear polaroid ------------------------- */
export function BearPolaroid() {
  return (
    <div className="bg-[#16110b] border border-[#8a5a3c]/25 rounded-xl p-3.5">
      <div className="flex gap-3 items-center">
        <img
          src="/img/bear.png"
          alt="Bear"
          className="size-12 rounded-lg object-cover ring-1 ring-[#8a5a3c]/50 floaty"
          style={{ ["--rot" as string]: "-3deg" }}
        />
        <div>
          <div className="font-display text-sm font-semibold flex items-center gap-1.5">
            <PawPrint className="size-3.5 text-[#c98d54]" /> Bear
          </div>
          <div className="text-[11px] text-[#a8977a] italic mt-0.5">
            Best friend. Unranked. Undefeated.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- player card ------------------------- */
export function PlayerCard({
  side,
  blunders,
  captured,
  capturedColor,
  timeStr,
  active,
}: {
  side: Color;
  blunders: number;
  captured: PieceSymbol[];
  capturedColor: Color;
  timeStr: string;
  active: boolean;
}) {
  return (
    <div className="bg-[#16110b] border border-[#e2a24a]/15 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`size-8 rounded-lg grid place-items-center border ${
              side === "w" ? "bg-[#f2e8cf] border-[#f2e8cf]" : "bg-[#33241a] border-[#e9b96c]/40"
            }`}
          >
            <span className={`font-display font-bold text-sm ${side === "w" ? "text-[#241708]" : "text-[#e9b96c]"}`}>
              {side === "w" ? "W" : "B"}
            </span>
          </span>
          <div>
            <div className="font-display text-sm font-semibold">You</div>
            <div className="font-mono2 text-[9px] uppercase tracking-[0.18em] text-[#a8977a]">
              the challenger
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-mono2 text-lg leading-none ${active ? "text-[#f2ead9]" : "text-[#a8977a]"}`}>
            {timeStr}
          </div>
          <div className="font-mono2 text-[9px] text-[#a8977a]/70 mt-1 flex items-center gap-1 justify-end">
            <AlertTriangle className="size-2.5 text-[#c8462b]" />
            {blunders} blunder{blunders === 1 ? "" : "s"}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center min-h-6 border-t border-[#e2a24a]/10 pt-2.5">
        <span className="font-mono2 text-[9px] uppercase tracking-[0.18em] text-[#a8977a] mr-2">
          Your trophies
        </span>
        {captured.length === 0 ? (
          <span className="text-[10px] text-[#a8977a]/50 italic">go hunting</span>
        ) : (
          captured.map((t, i) => (
            <PieceGlyph key={i} type={t} color={capturedColor} className="size-6 -ml-1 first:ml-0" />
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------- eval bar ------------------------- */
export function EvalBar({ evalWhite }: { evalWhite: number }) {
  const pct = Math.max(3, Math.min(97, 50 + evalWhite * 6));
  const label = (evalWhite >= 0 ? "+" : "") + evalWhite.toFixed(1);
  return (
    <div className="flex flex-col items-center gap-2 self-stretch py-1">
      <div className="relative flex-1 w-2.5 rounded-full bg-[#33261a] overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#f2e8cf] to-[#e2c04a] transition-all duration-700 rounded-full"
          style={{ height: `${pct}%` }}
        />
        <div className="absolute left-0 w-full h-px bg-[#a8977a]/60" style={{ bottom: "50%" }} />
      </div>
      <span className="font-mono2 text-[9px] text-[#a8977a] -rotate-90 sm:rotate-0">{label}</span>
    </div>
  );
}

/* ------------------------- controls ------------------------- */
export function ControlsBar({
  onDraw,
  onResign,
  onNew,
  muted,
  onToggleMute,
  disabled,
}: {
  onDraw: () => void;
  onResign: () => void;
  onNew: () => void;
  muted: boolean;
  onToggleMute: () => void;
  disabled: boolean;
}) {
  const cls =
    "btn-press flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e2a24a]/20 text-[12px] font-mono2 text-[#eadfc3] hover:border-[#e2a24a]/60 hover:bg-[#e2a24a]/10 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-[#e2a24a]/20";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={cls} onClick={onDraw} disabled={disabled}>
        <Handshake className="size-3.5" /> Draw?
      </button>
      <button className={cls} onClick={onResign} disabled={disabled}>
        <Flag className="size-3.5" /> Resign
      </button>
      <button className={cls} onClick={onNew}>
        <RotateCcw className="size-3.5" /> New game
      </button>
      <button className={`${cls} ml-auto`} onClick={onToggleMute} aria-label="toggle sound">
        {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
      </button>
    </div>
  );
}

/* ------------------------- move list ------------------------- */
export function MoveList({ sans }: { sans: string[] }) {
  const pairs: [string, string | undefined][] = [];
  for (let i = 0; i < sans.length; i += 2) pairs.push([sans[i], sans[i + 1]]);
  return (
    <div className="h-full overflow-y-auto nice-scroll bg-[#14100b] border border-[#e2a24a]/15 rounded-xl p-3">
      <div className="font-mono2 text-[9px] uppercase tracking-[0.22em] text-[#a8977a] mb-2 px-1">
        Notation
      </div>
      {pairs.length === 0 && (
        <div className="text-[11px] text-[#a8977a]/60 italic px-1">
          The first move writes the first sentence.
        </div>
      )}
      <div className="grid grid-cols-[2rem_1fr_1fr] gap-y-0.5 font-mono2 text-[12px]">
        {pairs.map(([w, b], i) => (
          <div key={i} className="contents">
            <span className="text-[#a8977a]/70 px-1">{i + 1}.</span>
            <span
              className={`px-1.5 py-0.5 rounded ${i * 2 === sans.length - 1 ? "bg-[#e2a24a]/15 text-[#f0c179]" : "text-[#eadfc3]"}`}
            >
              {w}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded ${b && i * 2 + 1 === sans.length - 1 ? "bg-[#e2a24a]/15 text-[#f0c179]" : "text-[#eadfc3]/80"}`}
            >
              {b ?? ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
