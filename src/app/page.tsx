"use client";

import Link from "next/link";
import {
  Sparkles,
  SlidersHorizontal,
  BookTemplate,
  ArrowRight,
  Zap,
  GitCompare,
  History,
  Layers,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";

const features = [
  {
    icon: Zap,
    title: "一句话生成",
    description: "输入简单描述，AI 自动生成结构化的高质量 Prompt",
  },
  {
    icon: GitCompare,
    title: "多模型对比",
    description: "同时运行多个模型，对比输出差异，找到最佳方案",
  },
  {
    icon: History,
    title: "版本管理",
    description: "保存历史快照，随时回溯，追踪 Prompt 的演进过程",
  },
  {
    icon: Layers,
    title: "4-Pillars 结构",
    description: "Role、Context、Input、Output 四大支柱，构建专业 Prompt",
  },
];

const quickActions = [
  {
    title: "一句话生成 Prompt",
    description: "描述你的需求，AI 帮你生成专业的结构化 Prompt",
    icon: Sparkles,
    href: "/generate",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "调优工作台",
    description: "编辑、测试、对比，打磨你的 Prompt 到完美",
    icon: SlidersHorizontal,
    href: "/playground",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "浏览模板库",
    description: "从精选模板开始，快速上手各种场景",
    icon: BookTemplate,
    href: "/templates",
    gradient: "from-orange-500 to-amber-500",
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="h-full overflow-auto">
        <div className="mx-auto max-w-5xl px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 dark:bg-violet-900/30 px-4 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 mb-6">
              <Sparkles className="h-4 w-4" />
              Prompt 工程工作台
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              打造更好的{" "}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Prompt
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              从一句话描述到专业级 Prompt，从单模型测试到多模型对比。
              <br />
              Better Prompt 帮你系统化地创建、调优和管理 AI 提示词。
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3 mb-16">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} mb-4`}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {action.title}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-center mb-8">
              核心功能
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4 rounded-xl border bg-card/50 p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <feature.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-8 border">
            <h2 className="text-xl font-semibold mb-2">准备好开始了吗？</h2>
            <p className="text-muted-foreground mb-6">
              只需一句话，让 AI 帮你生成专业的 Prompt
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-medium text-white hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
            >
              <Sparkles className="h-4 w-4" />
              开始生成
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
