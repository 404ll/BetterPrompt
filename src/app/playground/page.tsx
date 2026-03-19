"use client";

import AppShell from "@/components/layout/AppShell";
import PlaygroundHeader from "@/components/prompt-editor/PlaygroundHeader";
import BlockEditor from "@/components/prompt-editor/BlockEditor";
import ModelRunner from "@/components/prompt-editor/ModelRunner";
import Footer from "@/components/prompt-editor/Footer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function PlaygroundPage() {
  return (
    <AppShell>
      <div className="flex flex-col h-full">
        <PlaygroundHeader />

        <main className="flex-1 overflow-hidden">
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-full items-stretch"
          >
            <ResizablePanel defaultSize={34} minSize={25}>
              <BlockEditor />
            </ResizablePanel>
            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={33} minSize={20}>
              <ModelRunner modelConfigId="model-a" />
            </ResizablePanel>
            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={33} minSize={20}>
              <ModelRunner modelConfigId="model-b" />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>

        <Footer />
      </div>
    </AppShell>
  );
}
