"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookTemplate,
  Code,
  FileText,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Palette,
  Search,
  ArrowRight,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { usePromptStore } from "@/store/promptStore";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: typeof Code;
  blocks: {
    role: string;
    context: string;
    input: string;
    output: string;
  };
}

const categories = [
  { id: "all", name: "全部", icon: BookTemplate },
  { id: "coding", name: "编程开发", icon: Code },
  { id: "writing", name: "写作创作", icon: FileText },
  { id: "chat", name: "对话助手", icon: MessageSquare },
  { id: "business", name: "商业办公", icon: Briefcase },
  { id: "education", name: "教育学习", icon: GraduationCap },
  { id: "creative", name: "创意设计", icon: Palette },
];

const templates: Template[] = [
  {
    id: "code-reviewer",
    name: "代码审查助手",
    description: "分析代码质量，发现潜在问题，给出改进建议",
    category: "coding",
    icon: Code,
    blocks: {
      role: "你是一位资深的代码审查专家，拥有 10 年以上的软件开发经验。你擅长发现代码中的潜在问题、性能瓶颈和安全漏洞，并能给出清晰的改进建议。",
      context: "用户会提供一段代码，请从以下几个维度进行审查：代码质量、可读性、性能、安全性、最佳实践。",
      input: "请审查以下代码：\n\n```{{language}}\n{{code}}\n```",
      output: "请按以下格式输出审查结果：\n\n## 总体评价\n[简要评价]\n\n## 发现的问题\n- 问题1：[描述] (严重程度：高/中/低)\n- 问题2：...\n\n## 改进建议\n1. [具体建议]\n2. ...\n\n## 优化后的代码\n```\n[改进后的代码]\n```",
    },
  },
  {
    id: "tech-writer",
    name: "技术文档写手",
    description: "将复杂的技术概念转化为清晰易懂的文档",
    category: "writing",
    icon: FileText,
    blocks: {
      role: "你是一位专业的技术文档工程师，擅长将复杂的技术概念用简洁清晰的语言表达出来。你的文档风格简洁、结构清晰、示例丰富。",
      context: "用户需要你帮助撰写技术文档，可能是 API 文档、使用指南、教程等。请确保文档对初学者友好，同时不失专业性。",
      input: "请为以下内容撰写技术文档：\n\n主题：{{topic}}\n目标读者：{{audience}}\n文档类型：{{doc_type}}",
      output: "请输出结构化的 Markdown 格式文档，包含：标题、概述、详细说明、代码示例（如适用）、注意事项、参考链接。",
    },
  },
  {
    id: "english-tutor",
    name: "英语口语教练",
    description: "模拟真实对话场景，帮助练习英语口语",
    category: "education",
    icon: GraduationCap,
    blocks: {
      role: "你是一位友好耐心的英语口语教练，擅长创造轻松的对话环境。你会根据学生的水平调整语言难度，在对话中自然地纠正错误，并给出更地道的表达方式。",
      context: "学生希望通过模拟真实场景来练习英语口语。请用英语进行对话，并在适当时候给出中文解释和学习建议。",
      input: "场景：{{scenario}}\n我的英语水平：{{level}}\n我想说：{{message}}",
      output: "请用以下格式回复：\n\n**对话回复**：[英文回复]\n\n**表达建议**：[如果学生的表达有改进空间，给出更地道的说法]\n\n**学习要点**：[本轮对话中值得学习的词汇或句型]",
    },
  },
  {
    id: "prd-writer",
    name: "PRD 文档助手",
    description: "帮助产品经理撰写专业的产品需求文档",
    category: "business",
    icon: Briefcase,
    blocks: {
      role: "你是一位经验丰富的产品经理，擅长撰写清晰、完整、可执行的产品需求文档（PRD）。你了解敏捷开发流程，能够将模糊的需求转化为具体的功能描述。",
      context: "用户会描述一个产品功能或需求，请帮助将其转化为标准的 PRD 格式，确保开发团队能够准确理解和实现。",
      input: "功能名称：{{feature_name}}\n功能描述：{{description}}\n目标用户：{{target_users}}",
      output: "请按以下 PRD 模板输出：\n\n# {{feature_name}}\n\n## 1. 背景与目标\n## 2. 用户故事\n## 3. 功能需求\n### 3.1 核心功能\n### 3.2 边界情况\n## 4. 非功能需求\n## 5. 验收标准\n## 6. 排期建议",
    },
  },
  {
    id: "ui-designer",
    name: "UI 设计顾问",
    description: "提供 UI/UX 设计建议和改进方案",
    category: "creative",
    icon: Palette,
    blocks: {
      role: "你是一位资深的 UI/UX 设计师，精通现代设计趋势、用户体验原则和设计系统。你能够从用户视角出发，提供实用的设计建议。",
      context: "用户会描述一个界面设计问题或展示现有设计，请从视觉设计、用户体验、可访问性等角度给出专业建议。",
      input: "设计问题：{{design_question}}\n产品类型：{{product_type}}\n目标用户：{{target_users}}",
      output: "请从以下几个方面给出建议：\n\n## 设计分析\n[当前设计的优缺点]\n\n## 改进建议\n1. 视觉层面：...\n2. 交互层面：...\n3. 可访问性：...\n\n## 参考案例\n[推荐参考的优秀设计案例]",
    },
  },
  {
    id: "data-analyst",
    name: "数据分析师",
    description: "解读数据，发现洞察，生成分析报告",
    category: "business",
    icon: Briefcase,
    blocks: {
      role: "你是一位专业的数据分析师，擅长从数据中发现有价值的洞察，并用清晰的方式呈现分析结果。你熟悉常见的数据分析方法和可视化技巧。",
      context: "用户会提供一些数据或描述数据分析需求，请帮助进行分析并给出有价值的洞察和建议。",
      input: "分析目标：{{analysis_goal}}\n数据描述：{{data_description}}\n关注指标：{{metrics}}",
      output: "请按以下格式输出分析报告：\n\n## 数据概览\n[数据基本情况]\n\n## 关键发现\n1. 发现1：[描述 + 数据支撑]\n2. 发现2：...\n\n## 深度洞察\n[更深层次的分析]\n\n## 行动建议\n[基于分析的具体建议]",
    },
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const updateBlockContent = usePromptStore(
    (state) => state.updateBlockContent
  );

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template: Template) => {
    updateBlockContent("role1", template.blocks.role);
    updateBlockContent("context1", template.blocks.context);
    updateBlockContent("input1", template.blocks.input);
    updateBlockContent("out1", template.blocks.output);
    router.push("/playground");
  };

  return (
    <AppShell>
      <div className="h-full overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Header */}
          <div className="mb-10">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Library
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
              模板库
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              作为起点导入工作台，再按你的业务改写变量与约束。
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-border/90 bg-card/80 pl-10 pr-4 text-sm shadow-sm focus:border-teal-600/45 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === category.id
                    ? "border border-teal-600/35 bg-teal-50/80 text-foreground shadow-sm dark:border-teal-800/50 dark:bg-teal-950/30 dark:text-teal-100/90"
                    : "border border-transparent bg-background/70 text-muted-foreground hover:border-border hover:bg-card/80"
                )}
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group rounded-xl border border-border/90 bg-card/90 p-5 shadow-sm transition-all hover:border-teal-600/25 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/80">
                    <template.icon className="h-6 w-6 text-teal-800/90 dark:text-teal-300/85" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 font-display text-[17px] font-semibold tracking-tight">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:text-teal-900 dark:text-teal-300/90 dark:hover:text-teal-200"
                    >
                      使用此模板
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookTemplate className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>没有找到匹配的模板</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
