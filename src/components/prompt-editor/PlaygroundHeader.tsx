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
    <header className="flex h-14 items-center justify-between border-b px-4 bg-background shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold">调优工作台</h1>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getScoreColor(score)}`}
        >
          质量分 {score}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          <FlaskConical className="h-3 w-3" />
          演示模式
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Variable className="h-4 w-4" />
          <span className="text-xs">变量：</span>
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
                className="flex items-center gap-1.5 border rounded-md px-2 py-1 bg-muted/50 transition-colors focus-within:border-violet-500/50"
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
