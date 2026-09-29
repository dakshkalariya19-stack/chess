import { useEffect, useRef } from "react";
import { MessageSquareText } from "lucide-react";

export interface ChatMsg {
  id: number;
  who: "shawn" | "bear" | "you" | "sys";
  text: string;
}

function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="size-8 rounded-full object-cover ring-1 ring-[#e2a24a]/40 shrink-0 bg-[#241b12]"
    />
  );
}

export function ChatPanel({
  messages,
  typing,
  quickReplies,
  onReply,
  allowReply,
}: {
  messages: ChatMsg[];
  typing: "shawn" | "bear" | null;
  quickReplies: { label: string }[];
  onReply: (label: string) => void;
  allowReply: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#14100b] border border-[#e2a24a]/15 rounded-xl overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#e2a24a]/12 bg-[#1a140d]">
        <MessageSquareText className="size-4 text-[#e2a24a]" />
        <span className="font-mono2 text-[11px] tracking-[0.2em] uppercase text-[#eadfc3]/90">
          Match Talk
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono2 text-[10px] text-[#a8977a]">
          <span className="size-1.5 rounded-full bg-[#7fb069] pulse-soft" />
          Shawn is always online
        </span>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto nice-scroll px-3.5 py-3 space-y-3">
        {messages.map((m) => {
          if (m.who === "sys") {
            return (
              <div key={m.id} className="msg-in text-center">
                <span className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-[#a8977a]/80">
                  {m.text}
                </span>
              </div>
            );
          }
          if (m.who === "you") {
            return (
              <div key={m.id} className="msg-in flex justify-end">
                <div className="max-w-[80%] rounded-xl rounded-br-sm bg-[#e2a24a] text-[#1a1208] px-3.5 py-2 text-[13px] leading-snug font-medium">
                  {m.text}
                </div>
              </div>
            );
          }
          const isBear = m.who === "bear";
          return (
            <div key={m.id} className="msg-in flex gap-2.5 items-start">
              <Avatar src={isBear ? "/img/bear.png" : "/img/shawn.png"} alt={isBear ? "Bear" : "Shawn"} />
              <div className="max-w-[82%]">
                <div className="font-mono2 text-[9px] uppercase tracking-[0.2em] text-[#a8977a] mb-1">
                  {isBear ? "Bear · translated" : "Shawn"}
                </div>
                <div
                  className={`rounded-xl rounded-tl-sm px-3.5 py-2 text-[13px] leading-snug border ${
                    isBear
                      ? "bg-[#241a10] border-[#8a5a3c]/40 text-[#eed9b6] italic"
                      : "bg-[#20180f] border-[#e2a24a]/15 text-[#f2ead9]"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="msg-in flex gap-2.5 items-center">
            <Avatar src={typing === "bear" ? "/img/bear.png" : "/img/shawn.png"} alt={typing} />
            <div className="rounded-xl rounded-tl-sm px-4 py-2.5 bg-[#20180f] border border-[#e2a24a]/15 flex gap-1">
              <span className="typing-dot size-1.5 rounded-full bg-[#e2a24a]" />
              <span className="typing-dot size-1.5 rounded-full bg-[#e2a24a]" />
              <span className="typing-dot size-1.5 rounded-full bg-[#e2a24a]" />
            </div>
          </div>
        )}
      </div>

      {/* quick replies */}
      <div className="px-3.5 py-3 border-t border-[#e2a24a]/12 bg-[#191309]">
        <div className="font-mono2 text-[9px] uppercase tracking-[0.22em] text-[#a8977a] mb-2">
          Say something
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickReplies.map((q) => (
            <button
              key={q.label}
              onClick={() => onReply(q.label)}
              disabled={!allowReply}
              className="btn-press text-[11px] px-2.5 py-1.5 rounded-full border border-[#e2a24a]/25 text-[#eadfc3] hover:bg-[#e2a24a] hover:text-[#1a1208] disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#eadfc3] disabled:cursor-not-allowed"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
