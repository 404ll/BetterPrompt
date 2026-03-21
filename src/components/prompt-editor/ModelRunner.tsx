"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Loader2, Copy, Check } from "lucide-react";
import { usePromptStore } from "@/store/promptStore";
import { ModelId } from "@/types/prompt";
import { useState } from "react";

const MODEL_OPTIONS: { value: ModelId; label: string }[] = [
  { value: "gpt-4o", label: "GPT-4 Omni" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "deepseek", label: "DeepSeek Coder" },
];

interface ModelRunnerProps {
  modelConfigId: string;
}

export default function ModelRunner({ modelConfigId }: ModelRunnerProps) {
  const [copied, setCopied] = useState(false);

  const modelConfig = usePromptStore((state) =>
    state.modelConfigs.find((c) => c.id === modelConfigId)
  );
  const updateModelConfig = usePromptStore((state) => state.updateModelConfig);

  if (!modelConfig) {
    return <div className="p-4 text-muted-foreground">模型配置未找到</div>;
  }

  const { model, response, isLoading, error } = modelConfig;

  const handleModelChange = (value: string) => {
    updateModelConfig(modelConfigId, { model: value as ModelId });
  };

  const handleCopy = async () => {
    if (response) {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const modelLabel =
    MODEL_OPTIONS.find((m) => m.value === model)?.label || model;

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/80 bg-card/40 px-4 backdrop-blur-sm">
        <Select value={model} onValueChange={handleModelChange}>
          <SelectTrigger className="w-[180px] h-8 text-xs font-semibold focus:ring-0">
            <SelectValue placeholder="请选择模型..." />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          {response && !isLoading && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title="复制响应"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          )}

          {isLoading ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-teal-800 dark:text-teal-300/90">
              <Loader2 className="h-3 w-3 animate-spin" />
              生成中...
            </span>
          ) : error ? (
            <span className="flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertCircle className="h-3 w-3" />
              失败
            </span>
          ) : response ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              完成
            </span>
          ) : (
            <span className="text-xs text-muted-foreground mr-1">就绪</span>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : response ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {response}
            </pre>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground italic text-sm mt-32 text-center">
              {modelLabel} 正在等待提示词执行...
              <br />
              点击“全部运行”来观察模型表现。
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
