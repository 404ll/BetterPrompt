# Better Prompt - Prompt 工程工作台

## 产品架构

```
Better Prompt
├── 首页 (/)                    - 产品介绍、功能入口
├── 一句话生成 (/generate)       - AI 智能生成结构化 Prompt
├── 调优工作台 (/playground)     - 多模型对比、Prompt 调优
└── 模板库 (/templates)          - 精选 Prompt 模板
```

## 开发进度

### Phase 0-2: 基础设施 ✅
- [x] Next.js 15 项目初始化
- [x] Zustand + Immer 状态管理
- [x] Shadcn UI 组件库
- [x] 4-Pillars 类型定义

### Phase 3: 多模型 Playground ✅
- [x] Vercel AI SDK 接入
- [x] 统一 Chat API (`/api/chat`)
- [x] 流式输出渲染
- [x] 并行多模型调用

### Phase 4: 数据持久化 ✅
- [x] Dexie (IndexedDB) 配置
- [x] 历史快照保存/恢复
- [x] Diff 引擎核心算法

### Phase 5: 产品化重构 ✅
- [x] 侧边栏导航系统
- [x] 首页 Landing 页面
- [x] 一句话生成功能 (`/generate`)
- [x] 调优工作台增强 (`/playground`)
- [x] 模板库页面 (`/templates`)
- [x] Prompt 质量评分

## 核心功能

### 1. 一句话生成 Prompt
- 输入简单描述，AI 生成 4-Pillars 结构化 Prompt
- 支持三种风格：简洁 / 详细 / 创意
- 一键导入到调优工作台

### 2. 调优工作台
- 可视化块编辑器（Role / Context / Input / Output）
- 变量提取与替换 `{{variable}}`
- 多模型并行对比（GPT-4o / Claude / Gemini / DeepSeek）
- 流式输出实时显示
- Prompt 质量评分

### 3. 模板库
- 预设场景模板（代码审查、技术文档、英语教练等）
- 分类筛选（编程开发、写作创作、商业办公等）
- 搜索功能
- 一键导入使用

### 4. 历史管理
- 快照保存与恢复
- IndexedDB 本地持久化

## 待优化功能

- [ ] Ghost Text 幽灵文字（编辑器中显示历史版本差异）
- [ ] 输出侧 Diff 高亮（多模型响应对比）
- [ ] 快捷键系统（Cmd+Enter 运行等）
- [ ] 响应式移动端适配
- [ ] 暗色模式完善
- [ ] 导出功能（Markdown / JSON）

---
状态：**产品化重构完成，已具备完整的用户流程和核心功能。**
