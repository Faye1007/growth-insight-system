# Growth Insight System - Progress

## Current Status

项目已完成 Step 1.1：Next.js 应用骨架创建。

当前目标：

- 保持当前应用骨架稳定。
- 等待进入 Step 1.2：整理项目初始目录。
- 后续逐步接入页面结构、数据库、认证和 AI 复盘能力。

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
- 随手记类型：事件和灵感；情绪作为事件记录的手动标签，不作为独立记录类型
- 情绪标签：第一版预设平静、开心、满足、期待、兴奋、焦虑、疲惫、低落、委屈、生气、压力、混乱、孤独、感激
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

## Not Started

- Supabase 项目配置
- 数据库 schema
- 页面导航和完整页面壳
- AI provider adapter

## Next Step Candidate

Step 1.2：整理项目初始目录。

进入下一步前，需要按项目 Step Workflow 单独确认目标、影响文件和验证方式。
