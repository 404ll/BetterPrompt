import Header from "@/components/prompt-editor/Header";
import Footer from "@/components/prompt-editor/Footer";
import BlockEditor from "@/components/prompt-editor/BlockEditor";
import ModelRunner from "@/components/prompt-editor/ModelRunner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  return (
    <div className="flex flex-col h-screen min-w-[800px] bg-background text-foreground overflow-hidden">
      {/* 顶部 Header 区 */}
      <Header />

      {/* 主工作区 三列分栏 */}
      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal" className="h-full items-stretch">
          {/* 左侧：Prompt 块编辑器 */}
          <ResizablePanel defaultSize={34} minSize={25}>
            <BlockEditor />
          </ResizablePanel>
          <ResizableHandle withHandle />
          
          {/* 中间：模型 A */}
          <ResizablePanel defaultSize={33} minSize={20}>
            <ModelRunner modelId="model-a" defaultModel="gpt-4o" title="模型 A (GPT-4o)" />
          </ResizablePanel>
          <ResizableHandle withHandle />

          {/* 右侧：模型 B */}
          <ResizablePanel defaultSize={33} minSize={20}>
            <ModelRunner modelId="model-b" defaultModel="claude-3-5" title="模型 B (Claude 3.5)" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      {/* 底部 Footer 区 (操作栏) */}
      <Footer />
    </div>
  );
}
