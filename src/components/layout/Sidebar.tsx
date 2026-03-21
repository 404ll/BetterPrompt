"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenLine,
  SlidersHorizontal,
  BookMarked,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    name: "概览",
    href: "/",
    icon: Home,
    description: "产品与入口",
  },
  {
    name: "生成",
    href: "/generate",
    icon: PenLine,
    description: "从描述到结构化",
  },
  {
    name: "工作台",
    href: "/playground",
    icon: SlidersHorizontal,
    description: "编辑与多模型",
  },
  {
    name: "模板",
    href: "/templates",
    icon: BookMarked,
    description: "场景起点",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-zinc-800/80 bg-zinc-950 text-zinc-300 transition-[width] duration-300 ease-out",
        collapsed ? "w-[4.25rem]" : "w-[15.5rem]"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-zinc-800/80 px-3">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-[11px] font-semibold tracking-tight text-zinc-100">
              BP
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight text-zinc-50 truncate">
              Better Prompt
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto" title="Better Prompt">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-[11px] font-semibold text-zinc-100">
              BP
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-200 transition-colors",
            collapsed && "mx-auto mt-1"
          )}
          aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                isActive
                  ? "bg-zinc-900 text-zinc-50 shadow-[inset_2px_0_0_0_oklch(0.62_0.12_175)]"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 stroke-[1.5]",
                  isActive ? "text-teal-400/95" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              {!collapsed && (
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="font-medium">{item.name}</span>
                  {!isActive && (
                    <span className="text-[11px] text-zinc-600 group-hover:text-zinc-500">
                      {item.description}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800/80 p-3">
        {!collapsed && (
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2.5">
            <p className="text-[11px] leading-relaxed text-zinc-500">
              <span className="font-medium text-zinc-300">演示</span>
              <span className="mx-1.5 text-zinc-700">·</span>
              未配置密钥时使用模拟输出
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
