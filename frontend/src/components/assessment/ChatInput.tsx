import React, { useRef, useState, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "@/components/ui/use-toast";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
};

const ChatInput = ({
  value,
  onChange,
  placeholder = "Type or speak your response...",
  minRows = 3,
  maxRows = 12,
}: Props) => {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const baseRef = useRef(value);
  const [interim, setInterim] = useState("");

  const { isListening, isSupported, toggle } = useSpeechRecognition((text, isFinal) => {
    const base = baseRef.current;
    const sep = base && !base.endsWith(" ") && base.length > 0 ? " " : "";
    if (isFinal) {
      const next = base + sep + text;
      baseRef.current = next;
      setInterim("");
      onChange(next);
    } else {
      setInterim(text);
      onChange(base + sep + text);
    }
  });

  // Auto-resize
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 24;
    const max = lineHeight * maxRows;
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [value, maxRows]);

  const handleMicClick = () => {
    if (!isSupported) {
      toast({
        title: "Speech recognition not supported",
        description: "Try Chrome, Edge, or Safari for voice input.",
        variant: "destructive",
      });
      return;
    }
    if (!isListening) {
      baseRef.current = value || "";
      setInterim("");
    } else {
      // stopping: commit any interim text
      if (interim) {
        const base = baseRef.current;
        const sep = base && !base.endsWith(" ") && base.length > 0 ? " " : "";
        baseRef.current = base + sep + interim;
        onChange(baseRef.current);
        setInterim("");
      }
    }
    toggle();
  };

  return (
    <div className="w-full space-y-3">
      <div
        className={cn(
          "group relative rounded-3xl border bg-card shadow-sm transition-all",
          "focus-within:shadow-md focus-within:border-primary/40",
          isListening && "border-primary/60 ring-2 ring-primary/20"
        )}
      >
        {/* Listening halo */}
        {isListening && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl">
            <div className="absolute inset-0 rounded-3xl bg-primary/5 animate-pulse" />
          </div>
        )}

        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => {
            baseRef.current = e.target.value;
            onChange(e.target.value);
          }}
          placeholder={isListening ? "Listening..." : placeholder}
          rows={minRows}
          className={cn(
            "relative w-full resize-none bg-transparent px-5 pt-4 pb-14",
            "text-base leading-6 text-foreground placeholder:text-muted-foreground",
            "outline-none focus:outline-none rounded-3xl"
          )}
        />

        {/* Bottom toolbar */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2">
            {isListening && (
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Listening{interim ? "…" : ""}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleMicClick}
              aria-label={isListening ? "Stop dictation" : "Start dictation"}
              title={isListening ? "Stop dictation" : "Start dictation"}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full transition-all",
                "hover:bg-muted",
                isListening &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md scale-105"
              )}
            >
              {isListening ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Equalizer bars when listening */}
        {isListening && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-0.5 bg-primary/70 rounded-full animate-pulse"
                style={{
                  height: `${30 + ((i * 17) % 70)}%`,
                  animationDelay: `${i * 120}ms`,
                  animationDuration: "900ms",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;