"use client";

import Link from "next/link";
import { Play, History, Square } from "lucide-react";
import { usePromptStore } from "@/store/promptStore";
import { useState } from "react";

export default function Footer() {
  const blocks = usePromptStore((state) => state.blocks);
  const variables = usePromptStore((state) => state.variables);
  const modelConfigs = usePromptStore((state) => state.modelConfigs);
  const isRunningAll = usePromptStore((state) => state.isRunningAll);
  const setIsRunningAll = usePromptStore((state) => state.setIsRunningAll);
  const setModelLoading = usePromptStore((state) => state.setModelLoading);
  const setModelError = usePromptStore((state) => state.setModelError);
  const setModelResponse = usePromptStore((state) => state.setModelResponse);
  const appendModelResponse = usePromptStore(
    (state) => state.appendModelResponse
  );
  const clearAllResponses = usePromptStore((state) => state.clearAllResponses);
  const getAssembledPrompt = usePromptStore(
    (state) => state.getAssembledPrompt
  );

  const [abortControllers, setAbortControllers] = useState<
    Map<string, AbortController>
  >(new Map());

  const activeBlocksCount = blocks.filter((b) => b.isActive).length;
  const variablesCount = Object.keys(variables).length;
  const enabledModelsCount = modelConfigs.filter((c) => c.enabled).length;

  const runModel = async (
    modelConfigId: string,
    prompt: string,
    abortController: AbortController
  ) => {
    const config = modelConfigs.find((c) => c.id === modelConfigId);
    if (!config) return;

    setModelLoading(modelConfigId, true);
    setModelError(modelConfigId, null);
    setModelResponse(modelConfigId, "");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          modelId: config.model,
          parameters: config.parameters,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              appendModelResponse(modelConfigId, text);
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setModelError(modelConfigId, "已取消");
      } else {
        setModelError(
          modelConfigId,
          error instanceof Error ? error.message : "未知错误"
        );
      }
    } finally {
      setModelLoading(modelConfigId, false);
    }
  };

  const handleRunAll = async () => {
    const prompt = getAssembledPrompt();

    if (!prompt.trim()) {
      alert("请先填写提示词内容");
      return;
    }

    clearAllResponses();
    setIsRunningAll(true);

    const controllers = new Map<string, AbortController>();
    const enabledConfigs = modelConfigs.filter((c) => c.enabled);

    enabledConfigs.forEach((config) => {
      const controller = new AbortController();
      controllers.set(config.id, controller);
    });

    setAbortControllers(controllers);

    try {
      await Promise.all(
        enabledConfigs.map((config) =>
          runModel(config.id, prompt, controllers.get(config.id)!)
        )
      );
    } finally {
      setIsRunningAll(false);
      setAbortControllers(new Map());
    }
  };

  const handleStopAll = () => {
    abortControllers.forEach((controller) => controller.abort());
    setIsRunningAll(false);
  };

  return (
    <footer className="flex h-16 items-center justify-between border-t px-6 bg-background">
      <div className="flex items-center gap-4 text-sm text-muted-foreground transition-all">
        <span>
          {activeBlocksCount} 个激活的内容块 · {variablesCount} 个全局变量 ·
          已选择 {enabledModelsCount} 个模型
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/playground/history"
          className="flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <History className="h-4 w-4" />
          历史记录
        </Link>

        {isRunningAll ? (
          <button
            onClick={handleStopAll}
            className="flex items-center gap-2 rounded-md bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            <Square fill="currentColor" className="h-4 w-4" />
            停止
          </button>
        ) : (
          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="flex items-center gap-2 rounded-md bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm disabled:opacity-50"
          >
            <Play fill="currentColor" className="h-4 w-4" />
            全部运行
          </button>
        )}
      </div>
    </footer>
  );
}
