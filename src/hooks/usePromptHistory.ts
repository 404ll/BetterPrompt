"use client";

import { useState, useEffect, useCallback } from "react";
import { PromptSnapshot, PromptBlock } from "@/types/prompt";

export function usePromptHistory() {
  const [snapshots, setSnapshots] = useState<PromptSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadSnapshots = useCallback(async () => {
    if (typeof window === "undefined") return;

    setIsLoading(true);
    try {
      const { getSnapshots } = await import("@/lib/db");
      const data = await getSnapshots(50);
      setSnapshots(data);
    } catch (error) {
      console.error("Failed to load snapshots:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      loadSnapshots();
    }
  }, [mounted, loadSnapshots]);

  const save = useCallback(
    async (
      blocks: PromptBlock[],
      variables: Record<string, string>,
      title?: string
    ) => {
      if (typeof window === "undefined") return "";
      const { saveSnapshot } = await import("@/lib/db");
      const id = await saveSnapshot(blocks, variables, title);
      await loadSnapshots();
      return id;
    },
    [loadSnapshots]
  );

  const remove = useCallback(
    async (id: string) => {
      if (typeof window === "undefined") return;
      const { deleteSnapshot } = await import("@/lib/db");
      await deleteSnapshot(id);
      await loadSnapshots();
    },
    [loadSnapshots]
  );

  const rename = useCallback(
    async (id: string, title: string) => {
      if (typeof window === "undefined") return;
      const { updateSnapshotTitle } = await import("@/lib/db");
      await updateSnapshotTitle(id, title);
      await loadSnapshots();
    },
    [loadSnapshots]
  );

  return {
    snapshots,
    isLoading,
    save,
    remove,
    rename,
    refresh: loadSnapshots,
  };
}
