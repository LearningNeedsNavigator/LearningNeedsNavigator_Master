import { HelpCircle } from "lucide-react";

type HelpButtonProps = {
  variant?: "inline" | "floating";
};

const HelpButton = ({ variant = "inline" }: HelpButtonProps) => {
  const subject = encodeURIComponent("Learning Needs Navigator Support");
  const href = `mailto:info_arnaintelligence@alis-global.com?subject=${subject}`;

  if (variant === "floating") {
    return (
      <a
        href={href}
        aria-label="Need Help? Contact support"
        className="hidden md:inline-flex fixed bottom-6 right-6 z-50 items-center justify-center gap-2 rounded-full bg-[#0D9488] text-white shadow-lg ring-1 ring-black/5 transition hover:brightness-110 hover:scale-105 print:hidden px-4 py-3"
      >
        <HelpCircle className="h-7 w-7" />
      </a>
    );
  }

  return (
    <a
      href={href}
      aria-label="Need Help? Contact support"
      className="inline-flex items-center gap-2 rounded-full bg-[#0D9488] px-3 py-2 sm:px-4 text-sm font-medium text-white shadow-md transition hover:brightness-110"
    >
      <HelpCircle className="h-4 w-4" />
      <span>Need Help?</span>
    </a>
  );
};

export default HelpButton;
