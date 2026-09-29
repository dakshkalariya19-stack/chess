import { useState } from "react";
import type { Color, PieceSymbol } from "chess.js";
import {
  Brain,
  Crown,
  GraduationCap,
  MessageSquareText,
  PawPrint,
  Play,
  X,
} from "lucide-react";
import { PieceGlyph } from "./PieceGlyph";
import { Ticker } from "./Panels";

/* ------------------------- intro ------------------------- */
export function IntroOverlay({ onStart }: { onStart: (side: Color) => void }) {
  const [side, setSide] = useState<Color>("w");

  const creds = [
    {
      icon: GraduationCap,
      title: "Qualified — Russian School of Chess",
      sub: "Graduated a Thursday. It was snowing. Obviously.",
    },
    {
      icon: MessageSquareText,
      title: "Extremely talkative",
      sub: "Banned from whispering at the board. Types instead.",
    },
    {
      icon: Brain,
      title: "Adaptive opponent",
      sub: "Plays badly when ahead. Focuses hard when losing. Watches you.",
    },
    {
      icon: PawPrint,
      title: "Best friend: Bear",
      sub: "Unranked. Undefeated. Supervises every game.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto nice-scroll backdrop-glow">
      <div className="min-h-full flex flex-col">
        <div className="flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8 py-8 lg:py-0 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          {/* left */}
          <div className="relative pt-4">
            <div className="font-mono2 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#e2a24a] flex items-center gap-2">
              <Crown className="size-4" /> The Bear &amp; Bishop Chess Club presents
            </div>

            <h1 className="font-display font-semibold leading-[0.88] mt-4">
              <span className="block text-[clamp(3.8rem,11vw,8.5rem)] text-[#f2ead9]">SHAWN</span>
              <span className="block text-[clamp(1.4rem,3.4vw,2.6rem)] italic text-[#e2a24a] mt-1">
                Petrovich · “The Wood Respector”
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#cdbfa4]">
              One exhibition match. One graduate of the Soviet chess machine. He studies
              how you play, shifts gears mid-game, and narrates everything. Somewhere
              behind him sits Bear — best friend, silent coach, materialist.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-2.5 max-w-2xl">
              {creds.map((c) => (
                <div
                  key={c.title}
                  className="flex gap-3 p-3 rounded-lg border border-[#e2a24a]/15 bg-[#16110b]/80"
                >
                  <c.icon className="size-4 mt-0.5 shrink-0 text-[#e2a24a]" />
                  <div>
                    <div className="text-[13px] font-medium text-[#f2ead9]">{c.title}</div>
                    <div className="text-[11px] text-[#a8977a] italic">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* side picker + CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex rounded-lg overflow-hidden border border-[#e2a24a]/25">
                {(["w", "b"] as Color[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className={`btn-press px-4 py-2.5 flex items-center gap-2 font-mono2 text-[11px] uppercase tracking-[0.14em] ${
                      side === s
                        ? "bg-[#e2a24a] text-[#1a1208]"
                        : "bg-[#16110b] text-[#eadfc3] hover:bg-[#e2a24a]/10"
                    }`}
                  >
                    <PieceGlyph type="k" color={s} className="size-6" />
                    Play {s === "w" ? "white" : "black"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onStart(side)}
                className="btn-press group flex items-center gap-2.5 bg-[#e2a24a] hover:bg-[#f0c179] text-[#1a1208] font-semibold px-6 py-3 rounded-lg text-[15px]"
              >
                <Play className="size-4 group-hover:translate-x-0.5 transition-transform" />
                Take your seat
              </button>
            </div>

            <div className="mt-4 font-mono2 text-[10px] uppercase tracking-[0.2em] text-[#a8977a]/70">
              He talks. He calculates. He adapts. Bring sandwiches.
            </div>
          </div>

          {/* right — polaroids */}
          <div className="relative hidden md:block pb-10">
            <div className="absolute -top-8 -right-4 font-display outline-word text-[9rem] leading-none select-none pointer-events-none">
              ШАХ
            </div>
            <div
              className="floaty relative ml-auto w-[78%] max-w-[380px] bg-[#f4ead3] p-3 pb-4 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
              style={{ ["--rot" as string]: "-2.5deg" }}
            >
              <img src="/img/shawn.png" alt="Shawn" className="w-full aspect-square object-cover" />
              <div className="mt-2.5 flex items-center justify-between font-mono2 text-[10px] text-[#5c4a33]">
                <span>S. Petrovich — qualified, 2009</span>
                <Crown className="size-3" />
              </div>
            </div>
            <div
              className="floaty absolute -bottom-2 right-0 w-[42%] max-w-[185px] bg-[#f4ead3] p-2.5 pb-3 shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
              style={{ ["--rot" as string]: "4deg", animationDelay: "-2.5s" }}
            >
              <img src="/img/bear.png" alt="Bear" className="w-full aspect-square object-cover" />
              <div className="mt-2 font-mono2 text-[9px] text-[#5c4a33] flex items-center gap-1">
                <PawPrint className="size-3" /> Bear — best friend
              </div>
            </div>
          </div>
        </div>

        <Ticker />
      </div>
    </div>
  );
}

/* ------------------------- game over ------------------------- */
export function GameOverOverlay({
  title,
  subtitle,
  quote,
  moves,
  blunders,
  won,
  onRematch,
  onClose,
}: {
  title: string;
  subtitle: string;
  quote: string;
  moves: number;
  blunders: number;
  won: boolean;
  onRematch: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 backdrop-blur-sm p-4">
      <div className="msg-in relative w-full max-w-lg bg-[#171208] border border-[#e2a24a]/25 rounded-2xl p-7 sm:p-9 overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
        <Crown className="crown-sway absolute -right-6 -top-8 size-40 text-[#e2a24a]/10" />
        <div className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-[#e2a24a]">
          Full time
        </div>
        <h2 className="font-display font-semibold text-[clamp(2.2rem,6vw,3.4rem)] leading-none mt-2 text-[#f2ead9]">
          {title}
        </h2>
        <div className="font-mono2 text-[11px] text-[#a8977a] mt-1.5 uppercase tracking-[0.15em]">
          {subtitle}
        </div>

        <div className="mt-6 border-l-2 border-[#e2a24a] pl-4">
          <p className="italic text-[14px] leading-relaxed text-[#eadfc3]">“{quote}”</p>
          <div className="mt-2 font-mono2 text-[9px] uppercase tracking-[0.2em] text-[#a8977a]">
            — Shawn Petrovich
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { k: "Moves", v: String(Math.ceil(moves / 2)) },
            { k: "Your blunders", v: String(blunders) },
            { k: "Verdict", v: won ? "Yours" : title === "Draw" ? "Shared" : "Shawn's" },
          ].map((s) => (
            <div key={s.k} className="rounded-lg border border-[#e2a24a]/15 bg-[#1c1510] px-3 py-2.5 text-center">
              <div className="font-display text-xl font-semibold">{s.v}</div>
              <div className="font-mono2 text-[8.5px] uppercase tracking-[0.18em] text-[#a8977a] mt-0.5">
                {s.k}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex gap-2.5">
          <button
            onClick={onRematch}
            className="btn-press flex-1 bg-[#e2a24a] hover:bg-[#f0c179] text-[#1a1208] font-semibold px-5 py-3 rounded-lg text-sm"
          >
            Rematch — he insists
          </button>
          <button
            onClick={onClose}
            className="btn-press px-5 py-3 rounded-lg border border-[#e2a24a]/25 text-[#eadfc3] hover:bg-[#e2a24a]/10 flex items-center gap-2 text-sm"
          >
            <X className="size-4" /> Study board
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- promotion picker ------------------------- */
export function PromotionPicker({
  color,
  onPick,
}: {
  color: Color;
  onPick: (p: PieceSymbol) => void;
}) {
  const opts: { p: PieceSymbol; label: string }[] = [
    { p: "q", label: "Queen" },
    { p: "r", label: "Rook" },
    { p: "b", label: "Bishop" },
    { p: "n", label: "Knight" },
  ];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
      <div className="msg-in bg-[#171208] border border-[#e2a24a]/25 rounded-2xl p-6 text-center">
        <div className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-[#e2a24a]">
          Promotion
        </div>
        <div className="text-[12px] text-[#a8977a] italic mt-1">
          A queen is legal. So is showing off.
        </div>
        <div className="mt-4 flex gap-2">
          {opts.map((o) => (
            <button
              key={o.p}
              onClick={() => onPick(o.p)}
              className="btn-press group flex flex-col items-center gap-1 p-3 rounded-xl border border-[#e2a24a]/20 hover:border-[#e2a24a] hover:bg-[#e2a24a]/10 w-20"
            >
              <PieceGlyph type={o.p} color={color} className="size-12 group-hover:scale-110 transition-transform" />
              <span className="font-mono2 text-[9px] uppercase tracking-[0.15em] text-[#a8977a]">
                {o.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
