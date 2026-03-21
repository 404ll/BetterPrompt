"use client";

import Link from "next/link";
import {
  PenLine,
  SlidersHorizontal,
  BookMarked,
  ArrowUpRight,
  GitCompare,
  History,
  Layers,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";

const pillars: {
  title: string;
  desc: string;
  Icon: typeof PenLine;
}[] = [
  {
    title: "一句话生成",
    desc: "从描述到结构化 Prompt，再进入工作台。",
    Icon: PenLine,
  },
  {
    title: "多模型对照",
    desc: "并行跑不同模型，用输出反推提示词策略。",
    Icon: GitCompare,
  },
  {
    title: "版本与 Diff",
    desc: "快照整对象保存，对比差异，而非只看片段。",
    Icon: History,
  },
  {
    title: "4-Pillars",
    desc: "Role / Context / Input / Output，可审计、可迭代。",
    Icon: Layers,
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="h-full overflow-auto">
        <div className="mx-auto max-w-5xl px-8 py-16 sm:px-10 sm:py-20">
          <header className="mb-20 max-w-3xl">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Prompt studio
            </p>
            <h1 className="font-display text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl sm:leading-[1.08]">
              把提示词当作
              <span className="text-foreground/90">产品</span>
              来设计。
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              生成、编辑、对照、版本化——在同一套工作流里完成。
              界面刻意克制：少装饰、多结构，让你专注在文本与模型行为。
            </p>
          </header>

          <section className="mb-16 grid gap-3 sm:grid-cols-3">
            <Link
              href="/generate"
              className="group relative flex flex-col justify-between border border-border/80 bg-card/80 px-5 py-4 shadow-sm transition-all hover:border-teal-600/35 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <PenLine className="h-5 w-5 text-teal-700/90 dark:text-teal-400/90" strokeWidth={1.5} />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  生成
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  描述意图，得到可导入的结构化 Prompt。
                </p>
              </div>
            </Link>

            <Link
              href="/playground"
              className="group relative flex flex-col justify-between border border-border/80 bg-card/80 px-5 py-4 shadow-sm transition-all hover:border-teal-600/35 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <SlidersHorizontal
                  className="h-5 w-5 text-teal-700/90 dark:text-teal-400/90"
                  strokeWidth={1.5}
                />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  工作台
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  分块编辑、变量与多模型并行对比。
                </p>
              </div>
            </Link>

            <Link
              href="/templates"
              className="group relative flex flex-col justify-between border border-border/80 bg-card/80 px-5 py-4 shadow-sm transition-all hover:border-teal-600/35 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <BookMarked
                  className="h-5 w-5 text-teal-700/90 dark:text-teal-400/90"
                  strokeWidth={1.5}
                />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  模板
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  从常见场景起步，再按你的业务改写。
                </p>
              </div>
            </Link>
          </section>

          <section className="border-t border-border/70 pt-14">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              能力
            </h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-2">
              {pillars.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-background/80">
                    <item.Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-medium leading-snug">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="mt-20 border-t border-border/70 pt-10">
            <p className="text-xs text-muted-foreground">
              Better Prompt · 本地优先 · 演示模式可完全离线体验流程
            </p>
          </footer>
        </div>
      </div>
    </AppShell>
  );
}
