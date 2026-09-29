import { Chess, Move } from "chess.js";

/* ------------------------------------------------------------------ */
/*  Shawn's brain: a compact alpha-beta engine with an adaptive ego.   */
/* ------------------------------------------------------------------ */

export const PIECE_VAL: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 0,
};

const MATE = 100_000;
const INF = 1_000_000;

/* Piece-square tables (white perspective, a8 = index 0 ... h1 = 63) */
const PST_P = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
  20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5,
  -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];
const PST_N = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30,
  0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20,
  20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20,
  -40, -50, -40, -30, -30, -30, -30, -40, -50,
];
const PST_B = [
  -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0,
  5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10,
  0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20,
  -10, -10, -10, -10, -10, -10, -20,
];
const PST_R = [
  0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0,
  -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0,
  0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
];
const PST_Q = [
  -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
  5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5,
  5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10,
  -10, -20,
];
const PST_K = [
  -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
  -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40,
  -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20,
  -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
];
const PST_KE = [
  -50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30,
  -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30,
  -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30,
  0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50,
];

/* ---- evaluation ---- */
function evalWhite(chess: Chess): number {
  const b = chess.board();
  let score = 0;
  let nonKingMat = 0;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = b[r][f];
      if (!sq) continue;
      if (sq.type !== "k") nonKingMat += PIECE_VAL[sq.type];
    }
  }
  const endgame = nonKingMat <= 1600;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = b[r][f];
      if (!sq) continue;
      const idx = r * 8 + f;
      let table: number[];
      switch (sq.type) {
        case "p": table = PST_P; break;
        case "n": table = PST_N; break;
        case "b": table = PST_B; break;
        case "r": table = PST_R; break;
        case "q": table = PST_Q; break;
        default: table = endgame ? PST_KE : PST_K;
      }
      const v = PIECE_VAL[sq.type] + (sq.color === "w" ? table[idx] : table[idx ^ 56]);
      score += sq.color === "w" ? v : -v;
    }
  }
  return score;
}

function sideEval(chess: Chess): number {
  const s = evalWhite(chess);
  return chess.turn() === "w" ? s : -s;
}

export function staticEvalWhite(fen: string): number {
  return evalWhite(new Chess(fen));
}

/* ---- search plumbing ---- */
const ABORT = Symbol("abort");
let nodes = 0;
let deadline = 0;

function checkTime() {
  if ((nodes & 1023) === 0 && performance.now() > deadline) throw ABORT;
}

function moveOrderScore(m: Move): number {
  let s = 0;
  if (m.captured) s += 10 * PIECE_VAL[m.captured] - PIECE_VAL[m.piece];
  if (m.promotion) s += PIECE_VAL[m.promotion] + 600;
  if (m.san.includes("+")) s += 40;
  if (m.san.includes("#")) s += 60_000;
  return s;
}

function genOrdered(chess: Chess, capturesOnly = false): Move[] {
  const moves = chess.moves({ verbose: true });
  const list = capturesOnly ? moves.filter((m) => !!m.captured) : moves;
  list.sort((a, b) => moveOrderScore(b) - moveOrderScore(a));
  return list;
}

function quiesce(chess: Chess, alpha: number, beta: number, depth: number): number {
  nodes++;
  checkTime();
  const inCheck = chess.inCheck();
  const stand = sideEval(chess);
  if (depth <= 0) return stand;
  if (!inCheck) {
    if (stand >= beta) return stand;
    if (alpha < stand) alpha = stand;
  }
  const moves = genOrdered(chess, !inCheck);
  for (const m of moves) {
    chess.move(m);
    const s = -quiesce(chess, -beta, -alpha, depth - 1);
    chess.undo();
    if (s >= beta) return s;
    if (s > alpha) alpha = s;
  }
  return alpha;
}

function negamax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  ply: number,
  useQ: boolean
): number {
  nodes++;
  checkTime();
  const moves = genOrdered(chess);
  if (moves.length === 0) return chess.inCheck() ? -MATE + ply : 0;
  if (depth === 0) return useQ ? quiesce(chess, alpha, beta, 5) : sideEval(chess);

  let best = -INF;
  for (const m of moves) {
    chess.move(m);
    const s = -negamax(chess, depth - 1, -beta, -alpha, ply + 1, useQ);
    chess.undo();
    if (s > best) best = s;
    if (s > alpha) alpha = s;
    if (alpha >= beta) break;
  }
  return best;
}

export interface RootMove {
  move: Move;
  score: number; // relative to side to move, centipawns
}

export function searchRoot(
  fen: string,
  opts: { maxDepth: number; deadlineMs: number; useQ: boolean }
): RootMove[] {
  const chess = new Chess(fen);
  nodes = 0;
  deadline = performance.now() + opts.deadlineMs;

  let root: RootMove[] = genOrdered(chess).map((m) => ({ move: m, score: 0 }));
  if (root.length === 0) return [];

  try {
    for (let d = 1; d <= opts.maxDepth; d++) {
      const scored: RootMove[] = [];
      for (const rm of root) {
        if (performance.now() > deadline) throw ABORT;
        chess.move(rm.move);
        const s = -negamax(chess, d - 1, -INF, INF, 1, opts.useQ);
        chess.undo();
        scored.push({ move: rm.move, score: s });
      }
      scored.sort((a, b) => b.score - a.score);
      root = scored;
    }
  } catch (e) {
    if (e !== ABORT) throw e;
  }
  /* emergency fallback if the clock died on depth 1 */
  if (root.every((r) => r.score === 0)) {
    for (const rm of root) {
      chess.move(rm.move);
      rm.score = -sideEval(chess);
      chess.undo();
    }
    root.sort((a, b) => b.score - a.score);
  }
  return root;
}

/* ---- adaptive skill bands ---- */
export interface Band {
  key: string;
  label: string;
  color: string;
  depth: number;
  topK: number;
  deadline: number;
  useQ: boolean;
  mood: string;
}

const BANDS: Band[] = [
  {
    key: "casual", label: "Casual", color: "#7fb069",
    depth: 1, topK: 6, deadline: 300, useQ: false,
    mood: "Daydreaming about fishing with Bear.",
  },
  {
    key: "warm", label: "Warming Up", color: "#e2c04a",
    depth: 2, topK: 3, deadline: 550, useQ: true,
    mood: "Sipping tea. Polite. Dangerous.",
  },
  {
    key: "focused", label: "Focused", color: "#e2a24a",
    depth: 2, topK: 1, deadline: 750, useQ: true,
    mood: "Counting. Always counting.",
  },
  {
    key: "serious", label: "Serious", color: "#e2762e",
    depth: 3, topK: 2, deadline: 950, useQ: true,
    mood: "The velvet gloves are OFF.",
  },
  {
    key: "gm", label: "Grandmaster", color: "#c8462b",
    depth: 3, topK: 1, deadline: 1150, useQ: true,
    mood: "Full Soviet school protocol engaged.",
  },
];

export function bandFor(focus: number): Band {
  if (focus < 38) return BANDS[0];
  if (focus < 55) return BANDS[1];
  if (focus < 72) return BANDS[2];
  if (focus < 88) return BANDS[3];
  return BANDS[4];
}

export interface PickResult {
  move: Move;
  score: number;
  bestScore: number;
  band: Band;
}

export function pickShawnMove(fen: string, focus: number): PickResult {
  const band = bandFor(focus);
  const root = searchRoot(fen, {
    maxDepth: band.depth,
    deadlineMs: band.deadline,
    useQ: band.useQ,
  });
  if (root.length === 0) throw new Error("no moves");
  const best = root[0];
  const pool = root.filter((r) => r.score >= best.score - 110).slice(0, band.topK);
  let chosen = pool[0];
  if (pool.length > 1) {
    const weights = pool.map((_, i) => pool.length - i);
    let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i];
      if (roll <= 0) { chosen = pool[i]; break; }
    }
  }
  return { move: chosen.move, score: chosen.score, bestScore: best.score, band };
}

/** quick position probe used to grade the player's moves */
export function analyzePosition(fen: string): number {
  const root = searchRoot(fen, { maxDepth: 2, deadlineMs: 320, useQ: true });
  return root.length ? root[0].score : sideEval(new Chess(fen));
}
