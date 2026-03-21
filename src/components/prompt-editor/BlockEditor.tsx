"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { usePromptStore } from "@/store/promptStore";
import { cn } from "@/lib/utils";

export default function BlockEditor() {
  const blocks = usePromptStore((state) => state.blocks);
  const updateBlockContent = usePromptStore((state) => state.updateBlockContent);
  const toggleBlockActive = usePromptStore((state) => state.toggleBlockActive);

  return (
    <div className="flex h-full flex-col border-r border-border/80 bg-background/50">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/80 bg-card/40 px-4 backdrop-blur-sm">
        <h2 className="font-display text-sm font-semibold tracking-tight text-foreground/95">
          策略
        </h2>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Blocks
        </span>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-4">
          
          {blocks.map((block) => (
            <div 
              key={block.id} 
              className={cn(
                "group/card flex flex-col gap-2 rounded-lg border border-border/90 bg-card/90 p-4 shadow-sm transition-colors",
                block.type === "input" &&
                  "border-teal-600/25 shadow-[inset_0_1px_0_0_oklch(0.62_0.12_175_/_12%)]",
                block.isActive
                  ? "hover:border-border"
                  : "opacity-60 bg-muted/25"
              )}
            >
              <div className="flex items-center gap-3">
                <Checkbox 
                  id={block.id} 
                  checked={block.isActive} 
                  onCheckedChange={(checked) => toggleBlockActive(block.id, checked as boolean)}
                />
                <label htmlFor={block.id} className="text-sm font-medium leading-none cursor-pointer">
                  {block.title}
                </label>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                   <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded capitalize">{block.type}</span>
                </div>
              </div>
              <Textarea 
                placeholder="在此输入内容..." 
                className={cn(
                  "mt-2 text-sm resize-none focus-visible:ring-1 transition-all",
                  block.type === 'input' ? "min-h-[120px] bg-muted/50 border-transparent" : "min-h-[80px] bg-transparent border-transparent hover:border-border focus:border-border",
                  !block.isActive && "pointer-events-none opacity-50"
                )}
                value={block.content}
                onChange={(e) => updateBlockContent(block.id, e.target.value)}
                readOnly={!block.isActive}
              />
            </div>
          ))}

        </div>
      </ScrollArea>
    </div>
  );
}
