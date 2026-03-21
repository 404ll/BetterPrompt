import { PromptBlock, PromptSnapshot } from "@/types/prompt";

export type DiffType = "added" | "removed" | "unchanged" | "modified";

export interface TextDiff {
  type: DiffType;
  value: string;
}

export interface BlockDiff {
  blockId: string;
  type: DiffType;
  oldBlock?: PromptBlock;
  newBlock?: PromptBlock;
  textDiffs?: TextDiff[];
}

export interface SnapshotDiff {
  blockDiffs: BlockDiff[];
  variableDiffs: {
    added: string[];
    removed: string[];
    modified: { name: string; oldValue: string; newValue: string }[];
  };
}

export interface GhostTextSegment {
  text: string;
  isGhost: boolean;
  isAdded?: boolean;
}

/**
 * Compute text diff using a simple word-based algorithm
 */
export function computeTextDiff(oldText: string, newText: string): TextDiff[] {
  if (oldText === newText) {
    return [{ type: "unchanged", value: oldText }];
  }

  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);

  const diffs: TextDiff[] = [];

  const lcs = longestCommonSubsequence(oldWords, newWords);
  let oldIdx = 0;
  let newIdx = 0;
  let lcsIdx = 0;

  while (oldIdx < oldWords.length || newIdx < newWords.length) {
    if (lcsIdx < lcs.length) {
      while (oldIdx < oldWords.length && oldWords[oldIdx] !== lcs[lcsIdx]) {
        diffs.push({ type: "removed", value: oldWords[oldIdx] });
        oldIdx++;
      }

      while (newIdx < newWords.length && newWords[newIdx] !== lcs[lcsIdx]) {
        diffs.push({ type: "added", value: newWords[newIdx] });
        newIdx++;
      }

      if (
        oldIdx < oldWords.length &&
        newIdx < newWords.length &&
        oldWords[oldIdx] === lcs[lcsIdx]
      ) {
        diffs.push({ type: "unchanged", value: oldWords[oldIdx] });
        oldIdx++;
        newIdx++;
        lcsIdx++;
      }
    } else {
      while (oldIdx < oldWords.length) {
        diffs.push({ type: "removed", value: oldWords[oldIdx] });
        oldIdx++;
      }
      while (newIdx < newWords.length) {
        diffs.push({ type: "added", value: newWords[newIdx] });
        newIdx++;
      }
    }
  }

  return mergeDiffs(diffs);
}

function longestCommonSubsequence(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs: string[] = [];
  let i = m,
    j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}

function mergeDiffs(diffs: TextDiff[]): TextDiff[] {
  if (diffs.length === 0) return diffs;

  const merged: TextDiff[] = [];
  let current = { ...diffs[0] };

  for (let i = 1; i < diffs.length; i++) {
    if (diffs[i].type === current.type) {
      current.value += diffs[i].value;
    } else {
      merged.push(current);
      current = { ...diffs[i] };
    }
  }
  merged.push(current);

  return merged;
}

/**
 * Compute diff between two sets of blocks
 */
export function computeBlockDiff(
  oldBlocks: PromptBlock[],
  newBlocks: PromptBlock[]
): BlockDiff[] {
  const diffs: BlockDiff[] = [];
  const oldMap = new Map(oldBlocks.map((b) => [b.id, b]));
  const newMap = new Map(newBlocks.map((b) => [b.id, b]));

  const allIds = new Set([...oldMap.keys(), ...newMap.keys()]);

  for (const id of allIds) {
    const oldBlock = oldMap.get(id);
    const newBlock = newMap.get(id);

    if (!oldBlock && newBlock) {
      diffs.push({
        blockId: id,
        type: "added",
        newBlock,
      });
    } else if (oldBlock && !newBlock) {
      diffs.push({
        blockId: id,
        type: "removed",
        oldBlock,
      });
    } else if (oldBlock && newBlock) {
      if (
        oldBlock.content !== newBlock.content ||
        oldBlock.isActive !== newBlock.isActive
      ) {
        diffs.push({
          blockId: id,
          type: "modified",
          oldBlock,
          newBlock,
          textDiffs: computeTextDiff(oldBlock.content, newBlock.content),
        });
      } else {
        diffs.push({
          blockId: id,
          type: "unchanged",
          oldBlock,
          newBlock,
        });
      }
    }
  }

  return diffs;
}

/**
 * Compute diff between two snapshots
 */
export function computeSnapshotDiff(
  oldSnapshot: PromptSnapshot,
  newSnapshot: PromptSnapshot
): SnapshotDiff {
  const oldBlocks = oldSnapshot.promptVersion
    ? oldSnapshot.promptVersion.activeBlocks.map((b) => ({
        ...b,
        isActive: true,
      }))
    : oldSnapshot.blocks;
  const newBlocks = newSnapshot.promptVersion
    ? newSnapshot.promptVersion.activeBlocks.map((b) => ({
        ...b,
        isActive: true,
      }))
    : newSnapshot.blocks;

  const blockDiffs = computeBlockDiff(oldBlocks, newBlocks);

  const oldVariables = oldSnapshot.promptVersion?.variables ?? oldSnapshot.variables;
  const newVariables = newSnapshot.promptVersion?.variables ?? newSnapshot.variables;

  const oldVars = new Set(Object.keys(oldVariables));
  const newVars = new Set(Object.keys(newVariables));

  const added = [...newVars].filter((v) => !oldVars.has(v));
  const removed = [...oldVars].filter((v) => !newVars.has(v));
  const modified: { name: string; oldValue: string; newValue: string }[] = [];

  for (const name of oldVars) {
    if (
      newVars.has(name) &&
      oldVariables[name] !== newVariables[name]
    ) {
      modified.push({
        name,
        oldValue: oldVariables[name],
        newValue: newVariables[name],
      });
    }
  }

  return {
    blockDiffs,
    variableDiffs: { added, removed, modified },
  };
}

/**
 * Generate ghost text segments for displaying previous version content
 */
export function generateGhostText(
  current: string,
  previous: string
): GhostTextSegment[] {
  const diffs = computeTextDiff(previous, current);
  const segments: GhostTextSegment[] = [];

  for (const diff of diffs) {
    if (diff.type === "unchanged") {
      segments.push({ text: diff.value, isGhost: false });
    } else if (diff.type === "removed") {
      segments.push({ text: diff.value, isGhost: true });
    } else if (diff.type === "added") {
      segments.push({ text: diff.value, isGhost: false, isAdded: true });
    }
  }

  return segments;
}

/**
 * Compute similarity between two texts (0-1)
 */
export function computeSimilarity(text1: string, text2: string): number {
  if (text1 === text2) return 1;
  if (!text1 || !text2) return 0;

  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = [...words1].filter((w) => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;

  return union === 0 ? 0 : intersection / union;
}

/**
 * Compute response diff between multiple model outputs
 */
export function computeResponseDiff(
  responses: { modelId: string; response: string }[],
  baseModelId?: string
): Map<string, TextDiff[]> {
  const result = new Map<string, TextDiff[]>();

  if (responses.length < 2) return result;

  const baseResponse = baseModelId
    ? responses.find((r) => r.modelId === baseModelId)?.response
    : responses[0].response;

  if (!baseResponse) return result;

  for (const { modelId, response } of responses) {
    if (modelId !== baseModelId && response !== baseResponse) {
      result.set(modelId, computeTextDiff(baseResponse, response));
    }
  }

  return result;
}
