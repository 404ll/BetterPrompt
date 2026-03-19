import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const runtime = "edge";

const DEMO_MODE =
  process.env.DEMO_MODE === "true" || !process.env.OPENAI_API_KEY;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const SYSTEM_PROMPT = `你是一个专业的 Prompt 工程师。用户会给你一个简单的需求描述，你需要将其转化为结构化的高质量 Prompt。

请按照 4-Pillars 框架生成 Prompt，输出格式必须是以下 JSON：

{
  "role": "系统角色定义，描述 AI 应该扮演什么角色",
  "context": "背景信息和约束条件",
  "input": "用户输入的格式和示例，可以包含 {{变量}} 占位符",
  "output": "输出格式要求和约束"
}

生成原则：
1. Role 要具体明确，包含专业领域和行为特征
2. Context 提供必要的背景，但不要过于冗长
3. Input 使用 {{变量名}} 标记用户需要填入的内容
4. Output 明确格式要求，如 Markdown、JSON、列表等

只输出 JSON，不要有其他内容。`;

type GenerateStyle = "concise" | "detailed" | "creative";

const STYLE_INSTRUCTIONS: Record<GenerateStyle, string> = {
  concise: "生成简洁精炼的 Prompt，每个部分控制在 1-2 句话。",
  detailed: "生成详细完整的 Prompt，包含充分的指导和示例。",
  creative: "生成富有创意的 Prompt，鼓励 AI 发挥想象力。",
};

function generateMockPrompt(description: string, style: GenerateStyle): string {
  const styleDesc =
    style === "concise" ? "简洁" : style === "detailed" ? "详细" : "创意";

  const mockResult = {
    role: `你是一个专业的助手，专门帮助用户${description.slice(0, 20)}...。请以${styleDesc}的风格回答。`,
    context: `用户需要${description}。请基于最佳实践提供帮助。`,
    input: "用户的具体需求：{{user_input}}",
    output: `请以清晰的格式输出结果。如果涉及代码，使用 Markdown 代码块。`,
  };

  return JSON.stringify(mockResult, null, 2);
}

async function createMockStream(text: string): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const chars = text.split("");

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < chars.length; i++) {
        const chunk = `0:${JSON.stringify(chars[i])}\n`;
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) =>
          setTimeout(resolve, 10 + Math.random() * 20)
        );
      }
      controller.close();
    },
  });
}

export async function POST(req: Request) {
  try {
    const { description, style = "detailed" } = await req.json();

    if (!description) {
      return new Response(
        JSON.stringify({ error: "Missing description" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (DEMO_MODE) {
      const mockText = generateMockPrompt(description, style as GenerateStyle);
      const stream = await createMockStream(mockText);
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Demo-Mode": "true",
        },
      });
    }

    const styleInstruction =
      STYLE_INSTRUCTIONS[style as GenerateStyle] || STYLE_INSTRUCTIONS.detailed;

    const result = streamText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT + "\n\n" + styleInstruction,
      prompt: `用户需求：${description}`,
      temperature: style === "creative" ? 0.9 : 0.7,
      maxTokens: 1024,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Generate prompt error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
