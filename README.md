# Growth Insight System

> **归档说明**：本项目已停止维护，作为个人项目备份保留在 GitHub 上。

Growth Insight System 是一个个人成长洞察系统，用来记录任务、习惯、日程、事件和灵感，并基于这些记录生成日/周/月复盘与洞察报告。

这个项目来自我的个人使用需求：成长过程中，仅记录数据并不足够，真正有价值的是从记录中发现行为模式，并把复盘结果转化为下一步可以执行的调整。

## 核心功能

- **每日工作台**：展示今日概览、今日任务、习惯打卡、日程和随手记录，把记录入口收敛为统一的工作台。
- **任务管理**：创建、编辑、软删除任务，支持置顶、延期、状态流转（进行中→已完成）。
- **习惯养成**：创建、编辑、停用习惯，支持每日打卡、连续天数统计和累计次数。
- **日程安排**：创建、编辑、软删除日程，支持循环规则（每天/每周/每月）和时间区间。
- **随手记录**：快速记录事件和灵感，支持情绪标签、普通标签和 AI 分析权限。
- **成长记录**：按时间线展示所有记录，支持按类型和日期范围筛选。
- **洞察报告**：基于最近 7 天数据生成周复盘和月复盘，包含任务完成率、习惯打卡情况和趋势图表。
- **AI 复盘**：使用 OpenAI 兼容 API 生成个性化复盘分析和行动建议。
- **纪念日管理**：记录重要纪念日，支持礼物记录和提醒。
- **个人说明书**：维护个人偏好、价值观和工作方式，供 AI 复盘参考。
- **回收站**：软删除的记录可恢复，避免误操作。
- **数据导出**：支持将记录导出为 Markdown 格式。

## 产品思路

Growth Insight System 的核心不是简单记录，而是建立一个轻量闭环：

```text
记录数据 -> 识别模式 -> 生成复盘 -> 调整下一步计划
```

因此项目里有几类设计取舍：

- 把每日工作台作为默认入口，让用户先看当前状态，再补记录。
- 任务、习惯、日程和随手记录统一在工作台创建，减少页面跳转。
- 复盘页面独立出来，让"看见问题"和"形成下一步策略"成为核心入口。
- 使用软删除而非物理删除，避免数据意外丢失。
- 支持循环日程，减少重复创建的工作量。
- AI 复盘作为可选功能，不强制依赖外部 API。

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase Postgres
- Supabase Auth
- Drizzle ORM
- Recharts
- OpenAI-compatible AI provider adapter
- Render

## 技术实现要点

- 使用 Supabase Auth 管理邮箱密码登录和登录态保护。
- 使用 Supabase SSR client 搭配 Next.js App Router 实现服务端渲染和数据获取。
- 使用 Drizzle ORM 管理数据库 schema 和迁移，保留直连通道用于维护操作。
- 使用 Row Level Security (RLS) 确保用户只能访问自己的数据。
- 所有业务数据访问通过 `src/lib/data/user-data/` 统一管理，按功能领域拆分为 16 个模块。
- AI 复盘使用 OpenAI 兼容适配器，支持低成本模型、国内 API 和 OpenAI 之间切换。
- 使用 Recharts 展示任务完成率、习惯打卡等数据可视化图表。
- 支持循环日程规则（每天/每周/每月），自动计算今日应执行的日程。
- 软删除通过 `deleted_at` 字段实现，回收站可恢复误删记录。
- 全局视觉采用低饱和配色系统，强化数据记录体验。

## 本地运行

```bash
npm install
npm run dev
```

打开浏览器访问：

```text
http://localhost:3000
```

项目依赖 Supabase。若要完整运行登录、注册和数据读写功能，需要：

1. 创建 Supabase 项目
2. 复制 `.env.example` 为 `.env.local`
3. 在 `.env.local` 中填写 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的Supabase可发布密钥
DATABASE_URL=你的数据库连接URL
```

可选的 AI 配置：

```env
AI_PROVIDER=openai-compatible
AI_BASE_URL=你的API基础URL
AI_API_KEY=你的API密钥
AI_MODEL_DAILY=模型名称
AI_MODEL_WEEKLY=模型名称
AI_MODEL_MONTHLY=模型名称
```

数据库迁移：

```bash
npm run db:generate
npm run db:migrate
```

## 项目结构

```text
src/
├── app/                    # Next.js App Router 页面
│   ├── daily/              # 每日工作台
│   ├── checklist/          # 清单页（任务、习惯、日程）
│   ├── life/               # 人生页（事件、灵感）
│   ├── records/            # 成长记录时间线
│   ├── insights/           # 洞察报告（周/月复盘）
│   ├── ai/                 # AI 复盘界面
│   ├── manual/             # 个人说明书
│   ├── trash/              # 回收站
│   ├── export/             # 数据导出
│   ├── settings/           # 设置页
│   ├── toolbox/            # 工具箱（纪念日、礼物）
│   ├── auth/               # 认证相关路由
│   └── login/              # 登录页
├── components/             # 通用组件
├── contexts/               # React Context
├── db/                     # Drizzle schema 和迁移
├── lib/                    # 工具函数和数据访问层
│   ├── data/user-data/     # 用户态业务数据访问层
│   ├── ai/                 # AI 适配层
│   ├── supabase/           # Supabase 客户端工具
│   └── auth/               # 认证工具
└── scripts/                # 维护脚本
```

## 项目状态

这是一个个人使用中的成长洞察系统，目前已实现每日工作台、任务管理、习惯养成、日程安排、随手记录、成长记录、洞察报告、AI 复盘、纪念日管理、个人说明书、回收站和数据导出等核心功能，后续会继续根据真实使用体验优化移动端体验、复盘分析质量和页面细节。

## 后续计划

- 优化移动端高频记录体验。
- 继续改进复盘分析规则，让输出建议更具体。
- 增强 AI 复盘的个性化程度。
- 继续细化页面局部视觉层级和交互反馈。
- 补充更系统的测试和错误状态处理。
