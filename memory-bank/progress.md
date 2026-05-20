# Growth Insight System - Progress

## Current Status

项目已完成 Row Level Security 前置规划、Supabase SSR client 用户态读写迁移、本地 RLS 策略迁移文件生成、真实数据库 RLS 启用、AI 可选部署前置调整、Render 正式部署基础验收、部署前最终测试、Step 10.1 任务编辑与软删除、Step 10.2 日程编辑与软删除、Step 10.3 事件编辑与软删除、Step 10.4 灵感编辑与软删除、Step 10.5 习惯维护、Step 11.1 写入区默认收起、Step 11.2 今日概览卡快捷入口、Step 11.3 移动端工作台优化、Step 12.1 个人说明书读取与保存、Step 12.2 个人说明书手动编辑、Step 12.3 个人说明书与复盘预留关联、Step 13.1 周复盘程序统计、Step 13.2 周复盘发送预览、Step 13.3 周复盘生成与缓存、Step 14.1 月复盘程序统计、Step 14.2 月复盘发送预览、Step 14.3 月复盘生成与缓存、Step 15.1 纪念日记录、Step 15.2 礼物记录、Step 15.3 场景工具箱基础版、Step 15.4 Markdown 导出、Step 16.1 工作台简洁化与移动端导航优化、Step 16.2 日程循环规则、Modification Step 17.1 导航收敛与导出入口回收、Modification Step 17.2 每日工作台去掉重复概览、Modification Step 17.3 成长主页能力并入洞察报告、Modification Step 17.4 个人说明书并入 AI 复盘、Modification Step 18.1 移动端导航修复与每日工作台概览改造、Modification Step 18.2 列表置顶、习惯删除与排序规则、Modification Step 18.3 洞察报告入口分流与问题拆解排版优化、Modification Step 18.4 PC 账号入口右上角与公开版设置页改造、Step 19.1 灵感表增加转化字段、Step 19.2 底部导航重构、Step 19.3 清单页重构、Step 19.4 人生页重构、Step 19.5 AI 聊天界面、Step 19.6 复盘页移动端优化、Step 19.7 独立 API 层、Modification Step 20.1 Excel 历史数据迁移 dry-run、Modification Step 20.2 Excel 真实导入准备、Modification Step 20.3 Excel 历史数据真实导入、Modification Step 21.0 人生页面修复（清理重复代码）、Modification Step 21.1 设置页登录入口与昵称编辑 + 账号注销、Modification Step 21.2 清单列表与统计体验修正、Modification Step 21.3 清单页各模块新增按钮、Modification Step 21.4 复盘页成长概览置顶、Modification Step 21.5 AI 快捷键顺序调整 + 礼物记录、Modification Step 21.6 AI 界面对话框样式改造、Modification Step 21.7 人生页加载兜底与设置页昵称入口修复、Modification Step 22.1 人生页列表分组、快捷新增与详情入口、Modification Step 22.2 成长记录页移动端概览压缩与按天分组、Modification Step 22.3 设置页账号信息精简与每日工作台入口收敛和 Modification Step 22.4 账号数据清除与真实注销修正。Modification Step 23 计划已写入：包含 7 项真实使用反馈改进（清单/人生页内就地新建、AI 界面微信式改造、习惯详情页、日程表单简化、纪念日增强、成长记录全部历史数据、顶部纪念日提醒横幅）。Modification Step 23.1-23.7 已全部完成。Modification Step 24.1-24.3 已全部完成。

当前目标：

- Modification Step 24 待执行：日程复选框、习惯打卡不跳转、人生页加载修复。

- 保持当前基础视觉系统、基础页面、导航、Supabase client 工具层、Drizzle schema、迁移流程、认证入口、安全跳转、写入保护 helper、Supabase SSR client 用户态读写、真实数据库 RLS、每日工作台默认入口、每日工作台入口页、今日任务创建、任务状态更新、任务编辑与软删除、任务置顶、习惯创建、习惯打卡、习惯编辑与停用、习惯置顶与软删除、今日日程记录、日程编辑与软删除、日程开始/结束日期和循环周期、日程置顶、随手记录、事件编辑与软删除、事件置顶、灵感编辑与软删除、灵感置顶、写入区默认收起、每日工作台今日概览卡片跳转清单/人生列表、每日工作台晚间总结跳转复盘、移动端底部 5 Tab 导航、每日程序复盘摘要、成长记录统一时间线、成长记录基础筛选、成长记录按日期分组列表、成长记录移动端三列概览、成长记录事件两行预览、记录详情查看、事件详情情绪标签兜底显示、人生页事件标签运行时兜底、人生页分组数据加载兜底、人生页按日期分组列表、人生页新增快捷入口、纪念日和礼物详情页、纪念日关联历史礼物展示、洞察报告今日优先展示、洞察报告成长概览、洞察报告 AI 复盘与问题拆解/个人说明书快捷入口、任务完成率图表、习惯打卡图表、记录数量趋势、情绪基础统计、周复盘程序统计、周复盘发送预览、周复盘生成与缓存、周复盘 Markdown 导出、月复盘程序统计、月复盘发送预览、月复盘生成与缓存、月复盘 Markdown 导出、纪念日页面、纪念日创建/编辑/软删除、礼物记录创建/编辑/软删除和筛选、问题拆解页面、情绪复盘/压力整理/明日计划程序化输出和工具记录保存、Markdown 下载路由、复盘报告导出和近期成长记录导出、AI 配置检查、AI Provider Adapter 基础能力、每日复盘上下文生成能力、每日复盘发送预览能力、手动生成每日 AI 复盘能力、AI 成本控制边界、个人说明书读取与完整字段手动编辑、个人说明书复盘上下文预留读取接口、设置页账号摘要展示、设置页昵称图标编辑、账号数据物理清除、账号注销、右上角昵称入口跳转设置页、统一错误提示规范、基础闭环手工验收结果、Step 8.1 架构文档完成态、Step 8.2 进度文档完成态、Row Level Security 前置规划和本地 RLS 迁移文件稳定。
- 首版部署按无 AI 优先准备：Render 已配置 Supabase public 配置和 `DATABASE_URL`，AI 环境变量后续按需接入。
- `Faye的成长计划.xlsx` 中从 Coze + 飞书多维表格沉淀的历史数据已导入 `2215128728@qq.com` 账号下，迁移过程未修改数据库 schema，未写入飞书外部 ID。

## Confirmed Decisions

- 项目名称：`growth-insight-system`
- 产品方向：基于真实生活数据的个人成长洞察系统
- 第一版用户：Faye 自用
- 第一版核心：每日工作台
- 基础功能第一轮：先做每日工作台、基础记录、基础图表和每日 AI 复盘
- 后续阶段：Obsidian 双向同步暂缓；周复盘、月度复盘、纪念日记录、礼物记录、问题拆解基础版和 Markdown 导出已进入基础闭环
- 数据方向：Supabase Postgres 作为主数据库
- 认证方向：支持注册登录；未登录用户可浏览界面，写入时提示注册/登录
- 访问方向：未登录用户可浏览基础界面和展示数据
- 注册方向：第一版开放注册登录
- AI 策略：低成本优先，普通统计不用 AI，复盘分析才调用 AI
- 部署策略：首版部署不强制配置 AI；程序统计、基础图表和程序复盘摘要应在无 AI 环境变量时正常可用
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
- `memory-bank/modification-plan.md`
- `memory-bank/progress.md`
- `memory-bank/tech-stack.md`

## Completed

### ✅ Step 1.1：创建 Next.js 应用骨架

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

### ✅ Step 1.2：整理项目初始目录

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

### ✅ Step 1.3：建立基础页面壳

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

### ✅ Step 1.4：建立基础视觉规范

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

### ✅ Step 2.1：确定基础数据模型

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

### ✅ Step 2.2：接入 Supabase 数据库

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

### ✅ Step 2.3：建立数据库迁移流程

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

### ✅ Step 2.4A：认证入口和未登录写入拦截基线

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

### ✅ Step 2.4B：认证安全跳转和登录后写入保护基础

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

### ✅ Step 3.1：实现每日工作台页面结构

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

### ✅ Step 3.2：实现今日任务创建

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

### ✅ Step 3.3：实现任务状态更新

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

### ✅ Step 3.4：实现习惯创建

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

### ✅ Step 3.7：实现随手记录

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

### ✅ Step 3.6：实现今日日程记录

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

### ✅ Step 3.5：实现习惯打卡

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

### ✅ Step 3.8：实现今日概览统计

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

### ✅ Step 4.1：实现成长记录列表页

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

### ✅ Step 4.2：实现基础筛选

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

### ✅ Step 4.3：实现记录详情查看

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

### ✅ Step 5.1：实现洞察报告页面壳

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

### ✅ Step 5.2：实现任务完成率图表

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

### ✅ Step 5.3：实现习惯打卡图表

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

### ✅ Step 5.4：实现记录数量趋势

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

### ✅ Step 5.5：实现情绪基础统计

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

### ✅ Step 6.1：建立 AI 配置检查

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

### ✅ Step 6.2：建立 AI Provider Adapter 基础能力

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

### ✅ Step 6.3：生成每日复盘上下文

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

### ✅ Step 6.4：实现每日复盘发送预览

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

### ✅ Step 6.5：实现手动生成每日复盘

已完成内容：

- 每日复盘发送预览中的“确认生成今日复盘”已接入 Server Action。
- 新增 `generateDailyReviewAction()`，生成前必须通过 `requireCurrentUser()` 获取当前登录用户。
- 生成前先查询同一用户、同一日期、`report_type = daily` 的完成报告缓存。
- 同一天已有完成报告时，直接展示缓存结果，不重复调用 AI。
- 无缓存时，按发送预览中保留的事件原文 ID 构造 AI 输入。
- 只有确认生成表单提交时才调用 `generateReview()`。
- AI 输出会写入 `insight_reports`，保存标题、摘要、模式、建议、下一步行动、模型供应商、模型名称、来源统计、关键摘要和选中原文事件 ID。
- 保存使用 `insight_reports_user_period_unique` 唯一约束做 upsert，避免同一用户同一天重复有效报告。
- 每日工作台会读取并展示今日已完成复盘报告。
- 复盘报告展示标题、摘要、观察到的模式、行动建议、下一步行动、模型供应商、模型名称和生成时间。
- 未配置 AI 时，确认生成会回到每日工作台并显示明确提示，不让页面崩溃。
- Provider 调用失败时，确认生成会回到每日工作台并显示可理解错误。
- 页面打开不调用 AI。
- 打开发送预览不调用 AI。
- 本 Step 未修改 `.env.local`。
- 本 Step 未填入任何 AI key。
- 本 Step 不修改数据库 schema，也不执行迁移。

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
- `/daily` 返回 `200`。
- `/daily?reviewPreview=1` 返回 `200`。
- `/daily?reviewError=missing_ai_config` 返回 `200`。
- 源码检查通过：`generateReview()` 只出现在 `generateDailyReviewAction()` 中。
- Faye 已要求更新文档并提交 Git，视为 Step 6.5 验收通过。

尚未完成或暂缓：

- Row Level Security 尚未配置。

### ✅ Step 6.6：验证 AI 成本控制规则

已完成内容：

- 系统检查普通任务、任务状态更新、习惯创建、习惯打卡、日程记录和随手记录的 Server Action 调用链。
- 确认普通写入 Action 只做登录校验、字段校验、数据库写入、页面刷新和跳转，不调用 AI。
- 确认 `generateReview()` 只在 `generateDailyReviewAction()` 中被调用。
- 确认 OpenAI-compatible 请求入口只存在于服务端 AI 适配层 `src/lib/ai/openai-compatible.ts`。
- 确认每日工作台页面打开不调用 AI。
- 确认打开发送预览只生成程序统计、关键摘要和原文候选，不调用 AI。
- 确认已有今日完成复盘报告时，`generateDailyReviewAction()` 会先展示缓存结果，不重复调用 AI。
- 修正每日复盘发送预览文案，使其准确说明“只有点击确认生成时才会调用 AI”。
- 本 Step 未发起真实 AI 请求。
- 本 Step 未修改 `.env.local`。
- 本 Step 未填入任何 AI key。
- 本 Step 不修改数据库 schema，也不执行迁移。

本次新增或更新的文件：

- `src/app/daily/page.tsx`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- 源码检查通过：`generateReview()` 只出现在 `generateDailyReviewAction()` 和服务端 AI provider 封装中。
- 源码检查通过：`fetch()` 和 `Authorization` 只出现在 `src/lib/ai/openai-compatible.ts`。
- 源码检查通过：`AI_API_KEY` 和 `process.env.AI` 只出现在服务端 AI 配置工具层。
- 源码检查通过：任务、习惯、日程和随手记录表单绑定的是普通写入 Action，不是 AI 生成 Action。
- `git diff --check` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。
- Faye 已确认 Step 6.6 通过，并要求更新文档和提交 Git。

尚未完成或暂缓：

- Row Level Security 尚未配置。

### ✅ Step 7.1：实现设置页基础信息

已完成内容：

- 设置页继续展示当前应用运行状态和账号登录状态。
- 设置页继续展示 Supabase public client 配置状态。
- 设置页新增数据库只读健康检查，使用服务端 `DATABASE_URL` 执行 `select 1`。
- 数据库健康检查使用独立短连接和 3 秒连接超时，避免设置页被远端数据库连接长时间拖慢。
- 数据库未配置时显示“未配置”，配置存在但连接失败时显示“连接异常”，不展示底层错误堆栈。
- 数据库连接正常时显示“连接正常”和“数据库只读健康检查已通过”。
- 设置页继续展示 AI provider、AI base URL、AI API key、每日复盘模型、周复盘模型和月度复盘模型配置状态。
- AI API key 只显示“已配置/未配置”，不显示明文。
- 本 Step 未修改 `.env.local`。
- 本 Step 未填入任何 AI key。
- 本 Step 不修改数据库 schema，也不执行迁移。

本次新增或更新的文件：

- `src/app/settings/page.tsx`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `git diff --check` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。
- 本地 `/settings` 返回 `200`。
- 页面正文检查通过：显示“连接正常”“数据库只读健康检查已通过”“每日复盘待配置”和“AI API key 未配置”。
- 源码检查通过：设置页不展示真实数据库连接字符串、AI key 或底层错误信息。
- Faye 已确认 Step 7.1 通过，并要求更新文档和提交 Git。

尚未完成或暂缓：

- Row Level Security 尚未配置。

### ✅ Step 7.2：建立错误提示规范

已完成内容：

- 新增统一错误提示文案层，集中管理登录、每日工作台写入和每日复盘生成相关提示。
- 新增统一 `FeedbackMessage` 组件，提示结构统一为标题和详情。
- 登录页改为使用统一提示组件展示登录失败、注册失败、邮箱确认失败和需要登录等提示。
- 每日工作台改为使用统一提示组件展示任务、习惯、日程、随手记录和每日复盘相关提示。
- 每日工作台写入类 Server Action 增加保存失败兜底，数据库写入失败时返回对应页面区块并展示可理解提示。
- 每日复盘生成流程区分复盘上下文准备失败、AI 配置缺失、AI provider 调用失败和复盘保存失败。
- 新增应用级加载失败页，页面加载异常时显示可理解的重试提示，不展示技术堆栈。
- 错误提示不展示数据库连接字符串、API key、底层错误堆栈或 provider 原始错误。
- 本 Step 不修改 `.env.local`。
- 本 Step 不修改数据库 schema，也不执行迁移。

本次新增或更新的文件：

- `src/lib/feedback.ts`
- `src/components/feedback-message.tsx`
- `src/app/error.tsx`
- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/login/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本地 `/daily?taskError=save_failed` 返回 `200`。
- 本地 `/daily?reviewError=context_failed` 返回 `200`。
- 本地 `/login?error=login_failed&next=/daily` 返回 `200`。
- 本地 `/settings` 返回 `200`。
- 源码检查通过：新增统一提示组件和文案层不读取或展示真实密钥、数据库连接字符串、`AI_API_KEY` 或 `Authorization`。
- Faye 已确认 Step 7.2 通过，并要求更新文档和提交 Git。

### ✅ Step 7.3：完成基础闭环手工验收

已完成内容：

- 使用真实 Supabase 数据库写入一组基础闭环验收数据。
- 验收数据关联到已有账号 `2215128728@qq.com`。
- 验收日期为北京时间 `2026-05-05`。
- 写入 2 条任务，其中 1 条为已完成任务。
- 写入 1 个启用习惯。
- 写入 1 条今日习惯打卡。
- 写入 1 条今日日程。
- 写入 1 条事件记录，包含手动情绪标签和普通标签。
- 写入 1 条灵感记录，状态为待处理。
- 写入 1 份每日复盘缓存报告，用于验证缓存展示，不代表真实 AI 生成内容。
- 本 Step 未修改 `.env.local`。
- 本 Step 不修改数据库 schema，也不执行迁移。
- 本 Step 未发起真实 AI 请求。
- 本 Step 不改应用代码。

验证记录：

- 只读聚合查询通过：`tasks=2`。
- 只读聚合查询通过：`completed_tasks=1`。
- 只读聚合查询通过：`habits=1`。
- 只读聚合查询通过：`checkins=1`。
- 只读聚合查询通过：`schedules=1`。
- 只读聚合查询通过：`events=1`。
- 只读聚合查询通过：`ideas=1`。
- 只读聚合查询通过：`daily_reports=1`。
- 生产服务本地 `/daily` 返回 `200`。
- 生产服务本地 `/records` 返回 `200`。
- 生产服务本地 `/insights` 返回 `200`。
- 生产服务本地 `/settings` 返回 `200`。
- 源码检查通过：`generateReview()` 只出现在 `generateDailyReviewAction()` 和服务端 AI provider 封装中。
- 源码检查通过：`fetch()` 和 `Authorization` 只出现在 `src/lib/ai/openai-compatible.ts`。
- `npm run lint` 通过。
- `npm run build` 通过。
- 命令行页面检查没有浏览器登录态，因此页面响应验证覆盖未登录可打开；登录用户数据可见性通过真实数据库按用户和日期聚合验证。
- Faye 已要求更新文档和提交 Git。

### ✅ Step 8.1：更新架构文档

已完成内容：

- 更新 `memory-bank/@architecture.md`，补充 Step 7.3 后的基础闭环完成态快照。
- 写清当前实际用户流程：登录、每日工作台记录、今日概览、成长记录、洞察报告、每日复盘发送预览、确认生成或读取缓存复盘。
- 写清当前基础闭环已覆盖任务、习惯、日程、事件、灵感、程序统计、成长记录、基础图表、每日复盘、设置页状态和统一错误提示。
- 修正过期表述：每日复盘已经接入真实写入和缓存展示，不再写成“复盘仍未接真实写入”。
- 将数据模型章节从草案说明更新为当前真实数据模型说明，并注明实际结构以 `src/db/schema.ts` 和 `drizzle/0000_true_silver_sable.sql` 为准。
- 补充 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 环境变量说明，并保留对旧命名 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 的兼容说明。
- 写清当前仍未完成：Row Level Security、个人说明书真实编辑、周复盘、月度复盘、纪念日、礼物记录、场景工具箱和 Obsidian 导入导出。
- 本 Step 只修改架构文档，不修改应用代码、数据库 schema、迁移文件、`.env.local` 或真实数据库数据。

本次新增或更新的文件：

- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- 对照 `src/app`、`src/db/schema.ts`、`src/lib/ai` 和 `src/app/daily/actions.ts` 检查架构说明。
- `git diff --check -- memory-bank/@architecture.md` 通过。
- 本 Step 只修改文档，未运行 `npm run lint` 或 `npm run build`。
- Faye 已确认 Step 8.1 通过，并要求更新文档和提交 Git。

### ✅ Step 8.2：更新进度文档

已完成内容：

- 更新 `memory-bank/progress.md`，把当前状态从 Step 8.1 调整为 Step 8.2。
- 确认基础功能第一轮已完成的内容仍然只记录已验收通过的功能。
- 保留未完成内容：Row Level Security 尚未配置。
- 将下一步候选从 Step 8.2 调整为 Row Level Security 前置规划，避免继续停留在已完成的进度文档更新步骤。
- 本 Step 只修改进度文档，不修改应用代码、架构文档、数据库 schema、迁移文件、`.env.local` 或真实数据库数据。

本次新增或更新的文件：

- `memory-bank/progress.md`

验证记录：

- 对照 `memory-bank/implementation-plan.md` 中 Step 8.2 的执行指令和验证测试检查。
- 检查通过：已完成内容没有新增未验收功能。
- 检查通过：未完成内容仍保留 Row Level Security。
- 本 Step 只修改文档，未运行 `npm run lint` 或 `npm run build`。

### Row Level Security 前置规划

已完成内容：

- 在 `memory-bank/@architecture.md` 中新增 Row Level Security 前置规划章节。
- 明确当前关键约束：业务表已有 `user_id`，应用层已按用户 ID 限定，但业务读写主要通过 Drizzle 的 `DATABASE_URL` 直连数据库。
- 明确风险：直接启用依赖 `auth.uid()` 的 RLS 策略，可能与当前 Drizzle 直连方式不匹配，导致 Server Actions 失效或策略没有达到预期保护效果。
- 写清推荐路线：先保持应用层 `user_id` 限定，再为 RLS 做独立迁移；真实启用前必须在 Supabase SSR client 用户态读写和 Drizzle RLS 兼容会话之间选定路线。
- 补充第一批 8 张业务表的 RLS 策略草案，包括 `tasks`、`habits`、`habit_checkins`、`schedule_items`、`life_events`、`ideas`、`insight_reports` 和 `personal_manuals`。
- 补充真实启用前的验证清单，包括未登录访问、登录用户读写、跨用户 ID 篡改、写入当前用户 ID、设置页健康检查、lint 和 build。
- 本 Step 只做规划文档，不启用 RLS，不生成迁移，不执行数据库变更，不修改 `.env.local`。

本次新增或更新的文件：

- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- 对照 `src/db/schema.ts` 和 `drizzle/0000_true_silver_sable.sql` 检查 8 张业务表均有 `user_id`。
- 对照 `src/db/index.ts` 确认当前业务读写使用 Drizzle `DATABASE_URL` 直连数据库。
- 对照 `src/lib/auth/session.ts` 和 `src/app/daily/actions.ts` 确认当前应用层写入仍通过 `requireCurrentUser()` 获取用户并写入 `user_id`。
- 本 Step 只修改文档，未运行 `npm run lint` 或 `npm run build`。

### Row Level Security 路线确认与策略迁移设计

已完成内容：

- 确认 RLS 路线采用 Supabase SSR client 用户态读写。
- 新增 `src/lib/data/user-data.ts`，集中承载登录用户的任务、习惯、打卡、日程、事件、灵感、成长记录、洞察统计和每日复盘缓存读写。
- 每日工作台 Server Actions 改为通过 Supabase SSR client 写入业务表，不再通过 Drizzle `DATABASE_URL` 直连执行普通用户请求。
- 每日工作台、成长记录列表、记录详情、洞察报告和每日复盘上下文读取均改为通过 Supabase SSR client。
- 所有用户态查询和写入继续显式限定当前 `user_id`，不只依赖 RLS。
- `src/db/index.ts` 保留给 Drizzle schema、迁移、设置页数据库健康检查和必要的服务端内部维护用途。
- 新增本地迁移文件 `drizzle/0001_rls_user_policies.sql`，为 `tasks`、`habits`、`habit_checkins`、`schedule_items`、`life_events`、`ideas`、`insight_reports` 和 `personal_manuals` 启用 RLS 并创建基础策略。
- `habit_checkins` 写入和更新策略要求 `habit_id` 属于当前用户。
- `ideas` 写入和更新策略要求 `converted_task_id` 为空或目标任务属于当前用户。
- 更新 `drizzle/meta/_journal.json`，让本地迁移文件进入 Drizzle 迁移序列。
- 本 Step 后续已在 Faye 允许后执行真实数据库 RLS 迁移；未修改 `.env.local`，未配置生产环境变量，未部署。

本次新增或更新的文件：

- `src/lib/data/user-data.ts`
- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/records/page.tsx`
- `src/app/records/[kind]/[id]/page.tsx`
- `src/app/insights/page.tsx`
- `src/lib/ai/daily-review-context.ts`
- `drizzle/0001_rls_user_policies.sql`
- `drizzle/meta/_journal.json`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- 源码检查通过：`src/app` 和 `src/lib` 中普通用户态业务读写不再导入 `@/db`、`@/db/schema` 或 `drizzle-orm`。
- 迁移 SQL 人工检查通过：8 张业务表均启用 RLS，并包含 `select`、`insert`、`update`、`delete` 基础策略。
- 迁移 SQL 人工检查通过：未包含 `service_role`、`anon`、`DATABASE_URL`、`API_KEY` 或密码。
- `git diff --check` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。
- 生产构建本地服务下，未登录状态 `/`、`/daily`、`/records`、`/insights`、`/manual` 和 `/settings` 均返回 `200`。

### Row Level Security 真实数据库启用

已完成内容：

- Faye 已明确允许执行真实数据库迁移。
- 首次执行 `npm run db:migrate` 时，Drizzle CLI 在执行 RLS SQL 过程中返回失败码，但数据库检查确认该次事务未留下半套 RLS 状态。
- 使用同一份 `drizzle/0001_rls_user_policies.sql` 在事务中逐条诊断，确认 72 条 SQL 语句本身均可执行。
- 后续按表分短事务补齐执行 8 张业务表 RLS 策略，避免长 DDL 事务连接中断。
- 写入 Drizzle 迁移记录，迁移 hash 为 `688d09fb007a9e8b996791155c8a01f9fdbcf9e938c2e1420851865820678713`。
- 再次执行 `npm run db:migrate` 通过，确认 Drizzle 迁移记录与真实数据库状态一致。

验证记录：

- 数据库只读检查通过：8 张业务表均已启用 RLS。
- 数据库只读检查通过：8 张业务表共有 32 条 RLS policy。
- 数据库只读检查通过：Drizzle 迁移记录包含 0000 和 0001 两条记录。
- RLS 只读探针通过：模拟已有用户可见自己的任务、习惯、打卡、日程、事件、灵感和每日复盘。
- RLS 只读探针通过：模拟随机其他用户时，任务、习惯、打卡、日程、事件、灵感、复盘和个人说明书均返回 0。
- `npm run db:migrate` 通过。
- `git diff --check` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。
- 生产构建本地服务 `http://localhost:3003` 下，未登录状态 `/`、`/daily`、`/records`、`/insights`、`/manual` 和 `/settings` 均返回 `200`。
- 本 Step 未修改 `.env.local`，未配置生产环境变量，未部署，未提交 Git，未 push。

### ✅ Step 9.1：预览部署准备盘点

已完成内容：

- 只读检查 `.env.example`、设置页、Supabase 配置读取逻辑、AI 配置读取逻辑、认证回调逻辑和项目部署配置。
- 确认项目当前使用 Render 部署，仓库不再保留 `vercel.json`。
- 确认注册邮件回调使用当前请求 `origin` 生成 `/auth/confirm`，因此 Render 正式域名需要加入 Supabase Auth Redirect URL。
- 确认设置页只展示 Supabase、数据库和 AI 配置状态，不展示真实密钥、连接字符串或底层错误。
- 确认 `SUPABASE_SERVICE_ROLE_KEY` 当前不需要配置，继续暂缓。
- 输出 Render 需要配置的环境变量清单。
- 本 Step 未修改 `.env.local`，未配置 Render 环境变量，未配置 Supabase Auth Redirect URL，未部署。

Render 首版必填配置：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`

可暂缓配置：

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：只有不用 publishable key 时才需要。
- `AI_PROVIDER`、`AI_BASE_URL`、`AI_API_KEY` 和 `AI_MODEL_DAILY`：首版无 AI 部署可不填；需要生成 AI 复盘时再配置。
- `AI_MODEL_WEEKLY` 和 `AI_MODEL_MONTHLY`：周复盘和月度复盘尚未进入部署门槛。
- `SUPABASE_SERVICE_ROLE_KEY`：当前无服务端高权限需求。

Supabase Auth Redirect URL 需要配置：

- 正式域名：`https://<production-domain>/auth/confirm`
- 本地开发保留：`http://localhost:3001/auth/confirm`

验证记录：

- `git diff --check` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。
- 生产构建本地服务 `http://localhost:3004/settings` 返回 `200`。
- `/settings` 页面扫描未发现数据库连接串、AI key、service role key、Bearer token 等明文泄露。

### ✅ Step 9.2：Render 正式部署与基础验收

已完成内容：

- Faye 已在 Render 成功新建项目并完成 GitHub 部署。
- 正式访问域名为 `https://growth-insight-system.onrender.com`。
- Render 首版部署采用无 AI 配置路线，只要求 Supabase public client 配置和 `DATABASE_URL`。
- Faye 已在 Supabase Auth 中完成正式域名 Redirect URL 配置。
- 外部访问检查确认首页、每日工作台、登录页、洞察报告和设置页均可打开。
- Faye 已完成线上基础测试。

验证记录：

- `curl -I https://growth-insight-system.onrender.com/` 返回 `HTTP/2 200`。
- `curl -I https://growth-insight-system.onrender.com/daily` 返回 `HTTP/2 200`。
- `curl -I https://growth-insight-system.onrender.com/login` 返回 `HTTP/2 200`。
- `curl -I https://growth-insight-system.onrender.com/insights` 返回 `HTTP/2 200`。
- `curl -I https://growth-insight-system.onrender.com/settings` 返回 `HTTP/2 200`。
- Faye 已确认 Supabase 侧设置完成，并已完成线上测试。
- 本 Step 未配置 AI 环境变量，AI 待配置属于预期状态。

### ✅ Step 9.3：部署前最终测试

已完成内容：

- Faye 已确认部署前最终测试完成。
- 部署前测试统一按首版部署前测试记录。
- 测试重点覆盖正式部署站点的核心闭环：任务、习惯、打卡、日程、事件、灵感、程序复盘、成长记录和洞察报告。
- 确认未配置 AI 环境变量时，程序统计、基础图表和程序复盘摘要仍作为首版可用能力保留。
- 确认登录、退出、未登录浏览和未登录写入拦截仍按当前访问规则运行。
- 确认设置页和页面提示不展示数据库连接串、API key、service role key、Bearer token 或底层错误堆栈。
- 本 Step 未修改 `.env.local`，未配置 AI 环境变量，未修改数据库 schema，未执行迁移，未 push。

验证记录：

- 正式站点核心路由已在 Step 9.2 验证可访问。
- Faye 已完成线上部署前测试。
- 当前首版部署继续采用无 AI 配置路线，AI 待配置属于预期状态。
- 本 Step 只补充部署前测试完成态文档，未修改应用代码。

### ✅ Step 10.1：任务编辑与删除

已完成内容：

- 在每日工作台今日任务列表中加入任务详情入口、编辑入口和软删除入口。
- 支持编辑任务标题、分类、日期、状态、任务说明和复盘备注。
- 在任务详情页加入完整编辑表单，支持编辑同一批字段。
- 支持软删除任务，写入 `tasks.deleted_at` 和 `updated_at`，不做物理删除。
- 删除后的任务不再出现在每日工作台、成长记录、洞察统计和每日复盘上下文中。
- 任务编辑和软删除 Server Action 写入前都必须通过 `requireCurrentUser()` 获取当前登录用户。
- 任务编辑和软删除的数据访问层继续使用 Supabase SSR client，并显式限定当前 `user_id` 和 `deleted_at is null`。
- 用户 A 不能通过页面操作编辑或软删除用户 B 的任务；不存在、已删除或不属于当前账号的任务会被视为找不到。
- 本 Step 复用已有 `tasks.deleted_at` 字段，没有修改数据库 schema，也没有执行迁移。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/records/page.tsx`
- `src/app/records/[kind]/[id]/page.tsx`
- `src/lib/data/user-data.ts`
- `src/lib/feedback.ts`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 生产构建本地服务 `http://localhost:3005/daily` 返回 `200`。
- 生产构建本地服务 `http://localhost:3005/records` 返回 `200`。
- 生产构建本地服务 `http://localhost:3005/records/task/00000000-0000-0000-0000-000000000000` 返回 `200`。
- 生产构建本地服务 `http://localhost:3005/insights` 返回 `200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移，未 push。

### ✅ Step 10.2：日程编辑与删除

已完成内容：

- 在每日工作台今日日程列表中加入日程详情入口、编辑入口和软删除入口。
- 支持编辑日程标题、分类、日期、开始时间、结束时间和说明。
- 在日程详情页加入完整编辑表单，支持编辑同一批字段。
- 支持软删除日程，写入 `schedule_items.deleted_at` 和 `updated_at`，不做物理删除。
- 删除后的日程不再出现在每日工作台、成长记录、洞察统计和每日复盘上下文中。
- 编辑日期后，日程会从当前日期工作台移出，并出现在对应日期的数据查询结果中。
- 日程编辑和软删除 Server Action 写入前都必须通过 `requireCurrentUser()` 获取当前登录用户。
- 日程编辑和软删除的数据访问层继续使用 Supabase SSR client，并显式限定当前 `user_id` 和 `deleted_at is null`。
- 用户 A 不能通过页面操作编辑或软删除用户 B 的日程；不存在、已删除或不属于当前账号的日程会被视为找不到。
- 本 Step 复用已有 `schedule_items.deleted_at` 字段，没有修改数据库 schema，也没有执行迁移。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/records/page.tsx`
- `src/app/records/[kind]/[id]/page.tsx`
- `src/lib/data/user-data.ts`
- `src/lib/feedback.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移，未 push。

### ✅ Step 10.3：事件编辑与删除

已完成内容：

- 在每日工作台随手记录的事件列表中加入事件详情入口、编辑入口和软删除入口。
- 支持编辑事件内容、日期、情绪标签、普通标签、AI 分析权限、具体事件、下次行动和摘要。
- 在事件详情页加入完整编辑表单，支持编辑同一批字段。
- 支持软删除事件，写入 `life_events.deleted_at` 和 `updated_at`，不做物理删除。
- 删除后的事件不再出现在每日工作台、成长记录、洞察统计和每日复盘上下文中。
- 编辑 AI 分析权限后，每日复盘预览会按最新权限生成候选内容。
- 事件编辑和软删除 Server Action 写入前都必须通过 `requireCurrentUser()` 获取当前登录用户。
- 事件编辑和软删除的数据访问层继续使用 Supabase SSR client，并显式限定当前 `user_id` 和 `deleted_at is null`。
- 用户 A 不能通过页面操作编辑或软删除用户 B 的事件；不存在、已删除或不属于当前账号的事件会被视为找不到。
- 本 Step 复用已有 `life_events.deleted_at` 字段，没有修改数据库 schema，也没有执行迁移。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/records/page.tsx`
- `src/app/records/[kind]/[id]/page.tsx`
- `src/lib/data/user-data.ts`
- `src/lib/feedback.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移，未 push。

### ✅ Step 10.4：灵感编辑与删除

已完成内容：

- 在每日工作台随手记录的灵感列表中加入灵感详情入口、编辑入口和软删除入口。
- 支持编辑灵感内容、日期、状态和处理说明。
- 在灵感详情页加入完整编辑表单，支持编辑同一批字段。
- 支持软删除灵感，写入 `ideas.deleted_at` 和 `updated_at`，不做物理删除。
- 删除后的灵感不再出现在每日工作台、成长记录、洞察统计和每日复盘上下文中。
- 编辑状态后，灵感会按最新状态在每日工作台和详情页展示。
- 灵感编辑和软删除 Server Action 写入前都必须通过 `requireCurrentUser()` 获取当前登录用户。
- 灵感编辑和软删除的数据访问层继续使用 Supabase SSR client，并显式限定当前 `user_id` 和 `deleted_at is null`。
- 用户 A 不能通过页面操作编辑或软删除用户 B 的灵感；不存在、已删除或不属于当前账号的灵感会被视为找不到。
- 本 Step 复用已有 `ideas.deleted_at` 字段，没有修改数据库 schema，也没有执行迁移。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/records/page.tsx`
- `src/app/records/[kind]/[id]/page.tsx`
- `src/lib/data/user-data.ts`
- `src/lib/feedback.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移，未 push。

### ✅ Step 10.5：习惯维护

已完成内容：

- 在每日工作台习惯列表中加入习惯编辑入口和停用入口。
- 支持编辑习惯名称、分类、说明和开始日期。
- 在习惯打卡详情页展示对应习惯的说明、启用状态和开始日期。
- 在习惯打卡详情页加入对应习惯的编辑表单和停用入口。
- 支持停用习惯，写入 `habits.is_active = false` 和 `updated_at`，不删除习惯记录。
- 停用后的习惯不再出现在今日打卡列表和启用习惯统计中。
- 停用习惯不会删除 `habit_checkins`，历史打卡记录仍保留在成长记录和打卡详情中。
- 习惯编辑和停用 Server Action 写入前都必须通过 `requireCurrentUser()` 获取当前登录用户。
- 习惯编辑和停用的数据访问层继续使用 Supabase SSR client，并显式限定当前 `user_id` 和 `deleted_at is null`。
- 用户 A 不能通过页面操作编辑或停用用户 B 的习惯；不存在、已删除或不属于当前账号的习惯会被视为找不到。
- 本 Step 复用已有 `habits.description`、`habits.start_date` 和 `habits.is_active` 字段，没有修改数据库 schema，也没有执行迁移。
- 本 Step 不实现习惯删除或软删除；习惯删除或软删除需先确认历史打卡展示和统计规则。

本次新增或更新的文件：

- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/records/[kind]/[id]/page.tsx`
- `src/lib/data/user-data.ts`
- `src/lib/feedback.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移，未 push。

### ✅ Step 11.1：写入区默认收起

已完成内容：

- 将每日工作台今日任务、习惯打卡、今日日程和随手记录四个创建表单改为默认收起。
- 每个模块保留清晰新增入口：新建任务、添加习惯、记录日程和写一条记录。
- 登录用户点击新增入口后可展开对应创建表单并继续提交。
- 创建失败时，对应创建表单会自动展开，并在模块内显示统一错误反馈，方便直接修正。
- 创建成功后仍回到对应模块锚点，并展示保存成功反馈。
- 未登录用户仍看到登录/注册提示和写入拦截，不开放真实创建表单。
- 本 Step 只调整每日工作台页面结构和对应样式，不修改数据库 schema，不修改 `.env.local`，不执行迁移。

本次新增或更新的文件：

- `src/app/daily/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check -- src/app/daily/page.tsx src/app/globals.css` 通过。
- 本地 `/daily` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移，未 push。

### ✅ Step 11.2：今日概览卡增加快捷入口

已完成内容：

- 在每日工作台今日概览四张卡右上角增加快捷新增入口。
- 今日任务卡入口跳转到 `/daily?create=task#tasks`，并展开任务创建表单。
- 习惯打卡卡入口跳转到 `/daily?create=habit#habits`，并展开习惯创建表单。
- 今日日程卡入口跳转到 `/daily?create=schedule#schedule`，并展开日程创建表单。
- 随手记录卡入口跳转到 `/daily?create=record#notes`，并展开随手记录创建表单。
- 未登录用户点击概览卡快捷入口时进入登录流程，并保留返回到对应创建区域的 `next` 路径。
- 快捷入口不改变今日概览的程序统计，不触发 AI 调用，不修改任何写入 Action。
- 本 Step 只调整每日工作台页面结构和对应样式，不修改数据库 schema，不修改 `.env.local`，不执行迁移。

本次新增或更新的文件：

- `src/app/daily/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check -- src/app/daily/page.tsx src/app/globals.css` 通过。
- 本地 `/daily?create=task` 响应 `HTTP 200`。
- 本地 `/daily?create=record` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移，未 push。

### ✅ Step 11.3：移动端工作台检查与优化

已完成内容：

- 专项优化每日工作台在手机宽度下的基础布局。
- 小屏下收紧页面区块间距和卡片内边距，减少首屏压力。
- 小屏下状态标签允许换行，避免长标签横向撑开页面。
- 小屏下今日概览卡快捷入口保持可点击，同时不挤压卡片标题。
- 小屏下任务、习惯、日程和随手记录列表项改为更稳定的竖向结构。
- 小屏下列表操作区改为双列网格，常用按钮更容易点击。
- 小屏下延期日期输入占满可用宽度，延期按钮保持可点击。
- 小屏下编辑表单提交按钮和每日复盘操作按钮占满宽度，减少触控误点。
- 本 Step 只调整 CSS 响应式样式，不修改页面数据流、数据库 schema、`.env.local` 或写入 Action。

本次新增或更新的文件：

- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check -- src/app/globals.css` 通过。
- 本地 `/daily?create=task` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移，未 push。

### ✅ Step 12.1：个人说明书读取与保存

已完成内容：

- 将个人说明书页面从静态页面壳升级为登录用户可读写的页面。
- 未登录用户只看到登录提示，不能保存个人说明书。
- 登录用户进入 `/manual` 时读取当前账号的 `personal_manuals` 记录。
- 当前账号未创建个人说明书时，页面显示空白可编辑状态。
- 新增个人说明书保存 Server Action，写入前必须通过 `requireCurrentUser()` 获取当前登录用户。
- 保存时通过 Supabase SSR client 按当前 `user_id` upsert 到 `personal_manuals`。
- 当前 Step 支持保存当前人生阶段、主要目标、能力画像、情绪模式和常见内耗点。
- 保存成功后回到 `/manual?manualSaved=1` 并展示统一成功提示。
- 保存失败时展示统一错误提示，不暴露数据库错误、连接字符串或底层堆栈。
- 本 Step 复用已有 `personal_manuals` 表和 RLS 策略，没有修改数据库 schema，也没有执行迁移。

本次新增或更新的文件：

- `src/app/manual/actions.ts`
- `src/app/manual/page.tsx`
- `src/lib/data/user-data.ts`
- `src/lib/feedback.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check -- src/app/manual/page.tsx src/app/manual/actions.ts src/lib/data/user-data.ts src/lib/feedback.ts` 通过。
- 本地 `/manual` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移，未 push。

### ✅ Step 12.2：个人说明书手动编辑

已完成内容：

- 在个人说明书表单中补齐高能量来源、反复出现的问题和适合自己的行动建议风格三个字段。
- 保留已有当前人生阶段、主要目标、能力画像、情绪模式和常见内耗点字段，形成 Step 12.2 要求的完整手动编辑范围。
- 新增字段继续使用 dashboard 风格的轻量 textarea，不引入复杂富文本编辑器。
- 保存时通过 `savePersonalManualAction()` 读取并清洗新增字段。
- 数据访问层 `upsertPersonalManualForUser()` 已写入 `energy_sources`、`recurring_problems` 和 `preferred_action_style`。
- 列表类字段继续支持按换行或中英文逗号拆分，并限制最多 12 条。
- 保存成功后继续使用统一成功提示，保存失败继续使用不暴露底层错误的统一错误提示。
- 本 Step 复用已有 `personal_manuals` 表和 RLS 策略，没有修改数据库 schema，也没有执行迁移。

本次新增或更新的文件：

- `src/app/manual/actions.ts`
- `src/app/manual/page.tsx`
- `src/lib/data/user-data.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check -- src/app/manual/page.tsx src/app/manual/actions.ts src/lib/data/user-data.ts` 通过。
- 本地 `/manual` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移。

### ✅ Step 12.3：个人说明书与复盘预留关联

已完成内容：

- 新增复盘侧个人说明书上下文接口，支持按当前用户读取个人说明书，并接收每日、周、月复盘类型参数。
- 每日复盘上下文构建时会并行读取当天复盘数据和当前用户个人说明书状态。
- 当前个人说明书上下文只记录是否已读取、已填写字段和边界标记，不写入 `GenerateReviewInput`。
- 每日复盘预览新增“个人说明书关联边界”，明确当前不会把个人说明书放入 AI 输入。
- 后续如果要把个人说明书加入 AI 上下文，必须先在发送预览中明示具体内容，并由用户确认。
- 本 Step 未修改数据库 schema、RLS 策略、`.env.local` 或 AI provider 调用格式。

本次新增或更新的文件：

- `src/lib/ai/personal-manual-context.ts`
- `src/lib/ai/daily-review-context.ts`
- `src/app/daily/page.tsx`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check -- src/lib/ai/personal-manual-context.ts src/lib/ai/daily-review-context.ts src/app/daily/page.tsx` 通过。
- 本地 `/daily?reviewPreview=1` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移，未 push。

### ✅ Step 13.1：周复盘程序统计

已完成内容：

- 在洞察报告页新增“周复盘 / 最近 7 天程序统计”区块。
- 周复盘程序统计复用 `/insights` 已有最近 7 天任务、启用习惯、习惯打卡、日程、事件和灵感读取结果。
- 展示最近 7 天任务完成率、习惯打卡率、随手记录数量和日程记录数量。
- 生成程序关键摘要，包括任务完成情况、习惯打卡情况、事件/灵感数量、最高频情绪标签、最稳定习惯和高活动日期。
- 未登录用户仍只看到登录提示，不读取个人周数据。
- 最近 7 天没有可复盘数据时显示空状态。
- 本 Step 只做程序统计，不调用 AI，不读取个人说明书原文，不修改数据库 schema 或环境变量。

本次新增或更新的文件：

- `src/app/insights/page.tsx`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check -- src/app/insights/page.tsx` 通过。
- 本地 `/insights` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移。

### ✅ Step 13.2：周复盘发送预览

已完成内容：

- 新增周复盘上下文服务 `src/lib/ai/weekly-review-context.ts`，用于整理将来可能发送给 AI 的周复盘统计、关键摘要和事件原文候选。
- 新增 `getWeeklyReviewRowsForUser()` 只读查询，按当前 `user_id` 和最近 7 天范围读取任务、启用习惯、习惯打卡、日程、事件和灵感。
- 在洞察报告页新增“打开周复盘发送预览”入口。
- `/insights?weeklyPreview=1` 展示将用于 AI 的周复盘统计、关键摘要、事件原文候选、已降级为摘要的事件和个人说明书关联边界。
- 事件原文候选沿用每日复盘敏感规则：只有 `ai_analysis_permission = allow_original` 且未命中敏感规则的事件才显示为候选。
- 命中敏感规则的事件降级为摘要展示，不作为原文候选。
- 未配置周复盘 AI 时确认生成按钮不可用；即使已配置，当前也提示生成将在 Step 13.3 接入。
- 打开预览不调用 AI，不保存复盘报告，不修改数据库 schema、RLS 策略或 `.env.local`。

本次新增或更新的文件：

- `src/lib/ai/weekly-review-context.ts`
- `src/lib/data/user-data.ts`
- `src/app/insights/page.tsx`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check -- src/app/insights/page.tsx src/lib/ai/weekly-review-context.ts src/lib/data/user-data.ts` 通过。
- 本地 `/insights?weeklyPreview=1` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移。

### ✅ Step 13.3：周复盘生成与缓存

已完成内容：

- 新增周复盘生成 Server Action `generateWeeklyReviewAction()`。
- 周复盘生成前先按当前用户和最近 7 天周期查询已完成缓存报告；已有缓存时直接跳转展示，不重复调用 AI。
- 未命中缓存时，复用周复盘发送预览上下文和用户选择的事件原文调用 AI Provider Adapter。
- 生成结果保存到 `insight_reports`，`report_type = weekly`，并记录周期起止日期、统计摘要、关键摘要、选中的事件原文 ID、模型供应商和模型名称。
- 洞察报告页读取当前周期的周复盘缓存报告，并展示标题、摘要、观察到的模式、行动建议和下一步行动。
- 未配置周复盘 AI 时确认生成按钮不可用；程序统计和发送预览继续可用。
- 新增周复盘生成成功、读取缓存、配置缺失、provider 失败和保存失败的统一反馈。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移。

本次新增或更新的文件：

- `src/app/insights/actions.ts`
- `src/app/insights/page.tsx`
- `src/lib/data/user-data.ts`
- `src/lib/feedback.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check -- src/app/insights/page.tsx src/app/insights/actions.ts src/lib/data/user-data.ts src/lib/feedback.ts` 通过。
- 本地 `/insights` 响应 `HTTP 200`。
- 本地 `/insights?weeklyPreview=1` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移。

### ✅ Step 14.1：月复盘程序统计

已完成内容：

- 在洞察报告页新增“月复盘 / 本月程序统计”区块。
- 新增本月只读查询，按当前登录用户读取当月任务、启用习惯、习惯打卡、日程、事件、灵感和与本月有交集的已生成周复盘。
- 月复盘程序统计展示任务完成率、习惯稳定性、记录密度和已有周复盘数量。
- 生成月度程序关键摘要，包括任务模式、高频情绪、最稳定习惯、前后半月记录密度变化、高活动日期和已有周复盘参考数量。
- 未登录用户仍只看到登录提示，不读取个人月数据。
- 当月没有可复盘数据时显示空状态。
- 本 Step 只做程序统计，不调用 AI，不修改数据库 schema、RLS 策略或 `.env.local`。

本次新增或更新的文件：

- `src/app/insights/page.tsx`
- `src/lib/data/user-data.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本地 `/insights` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移。

### ✅ Step 14.2：月复盘发送预览

已完成内容：

- 新增月复盘上下文服务 `src/lib/ai/monthly-review-context.ts`，用于整理将来可能发送给 AI 的月度统计、关键记录摘要和已有周复盘摘要。
- 新增 `getMonthlyReviewRowsForUser()` 只读查询，按当前 `user_id` 和本月范围读取任务、启用习惯、习惯打卡、日程、事件、灵感和与本月有交集的已生成周复盘。
- 在洞察报告页新增“打开月复盘发送预览”入口。
- `/insights?monthlyPreview=1` 展示将用于 AI 的月复盘统计、关键记录摘要、已有周复盘摘要、已降级的敏感记录和个人说明书关联边界。
- 月复盘预览当前采用摘要-only 策略，不展示事件原文候选，不把未经确认的事件原文放入 AI 输入。
- 未配置月复盘 AI 时确认生成按钮不可用；即使已配置，当前也提示生成将在 Step 14.3 接入。
- 打开预览不调用 AI，不保存复盘报告，不修改数据库 schema、RLS 策略或 `.env.local`。

本次新增或更新的文件：

- `src/lib/ai/monthly-review-context.ts`
- `src/lib/data/user-data.ts`
- `src/app/insights/page.tsx`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本地 `/insights?monthlyPreview=1` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移。

### ✅ Step 14.3：月复盘生成与缓存

已完成内容：

- 新增月复盘生成 Server Action `generateMonthlyReviewAction()`。
- 月复盘生成前先按当前用户和北京时间自然月周期查询已完成缓存报告；已有缓存时直接跳转展示，不重复调用 AI。
- 未命中缓存时，复用月复盘发送预览上下文调用 AI Provider Adapter。
- 生成结果保存到 `insight_reports`，`report_type = monthly`，并记录自然月起止日期、统计摘要、关键摘要、模型供应商和模型名称。
- 洞察报告页读取当前自然月的月复盘缓存报告，并展示标题、摘要、观察到的模式、行动建议和下一步行动。
- 未配置月复盘 AI 时确认生成按钮不可用；程序统计和发送预览继续可用。
- 新增月复盘生成成功、读取缓存、配置缺失、provider 失败和保存失败的统一反馈。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移。

本次新增或更新的文件：

- `src/app/insights/actions.ts`
- `src/app/insights/page.tsx`
- `src/lib/data/user-data.ts`
- `src/lib/feedback.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `git diff --check` 通过。
- 本地 `/insights` 响应 `HTTP 200`。
- 本地 `/insights?monthlyPreview=1` 响应 `HTTP 200`。
- 本 Step 未修改 `.env.local`，未修改数据库 schema，未执行迁移。

### ✅ Step 15.1：纪念日记录

已完成内容：

- 新增 `anniversaries` 数据表 schema，用于保存纪念日标题、关系对象、纪念日日期、可选提醒日期、备注、创建/更新时间和软删除时间。
- 新增本地迁移文件 `drizzle/0002_cold_wendell_rand.sql`，创建 `anniversaries` 表、用户日期索引、用户提醒日期索引，并为该表启用 RLS 和当前用户隔离策略。
- 更新 Drizzle 迁移元数据，记录 `0002_cold_wendell_rand`。
- 新增生活扩展页面 `/life`，当前聚焦纪念日记录，展示纪念日数量、已设置提醒日期数量和后续礼物扩展提示。
- 在主导航新增“生活扩展”入口。
- 登录用户可以创建纪念日，最少填写标题、关系对象和日期；提醒日期和备注可选。
- 登录用户可以编辑纪念日标题、关系对象、日期、提醒日期和备注。
- 登录用户可以软删除纪念日，删除后写入 `deleted_at`，不物理删除。
- 未登录用户可以浏览页面结构，但只能看到登录提示，不能写入纪念日。
- 纪念日读写通过 Supabase SSR client 执行，并在应用层显式限定当前 `user_id`；数据库层同时通过 RLS 按 `auth.uid() = user_id` 隔离。
- 当前纪念日只做记录和列表，不做推送提醒，不调用 AI。

本次新增或更新的文件：

- `src/app/life/page.tsx`
- `src/app/life/actions.ts`
- `src/components/app-shell.tsx`
- `src/db/schema.ts`
- `src/lib/data/user-data.ts`
- `drizzle/0002_cold_wendell_rand.sql`
- `drizzle/meta/_journal.json`
- `drizzle/meta/0002_snapshot.json`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- 已检查代码实现与 Step 15.1 计划一致：包含数据模型、页面入口、创建、编辑、软删除、未登录拦截和用户隔离。
- 本次文档同步没有重新执行真实数据库迁移，避免重复操作数据库；按当前任务输入，迁移已经执行。
- `npm run lint` 通过。
- `npm run build` 通过，构建路由包含 `/life`。

### ✅ Step 15.2：礼物记录

已完成内容：

- 新增 `gift_records` 数据表 schema，用于保存礼物名称、对象、日期、用途、备注、可选关联纪念日、创建/更新时间和软删除时间。
- 新增本地迁移文件 `drizzle/0003_massive_expediter.sql`，创建 `gift_records` 表、用户日期索引、用户对象索引、用户纪念日索引、可选纪念日外键，并为该表启用 RLS 和当前用户隔离策略。
- 更新 Drizzle 迁移元数据，记录 `0003_massive_expediter`。
- 更新生活扩展页面 `/life`，在纪念日记录下方新增礼物记录区块。
- 登录用户可以创建礼物记录，最少填写礼物名称、对象、日期和用途；备注和关联纪念日可选。
- 登录用户可以编辑礼物名称、对象、日期、用途、备注和关联纪念日。
- 登录用户可以软删除礼物记录，删除后写入 `deleted_at`，不物理删除。
- 礼物列表支持按对象筛选和按关联纪念日筛选。
- 未登录用户可以浏览页面结构，但只能看到登录提示，不能写入礼物记录。
- 礼物记录读写通过 Supabase SSR client 执行，并在应用层显式限定当前 `user_id`；数据库层同时通过 RLS 按 `auth.uid() = user_id` 隔离。
- 写入礼物记录时，如果选择关联纪念日，会先校验该纪念日属于当前用户。
- 当前礼物记录只做记录和列表，不做 AI 推荐，不调用 AI。
- 本 Step 只生成本地迁移文件，没有执行真实数据库迁移。

本次新增或更新的文件：

- `src/app/life/page.tsx`
- `src/app/life/actions.ts`
- `src/db/schema.ts`
- `src/lib/data/user-data.ts`
- `drizzle/0003_massive_expediter.sql`
- `drizzle/meta/_journal.json`
- `drizzle/meta/0003_snapshot.json`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run db:generate` 通过，生成 `drizzle/0003_massive_expediter.sql`。
- 人工检查迁移 SQL：包含 `gift_records` 建表、索引、可选纪念日外键、RLS 启用和 `select`、`insert`、`update`、`delete` 基础策略。
- `npm run lint` 通过。
- `npm run build` 通过，构建路由包含 `/life`。

### ✅ Step 15.3：场景工具箱基础版

已完成内容：

- 新增 `tool_type` 枚举，当前包括 `emotion_review`、`stress_sorting` 和 `tomorrow_plan`。
- 新增 `tool_sessions` 数据表 schema，用于保存工具类型、标题、用户输入、工具输出、是否调用 AI、创建/更新时间和软删除时间。
- 新增本地迁移文件 `drizzle/0004_lonely_silver_samurai.sql`，创建 `tool_type` 枚举、`tool_sessions` 表、用户工具类型索引、用户创建时间索引，并为该表启用 RLS 和当前用户隔离策略。
- 更新 Drizzle 迁移元数据，记录 `0004_lonely_silver_samurai`。
- 新增场景工具箱页面 `/toolbox`。
- 在主导航新增“场景工具箱”入口。
- 第一批工具包括情绪复盘、压力整理和明日计划。
- 登录用户可以选择工具类型并保存一次工具记录；工具记录包含用户输入和程序化输出。
- 未配置 AI 时工具箱仍可使用；当前输出由程序化模板生成，不调用 AI。
- 登录用户可以查看最近 20 条工具记录，并按工具类型筛选。
- 未登录用户可以浏览页面结构，但只能看到登录提示，不能保存工具记录。
- 工具记录读写通过 Supabase SSR client 执行，并在应用层显式限定当前 `user_id`；数据库层同时通过 RLS 按 `auth.uid() = user_id` 隔离。
- 本 Step 只生成本地迁移文件，没有执行真实数据库迁移。

本次新增或更新的文件：

- `src/app/toolbox/page.tsx`
- `src/app/toolbox/actions.ts`
- `src/components/app-shell.tsx`
- `src/db/schema.ts`
- `src/lib/data/user-data.ts`
- `drizzle/0004_lonely_silver_samurai.sql`
- `drizzle/meta/_journal.json`
- `drizzle/meta/0004_snapshot.json`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run db:generate` 通过，生成 `drizzle/0004_lonely_silver_samurai.sql`。
- 人工检查迁移 SQL：包含 `tool_type` 枚举、`tool_sessions` 建表、索引、RLS 启用和 `select`、`insert`、`update`、`delete` 基础策略。
- `npm run lint` 通过。
- `npm run build` 通过，构建路由包含 `/toolbox`。

### ✅ Step 15.4：Obsidian Markdown 导出

已完成内容：

- 新增 Markdown 导出页面 `/export`。
- 新增 Markdown 下载路由 `/export/markdown`。
- 登录用户可以导出最近完成的每日、周和月复盘报告，导出内容包含标题、周期、模型、摘要、观察到的模式、行动建议和下一步行动。
- 登录用户可以导出近期成长记录，导出内容包含任务、习惯打卡、日程、事件和灵感记录。
- 未登录用户不能导出个人数据；页面只显示登录提示，下载路由返回 `401`。
- 导出读取全部按当前登录用户 ID 限定，用户 A 不能导出用户 B 的数据。
- 当前只做站内 Markdown 文件下载，不读取本地 Obsidian 仓库，不做双向同步。
- 导出内容不包含密钥、连接字符串或底层错误信息。
- 本 Step 未修改数据库 schema，未生成迁移，未执行真实数据库迁移。

本次新增或更新的文件：

- `src/app/export/page.tsx`
- `src/app/export/markdown/route.ts`
- `src/components/app-shell.tsx`
- `src/lib/data/user-data.ts`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过，构建路由包含 `/export` 和 `/export/markdown`。

### ✅ Step 16.1：工作台简洁化与移动端导航优化

已完成内容：

- 移动端共享导航改为左侧抽屉菜单，顶部右侧保留账号/登录入口。
- 每日工作台移除登录状态提示卡，登录信息统一回到应用壳显示。
- 今日任务列表改为简洁列表：任务名可直接进入详情页，左侧复选按钮可快速完成或取消完成，状态用不同颜色显示。
- 习惯列表改为简洁列表：左侧复选按钮可快速打卡或取消打卡，小字显示分类、开始日期、累计次数和连续天数，保留停用入口。
- 今日日程列表改为简洁列表：显示时间、标题、分类和日期，标题可进入详情页，保留删除入口。
- 随手记录列表改为简洁列表：事件和灵感以内容预览为主，详情编辑下沉到详情页。
- 事件详情页、每日工作台和洞察报告增加情绪/标签数组兜底解析，避免情绪标签被字符串拆成单字显示。
- 洞察报告通过布局排序优先展示今日概览，再展示周复盘和月复盘相关内容；今日概览和图表区域做密度压缩。
- 本 Step 未修改数据库 schema，未生成迁移，未执行真实数据库迁移。

本次新增或更新的文件：

- `src/components/app-shell.tsx`
- `src/app/daily/page.tsx`
- `src/app/records/[kind]/[id]/page.tsx`
- `src/app/insights/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Step 16.2：日程循环规则

已完成内容：

- 新增日程循环周期选项：不循环、每天、每周、每月。
- `schedule_items` schema 新增 `start_date`、`end_date` 和 `recurrence` 字段。
- 新增 `schedule_recurrence` 数据库枚举。
- 新增本地迁移文件 `drizzle/0005_remarkable_doctor_strange.sql`，包含枚举、日程字段、旧数据 `start_date = schedule_date` 回填和用户开始日期索引。
- 已执行真实 Supabase 数据库迁移；第一次命令中断后复跑成功，最终输出 `migrations applied successfully`。
- 每日工作台创建日程时可设置开始日期、结束日期和循环周期。
- 今日工作台读取日程时兼容旧单日日程和新循环日程；命中今天的每日、每周、每月循环日程会显示在今日列表。
- 日程详情页展示并可编辑开始日期、结束日期和循环周期。
- 新增日程日期范围校验，结束日期不能早于开始日期。
- 本 Step 未写入测试业务数据，因此无需清理测试数据。

本次新增或更新的文件：

- `src/lib/schedules/options.ts`
- `src/db/schema.ts`
- `src/lib/data/user-data.ts`
- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/records/[kind]/[id]/page.tsx`
- `src/lib/feedback.ts`
- `drizzle/0005_remarkable_doctor_strange.sql`
- `drizzle/meta/_journal.json`
- `drizzle/meta/0005_snapshot.json`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run db:generate` 通过，生成 `drizzle/0005_remarkable_doctor_strange.sql`。
- 人工检查迁移 SQL：只新增 `schedule_recurrence`、`schedule_items` 三个循环字段、旧数据回填和开始日期索引。
- `npm run db:migrate` 第二次执行通过，真实 Supabase 数据库迁移成功。
- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.1：导航收敛与导出入口回收

已完成内容：

- 主导航移除“Markdown 导出”入口。
- 主导航移除“个人说明书”入口，后续作为 AI 复盘相关资料并入洞察报告入口设计。
- 主导航移除“场景工具箱”入口。
- “场景工具箱”命名调整为“问题拆解”；`/toolbox` 路由暂时保留，作为洞察报告中的辅助入口。
- 洞察报告顶部新增“AI 复盘与问题拆解”快捷入口，包含问题拆解、周复盘和月复盘。
- 洞察报告的周复盘、月复盘区域新增“导出 Markdown”快捷入口。
- `/export` 独立页面不再展示导出界面，访问时回到 `/insights`。
- `/export/markdown` 下载路由新增 `weekly` 和 `monthly` 类型，支持周复盘、月复盘按类型导出。
- “生活扩展”页面和导航命名调整为“纪念日”，路由 `/life` 暂不改，避免破坏已有链接。
- 本 Step 未修改数据库 schema，未生成迁移，未执行真实数据库迁移，未写入测试业务数据。

本次新增或更新的文件：

- `src/components/app-shell.tsx`
- `src/app/insights/page.tsx`
- `src/app/export/page.tsx`
- `src/app/export/markdown/route.ts`
- `src/app/life/page.tsx`
- `src/app/toolbox/page.tsx`
- `memory-bank/modification-plan.md`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.2：每日工作台去掉重复概览

已完成内容：

- 每日工作台今日概览从统计卡改为简洁清单卡。
- 今日任务概览卡直接显示任务复选框和任务名；勾选可快速完成/取消完成，任务名可进入详情页。
- 今日习惯概览卡直接显示习惯打卡复选框和习惯名；勾选可快速打卡/取消打卡。
- 今日日程概览卡显示时间和日程名；日程名可进入详情页。
- 随手记录概览卡显示今日事件和灵感内容；点击可进入详情页。
- 移除今日概览中的完成率、数量、进度条和细分标签，避免与洞察报告重复。
- 移除每日工作台四个分区底部的提示标签行，减少重复的“行动、稳定性、时间、沉淀”类信息。
- 本 Step 未修改数据库 schema，未生成迁移，未执行真实数据库迁移，未写入测试业务数据。

本次新增或更新的文件：

- `src/app/daily/page.tsx`
- `memory-bank/modification-plan.md`
- `memory-bank/progress.md`
- `memory-bank/@architecture.md`

验证记录：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.3：成长主页能力并入洞察报告

已完成内容：

- `/` 直接跳转到 `/daily`，每日打开优先看到每日工作台。
- 主导航移除“成长主页”，避免首页、每日工作台和洞察报告重复。
- 洞察报告新增“成长概览”区块，承接原成长主页的今日行动进度、本周关键指标和最近复盘状态。
- 原成长主页的静态占位卡不再展示。
- 本 Step 未修改数据库 schema，未生成迁移，未执行真实数据库迁移，未写入测试业务数据。

本次新增或更新的文件：

- `src/app/page.tsx`
- `src/components/app-shell.tsx`
- `src/app/insights/page.tsx`
- `memory-bank/modification-plan.md`
- `memory-bank/progress.md`
- `memory-bank/@architecture.md`

验证记录：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.4：个人说明书并入 AI 复盘

已完成内容：

- 洞察报告的“AI 复盘与问题拆解”入口新增“个人说明书”快捷入口。
- 主导航继续不展示个人说明书，个人说明书作为 AI 复盘相关的长期背景资料进入。
- 个人说明书页面文案改为“洞察报告里 AI 复盘可参考的长期背景资料”。
- 个人说明书页面增加回到洞察报告入口。
- 继续保留“是否进入 AI 输入必须在发送预览中明示并由用户确认”的边界。
- 本 Step 未修改数据库 schema，未生成迁移，未执行真实数据库迁移，未写入测试业务数据。

本次新增或更新的文件：

- `src/app/insights/page.tsx`
- `src/app/manual/page.tsx`
- `memory-bank/modification-plan.md`
- `memory-bank/progress.md`
- `memory-bank/@architecture.md`

验证记录：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 18.1：移动端导航修复与每日工作台概览改造

已完成内容：

- 移动端左上角三横线菜单改为客户端抽屉组件，并通过 portal 挂载到 `document.body`，避免移动端 `sticky header` 和背景效果影响抽屉显示。
- 移动端抽屉以左侧长条目录展示主导航，包括每日工作台、成长记录、洞察报告、纪念日和设置。
- 移动端抽屉打开时锁定页面滚动，点击遮罩、关闭按钮或导航链接可关闭或跳转。
- 每日工作台今日概览改为四个入口：今日任务、今日习惯、今日日程、随手记录。
- 今日概览入口使用 URL query `view` 控制当前显示列表；未选择入口时先显示选择提示，不默认展开任务列表。
- 点击某个入口后仍停留在 `/daily`，只显示对应列表。
- 对应列表右上角提供“新增”按钮，点击后展开该列表对应的创建表单。
- 晚间复盘入口放在当前列表上方，避免长列表遮挡复盘入口。
- 随手记录列表内容改为单行省略，完整内容继续通过详情页查看。
- 本 Step 未修改数据库 schema，未生成迁移，未执行真实数据库迁移，未写入测试业务数据。

本次新增或更新的文件：

- `src/components/mobile-nav-drawer.tsx`
- `src/components/app-shell.tsx`
- `src/app/daily/page.tsx`
- `src/app/globals.css`
- `memory-bank/modification-plan.md`
- `memory-bank/progress.md`
- `memory-bank/@architecture.md`

验证记录：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。
- Faye 已确认移动端三横线菜单可正常弹出目录，并确认 Step 18.1 通过。

### ✅ Modification Step 18.2：列表置顶、习惯删除与排序规则

已完成内容：

- 为任务、习惯、日程、人生笔记和灵感增加 `is_pinned` 字段，旧数据默认未置顶。
- 生成并执行真实数据库迁移 `drizzle/0006_wandering_slayback.sql`。
- 每日工作台今日任务、今日习惯、今日日程和随手记录列表支持置顶和取消置顶。
- 置顶项在对应列表顶部展示；未置顶项继续沿用原有业务排序。
- 习惯增加删除能力，采用软删除方式写入 `deleted_at`，并同步置为不启用，不物理删除历史打卡。
- 习惯详情页增加删除入口；删除后今日习惯列表和启用习惯统计不再显示该习惯。
- 统一补充置顶和习惯删除的成功反馈文案。

本次新增或更新的文件：

- `src/db/schema.ts`
- `drizzle/0006_wandering_slayback.sql`
- `drizzle/meta/_journal.json`
- `drizzle/meta/0006_snapshot.json`
- `src/lib/data/user-data.ts`
- `src/app/daily/actions.ts`
- `src/app/daily/page.tsx`
- `src/app/records/[kind]/[id]/page.tsx`
- `src/lib/feedback.ts`
- `memory-bank/modification-plan.md`
- `memory-bank/progress.md`
- `memory-bank/@architecture.md`

验证记录：

- `npm run db:generate` 通过。
- 迁移 SQL 检查通过，只为 `habits`、`ideas`、`life_events`、`schedule_items` 和 `tasks` 增加 `is_pinned` 字段。
- Faye 已单独确认执行真实数据库迁移。
- `npm run db:migrate` 通过，真实 Supabase 数据库迁移成功。
- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。
- Faye 已确认继续，视为 Step 18.2 通过并进入下一步。

### ✅ Modification Step 18.3：洞察报告入口分流与问题拆解排版优化

已完成内容：

- 洞察报告默认页改为只展示复盘入口和成长概览，不再直接堆叠完整周/月复盘长内容。
- 洞察报告横向入口保留问题拆解、周复盘和月复盘。
- `/insights?view=weekly` 展示周复盘程序统计、周复盘发送预览、周复盘报告缓存、本周趋势、记录数量趋势、习惯状态和情绪记录。
- `/insights?view=monthly` 展示月复盘程序统计、月复盘发送预览、月复盘报告缓存和已有周复盘摘要。
- 周/月复盘生成、缓存和错误跳转保留在对应视图中，避免回到默认总览后看不到结果。
- 洞察报告默认页移除今日概览，今日完成情况合并回每日工作台。
- 每日工作台今日概览先展示任务完成率、习惯打卡、今日日程和随手记录完成情况，再展示今日任务、今日习惯、今日日程和随手记录四个列表入口。
- 问题拆解页面三类模块改为可点击工具入口，点击后定位到新增记录表单。
- 本 Step 未修改数据库 schema，未生成迁移，未执行真实数据库迁移，未写入测试业务数据。

本次新增或更新的文件：

- `src/app/daily/page.tsx`
- `src/app/insights/actions.ts`
- `src/app/insights/page.tsx`
- `src/app/toolbox/page.tsx`
- `src/app/globals.css`
- `memory-bank/modification-plan.md`
- `memory-bank/progress.md`
- `memory-bank/@architecture.md`

验证记录：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。
- `/daily`、`/insights`、`/insights?view=weekly`、`/insights?view=monthly` 和 `/toolbox` 本地返回 `200`。
- Faye 已确认继续，视为 Step 18.3 通过并进入下一步。

### ✅ Modification Step 18.4：PC 账号入口右上角与公开版设置页改造

已完成内容：

- PC 端新增顶部横条，账号状态和登录/退出入口统一放在右上角。
- 移除左侧导航底部的"当前阶段"内部卡片。
- 移除左侧导航底部的"账号状态"卡片，账号能力统一由顶部横条负责。
- 设置页改名为"账号与应用设置"，只展示用户可理解的账号信息和功能可用性状态。
- 设置页移除 Supabase URL、public key、service role key、Database URL、数据库连接检查、AI provider、AI base URL、AI API key、各复盘模型名称等内部配置字段。
- 设置页新增"功能可用性"区块，按任务管理、习惯打卡、日程记录、随手记录、洞察报告与图表、AI 复盘展示当前可用状态。
- 设置页新增"关于 AI 复盘"说明，明确 AI 是可选增强，未配置时不影响普通功能。
- 新增 `.desktop-account-button` 样式，保持与移动端账号按钮一致的视觉风格。

本次新增或更新的文件：

- `src/components/app-shell.tsx`
- `src/app/settings/page.tsx`
- `src/app/globals.css`
- `memory-bank/modification-plan.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。
- PC 端右上角能看到账号状态和登录/退出入口。
- 左侧导航底部不再显示"认证基线接入"等内部阶段说明。
- 设置页不出现 Supabase、Database URL、service role key、AI API key、AI provider 等内部配置字段。
- 未登录和已登录状态下设置页都不会泄露密钥、连接字符串或底层错误。

### ✅ Step 19.1：灵感表增加转化字段

已完成内容：

- 为 `ideas` 表新增 `converted_to_type` 字段，枚举类型为 `task` 或 `habit`。
- 新增 `converted_to_id` 字段（uuid，可选），用于记录转化后的任务或习惯 ID。
- 新增 `shelved_at` 字段（timestamp，可选），用于记录灵感搁置时间。
- 保留原有 `convertedTaskId` 字段，避免破坏已有数据。
- 更新 `src/db/schema.ts`，新增 `convertedToTypeEnum` 枚举定义和三个新字段。
- 生成迁移文件 `drizzle/0007_curved_stone_men.sql`。
- 已执行真实 Supabase 数据库迁移。

本次新增或更新的文件：

- `src/db/schema.ts`
- `drizzle/0007_curved_stone_men.sql`

验证记录：

- `npm run db:generate` 通过，识别到 ideas 表新增 3 个字段。
- `npm run db:migrate` 通过，真实 Supabase 数据库迁移成功。
- `npm run lint` 通过。
- `npm run build` 通过。

### ✅ Step 19.2：底部导航重构（5 Tab）

已完成内容：

- 将桌面端侧边栏导航保留，移动端改为底部 5 Tab 导航。
- 底部 Tab 顺序：清单（/checklist）、人生（/life）、AI（/ai）、复盘（/insights）、设置（/settings）。
- 新增 `src/components/bottom-nav.tsx` 底部导航组件，支持当前路由高亮。
- 新增 `/checklist` 清单页占位页面。
- 新增 `/ai` AI 助手页占位页面。
- 更新 `src/components/app-shell.tsx`，移除移动端顶部抽屉导航，改为底部导航。
- 桌面端（lg 及以上）保持侧边栏导航不变。
- 移动端 body 增加底部 padding（pb-16），避免内容被底部导航遮挡。
- 更新 `src/app/globals.css`，新增底部导航样式，包括固定定位、毛玻璃背景、安全区域适配和激活状态高亮。
- 根路径 `/` 默认跳转改为 `/checklist`。

本次新增或更新的文件：

- `src/components/bottom-nav.tsx`
- `src/app/checklist/page.tsx`
- `src/app/ai/page.tsx`
- `src/components/app-shell.tsx`
- `src/app/globals.css`
- `src/app/page.tsx`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过，新增 `/checklist` 和 `/ai` 路由。
- 移动端底部 5 Tab 可见且可点击。
- 桌面端侧边栏导航不受影响。

### ✅ Step 19.3：清单页重构（4类切换 + 复选框 + 周历）

已完成内容：

- 清单页 `/checklist` 顶部切换：任务 / 日程 / 习惯 / 灵感。
- 任务 + 日程 + 习惯：列表 + 复选框（标记完成/打卡）。
- 灵感：内容预览 + 日期 + 状态，无复选框。
- 视图切换：列表视图 / 周日历视图（横向滑动，每周 7 天）。
- 周历：日程和任务分别按行展示，点阵标记日期分布。
- 任务表和日程表保持独立，不合并。
- 复用现有 `updateTaskStatusAction` 和 `updateHabitCheckinAction` Server Actions。
- 新增 `src/lib/data/user-data.ts` 数据获取函数：`getChecklistTasksForUser`、`getChecklistSchedulesForUser`、`getChecklistHabitsForUser`、`getChecklistIdeasForUser`。
- 新增 `src/components/checklist/checklist-client.tsx` 客户端组件，处理 Tab 切换、视图切换和周历导航。
- 更新 `src/app/checklist/page.tsx` 服务端页面，按周范围获取数据并传入客户端组件。

本次新增或更新的文件：

- `src/components/checklist/checklist-client.tsx`
- `src/app/checklist/page.tsx`
- `src/lib/data/user-data.ts`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `/checklist` 路由可正常打开。
- 顶部 4 Tab 可切换显示对应列表。
- 列表视图和周历视图可切换。
- 周历支持上一周/下一周导航。

### ✅ Step 19.4：人生页重构（事件移入 + 3类切换）

已完成内容：

- 事件从原"随手记录"移入人生页 `/life`。
- 人生页顶部切换：事件 / 纪念日 / 礼物（3类切换）。
- 事件：内容预览 + 日期 + 情绪标签，定位为日记式记录。
- 纪念日 + 礼物：已有，移动端优化。
- 新增 `src/components/life/life-client.tsx` 客户端组件，处理 Tab 切换和列表展示。
- 新增 `src/lib/data/user-data.ts` 数据获取函数：`getLifeEventsForUser`。
- 更新 `src/app/life/page.tsx` 服务端页面，按 Tab 获取事件、纪念日和礼物数据。
- 保留纪念日和礼物的创建/编辑/软删除功能。

本次新增或更新的文件：

- `src/components/life/life-client.tsx`
- `src/app/life/page.tsx`
- `src/lib/data/user-data.ts`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `/life` 路由可正常打开。
- 顶部 3 Tab 可切换显示对应列表。
- 事件显示内容预览、日期和情绪标签。
- 纪念日和礼物列表正常显示。

### ✅ Step 19.5：AI 聊天界面 + 快捷键 + 规则解析 MVP

已完成内容：

- 新增 `/ai` AI 聊天页面，聊天式 UI，底部输入框。
- 输入框上方 6 个快捷键：创建任务 / 创建日程 / 创建习惯 / 记录事件 / 记录灵感 / 创建纪念日。
- 点击快捷键 → 指定类型 → 输入内容 → 显示确认卡片 → 确认后创建（不调用 AI 解析）。
- 不点快捷键直接输入 → 规则解析 MVP 自动识别意图 → 返回确认卡片 → 确认后创建。
- 规则解析覆盖常见句式：任务、日程、习惯、事件、灵感。
- 确认卡片展示识别结果，用户可确认创建。
- 创建成功后显示成功提示，失败显示错误提示。
- 新增 `src/components/ai/ai-chat-client.tsx` 客户端组件，处理聊天消息、快捷键、规则解析和确认创建。
- 复用现有 Server Actions：`createTaskAction`、`createScheduleItemAction`、`createHabitAction`、`createQuickRecordAction`。

本次新增或更新的文件：

- `src/components/ai/ai-chat-client.tsx`
- `src/app/ai/page.tsx`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- `/ai` 路由可正常打开。
- 聊天界面正常显示，输入框可输入。
- 快捷键点击后能指定类型并显示确认卡片。
- 直接输入时规则解析能识别常见句式。
- 确认卡片显示解析结果，用户可确认创建。

### ✅ Step 19.6：复盘页移动端优化

已完成内容：

- 洞察报告页 `/insights` 移动端布局全面优化。
- 页面标题从 1.875rem 降至 1.5rem，描述文字从 1rem 降至 0.875rem。
- 成长概览卡网格移动端单列显示。
- 复盘入口切换器 `insight-view-switcher` 移动端单列，卡片高度降至 4.5rem。
- 月/周复盘 KPI 网格移动端单列。
- 每日趋势卡片网格改为横向滚动 + scroll-snap，单卡宽度 14rem。
- 复盘分区网格移动端单列。
- 图表容器高度从 17.5rem 降至 13rem。
- 页面底部增加 5rem padding，避免内容被底部导航遮挡。
- 习惯打卡矩阵添加触摸滚动优化。
- 修复 `ai-chat-client.tsx` 编译错误：补充缺失的 `getBeijingDateValue` 函数定义。

本次新增或更新的文件：

- `src/app/globals.css`
- `src/components/ai/ai-chat-client.tsx`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- 移动端宽度下洞察报告页无明显横向溢出。
- 图表不横向溢出。
- 周/月复盘入口可点击。
- 页面底部内容不被底部导航遮挡。

### ✅ Step 19.7：独立 API 层（为小程序准备）

已完成内容：

- 新增 API Key 认证中间件 `src/lib/api/auth.ts`，支持 `x-api-key` 请求头验证。
- 新增环境变量 `API_SECRET_KEY` 和 `API_USER_ID`，用于 API 层认证和用户映射。
- 新增 5 个 Route Handler：
  - `/api/tasks`：任务列表查询（GET）、创建（POST）、更新/状态修改/软删除（PATCH）。
  - `/api/habits`：习惯列表查询（GET）、创建/打卡（POST）、更新/停用/软删除（PATCH）。
  - `/api/schedules`：日程列表查询（GET）、创建（POST）、更新/软删除（PATCH）。
  - `/api/events`：事件列表查询（GET）、创建（POST）、更新/软删除（PATCH）。
  - `/api/ideas`：灵感列表查询（GET）、创建（POST）、更新/软删除（PATCH）。
  - `/api/reviews`：复盘数据查询（GET），支持 daily/weekly/monthly 类型。
- 所有 API 接口统一返回 `{ success: true, data }` 或 `{ success: false, error }` 格式。
- 保留现有 Server Actions 供网页端使用，Route Handlers 供外部调用（小程序等）。
- 更新 `.env.example`，补充 API 环境变量说明。
- 新增 `getTasksForUser` 函数到 `user-data.ts`，支持按日期和状态过滤任务。

本次新增或更新的文件：

- `src/lib/api/auth.ts`（新增）
- `src/app/api/tasks/route.ts`（新增）
- `src/app/api/habits/route.ts`（新增）
- `src/app/api/schedules/route.ts`（新增）
- `src/app/api/events/route.ts`（新增）
- `src/app/api/ideas/route.ts`（新增）
- `src/app/api/reviews/route.ts`（新增）
- `src/lib/data/user-data.ts`（新增 `getTasksForUser`）
- `.env.example`（新增 API 环境变量）

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- 所有 API 路由在构建输出中可见（`/api/tasks`、`/api/habits`、`/api/schedules`、`/api/events`、`/api/ideas`、`/api/reviews`）。
- API Key 认证逻辑完整，无密钥时返回 503，密钥错误时返回 401。

### ✅ Modification Step 20.1：Excel 历史数据迁移 dry-run

已完成内容：

- 新增 `scripts/import_growth_plan_dry_run.py`，只解析 `Faye的成长计划.xlsx`，不连接数据库、不读取 `.env.local`、不写入真实数据。
- 新增 `scripts/README.md`，记录本地维护脚本规则和真实导入边界。
- 明确 Excel 工作表到系统表的映射：固定日程、任务、习惯、打卡记录、灵感、人生笔记、纪念日和礼物记录。
- dry-run 识别计划导入 125 条、跳过 7 条、提示 5 条。

验证记录：

- `python3 scripts/import_growth_plan_dry_run.py` 通过。
- `python3 scripts/import_growth_plan_dry_run.py --format json` 通过。
- `git diff --check` 通过。

### ✅ Modification Step 20.2：Excel 历史数据迁移真实导入准备

已完成内容：

- 新增 `scripts/import_growth_plan_apply.mjs`，支持 `plan`、`check`、`probe`、`probe-insert`、`simulate` 和 `apply` 模式。
- `plan` 不连接数据库；`check` 只读确认目标账号与现有数据量；`apply` 必须额外提供 `--confirm-import IMPORT_FAYE_GROWTH_PLAN`。
- 确认目标账号为 `2215128728@qq.com`，目标 `user_id` 为 `98779cb3-d200-4a9f-9b84-7ea206f89e0d`。
- 导入脚本按自然键查重，保留当前账号已有数据，飞书外部 ID 只用于导入期间关联，不写入业务表。

验证记录：

- `node --check scripts/import_growth_plan_apply.mjs` 通过。
- `node scripts/import_growth_plan_apply.mjs --mode plan` 通过。
- `node scripts/import_growth_plan_apply.mjs --mode check --email 2215128728@qq.com` 通过。
- `npm run lint` 通过。

### ✅ Modification Step 20.3：Excel 历史数据真实导入

已完成内容：

- 已将 `Faye的成长计划.xlsx` 中确认可迁移的数据导入 `2215128728@qq.com` 账号。
- 导入过程中发现 Node 22 + `postgres` 在连续写入时会出现 `CONNECTION_CLOSED`，脚本改为每条记录使用新连接、写完立即关闭的保守模式。
- 最终导入后只读计数：`tasks` 85、`habits` 8、`habit_checkins` 7、`schedule_items` 9、`ideas` 5、`life_events` 7、`anniversaries` 13、`gift_records` 6。
- Excel 中 2 条停用固定日程、4 条空灵感和 1 条空人生笔记保持跳过。

验证记录：

- `node scripts/import_growth_plan_apply.mjs --mode apply --email 2215128728@qq.com --confirm-import IMPORT_FAYE_GROWTH_PLAN` 完成。
- `node scripts/import_growth_plan_apply.mjs --mode check --email 2215128728@qq.com` 通过，只读确认导入后计数。
- `python3 scripts/import_growth_plan_dry_run.py` 通过。
- `node --check scripts/import_growth_plan_apply.mjs` 通过。
- `npm run lint` 通过。
- `git diff --check` 通过。

### ✅ Modification Step 21.2：清单列表与统计体验修正

已完成内容：

- 清单界面（`/checklist`）任务、日程、灵感列表改为按日期分组显示，每天一个日期标题。
- 去掉任务列表每项下方的 `status-pill` 状态标签，用复选框勾选状态表达完成与否。
- 已完成任务的标题文字加删除线（`line-through`）视觉反馈。
- 日程列表去掉右侧冗余时间 `status-pill`，时间信息保留在左侧 time chip。
- 习惯列表去掉"今日已完成/今日未完成"的 `status-pill`，复选框已足够表达。
- 灵感列表按天分组，保留状态标签（"待处理/已转任务/已搁置/已放弃"是业务状态，需保留）。
- 周历视图不受影响，保持原有矩阵展示。
- 清单界面 tab 上的统计数字改为显示**今日**的数量（而非本周）。
- 在清单页面顶部加"查看全部成长记录 →"链接，指向 `/records`。
- 周历视图的统计保持本周数量不变。
- 本项最初在计划文档中拆成 21.1 和 21.2；为避免与设置页 Step 21.1 冲突，完成态统一归并为 Step 21.2。

影响文件：

- `src/components/checklist/checklist-client.tsx`
- `src/app/checklist/page.tsx`

验证记录：

- 以对应完成时的 `npm run build` 验证为准。

### ✅ Modification Step 21.3A：人生界面数据加载排查

已完成内容：

- 排查 `/life` 页面"未加载成功"问题。
- 确认原因：已登录但数据库中 `life_events` 表无数据，属于空数据库正常表现，非 bug。
- 用户可在每日工作台记录事件后，到 `/life` 页面查看是否正常显示。
- 本项为排查记录，不涉及代码修改；后续真正的人生页加载兜底修复记录在 Step 21.7。

影响文件：

- 无代码修改，仅排查确认。

验证记录：

- 已确认非 bug。

### ✅ Modification Step 21.1：设置页登录入口与昵称编辑 + 账号注销

已完成内容：

- 未登录状态：在"账号信息"卡片显示"登录/注册"按钮，点击后跳转到登录页并保留返回路径。
- 已登录状态：
  - 显示邮箱和昵称输入框，支持修改昵称。
  - 昵称存储在 Supabase Auth 的 `user_metadata` 中，通过 `updateUser()` API 更新。
  - 昵称保存后显示成功提示，失败时显示错误提示。
- 账号注销功能：
  - 折叠在"注销账号"展开区域中，避免误触。
  - 二次确认对话框（`confirm()`）。
  - 当时注销流程只软删除部分业务表数据；后续 Modification Step 22.4 已修正为先物理删除完整业务数据，再删除 Supabase Auth 用户。
  - 注销后自动退出登录并跳转首页。

新增 Server Actions：

- `updateNicknameAction`：更新用户昵称到 `user_metadata`。
- `deleteAccountAction`：软删除用户所有业务数据并退出登录。

影响文件：

- `src/app/settings/page.tsx`
- `src/app/auth/actions.ts`

验证记录：

- `npm run build` 通过。
- 所有路由正常生成（22个路由）。

### ✅ Modification Step 21.6：AI 界面对话框样式改造

已完成内容：

- AI 界面改为类似微信聊天的对话框样式。
- 新增 `.chat-container` 统一背景框，包裹消息区域和输入区域。
- 消息气泡样式：
  - AI 消息左对齐，浅色背景（`--surface`）
  - 用户消息右对齐，深色背景（`--mist`）白色文字
  - 确认卡片左对齐，带边框
- 输入区域固定在底部，带顶部分隔线。
- 快捷键按钮放置在输入框上方，同在一个背景框内。

影响文件：

- `src/components/ai/ai-chat-client.tsx`
- `src/app/globals.css`

验证记录：

- `npm run build` 通过。
- 所有路由正常生成。

### ✅ Modification Step 21.3：清单页各模块新增按钮

已完成内容：

- 清单界面（`/checklist`）任务、日程、习惯、灵感列表右上角添加"新增"按钮。
- 点击后跳转到每日工作台对应视图并展开创建表单。
- 任务 → `/daily?view=tasks`
- 日程 → `/daily?view=schedule`
- 习惯 → `/daily?view=habits`
- 灵感 → `/daily?view=notes`
- 周历视图不受影响，保持原有矩阵展示。

影响文件：

- `src/components/checklist/checklist-client.tsx`

验证记录：

- `npm run build` 通过。
- 所有路由正常生成。

### ✅ Modification Step 21.5：AI 快捷键顺序调整 + 礼物记录

已完成内容：

- AI 界面快捷键调整为两行显示：
  - 第一行：创建任务、创建日程、创建习惯、记录灵感
  - 第二行：记录事件、创建纪念日、礼物记录
- 新增"礼物记录"快捷键，支持 AI 对话中直接创建礼物。
- 礼物记录复用 `createGiftRecordAction`，自动填充对象为"未知"、用途为"其他"。
- 快捷键区域改为 `flex-col` 布局，按 `row` 字段分组渲染。

影响文件：

- `src/components/ai/ai-chat-client.tsx`

验证记录：

- `npm run build` 通过。
- 所有路由正常生成（22个路由）。

### ✅ Modification Step 21.4：复盘页成长概览置顶

已完成内容：

- 将"成长概览"KPI 卡片移到复盘页面最上方显示（登录提示之后、AI复盘入口之前）。
- 纯 UI 顺序调整，不涉及逻辑改动。
- 成长概览只在默认视图（`overview`）显示，周复盘和月复盘视图不受影响。

影响文件：

- `src/app/insights/page.tsx`

验证记录：

- `npm run build` 通过。
- 所有路由正常生成。

### ✅ Modification Step 21.0：人生页面修复（清理重复代码）

已完成内容：

- 清理 `src/app/life/page.tsx` 中重复的纪念日/礼物 CRUD 区块（约140行代码）。
- 删除不再使用的组件：`AnniversaryForm`、`GiftRecordForm`、`AnniversaryCard`、`GiftRecordCard`。
- 删除不再使用的辅助函数：`formatDateValue`、`getBeijingDateValue`、`getDaysUntilNextAnniversary`、`getAnniversaryTitle`。
- 更新 `LifeClient` 组件，新增 `isLoggedIn` 和 `loginPath` props。
- 未登录状态在各 tab（事件/纪念日/礼物）显示清晰的登录入口。
- 页面结构统一为 `LifeClient` 组件负责所有展示逻辑，page.tsx 只负责数据获取。

影响文件：

- `src/app/life/page.tsx`
- `src/components/life/life-client.tsx`

验证记录：

- `npm run build` 通过。
- 所有路由正常生成（22个路由）。
- 移动端和PC端人生页面不再显示重复内容。

如果后续需要写入测试数据验证页面行为，测试通过后必须删除或软删除对应测试数据。

### ✅ Modification Step 21.7：人生页加载兜底与设置页昵称入口修复

已完成内容：

- 修复 `/life` 登录态下历史事件标签格式异常导致页面无法加载的问题。
- `src/lib/data/user-data.ts` 新增字符串数组运行时兜底：数组正常保留，JSON 字符串尝试解析，普通字符串作为单项标签，其他值降级为空数组。
- `/life` 页面事件、纪念日、礼物三类数据改为 `Promise.allSettled` 分组读取，单个数据源失败时不再拖垮整页，并显示统一加载提示。
- `/settings` 已有昵称时优先展示当前昵称，点击"修改昵称"才展开编辑；未设置昵称时默认展开设置区域。
- PC 右上角账号入口改为只显示昵称，点击跳转 `/settings`；退出登录入口迁入设置页。
- 账号注销确认逻辑移入客户端组件，避免服务端页面直接传递浏览器事件处理器。
- `deleteAccountAction` 清理未使用变量，保持 lint 无警告。

影响文件：

- `src/lib/data/user-data.ts`
- `src/app/life/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/auth/actions.ts`
- `src/components/app-shell.tsx`
- `src/components/settings/delete-account-submit-button.tsx`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地生产服务 `http://localhost:3003/life` 返回 `200`。
- 本地生产服务 `http://localhost:3003/settings` 返回 `200`。
- Faye 已确认人生页和设置页本轮修复通过。

### ✅ Modification Step 22.1：人生页列表分组、快捷新增与详情入口

已完成内容：

- 人生页事件 / 纪念日 / 礼物三个 tab 的列表改为按日期分组展示，避免一整条长列表直接铺开。
- 事件列表每条最多展示两行内容，点击内容进入 `/records/event/[id]` 查看和编辑详情。
- 纪念日列表标题点击进入 `/life/anniversary/[id]` 查看、编辑和软删除。
- 礼物列表标题点击进入 `/life/gift/[id]` 查看、编辑和软删除。
- 人生页三个 tab 右上角新增快捷入口：事件跳转每日工作台记录入口，纪念日和礼物在当前 tab 内展开轻量创建表单。
- 移动端人生页 tab 排版改为第一行事件，第二行纪念日和礼物。
- 新增 `/life/[kind]/[id]` 详情路由，当前支持 `anniversary` 和 `gift` 两类。
- 纪念日详情页直接展示已关联的历史礼物记录列表，礼物标题可继续点击进入礼物详情页查看和编辑。
- 礼物创建和编辑继续校验关联纪念日归属当前用户。

影响文件：

- `memory-bank/modification-plan.md`
- `src/components/life/life-client.tsx`
- `src/app/life/[kind]/[id]/page.tsx`
- `src/app/life/actions.ts`
- `src/lib/data/user-data.ts`
- `src/app/globals.css`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地生产服务 `http://localhost:3006/life` 返回 `200`。
- Faye 已确认纪念日详情页历史礼物记录改为直接展开显示。

### ✅ Modification Step 22.2：成长记录页移动端概览压缩与按天分组

已完成内容：

- 成长记录页 `/records` 的近期概览在移动端改为三列紧凑网格，减少首屏垂直占用。
- 近期记录列表从单条时间线改为按北京时间日期分组展示，接近清单页按天分隔的列表结构。
- 任务、习惯、日程、事件和灵感条目继续保留详情页跳转。
- 成长记录里的事件条目标题最多展示两行，超出内容折叠到事件详情页查看和编辑。
- 现有类型筛选和日期范围筛选继续保留，筛选后仍按日期分组。

影响文件：

- `memory-bank/modification-plan.md`
- `src/app/records/page.tsx`
- `src/app/globals.css`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地生产服务 `http://localhost:3007/records` 返回 `200`。

### ✅ Modification Step 22.3：设置页账号信息精简与每日工作台入口收敛

已完成内容：

- 设置页账号区改为紧凑摘要，昵称作为主标题，邮箱和登录状态作为次级信息。
- 已有昵称时不再展示默认展开的输入框；点击昵称旁边的笔图标才展开昵称编辑。
- 退出登录和注销账号并列显示、尺寸一致，并继续用现有颜色区分；注销账号仍保留确认弹窗。
- 根路径 `/` 继续默认进入 `/daily`。
- `/daily` 默认只展示今日概览和晚间总结入口；不再默认显示任务、习惯、日程和随手记录列表。
- 今日概览四张卡片变成快捷入口：任务、习惯、日程跳转到清单页对应 tab，随手记录跳转到人生事件列表。
- 晚间总结快捷入口跳转到复盘页 `/insights`。
- 保留 `/daily?view=...` 旧入口，供清单页新增按钮继续打开对应创建表单。

影响文件：

- `memory-bank/modification-plan.md`
- `src/app/settings/page.tsx`
- `src/components/settings/delete-account-submit-button.tsx`
- `src/app/daily/page.tsx`
- `src/app/globals.css`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地生产服务 `http://localhost:3007/daily` 返回 `200`。
- 本地生产服务 `http://localhost:3007/settings` 返回 `200`。

### ✅ Modification Step 22.4：账号数据清除与真实注销修正

已完成内容：

- 修正此前"注销账号"只退出登录、且业务数据清理不完整的问题。
- 设置页账号操作区新增"清除数据"按钮，位置在"退出登录"和"注销账号"之间。
- "清除数据"会物理删除当前账号所有业务数据，覆盖任务、习惯、习惯打卡、日程、事件、灵感、复盘报告、个人说明书、纪念日、礼物记录和工具箱记录；账号本身保留，用户保持登录。
- "注销账号"按钮文案从"确认注销账号"改为"注销账号"。
- "注销账号"会先物理删除当前账号所有业务数据，再通过 Supabase Admin API 删除 Supabase Auth 用户，最后退出登录并跳转首页。
- 注销账号需要服务端配置 `SUPABASE_SERVICE_ROLE_KEY`；未配置时不删除数据，并在设置页展示明确提示。
- 删除顺序按外键关系处理：先删除习惯打卡、礼物等子记录，再删除习惯、纪念日和任务等父记录。
- 设置页新增账号数据清除成功提示、数据清除失败提示、注销失败提示和服务端权限缺失提示。

影响文件：

- `src/app/auth/actions.ts`
- `src/app/settings/page.tsx`
- `src/components/settings/clear-data-submit-button.tsx`
- `src/components/settings/delete-account-submit-button.tsx`
- `memory-bank/modification-plan.md`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`

验证记录：

- `npm run lint` 通过。
- `npm run build` 通过。

### ✅ Modification Step 23.3：习惯详情页

完成内容：

- 清单页习惯名称添加跳转到 `/checklist/habits/[id]` 的链接。
- 新建习惯详情页，支持编辑名称、说明、分类、开始日期。
- 支持停用/重新启用习惯和软删除习惯。
- 操作完成后 redirect 回详情页并显示 feedback 提示。
- `src/lib/data/user-data.ts` 新增 `getHabitByIdForUser` 和 `HabitRecord` 类型。
- `src/app/daily/actions.ts` 的停用/删除习惯 action 支持 `source=checklist` 来源。

验证：

- `npm run build` 通过。

### ✅ Modification Step 23.2：AI 界面微信式改造

完成内容：

- AI 页面整体包裹在统一背景框 `ai-chat-shell` 内，高度自适应视口。
- 快捷键改为横向胶囊按钮工具栏，放在输入框上方。
- 用户消息靠右气泡（紫色背景），AI/系统消息靠左气泡（浅色背景）。
- 确认卡片内嵌在 AI 气泡中，带确认按钮。
- 输入框固定在底部，发送按钮为图标按钮。
- 移动端适配：消息气泡最大宽度 90%，快捷按钮缩小。

验证：

- `npm run build` 通过。

### ✅ Modification Step 23.1：清单/人生页内就地新建 + 每日工作台收敛

完成内容：

- 清单页（任务/日程/习惯/灵感）"新增"按钮改为 `<details>` 内联表单，提交后留在当前页面。
- 人生页事件 tab 新增按钮改为内联表单，支持内容、日期、AI 权限、情绪标签和普通标签。
- 每日工作台移除各模块创建表单区块，"新增"按钮改为跳转清单页或人生页对应 tab。
- 新建 `src/app/checklist/actions.ts` 处理清单页就地创建（任务/日程/习惯/灵感/事件）。
- 清单页和人生页支持创建成功/失败的 feedback 提示。
- 空状态提示文案更新为引导用户点击"新增"。

验证：

- `npm run build` 通过。

### ✅ Modification Step 23.5：纪念日增强 + 数据库迁移

完成内容：

- 纪念日新增 `type` 字段（纪念日/生日），`anniversary_type` 数据库枚举。
- 纪念日新增 `reminderMode` 字段（一次性/按年），`reminder_mode` 数据库枚举。
- 纪念日新增 `isLunar` 布尔字段，支持生日农历标记。
- 礼物记录 `purpose` 字段改名为 `return_gift`（对方回礼），改为非必填项。
- 执行真实数据库迁移（`0008_anniversary_enhancements.sql`）。
- 更新 `src/db/schema.ts`、`src/lib/data/user-data.ts`、`src/app/life/actions.ts`。
- 更新 `src/components/life/life-client.tsx` 表单 UI：纪念日新增类型、提醒模式、农历复选框；礼物用途改为对方回礼并选填。
- 更新 `src/app/life/[kind]/[id]/page.tsx` 详情页和编辑表单。
- 历史数据兼容：迁移脚本自动将 `purpose` 数据复制到 `return_gift`。

验证：

- `npm run db:migrate` 通过，真实 Supabase 数据库迁移成功。
- `npm run build` 通过。

### ✅ Modification Step 23.6：成长记录全部历史数据

完成内容：

- 日期范围筛选项"全部近期"改为"全部历史"，取消数量限制。
- 保留"今天"和"最近 7 天"快捷筛选。
- 移除 `timelineLimit = 40` 的全局截断。
- wrapper 函数改为接受 `limit` 参数，"全部历史"模式下 limit 设为 9999。
- 页面文案更新：近期概览 → 历史概览，近期记录 → 历史记录。
- 默认筛选从 `recent` 改为 `all`。

验证：

- `npm run build` 通过。

### ✅ Modification Step 23.7：顶部纪念日提醒横幅

完成内容：

- 人生页和成长记录页顶部新增纪念日提醒横幅。
- 显示未来 7 天内和当天的纪念日/生日，按时间排序。
- 区分"今天"和"X 天后"提示文案。
- 新增 `getUpcomingAnniversariesForUser` 数据函数，支持按年提醒模式自动计算下次日期。
- 新增 `UpcomingAnniversary` 类型。
- 横幅中纪念日标题可点击进入详情页。

验证：

- `npm run build` 通过。

## Not Started

- 自定义正式域名绑定
- AI 复盘生产环境变量配置

## Next Step Candidate

下一阶段候选：继续观察每日工作台入口收敛后的真实使用体验，确认清单页新增入口、人生事件入口和复盘入口是否需要进一步调整。
