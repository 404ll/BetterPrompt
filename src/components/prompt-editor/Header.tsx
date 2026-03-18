export default function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6 bg-background">
        <h1 className="text-lg font-semibold">Better Prompt</h1>
      
      {/* 全局变量区 placeholders */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>全局变量：</span>
        <div className="flex gap-2">
          {/* 这里后续会动态渲染输入框 */}
          <div className="flex items-center gap-2 border rounded-md px-2 py-1 bg-muted/50">
            <span className="font-mono text-xs">{"{" + "{language}" + "}"}</span>
            <input type="text" placeholder="例如：中文" className="bg-transparent border-none outline-none w-24 text-xs" />
          </div>
        </div>
      </div>
    </header>
  );
}
