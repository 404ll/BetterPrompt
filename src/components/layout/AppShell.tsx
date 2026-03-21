"use client";

import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar />
      <main className="bp-main-surface flex-1 overflow-hidden text-foreground">
        {children}
      </main>
    </div>
  );
}
