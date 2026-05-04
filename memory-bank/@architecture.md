# Growth Insight System - Architecture

## 1. Current Stage

当前项目已完成 Step 2.4A，具备 Next.js App Router 基础应用骨架、初始目录结构、共享导航、基础页面壳、基础视觉规范、Supabase 客户端接入基线、Drizzle schema、数据库迁移流程、认证入口和未登录写入拦截基线。

当前已存在：

- Next.js 应用配置。
- TypeScript 配置。
- Tailwind CSS v4 基础样式入口。
- `src/app` 应用入口。
- `src/components`、`src/contexts`、`src/db` 和 `src/lib/ai` 初始目录。
- 共享应用壳和主导航。
- 成长主页、每日工作台、成长记录、洞察报告、个人说明书和设置页。
- 全局视觉 token 和基础 dashboard 组件样式。
- 低饱和紫色、绿色、蓝色和辅助暖色的基础配色系统。
- `package-lock.json` 依赖锁文件。
- shadcn/ui 预备配置。
- Supabase SSR/browser client 工具层。
- `.env.example` 环境变量模板。
- 设置页 Supabase 配置状态展示。
- 真实 `.env.local` 本地配置，包含 Supabase public client 配置和 `DATABASE_URL`，但不进入 Git。
- Drizzle ORM、Drizzle Kit 和 Postgres client 依赖。
- `drizzle.config.ts` 迁移配置。
- `src/db/schema.ts` 基础数据表 schema。
- `src/db/index.ts` 服务端数据库查询入口。
- `drizzle/0000_true_silver_sable.sql` 第一版迁移 SQL。
- 真实 Supabase 数据库中的第一批 8 张基础业务表。
- `/login` 登录/注册页面。
- `/auth/confirm` Supabase 邮箱确认回调路由。
- Supabase Auth 登录、注册、退出 Server Actions。
- 当前用户读取 helper。
- 侧边栏账号状态展示。
- 每日工作台未登录写入拦截提示。

尚未开始：

- 真实业务数据读写。
- Row Level Security。
- AI provider adapter。
- 真实图表、表单和交互组件视觉细化。

目标技术方向：

```text
Next.js App Router
  ↓
Server Actions / Route Handlers
  ↓
Domain Services
  ↓
Supabase Postgres via Drizzle ORM
  ↓
AI Provider Adapter for scheduled/manual reviews
```

### 1.1 Current Skeleton File Roles

当前 Step 1.1-Step 2.4A 建立应用骨架、目录、页面壳、基础视觉规范、Supabase 客户端接入基线、Drizzle schema、数据库迁移流程、认证入口和未登录写入拦截基线，不包含真实业务数据读写。各文件职责如下：

- `package.json`: 定义项目名称、运行脚本和基础依赖。当前脚本包括 `dev`、`build`、`start`、`lint`、`db:generate`、`db:migrate` 和 `db:studio`；依赖包括 Supabase SSR/client 包、Drizzle ORM 和 Postgres client。
- `tsconfig.json`: TypeScript 配置，启用严格模式，并设置 `@/*` 指向 `src/*`。
- `next-env.d.ts`: Next.js 自动类型声明入口。
- `next.config.ts`: Next.js 配置文件，当前保持最小配置。
- `postcss.config.mjs`: Tailwind CSS v4 的 PostCSS 插件配置。
- `eslint.config.mjs`: ESLint flat config，直接导入 Next 16 的 `eslint-config-next/core-web-vitals` 和 `eslint-config-next/typescript`。
- `package-lock.json`: npm 依赖锁文件，用于固定依赖解析结果，保证后续安装、数据库工具和验证更稳定。
- `components.json`: shadcn/ui 配置，指定 UI 组件别名、样式入口和图标库。
- `.gitignore`: 忽略依赖、构建产物、环境变量、本地调试日志和 TypeScript 构建缓存。
- `src/app/layout.tsx`: App Router 根布局，定义页面 HTML 语言和全局 metadata。
- `src/app/page.tsx`: 成长主页页面壳，展示今日行动进度、本周指标、最近复盘和每日工作台入口等占位区。
- `src/app/daily/page.tsx`: 每日工作台页面壳，预留今日概览、今日任务、习惯打卡、今日日程和随手记录分区，并使用统一状态标签。
- `src/app/records/page.tsx`: 成长记录页面壳，预留任务、习惯、日程、事件和灵感记录入口，并使用统一列表样式。
- `src/app/insights/page.tsx`: 洞察报告页面壳，预留今日概览、本周趋势、习惯状态和情绪记录，并使用柔和图表占位样式。
- `src/app/manual/page.tsx`: 个人说明书页面壳，预留人生阶段、目标、能力画像、情绪模式和常见内耗点，并使用统一字段卡片样式。
- `.env.example`: 环境变量模板，只列出需要配置的字段，不保存真实密钥。
- `src/app/settings/page.tsx`: 设置页展示应用、Supabase 配置状态和账号登录状态，只显示是否配置，不展示密钥、token 或连接字符串。
- `src/app/login/page.tsx`: 邮箱登录和注册页面，支持 `next` 参数把用户带回原页面。
- `src/app/auth/actions.ts`: Supabase Auth Server Actions，负责登录、注册和退出。
- `src/app/auth/confirm/route.ts`: Supabase 邮箱确认回调路由，成功后跳转到安全的 `next` 路径。
- `src/app/globals.css`: 全局样式入口，导入 Tailwind CSS，定义基础视觉 token、字体、页面标题、卡片、列表、状态标签、基础按钮和导航样式。
- `src/components/app-shell.tsx`: 共享应用壳，负责左侧或顶部主导航、导航图标、品牌区、当前阶段提示、账号状态和退出入口，并把页面内容包裹在统一布局中。
- `src/components/.gitkeep`: 保留业务组件目录。
- `src/components/ui/.gitkeep`: 保留 shadcn/ui 组件目录。
- `src/contexts/.gitkeep`: 保留 React context 目录。
- `src/db/.gitkeep`: 保留数据库 schema 和 query 目录。
- `src/lib/ai/.gitkeep`: 保留 AI provider adapter 目录。
- `src/lib/supabase/config.ts`: 读取 Supabase 环境变量，提供 public client 配置校验和设置页状态检查。
- `src/lib/supabase/client.ts`: 浏览器端 Supabase client 工厂，只使用 `NEXT_PUBLIC_*` 配置。
- `src/lib/supabase/server.ts`: 服务端 Supabase client 工厂，使用 Next.js cookies 接入 SSR 会话能力。
- `src/lib/auth/session.ts`: 当前用户读取 helper，封装 Supabase `auth.getUser()`，认证未就绪时返回 `null`。
- `drizzle.config.ts`: Drizzle Kit 配置，读取 `.env.local` 中的 `DATABASE_URL`，用于生成和执行迁移。
- `drizzle/0000_true_silver_sable.sql`: 第一版数据库迁移 SQL，创建基础枚举、8 张基础业务表、索引和内部外键。
- `drizzle/meta/`: Drizzle 迁移快照和迁移日志元数据，用于后续增量迁移。
- `src/db/schema.ts`: Drizzle schema，定义 `tasks`、`habits`、`habit_checkins`、`schedule_items`、`life_events`、`ideas`、`insight_reports` 和 `personal_manuals`。
- `src/db/index.ts`: 服务端数据库入口，使用 `DATABASE_URL` 创建 Drizzle client；当前仅供后续服务端读写使用。
- `src/lib/utils.ts`: 通用工具函数入口，当前提供 `cn()` 用于合并 Tailwind className。

当前骨架遵循的约束：

- 已接入 Supabase client 工具层，并已配置真实 Supabase public client 与 `DATABASE_URL` 到本地 `.env.local`。
- `.env.local` 被 Git 忽略，不能提交真实密钥、token 或连接字符串。
- 已建立 Drizzle schema 和迁移流程，并已将第一批基础表迁移到真实 Supabase 数据库。
- 已接入认证入口和未登录写入拦截基线。
- 未登录用户仍可浏览页面。
- 未登录用户触发每日工作台写入入口时跳转登录提示。
- 登录用户可在侧边栏看到账号状态并退出。
- Supabase Auth 邮件确认完整链路需要在 Supabase Dashboard 中确认 Redirect URL 允许 `http://localhost:3001/auth/confirm`。
- 不接 AI。
- 不配置 `SUPABASE_SERVICE_ROLE_KEY`，除非后续步骤确实需要并单独确认。
- 只提供静态页面壳、导航和基础视觉规范。
- 页面视觉应保持个人 dashboard 风格，不做营销首页。
- 视觉 token 使用低饱和、温暖、莫兰迪方向；紫色、绿色、蓝色用于区分状态和占位图表。
- 卡片圆角保持 8px 左右，避免过度装饰。

### 1.2 Current Route Map

- `/`: 成长主页。
- `/daily`: 每日工作台。
- `/records`: 成长记录。
- `/insights`: 洞察报告。
- `/manual`: 个人说明书。
- `/settings`: 设置。
- `/login`: 登录/注册。
- `/auth/confirm`: Supabase 邮箱确认回调。

## 2. Recommended Tech Stack

- **Framework**: Next.js App Router
- **Language**: TypeScript
- **UI**: Tailwind CSS, shadcn/ui, lucide-react
- **Database**: Supabase Postgres
- **Auth**: Supabase Auth
- **ORM**: Drizzle ORM
- **Charts**: Recharts
- **AI**: OpenAI-compatible provider adapter
- **Deployment**: Vercel
- **Package Manager**: npm

## 2.1 Access Model

- 未登录用户可以访问应用首页、导航、基础说明和展示数据。
- 未登录用户不能写入个人数据。
- 任务、习惯、日程、事件、灵感和复盘生成都需要注册或登录。
- 未登录用户触发写入操作时，显示注册/登录提示。
- 第一版开放注册登录，但不做团队、社区、付费权限或公开协作。

## 3. Why This Stack

### 3.1 Next.js App Router

适合同时做前端页面和后端 API，减少项目复杂度。

### 3.2 Supabase Postgres

适合作为真实产品数据库，支持未来公开上线需要的认证、权限和数据隔离。

### 3.2.1 Supabase Client Baseline

Step 2.2 已安装并接入：

- `@supabase/supabase-js`
- `@supabase/ssr`

客户端分层规则：

- 浏览器端代码只能通过 `src/lib/supabase/client.ts` 创建 Supabase client。
- 服务端组件、Server Actions 和 Route Handlers 后续通过 `src/lib/supabase/server.ts` 创建 Supabase client。
- `src/lib/supabase/config.ts` 统一读取和校验 Supabase public 配置，并给设置页提供配置状态。
- 当前支持 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`，并兼容旧命名 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
- `SUPABASE_SERVICE_ROLE_KEY` 和 `DATABASE_URL` 只允许服务端使用，设置页只显示是否配置，不展示实际值。

当前限制：

- `.env.local` 只存在本地，不进入 Git。
- 已验证真实 Supabase 数据库连接和迁移。
- 尚未配置 `SUPABASE_SERVICE_ROLE_KEY`。
- 已接入 Supabase Auth 页面入口和基础 Server Actions。
- 尚未验证真实注册登录完整链路。
- 尚未启用 Row Level Security 或真实业务数据读写。

### 3.2.3 Supabase Auth Baseline

Step 2.4A 已接入 Supabase Auth 基线：

- 使用 `src/lib/supabase/server.ts` 创建服务端 Supabase client。
- 使用 `src/lib/auth/session.ts` 读取当前用户。
- 使用 `src/app/auth/actions.ts` 执行登录、注册和退出。
- 使用 `src/app/auth/confirm/route.ts` 处理邮箱确认回调。
- `/login` 支持登录和注册模式，并通过安全的 `next` 参数返回原页面。

访问规则当前实现：

- 未登录用户可以访问首页、每日工作台、成长记录、洞察报告、个人说明书、设置页和登录页。
- 未登录用户在每日工作台看到写入拦截提示。
- 每日工作台里的写入入口在未登录状态下跳转 `/login?next=/daily&message=login_required`。
- 已登录用户在侧边栏显示邮箱，并可退出登录。

当前限制：

- 真实业务写入尚未实现，因此写入拦截目前只覆盖每日工作台的占位入口。
- Row Level Security 尚未配置。
- 登录后的用户数据隔离需要后续在查询层和 RLS 中同时落实。
- 邮箱确认回调需要 Supabase Dashboard 允许 `http://localhost:3001/auth/confirm` 作为 Redirect URL。

### 3.2.2 Drizzle Migration Baseline

Step 2.3 已安装并接入：

- `drizzle-orm`
- `postgres`
- `drizzle-kit`
- `dotenv`

迁移规则：

- `npm run db:generate`: 根据 `src/db/schema.ts` 生成本地迁移 SQL，不修改数据库。
- `npm run db:migrate`: 读取 `.env.local` 中的 `DATABASE_URL`，连接真实 Supabase Postgres 并执行迁移；执行前必须单独确认。
- `npm run db:studio`: 打开 Drizzle Studio，用于本地查看数据库结构和数据；如需联网访问真实数据库，也应先说明用途。
- 每次修改 schema 后，先生成迁移 SQL，检查无误后再执行真实迁移。
- 迁移文件不能包含真实 URL、key、token、数据库密码或 service role key。

当前已迁移到真实 Supabase 的基础表：

- `tasks`
- `habits`
- `habit_checkins`
- `schedule_items`
- `life_events`
- `ideas`
- `insight_reports`
- `personal_manuals`

迁移状态：

- 第一版迁移 SQL 为 `drizzle/0000_true_silver_sable.sql`。
- Drizzle 迁移记录表为 `drizzle.__drizzle_migrations`。
- 只读查询已确认 8 张业务表和迁移记录表存在。

### 3.3 Drizzle ORM

轻量、类型安全，适合管理任务、习惯、情绪、复盘报告等结构化数据。

### 3.4 Recharts

覆盖 MVP 需要的趋势图、柱状图、折线图、完成率图表。

### 3.5 AI Provider Adapter

不绑定 OpenAI，支持配置低成本或国内模型 API。只要供应商兼容 OpenAI API 格式，后续切换成本较低。

## 4. Data Flow

### 4.1 Manual Daily Data

```text
User action in UI
  ↓
Auth gate checks login when action writes data
  ↓
Server Action / Route Handler
  ↓
Domain validation
  ↓
Drizzle query
  ↓
Supabase Postgres
  ↓
UI refresh
```

适用：

- 创建任务
- 完成任务
- 习惯打卡
- 记录事件和灵感
- 新建纪念日
- 记录礼物

### 4.2 Programmatic Insights

```text
Stored structured data
  ↓
Aggregation query
  ↓
Insight service
  ↓
Chart data
  ↓
Dashboard visualization
```

适用：

- 任务完成率
- 习惯连续天数
- 情绪趋势
- 分类分布
- 记录热力图

### 4.3 AI Review Generation

```text
User clicks generate / scheduled trigger
  ↓
Collect structured stats
  ↓
Build compact review context
  ↓
Run event-original sensitivity and permission checks
  ↓
Show AI context preview before sending
  ↓
AI provider adapter
  ↓
Selected model provider
  ↓
Normalize response
  ↓
Save InsightReport
  ↓
Display cached report
```

原则：

- 页面打开不自动重复调用 AI。
- 同一天同类型报告默认读取缓存。
- 重新生成需要用户明确触发。
- 每日复盘默认使用统计和摘要；少量事件原文必须经过权限、敏感规则和用户确认后才能发送。

## 5. Domain Modules

### 5.1 Daily Workspace

Responsibilities:

- 今日任务
- 习惯打卡
- 今日日程
- 随手记录：事件和灵感
- 晚间总结入口

### 5.2 Growth Records

Responsibilities:

- 查询和筛选历史记录
- 查看任务、习惯、事件、灵感、手动情绪标签
- 查看复盘报告

### 5.3 Visualization

Responsibilities:

- 将结构化数据转换为图表数据
- 不依赖 AI 完成基础洞察

### 5.4 AI Reviews

Responsibilities:

- 构造复盘上下文
- 调用模型供应商
- 保存每日、每周、月度复盘
- 控制成本和缓存

### 5.5 Personal Manual

Responsibilities:

- 保存当前人生阶段、目标、情绪模式、反复问题
- 后续支持由 AI 生成更新建议

### 5.6 Scenario Toolbox

Responsibilities:

- 情绪复盘
- 边界感练习
- 职场沟通复盘
- 决策复盘
- 关系复盘
- 周目标拆解

## 6. Initial Data Model Draft

Step 2.1 只确定基础功能第一轮需要的数据模型，不创建数据库、不写 Drizzle schema、不执行迁移。

第一批基础表：

- `tasks`
- `habits`
- `habit_checkins`
- `schedule_items`
- `life_events`
- `ideas`
- `insight_reports`
- `personal_manuals`

暂缓表：

- `anniversaries`: 纪念日，等每日工作台和每日复盘稳定后再做。
- `gift_records`: 礼物记录，等纪念日模块进入开发时再做。
- `tool_sessions`: 场景工具箱会话，等工具箱进入开发时再做。
- 成长知识库相关表：第一版不做，Obsidian 继续作为学习笔记主阵地。
- 飞书任务 ID、飞书日历事件 ID 等外部平台同步字段：第一版不保留，避免基础模型被外部工具绑定。

用户关系规则：

- 用户账号由 Supabase Auth 的 `auth.users` 管理，应用业务表不单独复制完整用户表。
- 每张个人数据表都必须有 `user_id`，关联到当前登录用户。
- 未登录用户只能浏览展示数据，不能写入个人数据。
- 后续启用 Row Level Security 时，所有个人数据都按 `user_id` 做隔离。

通用字段规则：

- 主键统一使用 `id`，类型优先使用 UUID。
- 每张业务表都保留 `created_at` 和 `updated_at`。
- 需要软删除时使用 `deleted_at`，第一轮先保留字段设计，不要求所有页面都实现删除。
- 日期字段用 `date` 表示用户理解的日期，按北京时间解释。
- 精确时间点用 `timestamp` 或 `timestamptz`，显示到前端时按北京时间格式化。

### 6.1 `tasks`

用途：

- 保存每日任务，是今日任务、任务完成率、延期统计和任务复盘的来源。

用户关系：

- 每条任务必须属于一个 `user_id`。
- 登录用户只能读取和修改自己的任务。

最小字段：

- `id`: 任务 ID。
- `user_id`: 所属用户 ID，关联 Supabase Auth 用户。
- `title`: 任务标题，必填。
- `description`: 任务补充说明，可选。
- `category`: 任务分类，固定为 `study`、`work`、`life`、`health`、`relationship`、`other`。
- `status`: 任务状态，固定为 `todo`、`in_progress`、`completed`、`postponed`。
- `task_date`: 任务所属日期，按北京时间理解。
- `is_postponed`: 是否曾被延期。
- `postponed_from_date`: 从哪一天延期而来，可选。
- `postponed_to_date`: 延期到哪一天，可选。
- `review_note`: 任务复盘或备注，可选。
- `completed_at`: 完成时间，可选。
- `created_at`: 创建时间。
- `updated_at`: 更新时间。
- `deleted_at`: 软删除时间，可选。

规则：

- 新任务默认 `status = todo`，默认 `task_date = 今天`。
- 标记延期时，`status = postponed`，`is_postponed = true`。
- 如果用户选择同步修改日期，则 `task_date` 改为延期后的日期，同时记录 `postponed_from_date` 和 `postponed_to_date`。

### 6.2 `habits`

用途：

- 保存习惯本身，是习惯打卡列表、连续天数和累计次数的基础。

用户关系：

- 每个习惯必须属于一个 `user_id`。
- 登录用户只能读取和修改自己的习惯。

最小字段：

- `id`: 习惯 ID。
- `user_id`: 所属用户 ID。
- `name`: 习惯名称，必填。
- `description`: 习惯说明，可选。
- `category`: 习惯分类，先复用任务分类：`study`、`work`、`life`、`health`、`relationship`、`other`。
- `is_active`: 是否启用，默认启用。
- `start_date`: 习惯开始日期，可选。
- `created_at`: 创建时间。
- `updated_at`: 更新时间。
- `deleted_at`: 软删除时间，可选。

规则：

- 第一轮不做复杂目标频率，启用的习惯默认出现在今日打卡列表。
- 连续天数和累计次数优先通过 `habit_checkins` 计算，避免在 `habits` 表里保存容易不同步的统计值。
- `habits` 只保存习惯本身，例如“多邻国”“快走10000步”，不保存某一天是否完成。
- 创建一个新习惯时写入 `habits`；每日勾选打卡时写入或更新 `habit_checkins`。

### 6.3 `habit_checkins`

用途：

- 保存每日习惯打卡记录，是习惯完成数、连续天数和累计打卡次数的来源。

用户关系：

- 每条打卡记录必须属于一个 `user_id`，并关联一个属于该用户的 `habit_id`。
- 一个 `habits` 记录可以对应多条 `habit_checkins` 记录，也就是同一个习惯每天最多一条打卡记录。

最小字段：

- `id`: 打卡记录 ID。
- `user_id`: 所属用户 ID。
- `habit_id`: 关联的习惯 ID。
- `checkin_date`: 打卡日期，按北京时间理解。
- `status`: 打卡状态，固定为 `checked`、`skipped`。
- `note`: 中断原因或复盘说明，可选。
- `created_at`: 创建时间。
- `updated_at`: 更新时间。

规则：

- 同一个 `habit_id` 在同一个 `checkin_date` 只能有一条有效记录。
- 勾选某个习惯当天已完成时，写入或更新一条 `habit_checkins`，`status = checked`。
- 如果打卡时没有填写复盘或感受，`note` 可以为空，但仍然需要有这条打卡记录。
- 如果打卡时同步填写复盘或感受，就把内容写入同一条 `habit_checkins.note`。
- 取消今日打卡时，可以删除记录或把状态改为 `skipped`，实际 schema 阶段再选择一种实现。
- 连续天数规则：漏打一天则连续天数断掉；取消某天打卡后重新计算连续天数。
- 累计天数规则：统计该习惯所有 `status = checked` 的有效日期。

### 6.4 `schedule_items`

用途：

- 保存单日日程项，是今日日程列表和日程数量统计的来源。

用户关系：

- 每条日程必须属于一个 `user_id`。
- 登录用户只能读取和修改自己的日程。

最小字段：

- `id`: 日程 ID。
- `user_id`: 所属用户 ID。
- `title`: 日程标题，必填。
- `description`: 日程说明，可选。
- `category`: 日程分类，先复用任务分类：`study`、`work`、`life`、`health`、`relationship`、`other`。
- `schedule_date`: 日程日期，按北京时间理解。
- `start_time`: 开始时间，可选，格式按本地时间理解。
- `end_time`: 结束时间，可选。
- `created_at`: 创建时间。
- `updated_at`: 更新时间。
- `deleted_at`: 软删除时间，可选。

规则：

- 第一轮只做单日记录，不做重复规则，不做外部日历同步。
- 今日工作台只展示 `schedule_date = 今天` 的日程。
- 有 `start_time` 时按开始时间排序，没有时间的日程排在后面。

### 6.5 `life_events`

用途：

- 保存人生笔记，也就是已经发生过的事件、情绪、复盘和下次行动，是成长记录、情绪统计、记录数量趋势和每日复盘上下文的来源。

用户关系：

- 每条人生笔记必须属于一个 `user_id`。
- 登录用户只能读取和修改自己的人生笔记。

最小字段：

- `id`: 人生笔记 ID。
- `user_id`: 所属用户 ID。
- `event_date`: 事件日期，按北京时间理解。
- `content`: 事件正文，必填。
- `emotion_tags`: 情绪标签列表，可选，第一轮手动选择。
- `tags`: 事件标签列表，可选，用于承接日常、情绪、工作、人际、教训等分类。
- `specific_event`: 具体事件，可选，用于从长文本中单独标记发生了什么。
- `next_action`: 下次怎么做，可选。
- `ai_analysis_permission`: AI 分析权限，固定为 `none`、`summary_only`、`allow_original`。
- `summary`: 程序或用户维护的摘要，可选，第一轮可以先为空。
- `created_at`: 创建时间。
- `updated_at`: 更新时间。
- `deleted_at`: 软删除时间，可选。

规则：

- 人生笔记就是事件记录，不再和灵感放在同一张表里。
- 人生笔记用于记录已经发生的事、当时的情绪、反思和下次行动。
- 情绪不是独立记录类型，只作为人生笔记的手动标签。
- `tags` 统一承接事件类型和场景标签，第一版不再单独保留 `event_type` 和 `scene_tags`，避免重复分类。
- 第一版预设情绪标签：平静、开心、满足、期待、兴奋、焦虑、疲惫、低落、委屈、生气、压力、混乱、孤独、感激。
- 新人生笔记默认 `ai_analysis_permission = summary_only`。
- 只有 `ai_analysis_permission = allow_original` 的人生笔记，才可能进入每日复盘原文候选。

### 6.6 `ideas`

用途：

- 保存灵感，也就是未来可能要做、要评估、要搁置或可转成任务的想法。

用户关系：

- 每条灵感必须属于一个 `user_id`。
- 登录用户只能读取和修改自己的灵感。

最小字段：

- `id`: 灵感 ID。
- `user_id`: 所属用户 ID。
- `idea_date`: 灵感记录日期，按北京时间理解。
- `content`: 灵感内容，必填。
- `status`: 灵感状态，固定为 `to_review`、`converted_to_task`、`shelved`、`abandoned`。
- `solution_note`: 解决方法或处理说明，可选。
- `converted_task_id`: 灵感转成任务后的任务 ID，可选。
- `created_at`: 创建时间。
- `updated_at`: 更新时间。
- `deleted_at`: 软删除时间，可选。

规则：

- 灵感和人生笔记归属于两个不同思路：灵感偏未来行动候选，人生笔记偏已发生事件和复盘。
- 新灵感默认 `status = to_review`。
- 灵感可以转化为任务，转化后记录 `converted_task_id`。
- 灵感默认只进入 AI 复盘摘要，不进入原文候选。

### 6.7 `insight_reports`

用途：

- 保存 AI 生成或缓存的复盘报告，是每日复盘展示、历史复盘和避免重复调用 AI 的来源。

用户关系：

- 每份复盘报告必须属于一个 `user_id`。
- 登录用户只能读取和重新生成自己的复盘报告。

最小字段：

- `id`: 复盘报告 ID。
- `user_id`: 所属用户 ID。
- `report_type`: 复盘类型，固定为 `daily`、`weekly`、`monthly`。
- `period_start`: 复盘开始日期，按北京时间理解。
- `period_end`: 复盘结束日期，按北京时间理解。
- `title`: 复盘标题。
- `summary`: 总结正文。
- `patterns`: 生活模式或问题列表，建议用 JSON 保存。
- `suggestions`: 行动建议列表，建议用 JSON 保存。
- `next_actions`: 下一步行动列表，建议用 JSON 保存。
- `source_stats`: 发送给 AI 前的结构化统计摘要，建议用 JSON 保存。
- `source_highlights`: 关键记录摘要，建议用 JSON 保存。
- `selected_original_event_ids`: 本次允许发送原文的人生笔记 ID 列表，建议用 JSON 保存。
- `model_provider`: 模型供应商名称。
- `model_name`: 实际使用的模型名称。
- `generation_status`: 生成状态，固定为 `pending`、`completed`、`failed`。
- `error_message`: 失败原因，可选，不直接展示底层堆栈。
- `generated_at`: 生成完成时间，可选。
- `created_at`: 创建时间。
- `updated_at`: 更新时间。

规则：

- 同一用户、同一 `report_type`、同一 `period_start` 和 `period_end` 默认只保留一份当前有效报告。
- 页面打开时默认读取缓存报告，不自动重复调用 AI。
- 重新生成必须由用户明确触发。
- 普通统计和摘要由程序生成，AI 只负责解释、归纳和建议。

### 6.8 `personal_manuals`

用途：

- 保存个人说明书，是长期自我理解、目标、情绪模式和行动建议风格的结构化资料。

用户关系：

- 每份个人说明书必须属于一个 `user_id`。
- 第一轮每个用户默认最多一份当前版本。

最小字段：

- `id`: 个人说明书 ID。
- `user_id`: 所属用户 ID。
- `life_stage`: 当前人生阶段，可选。
- `current_goals`: 当前主要目标，建议用 JSON 保存。
- `ability_profile`: 能力画像，可选。
- `emotion_patterns`: 情绪模式，可选。
- `energy_sources`: 高能量来源，建议用 JSON 保存。
- `drain_sources`: 常见内耗点，建议用 JSON 保存。
- `recurring_problems`: 反复出现的问题，建议用 JSON 保存。
- `preferred_action_style`: 适合 Faye 的行动建议风格，可选。
- `notes`: 手动补充说明，可选。
- `created_at`: 创建时间。
- `updated_at`: 更新时间。

规则：

- 第一轮只支持手动编辑。
- 后续周复盘和月度复盘可以生成更新建议，但必须经用户确认后再写入。

### 6.9 Time Rules

- 所有“今天”“最近 7 天”“最近 30 天”“本周”都按北京时间计算。
- 时区统一为 `Asia/Shanghai`。
- 习惯连续天数规则：漏打一天则连续天数断掉；取消某天打卡后重新计算连续天数。
- 习惯累计天数规则：统计该习惯所有有效打卡天数。

## 7. AI Adapter Contract Draft

应用层不直接调用某家模型 SDK，而是调用统一接口。

```ts
type ReviewType = "daily" | "weekly" | "monthly";

type GenerateReviewInput = {
  userId: string;
  reviewType: ReviewType;
  dateRange: {
    start: string;
    end: string;
  };
  stats: Record<string, unknown>;
  highlights: string[];
  selectedOriginals?: Array<{
    eventId: string;
    content: string;
    sensitivityDecision: "allowed" | "downgraded_to_summary";
  }>;
  sensitiveMode: "summary_only" | "allow_selected_originals";
};

type GenerateReviewOutput = {
  title: string;
  summary: string;
  patterns: string[];
  suggestions: string[];
  nextActions: string[];
  modelProvider: string;
  modelName: string;
};
```

第一版实现一个 provider 即可，但接口必须保留 provider 可切换能力。

### 7.1 Daily Review Context Rules

- 普通统计和摘要由程序生成，不调用 AI。
- 只有事件记录可以进入原文候选；灵感记录默认只进入摘要。
- 事件原文进入 AI 前必须同时满足：记录权限允许原文参与、未命中明显敏感规则、用户在发送预览中确认。
- 明显敏感规则包括但不限于手机号、身份证、银行卡、详细住址、密钥、token、医疗隐私和高度私密关系细节。
- 命中敏感规则时，该事件降级为摘要参与，不发送原文。
- 第一版限制每日复盘最多发送 3-5 条事件原文，并对单条原文做长度截断。

## 8. Environment Variables Draft

后续创建应用时需要：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
AI_PROVIDER=
AI_BASE_URL=
AI_API_KEY=
AI_MODEL_DAILY=
AI_MODEL_WEEKLY=
AI_MODEL_MONTHLY=
```

注意：

- `AI_API_KEY` 只能在服务端使用。
- `SUPABASE_SERVICE_ROLE_KEY` 不能暴露给前端。
- 修改 `.env` 属于 Faye 全局规则中的红线，必须单独确认。

## 8.1 Visual System Direction

- 产品做成安静、清晰、实用的 dashboard。
- 不做营销首页。
- 配色采用低饱和、温暖、莫兰迪色系。
- 主色优先考虑紫色、绿色和蓝色的低饱和组合。
- 图表颜色需要柔和但可区分。
- 页面应适合长期每天使用，避免强烈视觉刺激和纯装饰性背景。

## 9. Non-Goals For MVP

- 不做完整知识库。
- 不做移动 App。
- 不做付费系统。
- 不做复杂自动化 Agent。
- 不把 AI 作为普通录入流程的必需步骤。

## 10. Verification Strategy

文档阶段：

- 检查文件存在。
- 检查 PRD 和架构是否覆盖已确认的产品方向。

应用阶段：

- `npm run lint`
- `npm run build`
- 关键表单和 AI 复盘流程增加基础测试或手工验收清单。
