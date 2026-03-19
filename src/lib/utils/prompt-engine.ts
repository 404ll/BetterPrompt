import { PromptBlock } from "@/types/prompt";

/**
 * 从文本中提取所有包含在 {{ }} 中的变量名称，并去重
 */
export function extractVariables(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = [...text.matchAll(regex)];
  const variableNames = matches.map((m) => m[1].trim());
  return Array.from(new Set(variableNames));
}

/**
 * 将变量值替换到文本中的 {{variable}} 占位符
 */
export function replaceVariables(
  text: string,
  variables: Record<string, string>
): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const trimmedName = varName.trim();
    return variables[trimmedName] ?? match;
  });
}

/**
 * 组装完整的 Prompt 文本
 * 按照 4-Pillars 结构：Role -> Context -> Input -> Output
 */
export function assemblePrompt(
  blocks: PromptBlock[],
  variables: Record<string, string>
): string {
  const activeBlocks = blocks.filter((b) => b.isActive);

  const blockOrder: Record<string, number> = {
    role: 0,
    context: 1,
    input: 2,
    output: 3,
  };

  const sortedBlocks = [...activeBlocks].sort(
    (a, b) => blockOrder[a.type] - blockOrder[b.type]
  );

  const parts: string[] = [];

  for (const block of sortedBlocks) {
    if (block.content.trim()) {
      const processedContent = replaceVariables(block.content, variables);
      parts.push(processedContent);
    }
  }

  return parts.join("\n\n");
}

/**
 * 计算 Prompt 质量评分 (0-100)
 */
export function scorePrompt(blocks: PromptBlock[]): {
  score: number;
  breakdown: {
    structure: number;
    clarity: number;
    completeness: number;
  };
  suggestions: string[];
} {
  const activeBlocks = blocks.filter((b) => b.isActive);
  const suggestions: string[] = [];

  let structureScore = 0;
  let clarityScore = 0;
  let completenessScore = 0;

  const hasRole = activeBlocks.some(
    (b) => b.type === "role" && b.content.trim()
  );
  const hasContext = activeBlocks.some(
    (b) => b.type === "context" && b.content.trim()
  );
  const hasInput = activeBlocks.some(
    (b) => b.type === "input" && b.content.trim()
  );
  const hasOutput = activeBlocks.some(
    (b) => b.type === "output" && b.content.trim()
  );

  if (hasRole) structureScore += 25;
  else suggestions.push("添加系统角色定义可以提高输出一致性");

  if (hasInput) structureScore += 25;
  else suggestions.push("需要添加用户输入部分");

  if (hasOutput) structureScore += 25;
  else suggestions.push("添加输出约束可以控制响应格式");

  if (hasContext) structureScore += 25;

  const totalContent = activeBlocks.map((b) => b.content).join(" ");
  const wordCount = totalContent.split(/\s+/).filter(Boolean).length;

  if (wordCount > 10) clarityScore += 30;
  if (wordCount > 30) clarityScore += 20;
  if (wordCount > 50) clarityScore += 20;

  const hasSpecificInstructions =
    /请|必须|不要|只|仅|确保|注意/.test(totalContent);
  if (hasSpecificInstructions) clarityScore += 30;
  else suggestions.push("添加具体指令词（如'请'、'必须'、'不要'）可以提高清晰度");

  const activeCount = activeBlocks.filter((b) => b.content.trim()).length;
  completenessScore = Math.min(100, (activeCount / 4) * 100);

  const score = Math.round(
    structureScore * 0.4 + clarityScore * 0.3 + completenessScore * 0.3
  );

  return {
    score,
    breakdown: {
      structure: structureScore,
      clarity: clarityScore,
      completeness: completenessScore,
    },
    suggestions: suggestions.slice(0, 3),
  };
}
