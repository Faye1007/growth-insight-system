# Growth Insight System - Progress

## Current Status

项目已完成 Step 2.1：确定基础数据模型。

当前目标：

- 保持当前基础视觉系统、基础页面、导航和数据模型文档稳定。
- 等待进入 Step 2.2：接入 Supabase 数据库。
- 后续逐步接入认证、真实数据读写和 AI 复盘能力。

## Confirmed Decisions

- 项目名称：`growth-insight-system`
- 产品方向：基于真实生活数据的个人成长洞察系统
- 第一版用户：Faye 自用
- 第一版核心：每日工作台
- 基础功能第一轮：先做每日工作台、基础记录、基础图表和每日 AI 复盘
- 后续阶段：周复盘、月度复盘、纪念日、礼物记录和场景工具箱暂缓
- 数据方向：Supabase Postgres 作为主数据库
- 认证方向：支持注册登录；未登录用户可浏览界面，写入时提示注册/登录
- 访问方向：未登录用户可浏览基础界面和展示数据
- 注册方向：第一版开放注册登录
- AI 策略：低成本优先，普通统计不用 AI，复盘分析才调用 AI
- AI 接入：OpenAI-compatible provider adapter，不绑定 OpenAI
- AI 上下文策略：每日复盘默认使用统计和摘要，少量事件原文可在权限允许、敏感规则通过并经用户确认后发送
- 成长知识库：第一版暂缓，Obsidian 继续作为学习笔记主阵地
- 基础记录类型：人生笔记和灵感分表设计；人生笔记就是事件记录，灵感是未来行动候选
- 情绪设计：情绪作为人生笔记的手动标签，不作为独立记录类型
- 情绪标签：第一版预设平静、开心、满足、期待、兴奋、焦虑、疲惫、低落、委屈、生气、压力、混乱、孤独、感激
- 外部同步：第一版不保留飞书任务 ID、飞书日历事件 ID 等外部平台同步字段
- 时区：统一使用北京时间
- 视觉方向：安静、清晰、实用的 dashboard；低饱和温暖莫兰迪色系，偏紫色、绿色、蓝色

## Created Documents

- `AGENTS.md`
- `memory-bank/@product-requirements-document.md`
- `memory-bank/@architecture.md`
- `memory-bank/implementation-plan.md`
- `memory-bank/progress.md`
- `memory-bank/tech-stack.md`

## Completed

### Step 1.1：创建 Next.js 应用骨架

已完成内容：

- 创建 Next.js App Router 基础配置。
- 启用 TypeScript 配置。
- 启用 Tailwind CSS v4 的 PostCSS 配置。
- 创建 `src/app` 应用入口。
- 创建 `src/lib/utils.ts`，为后续 shadcn/ui 和通用 className 合并预留工具函数。
- 创建 `components.json`，为后续接入 shadcn/ui 保留配置。
- 保留现有 `AGENTS.md`、`memory-bank` 文档和项目内已有文件。

本次新增或更新的应用骨架文件：

- `.gitignore`
- `package.json`
- `tsconfig.json`
- `next-env.d.ts`
- `next.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `components.json`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/lib/utils.ts`

验证记录：

- 文件存在性检查通过。
- `package.json` 和 `components.json` JSON 解析通过。
- `npm run lint` 曾因依赖未安装报错 `eslint: not found`；这是依赖安装前的预期状态。
- Faye 已接管并确认 Step 1.1 验证通过。

### Step 1.2：整理项目初始目录

已完成内容：

- 建立业务组件目录 `src/components/`。
- 建立 shadcn/ui 组件目录 `src/components/ui/`。
- 建立 React context 目录 `src/contexts/`。
- 建立数据库目录 `src/db/`。
- 建立 AI 适配目录 `src/lib/ai/`。
- 使用 `.gitkeep` 保留空目录结构，不写入业务代码。

验证记录：

- 页面目录存在。
- UI 组件目录存在。
- 业务组件目录存在。
- 数据库目录存在。
- AI 适配目录存在。
- Faye 已确认继续进入下一步。

### Step 1.3：建立基础页面壳

已完成内容：

- 创建共享应用壳 `src/components/app-shell.tsx`。
- 在根布局中接入共享导航。
- 创建成长主页 `/`。
- 创建每日工作台 `/daily`。
- 创建成长记录 `/records`。
- 创建洞察报告 `/insights`。
- 创建个人说明书 `/manual`。
- 创建设置页 `/settings`。
- 所有页面只提供静态占位内容，不接数据库、认证或 AI。

验证记录：

- 页面文件存在性检查通过。
- 导航路径和页面路径一致。
- 当前本地没有 `node_modules` 时无法由 Codex 运行 `npm run lint` 或 `npm run build`。
- Faye 已要求更新文档并提交 Git，视为 Step 1.3 验证已通过。

### Step 1.4：建立基础视觉规范

已完成内容：

- 在 `src/app/globals.css` 中建立全局视觉 token，包括背景、前景、卡片、边框、低饱和紫色、绿色、蓝色和辅助暖色。
- 建立通用页面样式，包括页面标题、说明文字、卡片、列表、状态标签和基础按钮。
- 更新共享应用壳 `src/components/app-shell.tsx`，强化侧边栏、导航图标和当前阶段提示。
- 统一成长主页、每日工作台、成长记录、洞察报告、个人说明书和设置页的静态视觉风格。
- 保持当前页面仍为静态占位，不接数据库、认证或 AI。
- 修正 `eslint.config.mjs`，改为直接使用 Next 16 的 flat config，避免 ESLint 9 通过 `FlatCompat` 重复转换时出现循环对象错误。
- 安装项目本地依赖并生成 `package-lock.json`，用于锁定依赖版本和支持后续稳定验证。

验证记录：

- `npm install` 初次因网络 `ECONNRESET` 失败；改用 `--prefer-offline --no-audit --no-fund --registry=https://registry.npmjs.org` 后安装成功。
- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- Faye 已要求更新文档并提交 Git，视为 Step 1.4 验证已通过。

### Step 2.1：确定基础数据模型

已完成内容：

- 在 `memory-bank/@architecture.md` 中补充基础功能第一轮的数据模型。
- 明确第一批基础表为 `tasks`、`habits`、`habit_checkins`、`schedule_items`、`life_events`、`ideas`、`insight_reports` 和 `personal_manuals`。
- 明确 `habits` 只保存习惯本身，`habit_checkins` 保存每天的打卡记录和可选复盘感受。
- 根据 `Faye的成长计划.xlsx` 的实际字段调整模型方向。
- 将人生笔记和灵感拆成两张表：`life_events` 用于已经发生的事件和复盘，`ideas` 用于未来行动候选。
- 合并人生笔记中的事件类型和场景标签，统一使用 `tags` 字段。
- 明确第一版不保留飞书任务 ID、飞书日历事件 ID 等外部平台同步字段。
- 继续暂缓纪念日、礼物、工具箱和成长知识库相关数据表。

验证记录：

- 文档检查通过：8 张基础表都包含用途、用户关系和最小字段。
- 文档检查通过：`life_entries`、旧 `entryId` 和飞书外部 ID 字段已无残留。
- `git diff --check -- memory-bank/@architecture.md` 通过。
- 本 Step 只修改文档，没有运行 `npm run lint` 或 `npm run build`。
- Faye 已确认 Step 2.1 数据模型调整方向，并要求更新文档和提交 Git。

## Not Started

- Supabase 项目配置
- 数据库 schema
- AI provider adapter

## Next Step Candidate

Step 2.2：接入 Supabase 数据库。

进入下一步前，需要按项目 Step Workflow 单独确认目标、影响文件和验证方式。
