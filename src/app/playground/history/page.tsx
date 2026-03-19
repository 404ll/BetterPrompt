"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  GitCompare,
  History,
  RotateCcw,
  Save,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { usePromptStore } from "@/store/promptStore";
import { PromptSnapshot } from "@/types/prompt";
import { computeSnapshotDiff, TextDiff } from "@/lib/utils/diff-engine";

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;

  return date.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateSnapshotTitle(snapshot: PromptSnapshot): string {
  if (snapshot.title) return snapshot.title;
  const roleBlock = snapshot.blocks.find(
    (b) => b.type === "role" && b.content.trim()
  );
  if (roleBlock) {
    const preview = roleBlock.content.slice(0, 30);
    return preview + (roleBlock.content.length > 30 ? "..." : "");
  }
  return `快照 ${new Date(snapshot.timestamp).toLocaleTimeString("zh-CN")}`;
}

function renderDiffText(diffs: TextDiff[]) {
  return diffs.map((segment, idx) => {
    if (segment.type === "added") {
      return (
        <span
          key={`add-${idx}`}
          className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-sm"
        >
          {segment.value}
        </span>
      );
    }
    if (segment.type === "removed") {
      return (
        <span
          key={`remove-${idx}`}
          className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 line-through rounded-sm"
        >
          {segment.value}
        </span>
      );
    }
    return <span key={`keep-${idx}`}>{segment.value}</span>;
  });
}

export default function HistoryPage() {
  const { snapshots, isLoading, save, remove } = usePromptHistory();
  const [baseId, setBaseId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  const blocks = usePromptStore((state) => state.blocks);
  const variables = usePromptStore((state) => state.variables);
  const updateBlockContent = usePromptStore((state) => state.updateBlockContent);
  const toggleBlockActive = usePromptStore((state) => state.toggleBlockActive);
  const updateVariable = usePromptStore((state) => state.updateVariable);

  useEffect(() => {
    if (snapshots.length === 0) return;
    if (!targetId) setTargetId(snapshots[0].id);
    if (!baseId) setBaseId(snapshots[1]?.id ?? snapshots[0].id);
  }, [snapshots, baseId, targetId]);

  const baseSnapshot = snapshots.find((s) => s.id === baseId) ?? null;
  const targetSnapshot = snapshots.find((s) => s.id === targetId) ?? null;
  const currentSnapshot: PromptSnapshot = useMemo(
    () => ({
      id: "__current__",
      timestamp: Date.now(),
      blocks,
      variables,
      title: "当前未保存状态",
    }),
    [blocks, variables]
  );

  const snapshotDiff = useMemo(() => {
    if (baseSnapshot && targetSnapshot && baseSnapshot.id !== targetSnapshot.id) {
      return computeSnapshotDiff(baseSnapshot, targetSnapshot);
    }
    if (baseSnapshot && targetSnapshot && baseSnapshot.id === targetSnapshot.id) {
      return computeSnapshotDiff(baseSnapshot, currentSnapshot);
    }
    if (!baseSnapshot || !targetSnapshot) {
      return null;
    }
    return null;
  }, [baseSnapshot, targetSnapshot, currentSnapshot]);

  const changedBlocks =
    snapshotDiff?.blockDiffs.filter((b) => b.type !== "unchanged") ?? [];

  const handleSaveSnapshot = async () => {
    await save(blocks, variables);
  };

  const handleRestoreSnapshot = (snapshot: PromptSnapshot) => {
    snapshot.blocks.forEach((block) => {
      updateBlockContent(block.id, block.content);
      toggleBlockActive(block.id, block.isActive);
    });
    Object.entries(snapshot.variables).forEach(([name, value]) => {
      updateVariable(name, value);
    });
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <header className="h-14 shrink-0 border-b px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/playground"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              返回工作台
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="font-semibold flex items-center gap-2">
              <History className="h-4 w-4" />
              历史对比
            </h1>
          </div>
          <Button size="sm" variant="outline" onClick={handleSaveSnapshot}>
            <Save className="h-3.5 w-3.5 mr-1" />
            保存当前快照
          </Button>
        </header>

        <div className="flex-1 grid grid-cols-2 overflow-hidden">
          <div className="border-r p-4 overflow-hidden flex flex-col">
            <div className="text-sm text-muted-foreground mb-3">
              {snapshots.length} 个快照（选择两个版本进行对比）
            </div>
            <ScrollArea className="flex-1 border rounded-lg">
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground">加载中...</div>
              ) : snapshots.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  暂无快照，先在工作台保存一个快照。
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {snapshots.map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className={cn(
                        "rounded-lg border p-3",
                        targetId === snapshot.id && "border-blue-300 bg-blue-50/40 dark:bg-blue-900/20",
                        baseId === snapshot.id && "border-amber-300 bg-amber-50/40 dark:bg-amber-900/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {generateSnapshotTitle(snapshot)}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(snapshot.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(snapshot.id)}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          删除
                        </button>
                      </div>

                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => setBaseId(snapshot.id)}
                          className={cn(
                            "text-xs rounded px-2 py-1 border",
                            baseId === snapshot.id
                              ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300"
                              : "hover:bg-muted"
                          )}
                        >
                          设为基准 A
                        </button>
                        <button
                          onClick={() => setTargetId(snapshot.id)}
                          className={cn(
                            "text-xs rounded px-2 py-1 border",
                            targetId === snapshot.id
                              ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300"
                              : "hover:bg-muted"
                          )}
                        >
                          设为对比 B
                        </button>
                        <button
                          onClick={() => handleRestoreSnapshot(snapshot)}
                          className="text-xs rounded px-2 py-1 border hover:bg-muted inline-flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          恢复
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="p-4 overflow-hidden flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2">
                <GitCompare className="h-4 w-4" />
                Diff 结果
              </div>
              {baseSnapshot && targetSnapshot && (
                <div className="text-xs text-muted-foreground">
                  A: {generateSnapshotTitle(baseSnapshot)} → B:{" "}
                  {baseSnapshot.id === targetSnapshot.id
                    ? "当前未保存状态"
                    : generateSnapshotTitle(targetSnapshot)}
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 border rounded-lg bg-muted/20">
              {!snapshotDiff ? (
                <div className="p-4 text-sm text-muted-foreground">
                  请选择两个不同的快照进行对比。
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div className="flex gap-2 text-xs">
                    <span className="rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5">
                      +{snapshotDiff.blockDiffs.filter((b) => b.type === "added").length}
                    </span>
                    <span className="rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5">
                      ~{snapshotDiff.blockDiffs.filter((b) => b.type === "modified").length}
                    </span>
                    <span className="rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5">
                      -{snapshotDiff.blockDiffs.filter((b) => b.type === "removed").length}
                    </span>
                  </div>

                  {changedBlocks.length > 0 ? (
                    changedBlocks.map((block) => (
                      <div key={block.blockId}>
                        <div className="text-xs font-medium text-muted-foreground mb-1 uppercase flex items-center gap-2">
                          {block.newBlock?.type || block.oldBlock?.type || "block"}
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px]",
                              block.type === "added" &&
                                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                              block.type === "modified" &&
                                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                              block.type === "removed" &&
                                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            )}
                          >
                            {block.type}
                          </span>
                        </div>
                        <div className="text-sm bg-background rounded p-2 border whitespace-pre-wrap">
                          {block.textDiffs
                            ? renderDiffText(block.textDiffs)
                            : block.newBlock?.content || block.oldBlock?.content}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground rounded-lg border bg-background p-3">
                      两个版本内容一致，没有文本改动。
                    </div>
                  )}

                  {(snapshotDiff.variableDiffs.added.length > 0 ||
                    snapshotDiff.variableDiffs.removed.length > 0 ||
                    snapshotDiff.variableDiffs.modified.length > 0) && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        变量 Diff
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {snapshotDiff.variableDiffs.added.map((name) => (
                          <span
                            key={`var-add-${name}`}
                            className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded px-2 py-1 border font-mono"
                          >
                            + {name}
                          </span>
                        ))}
                        {snapshotDiff.variableDiffs.removed.map((name) => (
                          <span
                            key={`var-remove-${name}`}
                            className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded px-2 py-1 border font-mono"
                          >
                            - {name}
                          </span>
                        ))}
                        {snapshotDiff.variableDiffs.modified.map((item) => (
                          <span
                            key={`var-mod-${item.name}`}
                            className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded px-2 py-1 border font-mono"
                          >
                            ~ {item.name}: {item.oldValue || "(空)"} →{" "}
                            {item.newValue || "(空)"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

