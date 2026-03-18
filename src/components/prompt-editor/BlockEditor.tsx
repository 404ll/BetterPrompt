import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function BlockEditor() {
  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <h2 className="text-sm font-semibold tracking-tight">提示词策略</h2>
        <span className="text-xs text-muted-foreground">模块</span>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-4">
          
          {/* Block 1 (Role) */}
          <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm relative group hover:border-zinc-300 transition-colors">
            <div className="flex items-center gap-3">
              <Checkbox id="role1" defaultChecked />
              <label htmlFor="role1" className="text-sm font-medium leading-none cursor-pointer">
                系统角色 (Role)
              </label>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">标签</span>
              </div>
            </div>
            <Textarea 
              placeholder="你是一个人工智能专家..." 
              className="mt-2 min-h-[80px] text-sm resize-none focus-visible:ring-1 bg-transparent border-transparent hover:border-border focus:border-border"
              defaultValue="你是一个专业的编程助手。请简明扼要地回答。"
            />
          </div>

          {/* Block 2 (Context) */}
          <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm relative group hover:border-zinc-300 transition-colors">
            <div className="flex items-center gap-3">
              <Checkbox id="context1" defaultChecked />
              <label htmlFor="context1" className="text-sm font-medium leading-none cursor-pointer">
                上下文参考 (Context)
              </label>
            </div>
            <Textarea 
              placeholder="该项目采用 Next.js 15 架构..." 
              className="mt-2 min-h-[80px] text-sm resize-none focus-visible:ring-1 bg-transparent border-transparent hover:border-border focus:border-border"
            />
          </div>

          {/* Block 3 (Input) */}
          <div className="flex flex-col gap-2 border-2 border-primary/20 rounded-lg bg-card p-4 shadow-sm relative group">
            <div className="flex items-center gap-3">
              <Checkbox id="input1" defaultChecked />
              <label htmlFor="input1" className="text-sm font-medium leading-none cursor-pointer">
                用户输入 (Input)
              </label>
            </div>
            <Textarea 
              placeholder="提取 {{task_name}} 并执行 {{action}}。" 
              className="mt-2 min-h-[120px] text-sm resize-none focus-visible:ring-1 bg-muted/50 border-transparent shadow-inner"
              defaultValue="这是用户的查询：{{user_query}}"
            />
          </div>

          {/* Block 4 (Constraint/Output) */}
          <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm relative group hover:border-zinc-300 transition-colors">
            <div className="flex items-center gap-3">
              <Checkbox id="out1" defaultChecked />
              <label htmlFor="out1" className="text-sm font-medium leading-none cursor-pointer">
                输出约束 (Output)
              </label>
            </div>
            <Textarea 
              placeholder="必须输出完全有效的 JSON 格式..." 
              className="mt-2 min-h-[80px] text-sm resize-none focus-visible:ring-1 bg-transparent border-transparent hover:border-border focus:border-border"
              defaultValue="只返回 Markdown 代码块，不要提供多余解释。"
            />
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
