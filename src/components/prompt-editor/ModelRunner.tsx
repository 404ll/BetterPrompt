import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Loader2 } from "lucide-react";

interface ModelRunnerProps {
  modelId: string;
  defaultModel: string;
  title: string;
}

export default function ModelRunner({ modelId, defaultModel, title }: ModelRunnerProps) {
  // Placeholder variables for static UI Phase 1
  const isGenerating = false;
  const isError = false;

  return (
    <div className="flex h-full flex-col bg-slate-50/50 dark:bg-zinc-950">
      {/* 顶部模型选择和动作区 */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4 bg-background">
        <Select defaultValue={defaultModel}>
          <SelectTrigger className="w-[180px] h-8 text-xs font-semibold focus:ring-0">
            <SelectValue placeholder="请选择模型..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">GPT-4 Omni</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
            <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
            <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
            <SelectItem value="deepseek">DeepSeek Coder</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2">
          {/* Status Indicators (Placeholder) */}
          {isGenerating ? (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <Loader2 className="h-3 w-3 animate-spin" />
              生成中...
            </span>
          ) : isError ? (
            <span className="flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertCircle className="h-3 w-3" />
              失败
            </span>
          ) : (
            <span className="text-xs text-muted-foreground mr-1">就绪</span>
          )}
        </div>
      </div>

      {/* 生成结果展示区 */}
      <ScrollArea className="flex-1 p-4">
        {/* Placeholder Response */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground italic text-sm mt-32 text-center">
            {title} 正在等待提示词执行...
            <br />
            点击“全部运行”来观察模型表现。
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}
