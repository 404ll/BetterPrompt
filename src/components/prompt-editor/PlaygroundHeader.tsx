"use client";

import { usePromptStore } from "@/store/promptStore";
import { FlaskConical, Variable } from "lucide-react";
import { scorePrompt } from "@/lib/utils/prompt-engine";

export default function PlaygroundHeader() {
  const blocks = usePromptStore((state) => state.blocks);
  const variables = usePromptStore((state) => state.variables);
  const updateVariable = usePromptStore((state) => state.updateVariable);

  const entries = Object.entries(variables);
  const { score } = scorePrompt(blocks);

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600 bg-green-100 dark:bg-green-900/30";
    if (s >= 60) return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
    return "text-red-600 bg-red-100 dark:bg-red-900/30";
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-card/60 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-card/40">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-[15px] font-semibold tracking-tight text-foreground">
          工作台
        </h1>
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums ${getScoreColor(score)}`}
        >
          质量 {score}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-200/80 bg-amber-50/90 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200/90">
          <FlaskConical className="h-3 w-3 opacity-80" />
          演示
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Variable className="h-4 w-4 opacity-70" strokeWidth={1.5} />
          <span className="text-[11px] uppercase tracking-wide">变量</span>
        </div>
        <div className="flex gap-2">
          {entries.length === 0 ? (
            <span className="text-xs italic text-muted-foreground">
              无变量
            </span>
          ) : (
            entries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-1.5 rounded-md border border-border/90 bg-background/80 px-2 py-1 transition-colors focus-within:border-teal-600/45 focus-within:ring-1 focus-within:ring-teal-600/20"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {key}
                </span>
                <span className="text-muted-foreground">=</span>
                <input
                  type="text"
                  placeholder="值"
                  value={value}
                  onChange={(e) => updateVariable(key, e.target.value)}
                  className="bg-transparent border-none outline-none w-20 text-xs text-foreground placeholder:text-muted-foreground"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
