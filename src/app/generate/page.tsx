"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  Wand2,
  FileText,
  Lightbulb,
  Copy,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePromptStore } from "@/store/promptStore";

type GenerateStyle = "concise" | "detailed" | "creative";

const styleOptions: {
  value: GenerateStyle;
  label: string;
  description: string;
  icon: typeof FileText;
}[] = [
  {
    value: "concise",
    label: "简洁",
    description: "精炼扼要",
    icon: FileText,
  },
  {
    value: "detailed",
    label: "详细",
    description: "完整指导",
    icon: Wand2,
  },
  {
    value: "creative",
    label: "创意",
    description: "发挥想象",
    icon: Lightbulb,
  },
];

const examplePrompts = [
  "帮我写一个代码审查助手，能够分析代码质量并给出改进建议",
  "创建一个英语学习助手，帮助用户练习口语对话",
  "设计一个产品经理助手，帮助撰写 PRD 文档",
  "写一个数据分析师，能够解读数据并生成报告",
];

interface GeneratedPrompt {
  role: string;
  context: string;
  input: string;
  output: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<GenerateStyle>("detailed");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] =
    useState<GeneratedPrompt | null>(null);
  const [rawOutput, setRawOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const updateBlockContent = usePromptStore(
    (state) => state.updateBlockContent
  );

  const handleGenerate = async () => {
    if (!description.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedPrompt(null);
    setRawOutput("");

    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, style }),
      });

      if (!response.ok) {
        throw new Error("生成失败");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              accumulated += text;
              setRawOutput(accumulated);
            } catch {
              // ignore
            }
          }
        }
      }

      try {
        const parsed = JSON.parse(accumulated);
        setGeneratedPrompt(parsed);
      } catch {
        console.error("Failed to parse generated prompt");
      }
    } catch (error) {
      console.error("Generate error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedPrompt) {
      const text = `Role: ${generatedPrompt.role}\n\nContext: ${generatedPrompt.context}\n\nInput: ${generatedPrompt.input}\n\nOutput: ${generatedPrompt.output}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUseInPlayground = () => {
    if (generatedPrompt) {
      updateBlockContent("role1", generatedPrompt.role);
      updateBlockContent("context1", generatedPrompt.context);
      updateBlockContent("input1", generatedPrompt.input);
      updateBlockContent("out1", generatedPrompt.output);
      router.push("/playground");
    }
  };

  return (
    <AppShell>
      <div className="h-full overflow-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">一句话生成 Prompt</h1>
            </div>
            <p className="text-muted-foreground">
              描述你想要的 AI 助手，我们帮你生成专业的结构化 Prompt
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-medium mb-2 block">
                描述你的需求
              </label>
              <Textarea
                placeholder="例如：帮我写一个代码审查助手，能够分析代码质量并给出改进建议..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] text-base"
              />
            </div>

            {/* Example Prompts */}
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example) => (
                <button
                  key={example}
                  onClick={() => setDescription(example)}
                  className="text-xs px-3 py-1.5 rounded-full border bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {example.slice(0, 25)}...
                </button>
              ))}
            </div>

            {/* Style Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                生成风格
              </label>
              <div className="flex gap-3">
                {styleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStyle(option.value)}
                    className={cn(
                      "flex-1 flex items-center gap-3 rounded-lg border p-4 transition-all",
                      style === option.value
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                        : "hover:border-muted-foreground/30"
                    )}
                  >
                    <option.icon
                      className={cn(
                        "h-5 w-5",
                        style === option.value
                          ? "text-violet-600"
                          : "text-muted-foreground"
                      )}
                    />
                    <div className="text-left">
                      <div
                        className={cn(
                          "font-medium text-sm",
                          style === option.value && "text-violet-700 dark:text-violet-300"
                        )}
                      >
                        {option.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!description.trim() || isGenerating}
              className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  生成 Prompt
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          {(isGenerating || generatedPrompt) && (
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
                <h2 className="font-medium">生成结果</h2>
                {generatedPrompt && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-8"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      复制
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUseInPlayground}
                      className="h-8 bg-violet-600 hover:bg-violet-700"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-1" />
                      在工作台中使用
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-4">
                {isGenerating && !generatedPrompt ? (
                  <div className="font-mono text-sm whitespace-pre-wrap text-muted-foreground">
                    {rawOutput || "正在生成..."}
                  </div>
                ) : generatedPrompt ? (
                  <>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-violet-600 uppercase tracking-wide">
                        Role · 角色定义
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-sm">
                        {generatedPrompt.role}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        Context · 背景信息
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-sm">
                        {generatedPrompt.context}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
                        Input · 输入格式
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-sm font-mono">
                        {generatedPrompt.input}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                        Output · 输出约束
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-sm">
                        {generatedPrompt.output}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
