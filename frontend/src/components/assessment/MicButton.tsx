import React from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "@/components/ui/use-toast";

type Props = {
  currentValue: string;
  onTranscript: (newValue: string) => void;
  className?: string;
};

const MicButton = ({ currentValue, onTranscript, className }: Props) => {
  const baseRef = React.useRef(currentValue);

  const { isListening, isSupported, toggle } = useSpeechRecognition((text, isFinal) => {
    const base = baseRef.current;
    const sep = base && !base.endsWith(" ") ? " " : "";
    const next = base + sep + text;
    onTranscript(next);
    if (isFinal) {
      baseRef.current = next;
    }
  });

  const handleClick = () => {
    if (!isSupported) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }
    if (!isListening) {
      baseRef.current = currentValue || "";
    }
    toggle();
  };

  return (
    <Button
      type="button"
      size="icon"
      variant={isListening ? "default" : "outline"}
      onClick={handleClick}
      aria-label={isListening ? "Stop dictation" : "Start dictation"}
      title={isListening ? "Stop dictation" : "Start dictation"}
      className={cn(
        isListening && "animate-pulse bg-destructive hover:bg-destructive/90 text-destructive-foreground",
        className
      )}
    >
      {isListening ? <MicOff /> : <Mic />}
    </Button>
  );
};

export default MicButton;