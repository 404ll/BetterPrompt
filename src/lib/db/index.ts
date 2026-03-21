import Dexie, { Table } from "dexie";
import {
  PromptSnapshot,
  ModelResponse,
  PromptBlock,
  ModelParameters,
  ModelId,
  PromptVersionObject,
} from "@/types/prompt";
import { assemblePrompt } from "@/lib/utils/prompt-engine";

export class BetterPromptDB extends Dexie {
  snapshots!: Table<PromptSnapshot>;
  responses!: Table<ModelResponse>;

  constructor() {
    super("BetterPromptDB");

    this.version(1).stores({
      snapshots: "id, timestamp",
      responses: "id, snapshotId, modelId, timestamp",
    });
  }
}

export const db = new BetterPromptDB();

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function saveSnapshot(
  blocks: PromptBlock[],
  variables: Record<string, string>,
  title?: string,
  promptVersion?: PromptVersionObject
): Promise<string> {
  const id = generateId();
  const builtPromptVersion: PromptVersionObject =
    promptVersion ?? {
      assembledPrompt: assemblePrompt(blocks, variables),
      activeBlocks: blocks
        .filter((b) => b.isActive)
        .map((b) => ({
          id: b.id,
          type: b.type,
          title: b.title,
          content: b.content,
        })),
      variables: { ...variables },
    };

  const snapshot: PromptSnapshot = {
    id,
    timestamp: Date.now(),
    blocks: JSON.parse(JSON.stringify(blocks)),
    variables: { ...variables },
    title,
    promptVersion: builtPromptVersion,
  };

  await db.snapshots.add(snapshot);
  return id;
}

export async function getSnapshots(limit = 50): Promise<PromptSnapshot[]> {
  return db.snapshots.orderBy("timestamp").reverse().limit(limit).toArray();
}

export async function getSnapshot(
  id: string
): Promise<PromptSnapshot | undefined> {
  return db.snapshots.get(id);
}

export async function deleteSnapshot(id: string): Promise<void> {
  await db.snapshots.delete(id);
  await db.responses.where("snapshotId").equals(id).delete();
}

export async function updateSnapshotTitle(
  id: string,
  title: string
): Promise<void> {
  await db.snapshots.update(id, { title });
}

export async function saveModelResponse(
  snapshotId: string,
  modelId: string,
  model: ModelId,
  parameters: ModelParameters,
  response: string,
  tokenUsage?: { prompt: number; completion: number }
): Promise<string> {
  const id = generateId();
  const modelResponse: ModelResponse = {
    id,
    snapshotId,
    modelId,
    model,
    parameters: { ...parameters },
    response,
    timestamp: Date.now(),
    tokenUsage,
  };

  await db.responses.add(modelResponse);
  return id;
}

export async function getResponsesForSnapshot(
  snapshotId: string
): Promise<ModelResponse[]> {
  return db.responses.where("snapshotId").equals(snapshotId).toArray();
}

export async function clearAllData(): Promise<void> {
  await db.snapshots.clear();
  await db.responses.clear();
}

export async function getSnapshotCount(): Promise<number> {
  return db.snapshots.count();
}
