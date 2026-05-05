# Growth Insight System - Progress

## Current Status

项目已完成 Step 6.4：实现每日复盘发送预览。

当前目标：

- 保持当前基础视觉系统、基础页面、导航、Supabase client 工具层、Drizzle schema、迁移流程、认证入口、安全跳转、写入保护 helper、每日工作台结构、今日任务创建、任务状态更新、习惯创建、习惯打卡、今日日程记录、随手记录、今日概览程序统计、成长记录统一时间线、成长记录基础筛选、记录详情查看、洞察报告页面壳、任务完成率图表、习惯打卡图表、记录数量趋势、情绪基础统计、AI 配置检查、AI Provider Adapter 基础能力、每日复盘上下文生成能力和每日复盘发送预览能力稳定。
- 准备进入 Step 6.5：实现手动生成每日复盘。
- 后续逐步接入 Row Level Security、更多基础图表和 AI 复盘能力。

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

### Step 2.2：接入 Supabase 数据库

已完成内容：

- 安装 `@supabase/supabase-js` 和 `@supabase/ssr`。
- 新增 `.env.example`，列出 Supabase、数据库和后续 AI 所需环境变量字段。
- 更新 `.gitignore`，继续忽略真实 `.env*`，但允许保留 `.env.example` 模板。
- 新增 `src/lib/supabase/config.ts`，统一读取 Supabase public 配置并提供配置状态检查。
- 新增 `src/lib/supabase/client.ts`，作为浏览器端 Supabase client 创建入口。
- 新增 `src/lib/supabase/server.ts`，作为服务端 Supabase client 创建入口，并接入 Next.js cookies。
- 更新设置页 `src/app/settings/page.tsx`，展示 Supabase URL、public key、service role key 和 database URL 是否已配置，但不展示任何真实密钥或连接字符串。
- 当前兼容 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 和旧命名 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 检查通过：前端页面只显示配置是否存在，不输出真实密钥值。
- 本地开发服务曾启动在 `http://localhost:3001/settings`，3000 端口当时已被占用。

尚未完成或暂缓：

- Step 2.3 已补充真实 `.env.local` 配置、Drizzle schema、迁移流程和真实业务表。
- 尚未配置 `SUPABASE_SERVICE_ROLE_KEY`，当前阶段暂不需要。

### Step 2.3：建立数据库迁移流程

已完成内容：

- 配置真实 Supabase public client 环境变量和 `DATABASE_URL` 到 `.env.local`。
- 确认 `.env.local` 被 `.gitignore` 忽略，不会进入 Git。
- 安装 `drizzle-orm`、`postgres`、`drizzle-kit` 和 `dotenv`。
- 新增 `drizzle.config.ts`，统一读取 `.env.local` 中的 `DATABASE_URL`。
- 新增 `src/db/schema.ts`，建立第一批 8 张基础表的 Drizzle schema。
- 新增 `src/db/index.ts`，作为后续服务端数据库查询入口。
- 在 `package.json` 中新增 `db:generate`、`db:migrate` 和 `db:studio` 脚本。
- 生成本地迁移文件 `drizzle/0000_true_silver_sable.sql`。
- 已执行真实 Supabase 数据库迁移。

本次创建的基础表：

- `tasks`
- `habits`
- `habit_checkins`
- `schedule_items`
- `life_events`
- `ideas`
- `insight_reports`
- `personal_manuals`

验证记录：

- `npm run db:generate` 通过，确认 8 张表且无新 schema 变更。
- `npm run db:migrate` 通过，真实 Supabase 数据库迁移成功。
- 只读查询确认 8 张业务表都已存在。
- 只读查询确认 Drizzle 迁移记录表 `drizzle.__drizzle_migrations` 已存在。
- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 检查通过：迁移 SQL、源码和文档不包含真实 Supabase URL、publishable key、数据库密码或 service role key。

尚未完成或暂缓：

- 未配置 `SUPABASE_SERVICE_ROLE_KEY`。
- Step 2.4A 已接入 Supabase Auth 登录/注册入口和会话读取基线。
- 未配置 Row Level Security。
- 未实现真实业务数据读写。

### Step 2.4A：认证入口和未登录写入拦截基线

已完成内容：

- 新增 `src/app/login/page.tsx`，提供邮箱登录和注册页面。
- 新增 `src/app/auth/actions.ts`，提供登录、注册和退出的 Server Actions。
- 新增 `src/app/auth/confirm/route.ts`，处理 Supabase 邮箱确认回调。
- 新增 `src/lib/auth/session.ts`，封装当前登录用户读取逻辑。
- 更新 `src/components/app-shell.tsx`，在侧边栏显示账号状态；未登录显示登录/注册链接，已登录显示邮箱和退出按钮。
- 更新 `src/app/daily/page.tsx`，未登录用户仍可浏览每日工作台，但写入入口统一跳转登录提示。
- 更新 `src/app/settings/page.tsx`，显示真实账号登录状态。
- 更新 `src/app/globals.css`，补充登录表单、消息提示和禁用按钮样式。

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本地开发服务启动在 `http://localhost:3001`。
- `/login`、`/daily` 和 `/settings` 本地响应 `200`。
- 源码检查通过：未发现真实 Supabase URL、publishable key 或数据库密码。

尚未完成或暂缓：

- 未实现真实任务、习惯、日程、事件或灵感写入。
- 未配置 Row Level Security。
- 未验证 Supabase Auth 邮件确认完整链路；需要在 Supabase Dashboard 中确认 Redirect URL 允许 `http://localhost:3001/auth/confirm`。
- 未配置 `SUPABASE_SERVICE_ROLE_KEY`，当前阶段仍不需要。

### Step 2.4B：认证安全跳转和登录后写入保护基础

已完成内容：

- 新增 `src/lib/auth/paths.ts`，统一处理登录页 `next` 参数和登录 URL 生成。
- 收紧 `next` 参数校验，拒绝外部 URL、双斜杠路径、反斜杠路径和控制字符，避免开放跳转风险。
- 在 `src/lib/auth/session.ts` 中新增 `requireCurrentUser()`，为后续写入类 Server Action 提供统一登录保护。
- 更新登录、注册和邮箱确认回调，复用统一的安全跳转逻辑。
- 更新每日工作台和侧边栏登录入口，统一生成未登录写入提示链接。
- 未登录用户仍可浏览页面；后续真实写入 Action 接入时，应先调用 `requireCurrentUser()`，并把写入数据关联到返回的当前用户 ID。

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本地开发服务已存在于 `http://localhost:3001`。
- `/login`、`/daily` 和 `/settings` 本地响应 `200`。
- `/auth/confirm?next=/daily` 在缺少确认 code 时正确跳回登录页，并保留安全的 `/daily` 返回路径。
- `/auth/confirm?next=//evil.example` 被安全降级为 `next=/`。
- Faye 已要求更新文档并提交 Git，视为 Step 2.4B 验收通过。

尚未完成或暂缓：

- 未实现真实任务、习惯、日程、事件或灵感写入。
- 未配置 Row Level Security。
- 未配置 `SUPABASE_SERVICE_ROLE_KEY`，当前阶段仍不需要。

### Step 3.1：实现每日工作台页面结构

已完成内容：

- 重做 `src/app/daily/page.tsx`，从简单占位卡片升级为每日工作台骨架。
- 页面顶部显示北京时间日期、短日期和基础状态。
- 建立今日概览区，包含今日任务、习惯打卡、今日日程和随手记录 4 个统计占位卡。
- 建立每日工作台主分区：今日任务、习惯打卡、今日日程、随手记录。
- 每个主分区包含用途说明、空状态、后续字段标签和写入入口。
- 未登录用户仍可浏览页面；写入入口继续跳转登录提示。
- 已登录用户看到待接入按钮，真实写入保留到后续 Step。
- 更新 `src/app/globals.css`，补充每日概览卡、工作台面板、空状态和标签行的响应式样式。

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `/daily` 本地响应 `200`。
- Faye 已要求更新文档并提交 Git，视为 Step 3.1 验收通过。

尚未完成或暂缓：

- Step 3.2 已实现今日任务创建。
- Step 3.3 已实现任务状态更新。
- Step 3.4 已实现习惯创建。
- 未实现习惯打卡、日程、事件或灵感的真实读写。
- 今日概览中的任务卡已接入真实今日任务完成率，习惯卡已接入真实启用习惯数量，其他统计仍为静态占位。
- 未配置 Row Level Security。

### Step 3.2：实现今日任务创建

已完成内容：

- 新增每日工作台任务创建表单。
- 任务最少包含标题、分类、日期和状态。
- 任务分类固定为学习、工作、生活、健康、关系和其他。
- 任务状态固定为未开始、进行中、已完成和延期。
- 默认日期按北京时间落在今天。
- 默认状态为未开始。
- 新增任务保存 Server Action，写入前必须通过 `requireCurrentUser()` 获取当前登录用户。
- 保存后的任务会关联到当前用户，并写入 `tasks.user_id`。
- 每日工作台会读取当前登录用户今天的任务，并显示在今日任务列表。
- 今日概览中的任务数量会读取真实今日任务数量。
- 空标题提交会显示清晰提示。
- 未登录用户仍保持登录拦截，不允许写入任务。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/lib/tasks/options.ts`
- `src/app/globals.css`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 生产预览服务 `http://localhost:3002/daily` 返回 `200`。
- 未登录状态页面响应正常，并保留登录后新建任务入口。
- Faye 已要求更新文档并提交 Git，视为 Step 3.2 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 当前只接入任务创建，习惯、日程、随手记录和复盘仍未接真实写入。

### Step 3.3：实现任务状态更新

已完成内容：

- 在每日工作台今日任务列表中按状态分组展示任务。
- 支持把任务标记为进行中。
- 支持把任务标记为已完成，并写入完成时间。
- 支持把任务标记为延期。
- 延期任务必须选择新的延期日期。
- 标记延期时会把任务日期同步更新到延期日期，并记录原日期和延期目标日期。
- 延期任务再次出现在对应日期列表时，会显示延期来源和目标日期。
- 今日概览任务卡从任务数量升级为今日任务完成率。
- 状态更新 Server Action 写入前必须通过 `requireCurrentUser()` 获取当前登录用户。
- 状态更新查询和写入都按当前用户 ID 限定，避免修改其他用户任务。
- 补充任务状态操作按钮、延期日期输入和移动端换行样式。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/lib/tasks/options.ts`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本 Step 不修改数据库 schema，不执行迁移。
- Faye 已明确允许继续执行文档更新和提交 Git，视为 Step 3.3 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 当前只接入任务创建和状态更新，习惯、日程、随手记录和复盘仍未接真实写入。

### Step 3.4：实现习惯创建

已完成内容：

- 在每日工作台习惯打卡分区新增习惯创建表单。
- 习惯最少包含名称、分类和开始日期。
- 习惯分类复用任务分类：学习、工作、生活、健康、关系和其他。
- 新习惯默认启用，写入 `habits.is_active = true`。
- 默认开始日期按北京时间落在今天。
- 新增习惯保存 Server Action，写入前必须通过 `requireCurrentUser()` 获取当前登录用户。
- 保存后的习惯会关联到当前用户，并写入 `habits.user_id`。
- 每日工作台会读取当前登录用户的启用习惯，并显示在今日习惯列表。
- 今日概览中的习惯卡会读取真实启用习惯数量，当前显示为 `0/启用习惯数`，真实打卡数留到 Step 3.5。
- 空名称提交会显示清晰提示。
- 未登录用户仍保持登录拦截，不允许写入习惯。
- 本 Step 复用已有 `habits` 表字段，没有修改数据库 schema，也没有执行迁移。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- Faye 已要求更新文档并提交 Git，视为 Step 3.4 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 当前只接入任务创建、任务状态更新、习惯创建、习惯打卡、今日日程记录和随手记录，复盘仍未接真实写入。

### Step 3.7：实现随手记录

已完成内容：

- 在每日工作台随手记录分区新增记录创建表单。
- 支持选择记录类型：事件或灵感。
- 事件写入 `life_events` 表。
- 灵感写入 `ideas` 表。
- 事件最少包含内容、日期和 AI 分析权限。
- 灵感最少包含内容和日期。
- 事件支持手动选择情绪标签，第一版预设情绪包括平静、开心、满足、期待、兴奋、焦虑、疲惫、低落、委屈、生气、压力、混乱、孤独、感激。
- 事件支持手动输入普通标签，逗号分隔，最多保存 8 个。
- 新事件默认 `ai_analysis_permission = summary_only`。
- 新灵感默认 `status = to_review`。
- 新增随手记录保存 Server Action，写入前必须通过 `requireCurrentUser()` 获取当前登录用户。
- 保存后的事件和灵感会关联到当前用户，并分别写入 `life_events.user_id` 或 `ideas.user_id`。
- 每日工作台会读取当前登录用户今天的事件和灵感，并显示在今日随手记录列表。
- 今日概览中的随手记录卡会读取真实今日事件和灵感数量。
- 空内容提交会显示清晰提示。
- 非今日日期的事件和灵感不会出现在今日列表。
- 保存事件或灵感不会触发 AI 调用。
- 未登录用户仍保持登录拦截，不允许写入随手记录。
- 本 Step 复用已有 `life_events` 和 `ideas` 表字段，没有修改数据库 schema，也没有执行迁移。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/daily` 返回 `200`。
- 本地开发服务已启动在 `http://localhost:3001/daily`。
- Faye 已要求更新文档并提交 Git，视为 Step 3.7 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 当前只接入任务创建、任务状态更新、习惯创建、习惯打卡、今日日程记录和随手记录，复盘仍未接真实写入。

### Step 3.6：实现今日日程记录

已完成内容：

- 在每日工作台今日日程分区新增日程创建表单。
- 日程最少包含标题、分类、日期和开始时间。
- 支持可选结束时间。
- 日程分类复用任务分类：学习、工作、生活、健康、关系和其他。
- 默认日期按北京时间落在今天。
- 新增日程保存 Server Action，写入前必须通过 `requireCurrentUser()` 获取当前登录用户。
- 保存后的日程会关联到当前用户，并写入 `schedule_items.user_id`。
- 每日工作台会读取当前登录用户今天的日程，并显示在今日日程列表。
- 今日日程列表按开始时间和创建时间排序。
- 今日概览中的日程卡会读取真实今日日程数量。
- 空标题或缺少开始时间提交会显示清晰提示。
- 非今日日期的日程不会出现在今日列表。
- 未登录用户仍保持登录拦截，不允许写入日程。
- 本 Step 复用已有 `schedule_items` 表字段，没有修改数据库 schema，也没有执行迁移。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/daily` 返回 `200`。
- 本地开发服务已启动在 `http://localhost:3001/daily`。
- Faye 已要求更新文档并提交 Git，视为 Step 3.6 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 当前只接入任务创建、任务状态更新、习惯创建、习惯打卡和今日日程记录，随手记录和复盘仍未接真实写入。

### Step 3.5：实现习惯打卡

已完成内容：

- 在每日工作台启用习惯列表中新增今日打卡按钮。
- 支持取消今日打卡。
- 同一习惯同一天通过 `habit_checkins_habit_date_unique` 唯一约束做 upsert，不生成重复有效打卡记录。
- 今日打卡写入或更新为 `habit_checkins.status = checked`。
- 取消今日打卡写入或更新为 `habit_checkins.status = skipped`。
- 习惯打卡 Server Action 写入前必须通过 `requireCurrentUser()` 获取当前登录用户。
- 习惯打卡写入前会校验习惯属于当前用户、处于启用状态且未软删除，避免操作其他用户或停用习惯。
- 每日工作台会读取当前登录用户启用习惯的打卡记录，并显示今日是否完成、累计打卡次数和连续打卡天数。
- 今日概览中的习惯卡从 `0/启用习惯数` 升级为真实 `今日已完成/启用习惯数`。
- 连续天数从北京时间今日向前逐日计算；今日未打卡时连续天数为 0，漏打一天后连续天数断掉。
- 本 Step 复用已有 `habit_checkins` 表字段和唯一索引，没有修改数据库 schema，也没有执行迁移。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/daily` 返回 `200`。
- 本地开发服务已启动在 `http://localhost:3001/daily`。
- Faye 已要求更新文档并提交 Git，视为 Step 3.5 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 当前只接入任务创建、任务状态更新、习惯创建和习惯打卡，日程、随手记录和复盘仍未接真实写入。

### Step 3.8：实现今日概览统计

已完成内容：

- 每日工作台顶部今日概览改为完整真实程序统计。
- 今日任务卡显示任务完成率，并补充任务总数、进行中数量和延期数量。
- 任务完成率由当前登录用户北京时间今日任务总数和已完成任务数计算。
- 习惯打卡卡显示今日已打卡数和启用习惯数，并用进度条表达完成比例。
- 今日日程卡显示当前登录用户北京时间今日真实日程数量。
- 随手记录卡显示当前登录用户北京时间今日事件和灵感总数，并补充事件数和灵感数。
- 今日概览明确标注“程序统计，不调用 AI”。
- 新增今日概览进度条和细分标签样式，保持桌面和手机宽度下可读。
- 本 Step 不修改数据库 schema，不执行迁移，不接入 AI。

本次新增或更新的文件：

- `src/app/daily/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/daily` 返回 `200`。
- 本地开发服务已启动在 `http://localhost:3001/daily`。
- Faye 已要求更新文档并提交 Git，视为 Step 3.8 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 复盘仍未接真实写入。
- AI provider adapter 尚未接入。

### Step 4.1：实现成长记录列表页

已完成内容：

- 将成长记录页 `/records` 从静态占位改为真实近期记录时间线。
- 成长记录页读取当前登录用户的近期任务、习惯打卡、日程、事件和灵感。
- 近期记录按创建时间倒序合并为统一时间线。
- 不同记录类型通过图标、记录标签、状态标签和配色区分。
- 任务记录显示任务日期、分类、状态和延期标记。
- 习惯打卡记录显示习惯名称、打卡日期和打卡状态。
- 日程记录显示日程日期、开始/结束时间和分类。
- 事件记录显示事件日期、内容预览、情绪标签和普通标签。
- 灵感记录显示记录日期、内容预览和当前处理状态。
- 页面顶部显示近期概览，按任务、习惯、日程、事件和灵感统计当前载入数量。
- 未登录用户仍可打开成长记录页，并看到登录提示和空状态。
- 本 Step 不做复杂筛选，筛选留到 Step 4.2。
- 本 Step 不修改数据库 schema，不执行迁移，不接入 AI。

本次新增或更新的文件：

- `src/app/records/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/records` 返回 `200`。
- 本地开发服务已启动在 `http://localhost:3001/records`。
- Faye 已要求更新文档并提交 Git，视为 Step 4.1 验收通过。

尚未完成或暂缓：

- Step 4.2 基础筛选和 Step 4.3 记录详情查看已在后续步骤完成。
- Row Level Security 尚未配置。
- 复盘仍未接真实写入。
- AI provider adapter 尚未接入。

### Step 4.2：实现基础筛选

已完成内容：

- 成长记录页支持按记录类型筛选。
- 记录类型筛选项包括全部、任务、习惯、日程、事件和灵感。
- 成长记录页支持按日期范围筛选。
- 日期范围筛选项包括全部近期、今天和最近 7 天。
- 筛选状态写入 URL query 参数，例如 `/records?type=task`、`/records?range=today` 和 `/records?type=habit&range=7d`。
- 刷新页面后筛选状态会保留。
- 登录提示中的返回路径会保留当前筛选 URL。
- 当前筛选结果的统计卡会随筛选结果更新。
- 当前 Step 不做全文搜索。
- 本 Step 不修改数据库 schema，不执行迁移，不接入 AI。

本次新增或更新的文件：

- `src/app/records/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/records` 返回 `200`。
- `curl -I "http://localhost:3001/records?type=task"` 返回 `200`。
- `curl -I "http://localhost:3001/records?range=today"` 返回 `200`。
- `curl -I "http://localhost:3001/records?type=habit&range=7d"` 返回 `200`。
- 本地开发服务已启动在 `http://localhost:3001/records`。
- Faye 已要求更新文档并提交 Git，视为 Step 4.2 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 复盘仍未接真实写入。
- AI provider adapter 尚未接入。

### Step 4.3：实现记录详情查看

已完成内容：

- 成长记录时间线条目支持点击进入详情页。
- 新增动态详情路由 `/records/[kind]/[id]`。
- 支持查看任务详情、习惯打卡详情、日程详情、事件详情和灵感详情。
- 任务详情显示标题、分类、状态、任务日期、完成时间、延期信息、任务说明和复盘/备注。
- 习惯打卡详情显示习惯名称、习惯分类、打卡日期、打卡状态和备注。
- 日程详情显示标题、分类、日程日期、开始/结束时间和说明。
- 事件详情显示内容、事件日期、情绪标签、普通标签、AI 分析权限、具体事件、下次行动和摘要。
- 灵感详情显示内容、记录日期、状态、处理说明和转化任务 ID。
- 详情页只读，不提供编辑入口。
- 未登录用户访问详情页会看到登录提示，登录后返回当前详情页。
- 登录用户只能查询当前用户 ID 下的记录。
- 不存在、已删除或不属于当前账号的记录会显示未找到/无权限状态。
- 本 Step 不修改数据库 schema，不执行迁移，不接入 AI。

本次新增或更新的文件：

- `src/app/records/page.tsx`
- `src/app/records/[kind]/[id]/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/records` 返回 `200`。
- `curl -I http://localhost:3001/records/task/00000000-0000-0000-0000-000000000000` 返回 `200`。
- `curl -I http://localhost:3001/records/event/00000000-0000-0000-0000-000000000000` 返回 `200`。
- 本地开发服务已启动在 `http://localhost:3001/records`。
- Faye 已要求更新文档并提交 Git，视为 Step 4.3 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 复盘仍未接真实写入。
- AI provider adapter 尚未接入。

### Step 5.1：实现洞察报告页面壳

已完成内容：

- 将洞察报告页 `/insights` 从静态占位升级为可读取真实业务数据的页面壳。
- 页面分区包括今日概览、本周趋势、习惯状态、情绪记录和后续复盘提示。
- 今日概览读取当前登录用户今天的任务完成率、习惯打卡完成数、日程数量、事件数量和灵感数量。
- 本周趋势读取最近 7 天任务、习惯打卡和记录数量，并以轻量进度条和统计标签展示。
- 习惯状态读取当前登录用户的启用习惯，展示今日是否打卡和最近 7 天打卡次数。
- 情绪记录统计最近 7 天事件记录中的手动情绪标签出现次数。
- 未登录用户仍可浏览洞察报告页结构，并看到登录提示。
- 洞察报告页明确标注当前只做程序统计，不调用 AI。
- 当前 Step 不修改数据库 schema，不执行迁移，不安装新依赖，不接入 AI。

本次新增或更新的文件：

- `src/app/insights/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/insights` 返回 `200`。
- 本地开发服务已启动在 `http://localhost:3001/insights`。
- Faye 已要求更新文档并提交 Git，视为 Step 5.1 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 复盘仍未接真实写入。
- AI provider adapter 尚未接入。

### Step 5.2：实现任务完成率图表

已完成内容：

- 安装并接入 `recharts`。
- 新增任务完成率图表客户端组件，专门负责 Recharts 渲染。
- 洞察报告页继续由服务端读取当前登录用户最近 7 天任务数据，不把数据库查询逻辑放到前端。
- 在 `/insights` 本周趋势区新增最近 7 天任务完成率柱状图。
- 图表按北京时间展示最近 7 天每日完成率。
- 图表 tooltip 展示当天完成率和已完成/总任务数。
- 没有最近 7 天任务数据时显示空状态。
- 保留原有每日趋势卡，继续展示任务、习惯和记录数量概览。
- 本 Step 不修改数据库 schema，不执行迁移，不接入 AI。

本次新增或更新的文件：

- `package.json`
- `package-lock.json`
- `src/components/insights/task-completion-chart.tsx`
- `src/app/insights/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/insights` 返回 `200`。
- 本地开发服务已启动在 `http://localhost:3001/insights`。
- Faye 已要求更新文档并提交 Git，视为 Step 5.2 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 复盘仍未接真实写入。
- AI provider adapter 尚未接入。

### Step 5.3：实现习惯打卡图表

已完成内容：

- 新增习惯打卡图表客户端组件，专门负责 Recharts 和 7 天打卡点阵渲染。
- 洞察报告页继续由服务端读取当前登录用户的启用习惯和习惯打卡数据，不把数据库查询逻辑放到前端。
- 在 `/insights` 习惯状态区新增最近 7 天习惯打卡图表。
- 图表展示每个启用习惯最近 7 天完成数。
- 打卡点阵展示每个启用习惯最近 7 天每日是否完成。
- 习惯列表补充连续天数显示。
- 连续天数使用该习惯所有历史 `checked` 打卡日期从北京时间今天向前计算，不被最近 7 天窗口截断。
- 没有启用习惯时显示空状态。
- 本 Step 不修改数据库 schema，不执行迁移，不接入 AI。

本次新增或更新的文件：

- `src/components/insights/habit-checkin-chart.tsx`
- `src/app/insights/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/insights` 返回 `200`。
- 本地开发服务已启动并在检查后停止。
- Faye 已要求更新文档并提交 Git，视为 Step 5.3 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 复盘仍未接真实写入。
- AI provider adapter 尚未接入。

### Step 5.4：实现记录数量趋势

已完成内容：

- 新增记录数量趋势图表客户端组件，专门负责 Recharts 渲染。
- 洞察报告页继续由服务端读取当前登录用户最近 7 天事件和灵感数据，不把数据库查询逻辑放到前端。
- 在 `/insights` 新增记录数量趋势区块。
- 最近 7 天按天统计事件数量、灵感数量和随手记录总数。
- 图表使用堆叠柱状图区分事件和灵感。
- 区块顶部展示最近 7 天记录总数、事件总数和灵感总数。
- 没有最近 7 天事件或灵感记录时显示空状态。
- 本 Step 不使用 AI 归纳记录内容。
- 本 Step 不修改数据库 schema，不执行迁移，不接入 AI。

本次新增或更新的文件：

- `src/components/insights/record-trend-chart.tsx`
- `src/app/insights/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/insights` 返回 `200`。
- 本地开发服务已启动并在检查后停止。
- Faye 已要求更新文档并提交 Git，视为 Step 5.4 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 复盘仍未接真实写入。
- AI provider adapter 尚未接入。

### Step 5.5：实现情绪基础统计

已完成内容：

- 新增情绪基础统计图表客户端组件，专门负责 Recharts 渲染。
- 洞察报告页继续由服务端读取当前登录用户最近 7 天事件记录数据，不把数据库查询逻辑放到前端。
- 情绪统计只来自 `life_events.emotion_tags`，不统计灵感。
- 只统计用户手动选择的情绪标签，不做 AI 情绪判断。
- 在 `/insights` 情绪记录区新增最近 7 天手动情绪标签统计图表。
- 图表展示最近 7 天出现次数最多的手动情绪标签。
- 保留原有情绪标签计数卡片。
- 没有最近 7 天情绪标签时显示空状态。
- 本 Step 不修改数据库 schema，不执行迁移，不接入 AI。

本次新增或更新的文件：

- `src/components/insights/emotion-stats-chart.tsx`
- `src/app/insights/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/insights` 返回 `200`。
- 本地开发服务已启动并在检查后停止。
- Faye 已要求更新文档并提交 Git，视为 Step 5.5 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。
- 复盘仍未接真实写入。
- AI provider adapter 尚未接入。

### Step 6.1：建立 AI 配置检查

已完成内容：

- 新增 AI 配置状态 helper，统一读取 AI 环境变量是否存在。
- 设置页新增 AI 配置状态区。
- 设置页显示 `AI_PROVIDER`、`AI_BASE_URL`、`AI_API_KEY`、`AI_MODEL_DAILY`、`AI_MODEL_WEEKLY` 和 `AI_MODEL_MONTHLY` 的配置状态。
- `AI_API_KEY` 只显示“已配置/未配置”，不展示明文。
- 设置页显示每日复盘是否已满足基本 AI 配置条件。
- 未配置 AI 时，普通记录、程序统计和图表仍可正常使用。
- 本 Step 未修改 `.env.local`。
- 本 Step 未填入任何 AI key。
- 本 Step 不调用 AI，不接入 AI Provider Adapter。

本次新增或更新的文件：

- `src/lib/ai/config.ts`
- `src/app/settings/page.tsx`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `curl -I http://localhost:3001/settings` 返回 `200`。
- 本地开发服务已启动并在检查后停止。
- Faye 已要求更新文档并提交 Git，视为 Step 6.1 验收通过。

尚未完成或暂缓：

- AI Provider Adapter 尚未接入。
- 复盘的上下文生成、发送预览和真实生成尚未实现。
- Row Level Security 尚未配置。

### Step 6.2：建立 AI Provider Adapter 基础能力

已完成内容：

- 新增统一 AI Provider Adapter 类型定义。
- 新增按复盘类型选择模型的运行时配置读取能力。
- 新增 OpenAI-compatible `chat/completions` 调用实现。
- 新增统一 `generateReview()` 服务端入口。
- 新增缺失 AI 配置时的 `AiConfigurationError`。
- 保留后续按 `daily`、`weekly`、`monthly` 切换模型的能力。
- 所有运行时 AI 配置和 API key 读取都限制在服务端 AI 工具层。
- 本 Step 未修改 `.env.local`。
- 本 Step 未填入任何 AI key。
- 本 Step 未接入每日工作台或洞察报告页面，不会因打开页面触发 AI 请求。
- 本 Step 不修改数据库 schema，也不执行迁移。

本次新增或更新的文件：

- `src/lib/ai/config.ts`
- `src/lib/ai/types.ts`
- `src/lib/ai/openai-compatible.ts`
- `src/lib/ai/provider.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 源码检查通过：`src/app` 和 `src/components` 中未发现 `AI_API_KEY`、`process.env.AI` 或 `Authorization`。
- Faye 已要求更新文档并提交 Git，视为 Step 6.2 验收通过。

尚未完成或暂缓：

- 复盘的上下文生成、发送预览和真实生成尚未实现。
- 复盘报告缓存读写尚未接入页面。
- Row Level Security 尚未配置。

### Step 6.3：生成每日复盘上下文

已完成内容：

- 新增每日复盘上下文生成服务。
- 从当前用户指定日期的任务、启用习惯、习惯打卡、日程、事件和灵感生成结构化摘要。
- 摘要包含任务完成率、任务状态分布、任务分类分布、习惯今日完成数、习惯连续天数、日程分类、事件数量、灵感数量、情绪标签统计和普通标签统计。
- 生成关键记录摘要 `highlights`，用于后续发送预览和 AI 复盘输入。
- 灵感只进入摘要，不进入事件原文候选。
- `ai_analysis_permission = none` 的事件不进入 AI 内容。
- `ai_analysis_permission = summary_only` 的事件只进入摘要。
- 只有 `ai_analysis_permission = allow_original` 且未命中敏感规则的事件进入原文候选。
- 新增事件原文敏感内容基础规则，当前覆盖手机号、身份证、银行卡、详细地址、密钥/token、医疗隐私和高度私密关系内容。
- 命中敏感规则的事件会降级为摘要参与，不发送原文。
- 原文候选最多 5 条，单条原文截断到 600 字。
- 生成后续 AI adapter 可用的 `aiInput`，但本 Step 不调用 AI。
- 本 Step 未修改 `.env.local`。
- 本 Step 未读取 AI key。
- 本 Step 不修改数据库 schema，也不执行迁移。

本次新增或更新的文件：

- `src/lib/ai/daily-review-context.ts`
- `src/lib/ai/sensitive-rules.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 源码检查通过：新增 Step 6.3 文件中未发现 `generateReview()`、`AI_API_KEY` 或 `Authorization`。
- Faye 已要求更新文档并提交 Git，视为 Step 6.3 验收通过。

尚未完成或暂缓：

- 每日复盘发送预览尚未接入页面。
- 用户移除某条事件原文的交互尚未实现。
- 真实 AI 生成和复盘报告缓存读写尚未接入页面。
- Row Level Security 尚未配置。

### Step 6.4：实现每日复盘发送预览

已完成内容：

- 在每日工作台新增每日复盘入口。
- 未登录用户点击生成复盘入口时继续跳转登录提示。
- 登录用户点击“预览今日复盘”后，通过 URL query 参数打开今日复盘发送预览。
- 发送预览展示程序统计摘要，包括任务完成率、习惯打卡、今日日程和随手记录数量。
- 发送预览展示关键记录摘要 `highlights`。
- 发送预览展示允许发送的事件原文候选。
- 用户可以取消勾选某条事件原文，并通过“更新预览”移除该原文。
- 被移除的事件原文不会进入后续 `aiInput.selectedOriginals`。
- 取消预览会回到普通每日工作台。
- “确认生成”按钮保持禁用，真实生成留到 Step 6.5。
- 本 Step 不调用 AI。
- 本 Step 未修改 `.env.local`。
- 本 Step 未读取 AI key。
- 本 Step 不修改数据库 schema，也不执行迁移。

本次新增或更新的文件：

- `src/app/daily/page.tsx`
- `src/app/globals.css`
- `src/lib/ai/daily-review-context.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- `/daily` 返回 `200`。
- `/daily?reviewPreview=1` 返回 `200`。
- 源码检查通过：`src/app/daily` 和 `src/lib/ai/daily-review-context.ts` 中未发现 `generateReview()`、`AI_API_KEY` 或 `Authorization`。
- Faye 已要求更新文档并提交 Git，视为 Step 6.4 验收通过。

尚未完成或暂缓：

- 确认发送预览后调用 AI 尚未接入。
- AI 输出保存为今日复盘报告尚未实现。
- 同一天已有报告时展示缓存报告尚未实现。
- Row Level Security 尚未配置。

## Not Started

- Row Level Security
- 复盘的真实业务数据读写
- 手动生成每日复盘

## Next Step Candidate

Step 6.5：实现手动生成每日复盘。

进入下一步前，需要按项目 Step Workflow 单独确认目标、影响文件和验证方式。
