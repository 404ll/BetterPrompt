"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  SlidersHorizontal,
  BookTemplate,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    name: "首页",
    href: "/",
    icon: Home,
    description: "产品介绍",
  },
  {
    name: "一句话生成",
    href: "/generate",
    icon: Sparkles,
    description: "AI 智能生成 Prompt",
  },
  {
    name: "调优工作台",
    href: "/playground",
    icon: SlidersHorizontal,
    description: "多模型对比调优",
  },
  {
    name: "模板库",
    href: "/templates",
    icon: BookTemplate,
    description: "常用 Prompt 模板",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Better Prompt</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-md p-1.5 hover:bg-sidebar-accent transition-colors",
            collapsed && "mx-auto mt-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-sidebar-foreground/70" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-sidebar-foreground/70" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn("h-5 w-5 shrink-0", isActive && "text-violet-600")}
              />
              {!collapsed && (
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  {!isActive && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        {!collapsed && (
          <div className="rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">演示模式</span>
              <br />
              配置 API Key 以使用真实模型
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
