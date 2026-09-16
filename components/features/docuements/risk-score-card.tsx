import { cn } from "cn";

import { Card, CardContent } from "@/components/ui/card";
import { riskScoreLabel, RISK_TONE_CLASSES } from "@/lib/analysis-view";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RiskScoreCard({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-1 py-8 text-center">
          <p className="text-sm font-medium">Risk score pending</p>
          <p className="text-xs text-muted-foreground">
            Will appear once analysis completes.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { label, tone } = riskScoreLabel(score);
  const toneClasses = RISK_TONE_CLASSES[tone];
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <Card>
      <CardContent className="flex flex-row items-center gap-6 py-2">
        <div className="relative shrink-0">
          <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth={8}
            />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className={cn("transition-all duration-700 ease-out", toneClasses.ring)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">{score}</span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
              toneClasses.bg,
              toneClasses.text
            )}
          >
            {label}
          </span>
          <p className="mt-2 text-sm text-muted-foreground">
            Overall risk score generated from this document&apos;s AI
            analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
