# Better Prompt - Agent 行为准则

## 1. 技术栈约束
- **Framework:** Next.js 15 (App Router).
- **Styling:** Tailwind CSS + Lucide React (Icons).
- **Components:** Shadcn UI (优先使用原始组件，不要重复造轮子).
- **State Management:** Zustand (用于全局 Prompt 状态).
- **Logic:** TypeScript (严格类型，禁止使用 any).

## 2. 代码组织原则
- **原子化组件:** UI 组件放在 `@/components/ui`, 业务组件放在 `@/components/prompt-editor`.
- **逻辑抽离:** 复杂的正则提取、文本拼接逻辑必须抽离到 `@/lib/utils/prompt-engine.ts`.
- **单向数据流:** 所有 Prompt 修改必须通过 Zustand Store 的 actions 触发，保持状态可追溯。

## 3. 交互 Vibe 要求
- **实时性:** 变量提取必须是实时（Debounced）的。
- **视觉反馈:** 所有的 Block 切换、变量修改都要有平滑的过渡效果。
- **错误处理:** 如果用户输入了错误的变量格式（如 `{{}}` 为空），要在 UI 上给予轻量级提示。

## 4. 任务执行模式
- 在修改代码前，先简述你的实现思路。
- 每次修改后，检查是否破坏了现有的类型定义。
- 优先保持代码的简洁性，避免过度封装。