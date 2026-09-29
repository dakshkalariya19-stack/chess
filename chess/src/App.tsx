import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import type { Color, Move, PieceSymbol, Square } from "chess.js";
import { Crown } from "lucide-react";

import { Board } from "./components/Board";
import type { TrackedPiece } from "./components/Board";
import { ChatPanel } from "./components/Chat";
import type { ChatMsg } from "./components/Chat";
import {
  Ticker,
  ShawnCard,
  BearPolaroid,
  PlayerCard,
  ControlsBar,
  MoveList,
  EvalBar,
} from "./components/Panels";
import { IntroOverlay, GameOverOverlay, PromotionPicker } from "./components/Overlays";

import { analyzePosition, bandFor, pickShawnMove, PIECE_VAL } from "./engine/engine";
import type { PickResult } from "./engine/engine";
import {
  pick, maybe, pieceName,
  INTRO_FIRST, INTRO_REMATCH, findOpening,
  PLAYER_BLUNDER, PLAYER_BRILLIANT, SHAWN_CAPTURE, PLAYER_CAPTURE,
  SHAWN_CHECK, PLAYER_CHECK, SHAWN_BLUNDER, FOCUS_UP, FOCUS_DOWN,
  SHAWN_CASTLE, PLAYER_CASTLE, SHAWN_PROMO, PLAYER_PROMO, UNDERPROMO,
  IDLE, IDLE_BEAR, DRAW_ACCEPT, DRAW_DECLINE, RESIGN_SHAWN_WINS,
  SHAWN_WINS_MATE, SHAWN_LOSES_MATE, DRAW_END, BEAR_FAREWELL,
  QUICK_REPLIES,
} from "./engine/dialogue";
import type { Line } from "./engine/dialogue";
import {
  sMove, sCapture, sCheck, sStart, sEnd, sMsg, setMuted as setAudioMuted,
} from "./engine/sound";

/* ---------------- pieces bookkeeping ---------------- */
function initialPieces(): TrackedPiece[] {
  const chess = new Chess();
  const out: TrackedPiece[] = [];
  for (const row of chess.board())
    for (const sq of row)
      if (sq) out.push({ id: sq.color + sq.type + sq.square, type: sq.type, color: sq.color, square: sq.square });
  return out;
}

function applyTracked(prev: TrackedPiece[], m: Move): TrackedPiece[] {
  const arr = prev.map((p) => ({ ...p }));
  const mover = arr.find((p) => p.square === m.from && p.color === m.color);
  if (!mover) return prev;
  if (m.captured) {
    const capSq = (m.flags.includes("e") ? m.to[0] + m.from[1] : m.to) as Square;
    const i = arr.findIndex((p) => p.square === capSq && p.color !== m.color);
    if (i >= 0) arr.splice(i, 1);
  }
  mover.square = m.to;
  mover.type = (m.promotion as PieceSymbol) ?? m.piece;
  if (m.flags.includes("k") || m.flags.includes("q")) {
    const rank = m.color === "w" ? "1" : "8";
    const rf = ((m.flags.includes("k") ? "h" : "a") + rank) as Square;
    const rt = ((m.flags.includes("k") ? "f" : "d") + rank) as Square;
    const rook = arr.find((p) => p.square === rf);
    if (rook) rook.square = rt;
  }
  return arr;
}

const START_COUNT: Record<string, number> = { q: 1, r: 2, b: 2, n: 2, p: 8 };
function capturedOf(pieces: TrackedPiece[], color: Color): PieceSymbol[] {
  const out: PieceSymbol[] = [];
  const extraOfficers = (["q", "r", "b", "n"] as PieceSymbol[]).reduce(
    (acc, t) => acc + Math.max(0, pieces.filter((p) => p.color === color && p.type === t).length - START_COUNT[t]),
    0
  );
  (["q", "r", "b", "n", "p"] as PieceSymbol[]).forEach((t) => {
    const cur = pieces.filter((p) => p.color === color && p.type === t).length;
    let missing = START_COUNT[t] - Math.min(cur, START_COUNT[t]);
    if (t === "p") missing = Math.max(0, missing - extraOfficers);
    for (let i = 0; i < missing; i++) out.push(t);
  });
  return out;
}
function materialOf(pieces: TrackedPiece[], color: Color): number {
  return pieces.filter((p) => p.color === color).reduce((a, p) => a + PIECE_VAL[p.type], 0);
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const fmtClock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

interface OverInfo {
  title: string;
  subtitle: string;
  quote: string;
  won: boolean;
}

export default function App() {
  /* ---------- core refs ---------- */
  const chessRef = useRef(new Chess());
  const timersRef = useRef<number[]>([]);
  const genRef = useRef(0);
  const msgIdRef = useRef(0);
  const idleRef = useRef<number>(0);
  const openingRef = useRef(false);
  const declinedDrawsRef = useRef(0);
  const playerBestRef = useRef<number | null>(null);
  const lastPlayerMoveRef = useRef<Move | null>(null);

  /* mirrors for closures */
  const playerColorRef = useRef<Color>("w");
  const focusRef = useRef(56);
  const evalWhiteRef = useRef(0);
  const overRef = useRef<OverInfo | null>(null);
  const thinkingRef = useRef(false);
  const phaseRef = useRef<"intro" | "play">("intro");

  /* ---------- state ---------- */
  const [phase, setPhase] = useState<"intro" | "play">("intro");
  const [playerColor, setPlayerColor] = useState<Color>("w");
  const [pieces, setPieces] = useState<TrackedPiece[]>(initialPieces);
  const [sans, setSans] = useState<string[]>([]);
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [checkSq, setCheckSq] = useState<Square | null>(null);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState<"shawn" | "bear" | null>(null);
  const [focus, setFocus] = useState(56);
  const [thinking, setThinking] = useState(false);
  const [evalWhite, setEvalWhite] = useState(0);
  const [blunders, setBlunders] = useState(0);
  const [times, setTimes] = useState({ w: 0, b: 0 });
  const [over, setOver] = useState<OverInfo | null>(null);
  const [promo, setPromo] = useState<{ from: Square; to: Square } | null>(null);
  const [muted, setMuted] = useState(false);
  const [tab, setTab] = useState<"chat" | "moves">("chat");

  /* ---------- helpers ---------- */
  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };
  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const pushMsg = (who: ChatMsg["who"], text: string) => {
    setChat((c) => [...c.slice(-80), { id: ++msgIdRef.current, who, text }]);
    if (who === "shawn" || who === "bear") sMsg();
  };

  const sayChain = (lines: Line[], firstDelay = 400) => {
    const g = genRef.current;
    let t = firstDelay;
    for (const ln of lines) {
      schedule(() => { if (genRef.current === g) setTyping(ln.who); }, t);
      t += 380 + Math.min(ln.text.length * 20, 1650);
      schedule(() => {
        if (genRef.current !== g) return;
        setTyping(null);
        pushMsg(ln.who, ln.text);
      }, t);
      t += 380;
    }
    return t;
  };

  const setFocusBoth = (v: number) => { focusRef.current = v; setFocus(v); };
  const setEvalBoth = (v: number) => { evalWhiteRef.current = v; setEvalWhite(v); };
  const setThinkingBoth = (v: boolean) => { thinkingRef.current = v; setThinking(v); };

  const resetIdle = () => {
    if (idleRef.current) clearTimeout(idleRef.current);
    const g = genRef.current;
    idleRef.current = window.setTimeout(() => {
      if (genRef.current !== g || overRef.current || phaseRef.current !== "play") return;
      if (chessRef.current.turn() !== playerColorRef.current || thinkingRef.current) return;
      const bear = Math.random() < 0.3;
      sayChain([{ who: bear ? "bear" : "shawn", text: bear ? pick(IDLE_BEAR) : pick(IDLE) }], 300);
      resetIdle();
    }, 24000 + Math.random() * 16000);
  };

  /* ---------- clocks ---------- */
  useEffect(() => {
    if (phase !== "play") return;
    const id = window.setInterval(() => {
      if (overRef.current) return;
      const turn = chessRef.current.turn();
      setTimes((t) => ({ ...t, [turn]: t[turn] + 500 }));
    }, 500);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => { setAudioMuted(muted); }, [muted]);

  /* ---------- game end ---------- */
  const endGame = (info: OverInfo, lines: Line[]) => {
    genRef.current++; // invalidate pending chatter/engine
    overRef.current = info;
    setOver(info);
    setSelected(null);
    setPromo(null);
    setThinkingBoth(false);
    sEnd();
    pushMsg("sys", `Game over — ${info.subtitle.toLowerCase()}`);
    sayChain(lines, 1200);
  };

  const checkEnd = (): boolean => {
    const chess = chessRef.current;
    if (chess.isCheckmate()) {
      const loser = chess.turn();
      const shawnWon = loser === playerColorRef.current;
      const quote = pick(shawnWon ? SHAWN_WINS_MATE : SHAWN_LOSES_MATE);
      endGame(
        {
          title: "Checkmate",
          subtitle: shawnWon ? "Shawn writes the final sentence" : "You write the final sentence",
          quote, won: !shawnWon,
        },
        [{ who: "shawn", text: quote }, { who: "bear", text: pick(BEAR_FAREWELL) }]
      );
      return true;
    }
    const reason = chess.isStalemate()
      ? "stalemate"
      : chess.isThreefoldRepetition()
        ? "threefold repetition"
        : chess.isInsufficientMaterial()
          ? "bare kings and daydreams"
          : chess.isDraw()
            ? "the fifty-move silence"
            : null;
    if (reason) {
      const quote = pick(DRAW_END);
      endGame(
        { title: "Draw", subtitle: `By ${reason}`, quote, won: false },
        [{ who: "shawn", text: quote }, { who: "bear", text: pick(BEAR_FAREWELL) }]
      );
      return true;
    }
    return false;
  };

  /* ---------- shawn's move pipeline ---------- */
  const applyShawnMove = (res: PickResult) => {
    const chess = chessRef.current;
    const mv = chess.move(res.move);
    const after = applyTracked(piecesRef.current, res.move);
    setPieces(after);
    setSans(chess.history());
    setLastMove({ from: mv.from, to: mv.to });
    setThinkingBoth(false);

    mv.captured ? sCapture() : sMove();
    const inCheck = chess.inCheck();
    setCheckSq(
      inCheck
        ? after.find((p) => p.type === "k" && p.color === chess.turn())?.square ?? null
        : null
    );
    if (inCheck) sCheck();

    const lines: Line[] = [];
    const shawnBlundered = res.bestScore - res.score > 140;
    if (shawnBlundered) {
      lines.push({ who: "shawn", text: pick(SHAWN_BLUNDER) });
      setFocusBoth(clamp(focusRef.current + 9, 20, 97));
    }
    if (mv.captured) {
      lines.push({
        who: "shawn",
        text: pick(SHAWN_CAPTURE)
          .replace(/\{piece\}/g, pieceName(mv.captured))
          .replace(/\{taker\}/g, pieceName(mv.piece)),
      });
    }
    if (mv.promotion) lines.push({ who: "shawn", text: pick(SHAWN_PROMO) });
    if ((mv.flags.includes("k") || mv.flags.includes("q")) && maybe(0.45))
      lines.push({ who: "shawn", text: pick(SHAWN_CASTLE) });
    if (inCheck) lines.push({ who: "shawn", text: pick(SHAWN_CHECK) });
    sayChain(lines.slice(0, 2), 250);

    if (checkEnd()) return;

    /* probe the player's new position so we can grade their next move */
    const g = genRef.current;
    schedule(() => {
      if (genRef.current !== g || overRef.current) return;
      const best = analyzePosition(chess.fen()); // player perspective
      playerBestRef.current = best;
      setEvalBoth(clamp(((playerColorRef.current === "w" ? 1 : -1) * best) / 100, -9, 9));
    }, 250);

    if (maybe(0.13)) {
      schedule(() => {
        if (genRef.current === g && !overRef.current)
          sayChain([{ who: "bear", text: pick(IDLE_BEAR) }], 100);
      }, 3200);
    }
    resetIdle();
  };

  const runShawnTurn = (delay: number) => {
    const g = genRef.current;
    schedule(() => {
      if (genRef.current !== g || overRef.current) return;
      setThinkingBoth(true);
      schedule(() => {
        if (genRef.current !== g || overRef.current) return;
        let res: PickResult;
        try {
          res = pickShawnMove(chessRef.current.fen(), focusRef.current);
        } catch {
          return;
        }
        const humanDelay = 500 + Math.random() * 650 + (focusRef.current > 80 ? 300 : 0);
        schedule(() => {
          if (genRef.current !== g || overRef.current) return;
          applyShawnMove(res);
        }, humanDelay);
      }, 320);
    }, delay);
  };

  /* ---------- after the player moves ---------- */
  const analyzeAndReact = () => {
    const chess = chessRef.current;
    if (overRef.current) return;
    if (checkEnd()) return;

    const g = genRef.current;
    const lm = lastPlayerMoveRef.current;
    const shawnBest = analyzePosition(chess.fen()); // shawn perspective, cp

    /* grade the player's move + adapt focus */
    const lines: Line[] = [];
    const bestBefore = playerBestRef.current;
    if (bestBefore !== null && lm) {
      const delta = bestBefore - -shawnBest; // >0 => player's move lost ground
      if (delta > 140) {
        setBlunders((b) => b + 1);
        lines.push({ who: "shawn", text: pick(PLAYER_BLUNDER) });
      } else if (delta <= 20 && (lm.captured || lm.san.includes("+")) && maybe(0.4)) {
        lines.push({ who: "shawn", text: pick(PLAYER_BRILLIANT) });
      } else {
        if (lm.captured && maybe(0.55))
          lines.push({
            who: "shawn",
            text: pick(PLAYER_CAPTURE).replace(/\{piece\}/g, pieceName(lm.captured)),
          });
        if (lm.promotion) {
          lines.push({
            who: "shawn",
            text: pick(lm.promotion === "q" ? PLAYER_PROMO : UNDERPROMO).replace(
              /\{piece\}/g,
              pieceName(lm.promotion)
            ),
          });
        }
        if (chess.inCheck() && maybe(0.6)) lines.push({ who: "shawn", text: pick(PLAYER_CHECK) });
        if ((lm.flags.includes("k") || lm.flags.includes("q")) && maybe(0.35))
          lines.push({ who: "shawn", text: pick(PLAYER_CASTLE) });
      }
    }

    /* adaptive focus: the better YOU play, the harder HE plays */
    const shawnAdvPawns = shawnBest / 100;
    const target = clamp(56 - shawnAdvPawns * 15, 24, 97);
    const oldFocus = focusRef.current;
    const next = clamp(oldFocus + (target - oldFocus) * 0.35, 20, 97);
    const beforeBand = bandFor(oldFocus).label;
    setFocusBoth(next);
    if (bandFor(next).label !== beforeBand) {
      lines.push({ who: "shawn", text: pick(next > oldFocus ? FOCUS_UP : FOCUS_DOWN) });
    }

    setEvalBoth(
      clamp(((playerColorRef.current === "w" ? -1 : 1) * shawnBest) / 100, -9, 9)
    );

    /* keep at most 2 lines, but never drop the focus announcement */
    const finalLines = lines.length > 2 ? [lines[0], lines[lines.length - 1]] : lines;
    sayChain(finalLines, 420);
    playerBestRef.current = null;
    schedule(() => {
      if (genRef.current !== g || overRef.current) return;
      runShawnTurn(0);
    }, 650 + Math.random() * 500);
  };

  /* keep a live pieces ref for engine-apply closures */
  const piecesRef = useRef(pieces);
  piecesRef.current = pieces;

  /* ---------- player interaction ---------- */
  const targets = useMemo(() => {
    if (!selected) return [];
    try {
      const ms = chessRef.current.moves({ square: selected, verbose: true });
      const map = new Map<Square, boolean>();
      for (const m of ms) if (!map.has(m.to)) map.set(m.to, !!m.captured);
      return [...map.entries()].map(([to, capture]) => ({ to, capture }));
    } catch {
      return [];
    }
  }, [selected, pieces]);

  const finishPlayerMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    const chess = chessRef.current;
    let mv: Move;
    try {
      mv = chess.move({ from, to, promotion });
    } catch {
      return;
    }
    lastPlayerMoveRef.current = mv;
    const after = applyTracked(piecesRef.current, mv);
    setPieces(after);
    setSans(chess.history());
    setLastMove({ from, to });
    setSelected(null);
    setPromo(null);

    mv.captured ? sCapture() : sMove();
    const oppInCheck = chess.inCheck();
    setCheckSq(
      oppInCheck
        ? after.find((p) => p.type === "k" && p.color === chess.turn())?.square ?? null
        : null
    );
    if (oppInCheck) sCheck();

    if (!openingRef.current) {
      const line = findOpening(chess.history());
      if (line) {
        openingRef.current = true;
        sayChain([{ who: "shawn", text: line }], 700);
      }
    }
    resetIdle();
    const g = genRef.current;
    schedule(() => {
      if (genRef.current === g) analyzeAndReact();
    }, 90);
  };

  const onSquareClick = (sq: Square) => {
    const chess = chessRef.current;
    if (phaseRef.current !== "play" || overRef.current || promo) return;
    if (thinkingRef.current || chess.turn() !== playerColorRef.current) {
      setSelected(null);
      return;
    }
    const piece = chess.get(sq);
    if (selected) {
      if (sq === selected) { setSelected(null); return; }
      const legal = chess.moves({ square: selected, verbose: true });
      const m = legal.find((l) => l.to === sq);
      if (m) {
        if (m.promotion) { setPromo({ from: selected, to: sq }); return; }
        finishPlayerMove(selected, sq);
        return;
      }
      if (piece && piece.color === playerColorRef.current) { setSelected(sq); return; }
      setSelected(null);
      return;
    }
    if (piece && piece.color === playerColorRef.current) setSelected(sq);
  };

  /* ---------- actions ---------- */
  const startGame = (side: Color, rematch = false) => {
    genRef.current++;
    clearAllTimers();
    chessRef.current = new Chess();
    playerColorRef.current = side;
    phaseRef.current = "play";
    focusRef.current = 56;
    evalWhiteRef.current = 0;
    overRef.current = null;
    thinkingRef.current = false;

    setPlayerColor(side);
    setPhase("play");
    setOver(null);
    setPieces(initialPieces());
    setSans([]);
    setLastMove(null);
    setCheckSq(null);
    setSelected(null);
    setChat([]);
    setTyping(null);
    setFocusBoth(56);
    setEvalBoth(0);
    setBlunders(0);
    setTimes({ w: 0, b: 0 });
    setThinkingBoth(false);
    setPromo(null);
    setTab("chat");

    openingRef.current = false;
    declinedDrawsRef.current = 0;
    playerBestRef.current = null;
    lastPlayerMoveRef.current = null;

    sStart();
    pushMsg("sys", side === "w" ? "Exhibition game — you are White" : "Exhibition game — you are Black");
    const total = sayChain(rematch ? INTRO_REMATCH : INTRO_FIRST(side === "w"), 600);

    if (side === "w") {
      const g = genRef.current;
      schedule(() => {
        if (genRef.current !== g || overRef.current) return;
        playerBestRef.current = analyzePosition(chessRef.current.fen());
      }, total + 150);
    } else {
      runShawnTurn(total + 250);
    }
    resetIdle();
  };

  const onDraw = () => {
    if (overRef.current || phaseRef.current !== "play") return;
    pushMsg("you", "I offer a draw.");
    const shawnAdv = (playerColorRef.current === "w" ? -1 : 1) * evalWhiteRef.current;
    const g = genRef.current;
    schedule(() => {
      if (genRef.current !== g || overRef.current) return;
      const accept = shawnAdv < -1.3 || declinedDrawsRef.current >= 2;
      if (accept) {
        const quote = pick(DRAW_ACCEPT);
        endGame(
          { title: "Draw", subtitle: "peace treaty, signed in pencil", quote, won: false },
          [{ who: "shawn", text: quote }, { who: "bear", text: pick(BEAR_FAREWELL) }]
        );
      } else {
        declinedDrawsRef.current++;
        sayChain([{ who: "shawn", text: pick(DRAW_DECLINE) }], 200);
      }
    }, 900);
  };

  const onResign = () => {
    if (overRef.current || phaseRef.current !== "play") return;
    const quote = pick(RESIGN_SHAWN_WINS);
    endGame(
      { title: "Resignation", subtitle: "the king tips his own crown", quote, won: false },
      [{ who: "shawn", text: quote }, { who: "bear", text: pick(BEAR_FAREWELL) }]
    );
  };

  const onQuickReply = (label: string) => {
    if (phaseRef.current !== "play") return;
    pushMsg("you", label);
    const q = QUICK_REPLIES.find((x) => x.label === label);
    if (q) sayChain([{ who: "shawn", text: pick(q.replies) }], 700);
  };

  /* ---------- derived ---------- */
  const shawnColor: Color = playerColor === "w" ? "b" : "w";
  const capturedByShawn = useMemo(() => capturedOf(pieces, playerColor), [pieces, playerColor]);
  const capturedByPlayer = useMemo(() => capturedOf(pieces, shawnColor), [pieces, shawnColor]);
  const materialEdge = Math.round(
    (materialOf(pieces, shawnColor) - materialOf(pieces, playerColor)) / 100
  );
  const band = bandFor(focus);
  const myTurn = phase === "play" && !over && !thinking && chessRef.current.turn() === playerColor;

  /* ---------- render ---------- */
  if (phase === "intro") {
    return (
      <div className="grain">
        <IntroOverlay onStart={(s) => startGame(s)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen backdrop-glow grain">
      <Ticker />

      {/* header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#e2a24a]/12">
        <div className="flex items-center gap-2.5">
          <Crown className="size-4 text-[#e2a24a]" />
          <span className="font-display font-semibold">The Bear &amp; Bishop</span>
          <span className="font-mono2 text-[9px] uppercase tracking-[0.25em] text-[#a8977a] hidden sm:block">
            chess club · moscow district branch
          </span>
        </div>
        <span className="font-mono2 text-[9px] uppercase tracking-[0.25em] text-[#a8977a] hidden md:block">
          Exhibition · adaptive opponent · live
        </span>
      </header>

      {/* main */}
      <main className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,auto)_360px] gap-4 lg:gap-6 px-3 sm:px-6 py-5 max-w-[1460px] mx-auto items-start">
        {/* shawn zone */}
        <div className="flex flex-col gap-3">
          <ShawnCard
            focus={focus}
            bandLabel={band.label}
            bandColor={band.color}
            mood={band.mood}
            thinking={thinking}
            captured={capturedByShawn}
            capturedColor={playerColor}
            material={materialEdge}
          />
          <div className="hidden sm:block">
            <BearPolaroid />
          </div>
          <div className="hidden lg:block h-44">
            <MoveList sans={sans} />
          </div>
        </div>

        {/* board zone */}
        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-3 w-full lg:w-[min(620px,72vh)] mx-auto flex flex-col gap-3">
          <div className="flex gap-3 items-stretch">
            <div className="hidden sm:flex">
              <EvalBar evalWhite={evalWhite} />
            </div>
            <div className="relative flex-1 rounded-2xl p-2.5 sm:p-3 bg-gradient-to-br from-[#3a2a1c] via-[#2a1d12] to-[#1a120a] border border-[#e2a24a]/25 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
              <Board
                pieces={pieces}
                orientation={playerColor}
                interactive={phase === "play" && !over}
                selected={selected}
                targets={targets}
                lastMove={lastMove}
                checkSquare={checkSq}
                onSquareClick={onSquareClick}
              />
              <div className="mt-2 text-center font-mono2 text-[8.5px] uppercase tracking-[0.35em] text-[#a8977a]/80">
                the wood asks for respect · bear is watching
              </div>
            </div>
          </div>
          <ControlsBar
            onDraw={onDraw}
            onResign={onResign}
            onNew={() => startGame(playerColor, true)}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            disabled={!!over}
          />
          {myTurn && (
            <div className="font-mono2 text-[10px] uppercase tracking-[0.25em] text-[#e2a24a]/90 pulse-soft pl-1">
              your move — think, then think again
            </div>
          )}
        </div>

        {/* player zone */}
        <div className="lg:col-start-1 lg:row-start-2 flex flex-col gap-3">
          <PlayerCard
            side={playerColor}
            blunders={blunders}
            captured={capturedByPlayer}
            capturedColor={shawnColor}
            timeStr={fmtClock(times[playerColor])}
            active={myTurn}
          />
          <div className="hidden lg:flex items-center justify-between rounded-xl border border-[#e2a24a]/12 bg-[#14100b] px-4 py-2.5">
            <span className="font-mono2 text-[9px] uppercase tracking-[0.2em] text-[#a8977a]">
              Shawn's clock
            </span>
            <span className="font-mono2 text-sm text-[#eadfc3]">{fmtClock(times[shawnColor])}</span>
          </div>
        </div>

        {/* chat zone */}
        <div className="lg:col-start-3 lg:row-start-1 lg:row-span-3 flex flex-col min-h-0 lg:sticky lg:top-4 lg:h-[calc(100vh-8.5rem)]">
          {/* mobile tabs */}
          <div className="flex lg:hidden gap-2 mb-2">
            {(["chat", "moves"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`btn-press px-3.5 py-1.5 rounded-full border font-mono2 text-[10px] uppercase tracking-[0.18em] ${
                  tab === t
                    ? "bg-[#e2a24a] text-[#1a1208] border-[#e2a24a]"
                    : "border-[#e2a24a]/25 text-[#eadfc3]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className={`${tab === "chat" ? "flex" : "hidden"} lg:flex flex-col flex-1 min-h-[440px]`}>
            <ChatPanel
              messages={chat}
              typing={typing}
              quickReplies={QUICK_REPLIES}
              onReply={onQuickReply}
              allowReply={phase === "play"}
            />
          </div>
          <div className={`${tab === "moves" ? "block" : "hidden"} lg:hidden h-[440px]`}>
            <MoveList sans={sans} />
          </div>
        </div>
      </main>

      {/* overlays */}
      {promo && (
        <PromotionPicker
          color={playerColor}
          onPick={(p) => finishPlayerMove(promo.from, promo.to, p)}
        />
      )}
      {over && (
        <GameOverOverlay
          title={over.title}
          subtitle={over.subtitle}
          quote={over.quote}
          moves={sans.length}
          blunders={blunders}
          won={over.won}
          onRematch={() => startGame(playerColor, true)}
          onClose={() => setOver(null)}
        />
      )}
    </div>
  );
}
