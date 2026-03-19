"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, RotateCcw, Clock, FileText } from "lucide-react";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { usePromptStore } from "@/store/promptStore";
import { PromptSnapshot } from "@/types/prompt";
import { cn } from "@/lib/utils";
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

interface HistoryDialogProps {
  trigger?: React.ReactNode;
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

export default function HistoryDialog({ trigger }: HistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { snapshots, isLoading, save, remove } = usePromptHistory();

  const blocks = usePromptStore((state) => state.blocks);
  const variables = usePromptStore((state) => state.variables);

  const updateBlockContent = usePromptStore(
    (state) => state.updateBlockContent
  );
  const toggleBlockActive = usePromptStore(
    (state) => state.toggleBlockActive
  );
  const updateVariable = usePromptStore((state) => state.updateVariable);

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

    setOpen(false);
  };

  const handleDeleteSnapshot = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await remove(id);
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const selectedSnapshot = snapshots.find((s) => s.id === selectedId);
  const selectedIndex = snapshots.findIndex((s) => s.id === selectedId);
  const previousSnapshot =
    selectedIndex >= 0 && selectedIndex < snapshots.length - 1
      ? snapshots[selectedIndex + 1]
      : null;
  const snapshotDiff =
    selectedSnapshot && previousSnapshot
      ? computeSnapshotDiff(previousSnapshot, selectedSnapshot)
      : null;
  const changedBlocks =
    snapshotDiff?.blockDiffs.filter((b) => b.type !== "unchanged") ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button variant="outline" className="gap-2">
              <History className="h-4 w-4" />
              历史记录
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            历史快照
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-[400px]">
          <div className="w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {snapshots.length} 个快照
              </span>
              <Button size="sm" variant="outline" onClick={handleSaveSnapshot}>
                保存当前
              </Button>
            </div>

            <ScrollArea className="flex-1 border rounded-lg">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  加载中...
                </div>
              ) : snapshots.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无历史快照</p>
                  <p className="text-xs mt-1">点击"保存当前"创建第一个快照</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {snapshots.map((snapshot) => (
                    <div
                      key={snapshot.id}
                      onClick={() => setSelectedId(snapshot.id)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors group",
                        selectedId === snapshot.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {generateSnapshotTitle(snapshot)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(snapshot.timestamp)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSnapshot(snapshot.id, e)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {previousSnapshot ? "Diff 预览" : "预览"}
              </span>
              {selectedSnapshot && (
                <Button
                  size="sm"
                  onClick={() => handleRestoreSnapshot(selectedSnapshot)}
                  className="gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  恢复
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 border rounded-lg bg-muted/30">
              {selectedSnapshot ? (
                <div className="p-4 space-y-3">
                  {snapshotDiff && previousSnapshot && (
                    <div className="rounded-lg border bg-background p-3">
                      <div className="text-xs text-muted-foreground mb-2">
                        对比：
                        <span className="font-medium ml-1">
                          {generateSnapshotTitle(previousSnapshot)}
                        </span>
                      </div>
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
                    </div>
                  )}

                  {snapshotDiff && previousSnapshot ? (
                    changedBlocks.length > 0 ? (
                      changedBlocks.map((diffBlock) => (
                        <div key={diffBlock.blockId}>
                          <div className="text-xs font-medium text-muted-foreground mb-1 uppercase flex items-center gap-2">
                            {diffBlock.newBlock?.type || diffBlock.oldBlock?.type || "block"}
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px]",
                                diffBlock.type === "added" &&
                                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                                diffBlock.type === "modified" &&
                                  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                                diffBlock.type === "removed" &&
                                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              )}
                            >
                              {diffBlock.type}
                            </span>
                          </div>
                          <div className="text-sm bg-background rounded p-2 border whitespace-pre-wrap">
                            {diffBlock.textDiffs
                              ? renderDiffText(diffBlock.textDiffs)
                              : diffBlock.newBlock?.content || diffBlock.oldBlock?.content}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground rounded-lg border bg-background p-3">
                        与上一版本相比没有文本改动。
                      </div>
                    )
                  ) : (
                    selectedSnapshot.blocks
                      .filter((b) => b.isActive && b.content.trim())
                      .map((block) => (
                        <div key={block.id}>
                          <div className="text-xs font-medium text-muted-foreground mb-1 uppercase">
                            {block.type}
                          </div>
                          <div className="text-sm bg-background rounded p-2 border whitespace-pre-wrap">
                            {block.content}
                          </div>
                        </div>
                      ))
                  )}

                  {snapshotDiff &&
                    previousSnapshot &&
                    (snapshotDiff.variableDiffs.added.length > 0 ||
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

                  {!snapshotDiff &&
                    Object.keys(selectedSnapshot.variables).length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        变量
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedSnapshot.variables).map(
                          ([name, value]) => (
                            <span
                              key={name}
                              className="text-xs bg-background rounded px-2 py-1 border font-mono"
                            >
                              {name}: {value || "(空)"}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  选择一个快照查看详情
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
