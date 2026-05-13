import { cn } from "@/lib/utils";

/** Hand-stamped underline that sits below a word in the hero. */
export function WigglyUnderline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 9 C 20 2, 40 13, 60 6 S 100 12, 120 5 S 160 13, 198 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Four-point sparkle / "spark of joy" mark. */
export function Sparkle({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 0 C 12 6, 13 11, 24 12 C 13 13, 12 18, 12 24 C 12 18, 11 13, 0 12 C 11 11, 12 6, 12 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Bold six-point asterisk used as a floating accent in the hero/about. */
export function Asterisk({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="8" strokeLinecap="round">
        <line x1="32" y1="8"  x2="32" y2="56" />
        <line x1="11" y1="20" x2="53" y2="44" />
        <line x1="11" y1="44" x2="53" y2="20" />
      </g>
    </svg>
  );
}

/** A short squiggle used inline (e.g. divider). */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 12"
      aria-hidden="true"
      className={cn("h-3 w-20", className)}
    >
      <path
        d="M2 6 Q 12 0, 22 6 T 42 6 T 62 6 T 78 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
