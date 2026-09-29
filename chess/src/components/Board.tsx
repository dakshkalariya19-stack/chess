import type { Color, PieceSymbol, Square } from "chess.js";
import { PieceGlyph } from "./PieceGlyph";

export interface TrackedPiece {
  id: string;
  type: PieceSymbol;
  color: Color;
  square: Square;
}

export interface MoveTarget {
  to: Square;
  capture: boolean;
}

const FILES = "abcdefgh";

function posOf(sq: Square, orientation: Color): { col: number; row: number } {
  const file = FILES.indexOf(sq[0]);
  const rank = sq.charCodeAt(1) - 49; // 0..7
  return {
    col: orientation === "w" ? file : 7 - file,
    row: orientation === "w" ? 7 - rank : rank,
  };
}

interface BoardProps {
  pieces: TrackedPiece[];
  orientation: Color;
  interactive: boolean;
  selected: Square | null;
  targets: MoveTarget[];
  lastMove: { from: Square; to: Square } | null;
  checkSquare: Square | null;
  onSquareClick: (sq: Square) => void;
}

export function Board({
  pieces,
  orientation,
  interactive,
  selected,
  targets,
  lastMove,
  checkSquare,
  onSquareClick,
}: BoardProps) {
  const squares: Square[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const file = orientation === "w" ? col : 7 - col;
      const rank = orientation === "w" ? 7 - row : row;
      squares.push((FILES[file] + (rank + 1)) as Square);
    }
  }

  const targetMap = new Map<Square, boolean>();
  targets.forEach((t) => targetMap.set(t.to, t.capture));

  return (
    <div className="relative w-full aspect-square select-none">
      {squares.map((sq) => {
        const file = FILES.indexOf(sq[0]);
        const rank = sq.charCodeAt(1) - 49;
        const dark = (file + rank) % 2 === 0;
        const { col, row } = posOf(sq, orientation);
        const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
        const isSel = selected === sq;
        const target = targetMap.has(sq) ? targetMap.get(sq) : undefined;
        const isCheck = checkSquare === sq;

        return (
          <button
            key={sq}
            onClick={() => onSquareClick(sq)}
            disabled={!interactive}
            className={`absolute w-[12.5%] h-[12.5%] outline-none ${interactive ? "cursor-pointer" : "cursor-default"}`}
            style={{
              left: `${col * 12.5}%`,
              top: `${row * 12.5}%`,
              backgroundColor: dark ? "var(--board-d)" : "var(--board-l)",
            }}
            aria-label={sq}
          >
            {/* last move wash */}
            {isLast && (
              <span className="absolute inset-0 bg-[#e2a24a]/30 pointer-events-none" />
            )}
            {/* selected ring */}
            {isSel && (
              <span className="absolute inset-0 pointer-events-none shadow-[inset_0_0_0_3px_#e2a24a]" />
            )}
            {/* check glow */}
            {isCheck && (
              <span className="absolute inset-0 check-glow bg-[#c8462b]/35 pointer-events-none" />
            )}
            {/* target markers */}
            {target === false && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[26%] rounded-full bg-[#241708]/35 pointer-events-none" />
            )}
            {target === true && (
              <span className="absolute inset-[6%] rounded-full border-[3px] border-[#c8462b]/70 pointer-events-none" />
            )}
            {/* coordinates */}
            {(orientation === "w" ? file === 0 : file === 7) && (
              <span
                className={`absolute left-[4%] top-[3%] text-[9px] sm:text-[10px] font-mono2 pointer-events-none ${dark ? "text-[#ecdfc1]/70" : "text-[#6b4a33]"}`}
              >
                {sq[1]}
              </span>
            )}
            {(orientation === "w" ? rank === 0 : rank === 7) && (
              <span
                className={`absolute right-[5%] bottom-[3%] text-[9px] sm:text-[10px] font-mono2 pointer-events-none ${dark ? "text-[#ecdfc1]/70" : "text-[#6b4a33]"}`}
              >
                {sq[0]}
              </span>
            )}
          </button>
        );
      })}

      {/* pieces */}
      {pieces.map((p) => {
        const { col, row } = posOf(p.square, orientation);
        const isSel = selected === p.square;
        return (
          <div
            key={p.id}
            className={`piece-wrap absolute w-[12.5%] h-[12.5%] flex items-center justify-center pointer-events-none ${isSel ? "piece-lift" : ""}`}
            style={{
              left: `${col * 12.5}%`,
              top: `${row * 12.5}%`,
              zIndex: isSel ? 30 : 10,
            }}
          >
            <PieceGlyph type={p.type} color={p.color} className="w-[86%] h-[86%]" />
          </div>
        );
      })}
    </div>
  );
}
