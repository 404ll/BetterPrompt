import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  PromptBlock,
  ModelConfig,
  DEFAULT_PARAMETERS,
} from "@/types/prompt";
import { extractVariables, assemblePrompt } from "@/lib/utils/prompt-engine";

export interface PromptState {
  blocks: PromptBlock[];
  variables: Record<string, string>;
  modelConfigs: ModelConfig[];
  isRunningAll: boolean;

  // Block Actions
  updateBlockContent: (id: string, content: string) => void;
  toggleBlockActive: (id: string, isActive: boolean) => void;
  updateVariable: (name: string, value: string) => void;

  // Model Actions
  updateModelConfig: (
    modelConfigId: string,
    updates: Partial<ModelConfig>
  ) => void;
  setModelResponse: (modelConfigId: string, response: string) => void;
  appendModelResponse: (modelConfigId: string, chunk: string) => void;
  setModelLoading: (modelConfigId: string, isLoading: boolean) => void;
  setModelError: (modelConfigId: string, error: string | null) => void;
  clearAllResponses: () => void;

  // Run Actions
  setIsRunningAll: (isRunning: boolean) => void;
  getAssembledPrompt: () => string;
}

const initialBlocks: PromptBlock[] = [
  {
    id: "role1",
    type: "role",
    title: "系统角色 (Role)",
    content: "你是一个专业的编程助手。请简明扼要地回答。",
    isActive: true,
  },
  {
    id: "context1",
    type: "context",
    title: "上下文参考 (Context)",
    content: "",
    isActive: true,
  },
  {
    id: "input1",
    type: "input",
    title: "用户输入 (Input)",
    content: "这是用户的查询：{{user_query}}",
    isActive: true,
  },
  {
    id: "out1",
    type: "output",
    title: "输出约束 (Output)",
    content: "只返回 Markdown 代码块，不要提供多余解释。",
    isActive: true,
  },
];

const initialModelConfigs: ModelConfig[] = [
  {
    id: "model-a",
    model: "gpt-4o",
    enabled: true,
    parameters: { ...DEFAULT_PARAMETERS },
    response: "",
    isLoading: false,
    error: null,
  },
  {
    id: "model-b",
    model: "claude-3-5-sonnet",
    enabled: true,
    parameters: { ...DEFAULT_PARAMETERS },
    response: "",
    isLoading: false,
    error: null,
  },
];

function computeVariables(
  blocks: PromptBlock[],
  currentVariables: Record<string, string>
): Record<string, string> {
  const allContent = blocks
    .filter((b) => b.isActive)
    .map((b) => b.content)
    .join("\n");

  const vars = extractVariables(allContent);
  const newVariables: Record<string, string> = {};

  vars.forEach((v) => {
    newVariables[v] = currentVariables[v] || "";
  });

  return newVariables;
}

export const usePromptStore = create<PromptState>()(
  immer((set, get) => ({
    blocks: initialBlocks,
    variables: computeVariables(initialBlocks, {}),
    modelConfigs: initialModelConfigs,
    isRunningAll: false,

    updateBlockContent: (id, content) => {
      set((state) => {
        const block = state.blocks.find((b) => b.id === id);
        if (block) {
          block.content = content;
        }
        state.variables = computeVariables(state.blocks, state.variables);
      });
    },

    toggleBlockActive: (id, isActive) => {
      set((state) => {
        const block = state.blocks.find((b) => b.id === id);
        if (block) {
          block.isActive = isActive;
        }
        state.variables = computeVariables(state.blocks, state.variables);
      });
    },

    updateVariable: (name, value) => {
      set((state) => {
        state.variables[name] = value;
      });
    },

    updateModelConfig: (modelConfigId, updates) => {
      set((state) => {
        const config = state.modelConfigs.find((c) => c.id === modelConfigId);
        if (config) {
          Object.assign(config, updates);
        }
      });
    },

    setModelResponse: (modelConfigId, response) => {
      set((state) => {
        const config = state.modelConfigs.find((c) => c.id === modelConfigId);
        if (config) {
          config.response = response;
        }
      });
    },

    appendModelResponse: (modelConfigId, chunk) => {
      set((state) => {
        const config = state.modelConfigs.find((c) => c.id === modelConfigId);
        if (config) {
          config.response += chunk;
        }
      });
    },

    setModelLoading: (modelConfigId, isLoading) => {
      set((state) => {
        const config = state.modelConfigs.find((c) => c.id === modelConfigId);
        if (config) {
          config.isLoading = isLoading;
        }
      });
    },

    setModelError: (modelConfigId, error) => {
      set((state) => {
        const config = state.modelConfigs.find((c) => c.id === modelConfigId);
        if (config) {
          config.error = error;
        }
      });
    },

    clearAllResponses: () => {
      set((state) => {
        state.modelConfigs.forEach((config) => {
          config.response = "";
          config.error = null;
        });
      });
    },

    setIsRunningAll: (isRunning) => {
      set((state) => {
        state.isRunningAll = isRunning;
      });
    },

    getAssembledPrompt: () => {
      const state = get();
      return assemblePrompt(state.blocks, state.variables);
    },
  }))
);
