import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const runtime = "edge";

const DEMO_MODE = process.env.DEMO_MODE === "true" || !process.env.OPENAI_API_KEY;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: "https://api.deepseek.com/v1",
});

type ModelId =
  | "gpt-4o"
  | "gpt-4-turbo"
  | "claude-3-5-sonnet"
  | "claude-3-haiku"
  | "gemini-1.5-pro"
  | "deepseek";

const MODEL_PERSONALITIES: Record<ModelId, { name: string; style: string }> = {
  "gpt-4o": {
    name: "GPT-4 Omni",
    style: "我会以清晰、结构化的方式回答，注重逻辑性和准确性。",
  },
  "gpt-4-turbo": {
    name: "GPT-4 Turbo",
    style: "我的回答会更加简洁高效，直击要点。",
  },
  "claude-3-5-sonnet": {
    name: "Claude 3.5 Sonnet",
    style: "我倾向于深思熟虑，提供有洞察力的分析和建议。",
  },
  "claude-3-haiku": {
    name: "Claude 3 Haiku",
    style: "我会用简洁优雅的方式表达，追求精炼。",
  },
  "gemini-1.5-pro": {
    name: "Gemini 1.5 Pro",
    style: "我擅长多角度分析，提供全面的视角。",
  },
  deepseek: {
    name: "DeepSeek Coder",
    style: "我专注于代码和技术问题，提供实用的解决方案。",
  },
};

function generateMockResponse(prompt: string, modelId: ModelId): string {
  const personality = MODEL_PERSONALITIES[modelId];
  const promptPreview = prompt.length > 100 ? prompt.slice(0, 100) + "..." : prompt;

  return `## ${personality.name} 的回复

> **演示模式** - 这是模拟响应，用于展示 UI 功能

### 收到的提示词

\`\`\`
${promptPreview}
\`\`\`

### 模型特点

${personality.style}

### 示例回答

这是一个演示响应，展示了 Better Prompt 的多模型对比功能：

1. **流式输出** - 文本会逐字显示，模拟真实 API 响应
2. **并行调用** - 多个模型同时运行，可以对比不同模型的输出
3. **历史记录** - 你可以保存当前的 Prompt 快照，稍后恢复

---

*提示：配置 API Key 后可以获得真实的 AI 响应*`;
}

async function createMockStream(text: string): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const words = text.split(/(?<=\s)|(?=\s)/);

  return new ReadableStream({
    async start(controller) {
      for (const word of words) {
        const chunk = `0:${JSON.stringify(word)}\n`;
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 30));
      }
      controller.close();
    },
  });
}

function getModel(modelId: ModelId) {
  switch (modelId) {
    case "gpt-4o":
      return openai("gpt-4o");
    case "gpt-4-turbo":
      return openai("gpt-4-turbo");
    case "claude-3-5-sonnet":
      return anthropic("claude-3-5-sonnet-20241022");
    case "claude-3-haiku":
      return anthropic("claude-3-haiku-20240307");
    case "gemini-1.5-pro":
      return google("gemini-1.5-pro");
    case "deepseek":
      return deepseek("deepseek-chat");
    default:
      return openai("gpt-4o");
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, modelId, parameters } = await req.json();

    if (!prompt || !modelId) {
      return new Response(
        JSON.stringify({ error: "Missing prompt or modelId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (DEMO_MODE) {
      const mockText = generateMockResponse(prompt, modelId as ModelId);
      const stream = await createMockStream(mockText);
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Demo-Mode": "true",
        },
      });
    }

    const model = getModel(modelId as ModelId);

    const result = streamText({
      model,
      prompt,
      temperature: parameters?.temperature ?? 0.7,
      maxTokens: parameters?.maxTokens ?? 1024,
      topP: parameters?.topP ?? 1,
      frequencyPenalty: parameters?.frequencyPenalty ?? 0,
      presencePenalty: parameters?.presencePenalty ?? 0,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
