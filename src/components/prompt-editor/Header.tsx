"use client";

import { usePromptStore } from "@/store/promptStore";
import { FlaskConical } from "lucide-react";

export default function Header() {
  const variables = usePromptStore((state) => state.variables);
  const updateVariable = usePromptStore((state) => state.updateVariable);

  const entries = Object.entries(variables);

  return (
    <header className="flex h-14 items-center justify-between border-b px-6 bg-background">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Better Prompt</h1>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          MVP 2.0
        </span>
        <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          <FlaskConical className="h-3 w-3" />
          演示模式
        </span>
      </div>
      
      {/* 全局变量区 */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>全局变量：</span>
        <div className="flex gap-2">
          {entries.length === 0 ? (
            <span className="text-xs italic text-zinc-400">目前没有变量</span>
          ) : (
            entries.map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 border rounded-md px-2 py-1 bg-muted/50 transition-colors focus-within:border-primary/50">
                <span className="font-mono text-xs text-zinc-500">{"{" + "{" + key + "}" + "}"}</span>
                <input 
                  type="text" 
                  placeholder={`输入 ${key}`}
                  value={value}
                  onChange={(e) => updateVariable(key, e.target.value)}
                  className="bg-transparent border-none outline-none w-24 text-xs text-foreground placeholder:text-muted-foreground" 
                />
              </div>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
