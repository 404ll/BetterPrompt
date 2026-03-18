# Better Prompt MVP 2.0：开发规格书

## 1. 核心架构设计 (The "Compare-First" Architecture)
我们将界面重心从“编辑”转向“**实验与对比**”。
产品设计：提示词四要素 (Prompt 4-Pillars)我们将所有的 Prompt 拆解为以下四种标准块（Blocks），在数据结构中通过 type 区分：要素 (Type)业务定义 (Definition)默认行为 (Default Behavior)Role (角色)定义 AI 的身份、语气、专业背景。拼接在 Prompt 最顶部。Context (上下文)任务的背景、Few-shot 例子、知识库信息。拼接在角色之后。Input (输入)动态变化的数据，使用 {{variable}} 挂载。核心交互区，自动生成表单。Output (输出)约束格式（JSON/Markdown）、字数、负面约束。拼接在 Prompt 最底部。
产品风格类似Raycast

### 1.1 可视化块编辑器 (Visual Block Editor)
* **左侧：内容区**。依然采用 `Role`, `Task`, `Constraint` 的块状结构。
* **交互：** 每一个 Block 左侧都有一个 `Checkbox`。勾选/取消勾选，右侧所有模型的输入都会实时同步更新。
* **变量提取：** 自动识别 `{{}}` 并生成全局变量输入框。


### 1.2 多模型 Playground (Multi-Model Runner)
* **功能：** 支持并行调用。用户配置好 API Key 后，可以同时选择 `GPT-4o`, `Claude 3.5`, `DeepSeek`。
* **UI 表现：** 采用**分栏布局 (Column Layout)**。
    * 每一栏代表一个模型。
    * 点击“运行”，三个模型同时根据左侧的 Prompt 结构生成结果。

### 1.3 深度 Diff 功能 (The Diff Engine)
* **输入 Diff：** 记录 Prompt 的修改历史。点击“History”，弹出一个 Diff 视图（推荐使用 `react-diff-viewer`），对比当前 Prompt 与上一个版本的差异。
* **输出 Diff：** 这是难点也是亮点。在多模型结果下方提供一个“对比模式”，高亮不同模型输出之间的文本差异（例如：模型 A 比模型 B 多了哪些约束条件的执行）。

---

## 2. UI 布局建议 (Frontend Layout)

我建议采用类似 **Raycast** 或 **Vercel** 的极简工程风格：

* **Header:** 项目标题 + 全局变量配置区。
* **Main Content (Three Columns):**
    * **Column 1 (Editor):** 块状 Prompt 编辑器（高度可复用的列表）。
    * **Column 2 (Model A Output):** 模型 A 的选择下拉框 + 结果展示区。
    * **Column 3 (Model B Output):** 模型 B 的选择下拉框 + 结果展示区。
* **Bottom Bar:** 运行按钮 (Run All) + 历史快照 (Diff View) 入口。



---

## 3. 技术栈与关键实现 (Tech Stack)

| 功能 | 推荐库 / 实现方案 | 理由 |
| :--- | :--- | :--- |
| **状态管理** | **Zustand + Immer** | 处理复杂的嵌套 Blocks 和多模型 Response 状态，Immer 让不可变更新极其简单。 |
| **Diff 引擎** | **`react-diff-viewer`** | 现成的 UI 组件，支持 Split/Inline 模式，性能极佳。 |
| **API 调用** | **Vercel AI SDK** | 极其强大的库，统一了 OpenAI, Anthropic 等主流模型的流式输出 (Streaming) 接口，一行代码换模型。 |
| **持久化** | **IndexedDB (via Dexie.js)** | Prompt 历史可能很长，IndexedDB 比 LocalStorage 更适合存储大量的文本快照。 |

---

## 4. MVP 开发优先级 (Sprint Plan)

* **Step 1 (基础):** 实现 Blocks 编辑器 + 变量提取逻辑。
* **Step 2 (多模型):** 接入 Vercel AI SDK，实现两个模型窗口并行展示结果。
* **Step 3 (快照):** 实现“保存快照”功能，将当前的 `blocks` 数组存入 IndexedDB。
* **Step 4 (Diff):** 接入 `react-diff-viewer`，实现点击历史版本进行 Input 侧的 Diff。

---

## 5. 针对前端背景的“炫技”建议：
既然你是前端，可以在 **Diff** 上做一点交互微创新：
* **Ghost Text (幽灵文字):** 当用户在左侧 Block 编辑时，在右侧预览区以半透明形式显示上一版本的差异，这样用户不需要打开专门的 Diff 窗口就能感知变化。
