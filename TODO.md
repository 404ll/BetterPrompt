# Better Prompt MVP 2.0 - 开发 TODO List

## Phase 0: 项目初始化 (Project Setup)
- [ ] 在 `betterprompt` 目录下初始化 Next.js 15 (App Router, TypeScript, Tailwind CSS, src 目录)
- [ ] 安装依赖：`zustand`, `immer`, `lucide-react`, `ai` (Vercel AI SDK), `dexie`
- [ ] 配置基本目录结构：`src/components/ui`, `src/components/prompt-editor`, `src/lib/utils`
- [ ] 初始化并在项目中集成 Shadcn UI

## Phase 1: 静态 UI 布局与页面搭建 (UI First)
> **设计风格标注：极简工程风格，重点参考 Raycast / Notion 的 UI 体验（无框设计、细腻的毛玻璃与阴影、扁平化交互、流畅的微动效）。**

- [ ] 构建应用主框架：顶部 Header (全局变量区) + 底部操作栏 (Run All, History)
- [ ] 实现三列分栏布局 (Column Layout: 左侧编辑器 | 中间模型A | 右侧模型B)
- [ ] 搭建左侧可视化块编辑器 (Visual Block Editor) 的静态组件 (包含 Checkbox 和文本区域)
- [ ] 搭建中右侧模型运行区的静态组件 (模型选择下拉框、结果展示区)

## Phase 2: 核心数据引擎与状态 (State & Logic)
- [ ] 定义 Prompt 4-Pillars 类型接口 (`Role`, `Context`, `Input`, `Output`)
- [ ] 在 `src/lib/utils/prompt-engine.ts` 中实现变量提取逻辑（提取 `{{variable}}`）
- [ ] 实现并配置 Zustand Store (`store/promptStore.ts`)，结合 Immer 管理状态
- [ ] 将静态 UI 与 Zustand Store 绑定，实现勾选/更新 Block、动态渲染变量输入框功能

## Phase 3: 多模型 Playground 接入 (AI SDK)
- [ ] 接入 Vercel AI SDK
- [ ] 实现 "Run All" 按钮的事件监听：组装 Prompt 并行调用多模型
- [ ] 处理模型流式输出 (Streaming) 并渲染到对应的结果展示区

## Phase 4: 状态持久化与 Diff 引擎 (Persist & Diff)
- [ ] 接入并调配 `react-diff-viewer` (或类似实现) 提供差异化高亮
- [ ] (输入侧 Diff) 对比当前正在编辑的 Prompt 与历史快照，实现“Ghost Text / 幽灵文字”交互
- [ ] (输出侧 Diff) 在多模型对比下，高亮其文本回答之间的差异

---
状态：**已创建，准备进入 Phase 0。**
