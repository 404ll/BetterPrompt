import { Play, History } from "lucide-react";

export default function Footer() {
  return (
    <footer className="flex h-16 items-center justify-between border-t px-6 bg-background">
      <div className="flex items-center gap-4 text-sm text-muted-foreground transition-all">
        {/* Placeholder for status text */}
        <span>2 个内容块 · 1 个变量 · 已选择 2 个模型</span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* History / Diff View button */}
        <button className="flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          <History className="h-4 w-4" />
          历史记录
        </button>

        {/* Run All Button */}
        <button className="flex items-center gap-2 rounded-md bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm">
          <Play fill="currentColor" className="h-4 w-4" />
          全部运行
        </button>
      </div>
    </footer>
  );
}
