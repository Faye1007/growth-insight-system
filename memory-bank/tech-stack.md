# Growth Insight System - Tech Stack

## 结论

本项目推荐采用：

**Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui + Supabase Postgres/Auth + Drizzle ORM + Recharts + OpenAI-compatible AI Provider Adapter。**

这是当前最适合本项目的“简单但健壮”组合：

- 简单：一个 Next.js 项目同时承载页面、后端接口和 AI 调用。
- 健壮：数据库、认证、权限、类型安全、部署路径都能支撑未来公开上线。
- 可控：AI 不绑定 OpenAI，支持便宜或国内 OpenAI-compatible API。

## 技术栈清单

| 层级 | 选择 | 用途 |
|------|------|------|
| Web 框架 | Next.js App Router | 页面、路由、服务端逻辑、后端接口 |
| 语言 | TypeScript | 降低后续维护出错率 |
| 样式 | Tailwind CSS | 快速建立统一视觉系统 |
| UI 组件 | shadcn/ui | 使用可控、可改、现代化的基础组件 |
| 图标 | lucide-react | 统一图标系统 |
| 数据库 | Supabase Postgres | 存储任务、习惯、记录、复盘报告 |
| 认证 | Supabase Auth | 先支持自用，未来可扩展多用户 |
| ORM | Drizzle ORM | 类型安全地管理数据库表和查询 |
| 图表 | Recharts | 任务、习惯、情绪和趋势可视化 |
| AI 接入 | OpenAI-compatible Provider Adapter | 可切换低成本模型、国内模型或 OpenAI |
| 部署 | Vercel | 适合 Next.js 的简单部署路径 |
| 包管理 | npm | 默认、简单、资料最多 |

## 为什么这是最简单但最健壮

### 1. Next.js App Router

Next.js 可以同时做前端页面和后端接口，避免再单独维护一个后端项目。

对本项目来说，它能承载：

- 每日工作台页面
- 成长记录页面
- 洞察报告页面
- 设置页
- 数据读写接口
- AI 复盘接口

这样第一版项目结构更简单，未来也能继续扩展。

### 2. Supabase Postgres/Auth

Supabase 提供 Postgres 数据库和认证能力，适合从自用产品逐步走向公开上线。

Supabase 有免费层，适合自用 MVP 和早期验证。免费层限制会随官方政策变化，当前应按官方 billing 文档核对项目数量、数据库容量、月活用户和不活跃暂停规则。

对本项目来说，它能承载：

- 任务数据
- 习惯和打卡数据
- 日程数据
- 情绪和生活记录
- 复盘报告
- 用户账号和权限

Supabase 还支持 Row Level Security，后续做多用户时可以保护每个用户只能访问自己的数据。

本项目优先选择 Supabase/Postgres，而不是 Firebase，原因是本项目长期核心是任务、习惯、事件、情绪和复盘报告之间的统计分析。Postgres 更适合时间范围筛选、分类聚合、趋势统计和后续关系查询。

### 3. Drizzle ORM

Drizzle 的作用是让数据库结构和 TypeScript 类型保持一致，减少字段写错、查询写错的问题。

对本项目来说，任务、习惯、复盘报告这些表会逐渐变多，直接手写零散 SQL 或散落的数据请求会越来越难维护。Drizzle 能让数据库层更清晰。

### 4. Tailwind CSS + shadcn/ui

Tailwind 用来建立统一视觉规则，shadcn/ui 用来提供基础组件。

这个组合适合本项目，因为我们需要的是一个长期使用的工作台，而不是营销网站。它可以做出安静、清晰、可维护的界面。

### 5. Recharts

Recharts 足够覆盖第一版需要的图表：

- 任务完成率
- 习惯连续天数
- 情绪趋势
- 记录数量变化
- 分类分布

第一版不需要上更重的数据可视化框架。

### 6. OpenAI-compatible AI Provider Adapter

本项目不应该直接绑定某一家 AI 供应商。

推荐做一个统一 AI 适配层：

- 每日复盘可以用低成本模型。
- 周复盘可以用中等模型。
- 月度复盘必要时再用更强模型。
- 国内便宜 API、免费额度 API、OpenAI API 都可以作为供应商。

这样既控制成本，也避免未来被某一家模型锁死。

## 暂不推荐的选择

### 暂不推荐 Firebase 作为本项目主数据库

Firebase 可以用于快速开发 Web App，`haoshijia` 项目也可以继续作为目录结构参考。但本项目比 `haoshijia` 更偏长期生活数据分析，后续会频繁做时间范围、分类、任务状态、情绪标签和复盘报告之间的关系查询。

因此，本项目基础版直接采用 Supabase/Postgres，避免后续从 NoSQL 数据结构迁移到关系型数据库。

### 暂不推荐独立后端

例如单独做 Express、NestJS、FastAPI。

原因：

- 第一版会增加项目数量和部署复杂度。
- 当前功能 Next.js 后端接口已经足够。
- 对自用 MVP 来说维护成本偏高。

### 暂不推荐 MongoDB

原因：

- 本项目有大量结构化数据：任务、习惯、打卡、情绪、复盘报告。
- Postgres 更适合做关系查询、统计和后续权限控制。

### 暂不推荐一开始做移动 App

原因：

- Web 应用能最快验证核心闭环。
- 手机端可以先通过响应式网页适配。
- 等基础功能稳定后再考虑 App。

### 暂不推荐 LangChain / 重型 Agent 框架

原因：

- 当前 AI 需求是固定复盘和建议，不是复杂多步骤 Agent。
- 直接通过 AI Provider Adapter 调用模型更简单、更可控。

## 第一版最小技术边界

第一版只需要做到：

- 一个 Next.js Web 应用。
- 一个 Supabase Postgres 数据库。
- Supabase Auth 注册登录。
- 未登录用户可以浏览界面，但写入数据时必须注册或登录。
- Drizzle 管理基础数据表。
- Recharts 做基础图表。
- AI 只在“生成复盘”时调用。
- AI 供应商通过配置切换。

第一版不需要：

- 独立后端服务。
- 复杂微服务。
- 实时协作。
- 移动 App。
- 向量数据库。
- 完整知识库系统。
- 多模型自动路由。
- Agent 工作流编排框架。

## AI 模型选择策略

AI 不负责普通记录和统计。

普通功能：

- 创建任务：不用 AI。
- 习惯打卡：不用 AI。
- 情绪趋势：不用 AI。
- 任务完成率：不用 AI。
- 记录数量统计：不用 AI。

AI 功能：

- 每日复盘。
- 周复盘。
- 月度复盘。
- 生活模式归纳。
- 行动建议生成。

模型选择：

- 每日复盘：低成本模型。
- 周复盘：低成本或中等模型。
- 月度复盘：中等模型，必要时更强模型。

必须支持：

- 配置 AI base URL。
- 配置 API key。
- 配置不同复盘类型使用的模型。
- AI key 只允许服务端读取。
- 未配置 AI 时，非 AI 功能必须正常使用。

## 环境变量方向

Vercel 首版部署时，必填配置是：

- Supabase 项目地址。
- Supabase 前端可用 publishable key 或 anon key。
- 数据库连接字符串。

暂不必填的可选配置是：

- Supabase 服务端密钥。
- AI 供应商名称。
- AI base URL。
- AI API key。
- 每日复盘模型名。
- 周复盘模型名。
- 月度复盘模型名。

注意：

- 修改 `.env` 属于敏感配置变更，必须单独向 Faye 确认。
- 任何服务端密钥都不能出现在前端页面、日志或公开仓库。
- AI 环境变量可以后续再接入；未配置 AI 时，程序统计、图表和基础复盘摘要仍应正常可用。

## 验证标准

技术栈落地后，至少要通过以下验证：

- 应用可以本地启动。
- 应用可以完成生产构建。
- 基础页面路由正常。
- 未登录用户可以浏览界面。
- 未登录用户写入数据时会看到注册/登录提示。
- 数据库可以写入和读取任务。
- 关闭 AI 配置时，任务、习惯、记录和图表仍能正常使用。
- 配置 AI 后，只在生成复盘时调用模型。
- 前端代码和页面中不出现 AI API key。
- 图表能从真实数据库数据生成，而不是写死展示。
- 项目结构符合 `AGENTS.md` 和 `@architecture.md`。

## 官方参考

- Next.js App Router: https://nextjs.org/docs/app
- Supabase Auth with Next.js: https://supabase.com/docs/guides/auth/quickstarts/nextjs
- Supabase with Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase Drizzle guide: https://supabase.com/docs/guides/database/drizzle
- Drizzle Supabase guide: https://orm.drizzle.team/docs/connect-supabase
- Supabase Auth overview: https://supabase.com/docs/guides/auth
- Supabase billing: https://supabase.com/docs/guides/platform/billing-on-supabase
