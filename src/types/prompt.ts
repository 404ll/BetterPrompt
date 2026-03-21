export type BlockType = "role" | "context" | "input" | "output";

export interface PromptBlock {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  isActive: boolean;
}

export type ModelId =
  | "gpt-4o"
  | "gpt-4-turbo"
  | "claude-3-5-sonnet"
  | "claude-3-haiku"
  | "gemini-1.5-pro"
  | "deepseek";

export interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface ModelConfig {
  id: string;
  model: ModelId;
  enabled: boolean;
  parameters: ModelParameters;
  response: string;
  isLoading: boolean;
  error: string | null;
}

export interface PromptSnapshot {
  id: string;
  timestamp: number;
  blocks: PromptBlock[];
  variables: Record<string, string>;
  title?: string;
  promptVersion?: PromptVersionObject;
}

export interface PromptVersionObject {
  assembledPrompt: string;
  activeBlocks: Array<{
    id: string;
    type: BlockType;
    title: string;
    content: string;
  }>;
  variables: Record<string, string>;
}

export interface ModelResponse {
  id: string;
  snapshotId: string;
  modelId: string;
  model: ModelId;
  parameters: ModelParameters;
  response: string;
  timestamp: number;
  tokenUsage?: { prompt: number; completion: number };
}

export const DEFAULT_PARAMETERS: ModelParameters = {
  temperature: 0.7,
  maxTokens: 1024,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};
