/* ------------------------------------------------------------------ */
/*  Shawn's voice. He qualified from the Russian School of Chess and   */
/*  has never once stopped talking. Bear translations included.        */
/* ------------------------------------------------------------------ */

export type Speaker = "shawn" | "bear";

export interface Line {
  who: Speaker;
  text: string;
}

export const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const maybe = (p: number) => Math.random() < p;

const PIECE_NAMES: Record<string, string> = {
  p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king",
};
export const pieceName = (t?: string) => (t ? PIECE_NAMES[t] ?? "piece" : "piece");

/* ---------------- intro ---------------- */
export const INTRO_FIRST = (playerIsWhite: boolean): Line[] => [
  {
    who: "shawn",
    text: "Shawn Petrovich. Qualified, Russian School of Chess. The building had no heating. This builds character. And endgames.",
  },
  {
    who: "shawn",
    text: playerIsWhite
      ? "You take the white pieces. Move first. In Soviet Russia, usually the board moves you — but today, a gift."
      : "I take white. You take black. Brave. Black like coffee. Black like Bear's mood before breakfast.",
  },
  {
    who: "shawn",
    text: "Fair warning: I talk during play. My federation banned me from whispering at the board. So now I type.",
  },
  {
    who: "bear",
    text: "Bear is also here. He does not know the rules. He has opinions anyway.",
  },
];

export const INTRO_REMATCH: Line[] = [
  {
    who: "shawn",
    text: "Again! Good. The school loves a rematch. Coach Mikhail Mikhailovich would lean against the radiator and nod, once.",
  },
  { who: "bear", text: "Bear never left. Bear was always here." },
];

/* ---------------- openings ---------------- */
const OPENING_TABLE: { pat: string[]; name?: string; line?: string }[] = [
  {
    pat: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    name: "Italian Game",
    line: "The Italian! So romantic. So nineteenth century. Fine — we dance.",
  },
  {
    pat: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    name: "Ruy Lopez",
    line: "The Ruy Lopez. The Spanish torturer. My copy of this book had the pages worn through.",
  },
  {
    pat: ["e4", "c5"],
    name: "Sicilian Defense",
    line: "Ahh, the Sicilian. You want a FIGHT. Bear once wanted a fight. Once.",
  },
  {
    pat: ["e4", "e6"],
    name: "French Defense",
    line: "The French. Fine. I will simply suffer beautifully, like literature.",
  },
  {
    pat: ["e4", "c6"],
    name: "Caro-Kann",
    line: "The Caro-Kann. Solid as a bureaucrat's filing cabinet. Respected.",
  },
  {
    pat: ["e4", "e5", "Nf3", "Nf6"],
    name: "Petrov's Defense",
    line: "PETROV! You play my people's opening against ME? Now this is personal AND patriotic.",
  },
  {
    pat: ["d4", "d5", "c4"],
    name: "Queen's Gambit",
    line: "The Queen's Gambit. I accepted this gambit once in 1998. I am still calculating it.",
  },
  { pat: ["e4"], line: "King's pawn. Classical. The school approves of your manners." },
  { pat: ["d4"], line: "Queen's pawn. Solid. Patient. Boring in the way fortresses are boring. I like it." },
  { pat: ["Nf3"], line: "A Réti flavor. Modern. Suspicious. Coiled. Continue." },
  { pat: ["c4"], line: "The English. How exotic. I will allow it." },
];

export function findOpening(sans: string[]): string | null {
  let best: string | null = null;
  let bestLen = 0;
  for (const o of OPENING_TABLE) {
    if (o.pat.length > sans.length || o.pat.length <= bestLen) continue;
    const ok = o.pat.every((m, i) => sans[i] === m);
    if (ok && o.line) {
      best = o.line;
      bestLen = o.pat.length;
    }
  }
  return best;
}

/* ---------------- reactions ---------------- */
export const PLAYER_BLUNDER = [
  "Ohhh. Oh no. Mikhail Mikhailovich felt that, and he has been retired for eleven years.",
  "Write that move down. Frame it. Study it. Never do it again.",
  "In Soviet Russia, the blunder makes YOU. Old joke. Still true. Still funny to me.",
  "Bear looked away just now. He cannot watch suffering.",
  "Your {piece} had a family, you know. Had.",
  "The school has a word for that move. I am not allowed to type it.",
  "Do not worry. Champions are just beginners who have made every mistake twice. You are halfway there.",
  "I blinked and it got worse for you. Remarkable.",
];

export const PLAYER_BRILLIANT = [
  "…That was a good move. I will not say it again.",
  "Tal approves of that, from wherever legends go to complain about modern chess.",
  "Interesting. You study? With whom? Answer later — I am thinking.",
  "Fine. FINE. That was strong. Bear is clapping. Internally.",
  "You saw that? Really? The radiator of respect hums in your honor. One hum only.",
];

export const SHAWN_CAPTURE = [
  "Thank you for the {piece}. It goes on the shelf with the others.",
  "Mine now. As they say at the school: everything belongs to the patient.",
  "I remove your {piece}. No hard feelings. Only hard calculation.",
  "A small funeral for your {piece}. Bear sends condolences. I send nothing.",
  "You felt that in your spine, yes? Chess is a contact sport.",
  "Natural moves. Water flows downhill. My {taker} eats.",
  "One less puppet in your theater, friend.",
];

export const PLAYER_CAPTURE = [
  "Fine. Take the {piece}. I have nine more plans and one Bear.",
  "A gift, that {piece}. Every trap requires furniture.",
  "Bear never liked that {piece} anyway. Cluttered the aesthetic.",
  "You eat my {piece}. Bear ate a whole rotisserie chicken. You are not impressing the room.",
  "Material is temporary. Structure is forever. …The {piece} was nice though.",
];

export const SHAWN_CHECK = [
  "Check. The school taught us to announce it with dignity. CHECK.",
  "Your king must stretch his legs. Good for the circulation.",
  "Taxi for the king. Meter is running.",
];

export const PLAYER_CHECK = [
  "Check, he says. My king has dodged scarier men in scarier parks.",
  "Temporary. Like winter in Sochi.",
  "Ah, you found a check. Keep it. Souvenir.",
  "My king steps aside. Elegantly. Watch closely.",
];

export const SHAWN_BLUNDER = [
  "A deliberate inaccuracy. To test you. You are welcome.",
  "Excuse — I was distracted. Bear is eating my sandwich.",
  "The school would revoke my diploma for that move. We do not speak of this move.",
  "I meant to do that. I did not mean to do that. Both are true. Chess is paradox.",
  "Who is playing my pieces?! …It is me. Unfortunately.",
];

export const FOCUS_UP = [
  "Okay. Serious face now. Like Bear before salmon season.",
  "You are stronger than the brochure said. Adjusting.",
  "Removing the velvet gloves. Putting on the calculation.",
  "Focus. The school is watching. Theoretically. Spiritually.",
];

export const FOCUS_DOWN = [
  "I can relax slightly now. Do not tell my coach.",
  "Comfortable. I will play like it is Sunday and the samovar is warm.",
  "Breathing again. Back to pleasant chess.",
];

export const SHAWN_CASTLE = [
  "My king retires to the countryside. He will write letters.",
  "Castle. A king needs a den. Bear's single useful chess lesson.",
];
export const PLAYER_CASTLE = [
  "Castling. Safety first. Cowardice second? Joking. Mostly joking.",
];

export const SHAWN_PROMO = [
  "My pawn graduates. We do not cry at graduations. We calculate.",
  "Behold — a promotion. The little comrade rises.",
];
export const PLAYER_PROMO = [
  "A queen for you. How ambitious. How… anticipated.",
];
export const UNDERPROMO = [
  "A {piece}? Underpromotion. Romantic. Tal would light a cigarette to this.",
];

/* ---------------- idle chatter ---------------- */
export const IDLE = [
  "My coach made us arrange the pieces before every game. 'Respect the wood,' he said. Strange man. Magnificent bishop play.",
  "In school we solved one hundred puzzles before breakfast. Breakfast was also a puzzle.",
  "You know what separates the amateur from the master? The master knows which pawn to regret.",
  "I qualified on a Thursday. It was snowing. It is always snowing in these stories. That is how you know they are true.",
  "A plan is just a blunder with ambition. Think. Then think again.",
  "Karpov once won an argument with a door. True story. The door resigned.",
  "Take your time. Chess time is not real time. Real time is what my clock does to me.",
  "The secret of the Russian school: warm coat, cold calculation.",
  "Bear once sat on a chess clock. It became a federal case.",
  "I once drew a master by staring at the board very seriously. The position was lost. The stare was masterful.",
];

export const IDLE_BEAR = [
  "Bear says your pawn structure reminds him of a salmon run. This is a compliment. Probably.",
  "Bear has fallen asleep. Do not read into this. Or do. He is a psychological player.",
  "Bear suggests I take your knight. Bear is a materialist.",
  "Bear is watching your king the way he watches rivers. Patiently.",
];

/* ---------------- ends ---------------- */
export const DRAW_ACCEPT = [
  "Agreed. A draw is a small peace treaty. Bear respects treaties.",
  "Accepted. You fought like a winter road. We split the point and the fish.",
];
export const DRAW_DECLINE = [
  "No draw. Karpov once played 124 moves. I have sandwiches. Do you?",
  "Declined. The position still has things to teach. Also, I like teaching.",
  "A draw? Now? The wood objects. I object. Play on.",
];
export const RESIGN_SHAWN_WINS = [
  "Shake hands. You fought well. In the school this earns one nod. Consider yourself nodded at.",
  "A wise resignation. The school respects economy of suffering.",
];
export const SHAWN_WINS_MATE = [
  "Checkmate. Do not be sad — you lost to a qualification-certified mind. And to Bear's emotional support.",
  "Mate. The king bows, the board applauds, Bear wakes up briefly.",
];
export const SHAWN_LOSES_MATE = [
  "You mated me. In the school we say: the student becomes… a problem. Rematch. NOW. Please.",
  "Checkmate. I am framing this game. In my imaginary museum of pain. Well played, truly.",
];
export const DRAW_END = [
  "A draw. Half a point each. Bear splits a fish exactly this way.",
  "Stalemated justice. Neither of us wins; both of us talk.",
];
export const BEAR_FAREWELL = [
  "Bear thanks both players. He understood none of it. He is proud regardless.",
];

/* ---------------- quick replies ---------------- */
export const QUICK_REPLIES: { label: string; replies: string[] }[] = [
  {
    label: "Strong move, right?",
    replies: [
      "Confidence is the first casualty of calculation. But yes. Adequate.",
      "I have seen stronger. I have also seen worse. Most of the worse ones were also mine.",
    ],
  },
  {
    label: "Bear would not approve.",
    replies: [
      "Bear approves of three things: fish, naps, and my king safety. You escape his judgment. For now.",
      "Do NOT bring Bear into this. He has a very nuanced position on your rook.",
    ],
  },
  {
    label: "That was pure luck.",
    replies: [
      "Luck is just preparation wearing a fake mustache. Or so the school taught us.",
      "If this is luck, then I am the luckiest man in this district. Which is also true.",
    ],
  },
  {
    label: "Play faster!",
    replies: [
      "A Russian does not hurry. He arrives precisely when the position ripens.",
      "Speed is for blitz and for bears. This is neither. Patience.",
    ],
  },
];

export const TICKER_ITEMS = [
  "Shawn Petrovich — qualified, Russian School of Chess",
  "Best friend: Bear — unranked, undefeated",
  "He adapts to your play — the meter never lies",
  "In Soviet Russia, mate finds you",
  "Respect the wood",
  "Talkative and certified by the federation",
  "Warm coat. Cold calculation.",
  "One hundred puzzles before breakfast",
];
