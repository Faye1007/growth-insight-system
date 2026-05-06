# Growth Insight System - Architecture

## 1. Current Stage

当前项目已完成基础闭环、Step 8.1 架构文档更新、Step 8.2 进度文档更新、Row Level Security 前置规划、Supabase SSR client 用户态读写迁移、本地 RLS 策略迁移文件生成、真实数据库 RLS 启用、AI 可选部署前置调整、Vercel 正式部署基础验收、部署前最终测试、Step 10.1 任务编辑与软删除、Step 10.2 日程编辑与软删除、Step 10.3 事件编辑与软删除、Step 10.4 灵感编辑与软删除、Step 10.5 习惯维护、Step 11.1 写入区默认收起、Step 11.2 今日概览卡快捷入口、Step 11.3 移动端工作台优化、Step 12.1 个人说明书读取与保存和 Step 12.2 个人说明书手动编辑，具备 Next.js App Router 基础应用骨架、初始目录结构、共享导航、基础页面壳、基础视觉规范、Supabase 客户端接入基线、Drizzle schema、迁移流程、认证入口、未登录写入拦截基线、安全跳转、登录后写入保护 helper、每日工作台页面结构、今日任务创建、任务状态更新、任务编辑与软删除、习惯创建、习惯打卡、习惯编辑与停用、今日日程记录、日程编辑与软删除、随手记录、事件编辑与软删除、灵感编辑与软删除、四类写入区默认收起、今日概览快捷新增入口、每日工作台移动端样式优化、今日概览程序统计、成长记录统一时间线、成长记录基础筛选、记录详情查看、洞察报告页面壳、任务完成率图表、习惯打卡图表、记录数量趋势、情绪基础统计、AI 配置检查能力、AI Provider Adapter 基础能力、每日复盘上下文生成能力、每日程序复盘摘要、每日复盘发送预览能力、手动生成每日 AI 复盘能力、AI 成本控制边界验证、个人说明书读取与完整字段手动编辑、设置页基础信息展示、统一错误提示规范、基础闭环手工验收记录、RLS 接入验证记录、线上基础路由可用性验证记录和部署前核心闭环测试记录。

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
- 设置页 AI 配置状态展示。
- 真实 `.env.local` 本地配置，包含 Supabase public client 配置和 `DATABASE_URL`，但不进入 Git。
- Drizzle ORM、Drizzle Kit 和 Postgres client 依赖。
- `drizzle.config.ts` 迁移配置。
- `src/db/schema.ts` 基础数据表 schema。
- `src/db/index.ts` 服务端数据库查询入口，保留给迁移、设置页数据库健康检查和必要的服务端内部维护用途。
- `src/lib/data/user-data.ts` 用户态业务数据访问层，使用 Supabase SSR client 携带当前用户会话，并继续显式限定 `user_id`。
- `drizzle/0000_true_silver_sable.sql` 第一版迁移 SQL。
- 真实 Supabase 数据库中的第一批 8 张基础业务表。
- `/login` 登录/注册页面。
- `/auth/confirm` Supabase 邮箱确认回调路由。
- Supabase Auth 登录、注册、退出 Server Actions。
- 当前用户读取 helper。
- 登录页安全跳转 helper。
- 登录后写入保护 helper。
- 侧边栏账号状态展示。
- 每日工作台页面结构，包括顶部日期、今日概览、今日任务、习惯打卡、今日日程和随手记录分区。
- 每日工作台未登录写入拦截提示。
- 每日工作台四个创建表单默认收起，分别通过新建任务、添加习惯、记录日程和写一条记录入口展开；创建失败时对应表单自动展开并显示反馈。
- 每日工作台今日任务创建表单。
- 今日任务保存 Server Action。
- 今日任务状态更新 Server Action。
- 当前登录用户今日任务读取和列表展示。
- 今日任务按状态分组展示。
- 今日任务状态操作，包括进行中、已完成和延期。
- 今日任务编辑入口，可修改标题、分类、日期、状态、说明和复盘备注。
- 今日任务软删除入口，删除后写入 `deleted_at`，不物理删除数据。
- 延期任务日期同步更新和延期来源记录。
- 今日概览中的任务完成率读取真实今日任务数据。
- 每日工作台习惯创建表单。
- 习惯保存 Server Action。
- 习惯打卡和取消打卡 Server Action。
- 当前登录用户启用习惯读取和列表展示。
- 今日习惯编辑入口，可修改习惯名称、分类、说明和开始日期。
- 今日习惯停用入口，停用后写入 `is_active = false`，历史打卡记录保留。
- 当前登录用户习惯打卡记录读取、今日状态、累计次数和连续天数计算。
- 今日概览中的习惯卡读取真实启用习惯数量和今日已完成数量。
- 每日工作台日程创建表单。
- 今日日程保存 Server Action。
- 当前登录用户今日日程读取和按开始时间排序展示。
- 今日日程编辑入口，可修改标题、分类、日期、开始时间、结束时间和说明。
- 今日日程软删除入口，删除后写入 `deleted_at`，不物理删除数据。
- 今日概览中的日程卡读取真实今日日程数量。
- 每日工作台随手记录表单。
- 事件和灵感保存 Server Action。
- 当前登录用户今日事件和灵感读取、列表展示和数量统计。
- 今日事件编辑入口，可修改内容、日期、情绪标签、普通标签、AI 分析权限、具体事件、下次行动和摘要。
- 今日事件软删除入口，删除后写入 `deleted_at`，不物理删除数据。
- 今日灵感编辑入口，可修改内容、日期、状态和处理说明。
- 今日灵感软删除入口，删除后写入 `deleted_at`，不物理删除数据。
- 今日概览中的随手记录卡读取真实今日事件和灵感数量。
- 今日概览卡明确使用程序统计，不调用 AI。
- 今日概览展示任务完成率、习惯完成数、日程数量、随手记录数量，并补充任务总数、进行中数量、延期数量、事件数量和灵感数量。
- 今日概览四张卡提供快捷新增入口：今日任务新建、习惯打卡添加、今日日程记录、随手记录写入；登录用户点击后跳转并展开对应创建表单，未登录用户点击后进入登录流程。
- 每日工作台手机宽度下已优化卡片内边距、状态标签换行、列表操作区、延期日期输入、编辑表单按钮和复盘操作区，避免常见横向溢出和按钮拥挤。
- 成长记录页读取当前登录用户近期任务、习惯打卡、日程、事件和灵感，并按创建时间倒序合并为统一时间线。
- 成长记录页按任务、习惯、日程、事件和灵感统计当前载入数量。
- 成长记录页支持通过 URL query 参数按记录类型和日期范围筛选。
- 成长记录时间线条目可以进入详情页。
- 记录详情页按当前登录用户 ID 查询任务、习惯打卡、日程、事件和灵感详情；任务、日程、事件和灵感详情页支持编辑和软删除，习惯打卡详情页支持查看历史打卡并维护对应习惯。
- 洞察报告页读取当前登录用户最近 7 天任务、启用习惯、习惯打卡、日程、事件和灵感数据。
- 洞察报告页展示今日概览、本周趋势、习惯状态和情绪记录四个基础程序统计区块。
- 洞察报告页使用 Recharts 展示最近 7 天任务完成率柱状图。
- 洞察报告页使用 Recharts 和点阵展示启用习惯最近 7 天打卡情况。
- 洞察报告页展示启用习惯今日状态、最近 7 天完成数和连续天数。
- 洞察报告页使用 Recharts 展示最近 7 天随手记录数量趋势，并按事件和灵感拆分。
- 洞察报告页使用 Recharts 展示最近 7 天手动情绪标签基础统计。
- 洞察报告页未登录状态显示页面结构和登录提示，不读取个人数据。
- 任务完成率图表组件。
- 习惯打卡图表组件。
- 记录数量趋势图表组件。
- 情绪基础统计图表组件。
- AI 配置状态 helper。
- AI Provider Adapter 基础类型、运行时配置读取和 OpenAI-compatible 调用入口。
- 每日复盘上下文生成服务。
- 每日工作台每日复盘发送预览入口。
- 每日工作台每日程序复盘摘要；未配置 AI 时仍可查看基础复盘，不触发 AI 调用。
- 每日复盘事件原文候选勾选与移除交互。
- 每日复盘确认生成 Server Action；仅在 AI 配置完整时从页面开放提交入口。
- 今日复盘报告缓存展示。
- AI 成本控制边界已验证：普通任务、习惯、日程、随手记录、页面打开和发送预览不调用 AI；只有确认生成复盘时才进入 AI provider adapter；已有今日复盘报告时读取缓存。
- 设置页数据库只读健康检查，使用服务端 `DATABASE_URL` 执行 `select 1`，只展示连接状态，不展示连接字符串或底层错误。
- 个人说明书页读取当前登录用户的 `personal_manuals` 记录；未创建时显示空白可编辑状态；支持手动编辑当前人生阶段、主要目标、能力画像、情绪模式、高能量来源、常见内耗点、反复出现的问题和适合自己的行动建议风格；保存时按当前 `user_id` upsert，未登录用户只能看到登录提示。
- 统一错误提示文案层和提示组件。
- 每日工作台写入失败兜底提示。
- 每日复盘生成失败分类提示。
- 应用级加载失败页。
- 基础闭环手工验收数据已写入真实 Supabase 数据库，验证任务、习惯、打卡、日程、事件、灵感和每日复盘缓存能形成基础闭环。
- 事件原文敏感内容基础判定规则。
- 任务分类和状态的统一选项定义。

尚未开始：

- 个人说明书与复盘上下文预留关联。

目标技术方向：

```text
Next.js App Router
  ↓
Server Actions / Route Handlers
  ↓
Domain Services
  ↓
Supabase Postgres via Supabase SSR client for user data
  ↓
AI Provider Adapter for scheduled/manual reviews
```

### 1.1 Current Skeleton File Roles

当前 Step 1.1-Step 12.2 建立应用骨架、目录、页面壳、基础视觉规范、Supabase 客户端接入基线、Drizzle schema、数据库迁移流程、认证入口、未登录写入拦截基线、安全跳转、写入保护 helper、每日工作台结构、今日任务创建、任务状态更新、任务编辑与软删除、习惯创建、习惯打卡、习惯编辑与停用、今日日程记录、日程编辑与软删除、随手记录、事件编辑与软删除、灵感编辑与软删除、写入区默认收起、今日概览快捷新增入口、每日工作台移动端样式优化、今日概览程序统计、成长记录统一时间线、基础筛选、记录详情查看、洞察报告页面壳、任务完成率图表、习惯打卡图表、记录数量趋势、情绪基础统计、AI 配置检查、AI Provider Adapter 基础能力、每日复盘上下文生成能力、每日复盘发送预览能力、手动生成每日复盘能力、AI 成本控制边界验证、个人说明书读取与完整字段手动编辑、设置页基础信息展示、统一错误提示规范、基础闭环手工验收记录、RLS 接入验证记录、线上基础路由可用性验证记录、部署前最终测试记录和任务/习惯/日程/事件/灵感维护能力。各文件职责如下：

- `package.json`: 定义项目名称、运行脚本和基础依赖。当前脚本包括 `dev`、`build`、`start`、`lint`、`db:generate`、`db:migrate` 和 `db:studio`；依赖包括 Supabase SSR/client 包、Drizzle ORM、Postgres client 和 Recharts。
- `tsconfig.json`: TypeScript 配置，启用严格模式，并设置 `@/*` 指向 `src/*`。
- `next-env.d.ts`: Next.js 自动类型声明入口。
- `next.config.ts`: Next.js 配置文件，当前保持最小配置。
- `postcss.config.mjs`: Tailwind CSS v4 的 PostCSS 插件配置。
- `eslint.config.mjs`: ESLint flat config，直接导入 Next 16 的 `eslint-config-next/core-web-vitals` 和 `eslint-config-next/typescript`。
- `package-lock.json`: npm 依赖锁文件，用于固定依赖解析结果，保证后续安装、数据库工具和验证更稳定。
- `components.json`: shadcn/ui 配置，指定 UI 组件别名、样式入口和图标库。
- `.gitignore`: 忽略依赖、构建产物、环境变量、本地调试日志和 TypeScript 构建缓存。
- `src/app/layout.tsx`: App Router 根布局，定义页面 HTML 语言和全局 metadata。
- `src/app/error.tsx`: 应用级加载失败页，页面加载异常时显示面向用户的重试提示，不展示底层技术堆栈。
- `src/app/page.tsx`: 成长主页页面壳，展示今日行动进度、本周指标、最近复盘和每日工作台入口等占位区。
- `src/app/daily/page.tsx`: 每日工作台页面结构，显示北京时间日期、今日概览、今日任务、习惯打卡、今日日程、随手记录和每日复盘入口；今日概览已接入真实程序统计，显示任务完成率、习惯完成数、日程数量、随手记录数量、任务细分和记录细分，不调用 AI；今日概览四张卡提供快捷新增入口，登录用户点击后通过 `create` query 参数定位并展开对应创建表单，未登录用户点击后进入登录流程并保留返回路径；今日任务分区已接入默认收起的任务创建表单、当前用户今日任务列表、按状态分组展示、状态操作、延期日期选择、任务详情入口、任务编辑入口、任务软删除入口和任务完成率统计；习惯打卡分区已接入默认收起的习惯创建表单、当前用户启用习惯列表、习惯编辑入口、习惯停用入口、今日打卡状态、累计打卡次数、连续打卡天数和今日习惯完成数统计；今日日程分区已接入默认收起的日程创建表单、当前用户今日日程列表、日程详情入口、日程编辑入口、日程软删除入口和今日日程数量统计；随手记录分区已接入默认收起的事件/灵感创建表单、当前用户今日事件和灵感列表、事件详情入口、事件编辑入口、事件软删除入口、灵感详情入口、灵感编辑入口、灵感软删除入口、情绪标签和 AI 分析权限显示；四类创建表单在创建错误时自动展开，保存成功后仍回到对应模块并展示反馈；每日复盘入口支持登录用户打开程序复盘预览，展示统计摘要、程序摘要、关键摘要和事件原文候选，用户可以取消勾选某条原文；AI 未配置时确认生成按钮不可用，AI 配置完整后确认生成提交到服务端 Action，生成后展示今日复盘报告；同一天已有完成报告时展示缓存报告，不自动重复调用 AI。
- `src/app/daily/actions.ts`: 每日工作台 Server Actions，当前提供 `createTaskAction()`、`updateTaskStatusAction()`、`updateTaskAction()`、`softDeleteTaskAction()`、`createHabitAction()`、`updateHabitAction()`、`deactivateHabitAction()`、`updateHabitCheckinAction()`、`createScheduleItemAction()`、`updateScheduleItemAction()`、`softDeleteScheduleItemAction()`、`createQuickRecordAction()`、`updateLifeEventAction()`、`softDeleteLifeEventAction()`、`updateIdeaAction()`、`softDeleteIdeaAction()` 和 `generateDailyReviewAction()`；写入任务、更新任务状态、编辑任务、软删除任务、创建习惯、编辑习惯、停用习惯、更新习惯打卡、创建日程、编辑日程、软删除日程、保存随手记录、编辑事件、软删除事件、编辑灵感、软删除灵感和生成每日复盘前必须通过 `requireCurrentUser()` 获取当前登录用户，并把数据写入或限定更新到当前用户的 `user_id`；任务、习惯、打卡、日程、事件和灵感写入失败时会跳回对应页面区块并展示统一错误提示，不展示底层错误；每日复盘生成 Action 会先查同一天缓存报告，已有完成报告时直接返回缓存，不调用 AI；无缓存时才按发送预览选择调用 AI Provider Adapter，并把输出保存到 `insight_reports`；每日复盘生成失败按上下文准备失败、AI 配置缺失、AI provider 调用失败和复盘保存失败分类提示。
- `src/app/records/page.tsx`: 成长记录页面，服务端读取当前登录用户的近期任务、习惯打卡、日程、事件和灵感，按创建时间倒序合并为统一时间线；页面顶部显示按记录类型统计的当前载入数量；支持通过 URL query 参数按记录类型筛选和日期范围筛选，当前类型包括全部、任务、习惯、日程、事件和灵感，日期范围包括全部近期、今天和最近 7 天；未登录用户可以浏览页面结构并看到登录提示，登录返回路径会保留当前筛选 URL；时间线条目链接到对应详情页。
- `src/app/records/[kind]/[id]/page.tsx`: 成长记录详情页，支持 `task`、`habit`、`schedule`、`event` 和 `idea` 五类记录详情；任务详情支持编辑标题、分类、日期、状态、说明、复盘备注和软删除；习惯打卡详情展示历史打卡，同时支持编辑对应习惯的名称、分类、说明、开始日期和停用状态；日程详情支持编辑标题、分类、日期、开始时间、结束时间、说明和软删除；事件详情支持编辑内容、日期、情绪标签、普通标签、AI 分析权限、具体事件、下次行动、摘要和软删除；灵感详情支持编辑内容、日期、状态、处理说明和软删除；未登录用户看到登录提示；登录用户只能查询当前用户 ID 下的数据；不存在、已删除或不属于当前账号的记录显示未找到/无权限状态。
- `src/app/insights/page.tsx`: 洞察报告页面，服务端读取当前登录用户最近 7 天任务、启用习惯、习惯打卡、日程、事件和灵感数据；页面分区包括今日概览、本周趋势、记录数量趋势、习惯状态、情绪记录和后续复盘提示；本周趋势区已接入最近 7 天任务完成率图表和每日趋势卡；记录数量趋势区已接入最近 7 天事件和灵感堆叠柱状图；习惯状态区已接入最近 7 天习惯打卡图表、每日点阵、今日状态、最近 7 天完成数和连续天数；情绪记录区已接入最近 7 天手动情绪标签统计图表和计数卡片；当前只做程序统计，不调用 AI。
- `src/app/manual/page.tsx`: 个人说明书页面，未登录用户只显示登录提示；登录用户读取当前账号的 `personal_manuals` 记录，未创建时显示空白可编辑状态；当前支持手动编辑当前人生阶段、主要目标、能力画像、情绪模式、高能量来源、常见内耗点、反复出现的问题和适合自己的行动建议风格。
- `src/app/manual/actions.ts`: 个人说明书 Server Action，当前提供 `savePersonalManualAction()`；保存前必须通过 `requireCurrentUser()` 获取当前登录用户，并按当前 `user_id` upsert 完整手动编辑字段到 `personal_manuals`。
- `.env.example`: 环境变量模板，只列出需要配置的字段，不保存真实密钥；标注首版部署必填 Supabase public 配置和 `DATABASE_URL`，AI 配置为后续可选项。
- `src/app/settings/page.tsx`: 设置页展示应用运行状态、账号登录状态、Supabase 配置状态、数据库只读健康检查结果和 AI 配置状态；数据库健康检查使用独立短连接执行 `select 1`，成功时显示连接正常，失败时显示连接异常；只显示是否配置和连接状态，不展示密钥、token、API key、连接字符串或底层错误堆栈；明确 AI 是可选增强，未配置 AI 时普通记录、程序摘要、统计和图表仍可正常使用。
- `src/app/login/page.tsx`: 邮箱登录和注册页面，支持 `next` 参数把用户带回原页面。
- `src/app/auth/actions.ts`: Supabase Auth Server Actions，负责登录、注册和退出。
- `src/app/auth/confirm/route.ts`: Supabase 邮箱确认回调路由，成功后跳转到安全的 `next` 路径，失败时回到登录页。
- `src/app/globals.css`: 全局样式入口，导入 Tailwind CSS，定义基础视觉 token、字体、页面标题、卡片、列表、状态标签、基础按钮、导航样式、每日概览卡、今日概览卡快捷入口、今日概览进度条、洞察报告统计网格、洞察报告趋势卡、任务完成率图表容器、习惯打卡图表容器和点阵、记录数量趋势图表容器、情绪基础统计图表容器、成长记录时间线、记录概览统计、成长记录筛选控件、记录详情字段、工作台面板、空状态、创建区收起面板、任务表单、任务编辑表单、删除危险区、任务列表、任务状态分组、状态操作按钮、延期日期输入、习惯统计标签行、每日复盘预览区、每日复盘报告区、文本域、表单提示和每日工作台移动端适配样式。
- `src/components/app-shell.tsx`: 共享应用壳，负责左侧或顶部主导航、导航图标、品牌区、当前阶段提示、账号状态和退出入口，并把页面内容包裹在统一布局中。
- `src/components/feedback-message.tsx`: 统一提示组件，接收 `FeedbackMessage` 数据后按成功、错误或信息提示渲染标题和详情；错误提示使用 `alert` 语义，普通提示使用 `status` 语义。
- `src/components/insights/task-completion-chart.tsx`: 任务完成率图表客户端组件，使用 Recharts 渲染最近 7 天每日任务完成率；只接收服务端页面整理后的图表数据，不读取数据库，不接触密钥。
- `src/components/insights/habit-checkin-chart.tsx`: 习惯打卡图表客户端组件，使用 Recharts 渲染启用习惯最近 7 天完成数，并用点阵展示每日是否打卡；只接收服务端页面整理后的图表数据，不读取数据库，不接触密钥。
- `src/components/insights/record-trend-chart.tsx`: 记录数量趋势图表客户端组件，使用 Recharts 渲染最近 7 天事件和灵感数量堆叠柱状图；只接收服务端页面整理后的图表数据，不读取数据库，不接触密钥，不调用 AI。
- `src/components/insights/emotion-stats-chart.tsx`: 情绪基础统计图表客户端组件，使用 Recharts 渲染最近 7 天事件记录中的手动情绪标签出现次数；只接收服务端页面整理后的图表数据，不读取数据库，不接触密钥，不调用 AI。
- `src/components/.gitkeep`: 保留业务组件目录。
- `src/components/ui/.gitkeep`: 保留 shadcn/ui 组件目录。
- `src/contexts/.gitkeep`: 保留 React context 目录。
- `src/db/.gitkeep`: 保留数据库 schema 和 query 目录。
- `src/lib/ai/config.ts`: AI 配置状态和运行时配置 helper，读取 `AI_PROVIDER`、`AI_BASE_URL`、`AI_API_KEY`、`AI_MODEL_DAILY`、`AI_MODEL_WEEKLY` 和 `AI_MODEL_MONTHLY` 是否存在，并按 `daily`、`weekly`、`monthly` 选择对应模型；不暴露 `AI_API_KEY` 明文。
- `src/lib/ai/types.ts`: AI Provider Adapter 的共享类型，定义 `ReviewType`、`GenerateReviewInput`、`GenerateReviewOutput` 和 `AiProviderClient`。
- `src/lib/ai/openai-compatible.ts`: OpenAI-compatible provider 实现，负责构造 `chat/completions` 请求、发送服务端请求、解析 JSON 复盘结果并规范化输出。
- `src/lib/ai/provider.ts`: AI Provider Adapter 统一入口，当前根据复盘类型读取运行时配置，并提供 `generateReview()`；缺少 AI 配置时抛出 `AiConfigurationError`，不会回退到前端或暴露密钥。
- `src/lib/ai/daily-review-context.ts`: 每日复盘上下文生成服务，按当前用户和北京时间日期读取任务、启用习惯、习惯打卡、日程、事件和灵感，生成结构化统计、关键摘要、事件原文候选、敏感降级事件和后续 AI adapter 可用的 `aiInput`；并提供按用户勾选的事件 ID 过滤原文候选的 helper；该过程不调用 AI。
- `src/lib/ai/sensitive-rules.ts`: 事件原文敏感内容基础判定规则，当前识别手机号、身份证、银行卡、详细地址、密钥/token、医疗隐私和高度私密关系内容；命中后供每日复盘上下文服务降级为摘要参与。
- `src/lib/supabase/config.ts`: 读取 Supabase 环境变量，提供 public client 配置校验和设置页状态检查。
- `src/lib/supabase/client.ts`: 浏览器端 Supabase client 工厂，只使用 `NEXT_PUBLIC_*` 配置。
- `src/lib/supabase/server.ts`: 服务端 Supabase client 工厂，使用 Next.js cookies 接入 SSR 会话能力。
- `src/lib/auth/paths.ts`: 认证路径工具，统一校验登录页 `next` 参数，并生成登录、注册和写入拦截提示 URL。
- `src/lib/auth/session.ts`: 当前用户读取和写入保护 helper，封装 Supabase `auth.getUser()`；`getCurrentUser()` 认证未就绪时返回 `null`，`requireCurrentUser()` 用于后续写入类 Server Action，未登录时跳转登录页。
- `src/lib/feedback.ts`: 统一错误和状态提示文案层，集中管理登录、每日工作台写入、每日复盘生成和个人说明书保存等 query code 对应的用户提示；文案只说明发生了什么和下一步怎么做，不包含技术堆栈、连接字符串或密钥。
- `src/lib/tasks/options.ts`: 任务分类和任务状态的统一选项定义，提供英文枚举值、中文显示文案、状态分组顺序和合法性校验。
- `drizzle.config.ts`: Drizzle Kit 配置，读取 `.env.local` 中的 `DATABASE_URL`，用于生成和执行迁移。
- `drizzle/0000_true_silver_sable.sql`: 第一版数据库迁移 SQL，创建基础枚举、8 张基础业务表、索引和内部外键。
- `drizzle/0001_rls_user_policies.sql`: RLS 策略迁移 SQL，已在真实 Supabase 数据库为 8 张业务表启用 RLS，并创建按 `auth.uid() = user_id` 隔离的基础策略。
- `drizzle/meta/`: Drizzle 迁移快照和迁移日志元数据，用于后续增量迁移。
- `src/db/schema.ts`: Drizzle schema，定义 `tasks`、`habits`、`habit_checkins`、`schedule_items`、`life_events`、`ideas`、`insight_reports` 和 `personal_manuals`。
- `src/db/index.ts`: 服务端数据库入口，使用 `DATABASE_URL` 创建 Drizzle client；当前保留给 Drizzle schema、迁移、设置页数据库健康检查和必要的服务端内部维护用途，不作为普通登录用户请求的主读写通道。
- `src/lib/data/user-data.ts`: 服务端用户态数据访问入口，使用 Supabase SSR client 执行每日工作台、成长记录、详情页、洞察报告、每日复盘和个人说明书相关读写；当前包含任务创建、状态更新、编辑、软删除，习惯创建、编辑、停用、打卡，日程创建、编辑、软删除，事件创建、编辑、软删除，灵感创建、编辑和软删除，以及个人说明书读取和 upsert 保存能力；所有查询和写入仍显式限定当前 `user_id`，不只依赖 RLS。
- `src/lib/utils.ts`: 通用工具函数入口，当前提供 `cn()` 用于合并 Tailwind className。

### 1.2.1 Production Deployment Snapshot

当前正式部署状态：

- Vercel 正式域名为 `https://growth-insight-system.vercel.app/`。
- Supabase Auth 已配置正式域名 Redirect URL。
- Vercel 首版部署只要求 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 和 `DATABASE_URL`。
- AI 环境变量当前为可选项；未配置 AI 时，每日复盘显示程序摘要，普通记录、统计和图表可继续使用。
- 外部路由检查确认 `/`、`/daily`、`/login`、`/insights` 和 `/settings` 返回 `HTTP 200`。
- 部署前最终测试已完成；测试重点覆盖任务、习惯、打卡、日程、事件、灵感、程序复盘、成长记录和洞察报告核心闭环。

当前基础闭环遵循的约束：

- 已接入 Supabase client 工具层，并已配置真实 Supabase public client 与 `DATABASE_URL` 到本地 `.env.local`。
- `.env.local` 被 Git 忽略，不能提交真实密钥、token 或连接字符串。
- 已建立 Drizzle schema 和迁移流程，并已将第一批基础表迁移到真实 Supabase 数据库。
- 已接入认证入口和未登录写入拦截基线。
- 已建立统一安全跳转逻辑，避免登录和邮箱确认流程出现开放跳转。
- 已建立 `requireCurrentUser()` 写入保护 helper，后续真实写入 Action 必须先通过它拿到当前用户。
- 已建立每日工作台页面结构，今日任务创建、任务状态更新、习惯创建、习惯打卡、习惯编辑与停用、今日日程记录和随手记录已优先接入该页面。
- 每日工作台的任务、习惯、日程和随手记录创建表单默认收起，用户点击对应新增入口后展开；保存失败时对应表单自动展开并显示统一反馈。
- 今日概览四张卡已经增加快捷入口，登录用户点击后定位并展开对应创建表单，未登录用户点击后进入登录流程。
- 每日工作台移动端样式已做专项优化：小屏下卡片内边距收紧、状态标签可换行、列表操作区采用双列网格、延期日期输入占满可用宽度、编辑和复盘操作按钮更适合触控。
- 个人说明书已接入 `personal_manuals` 表读取和保存；登录用户可以编辑完整手动字段并刷新读回，未登录用户不能保存。
- 今日任务创建 Server Action 已调用 `requireCurrentUser()`，并把任务写入当前用户的 `tasks.user_id`。
- 今日任务状态更新 Server Action 已调用 `requireCurrentUser()`，并按当前用户 ID 限定任务读取和更新范围。
- 今日任务列表只按当前登录用户 ID、北京时间今日日期和未软删除条件查询，并按统一状态顺序分组展示。
- 今日任务支持标记为进行中、已完成和延期；标记已完成时写入 `completed_at`，标记延期时同步更新 `task_date`、`is_postponed`、`postponed_from_date` 和 `postponed_to_date`。
- 今日任务完成率由程序根据今日任务总数和已完成任务数计算，不调用 AI。
- 习惯创建 Server Action 已调用 `requireCurrentUser()`，并把习惯写入当前用户的 `habits.user_id`。
- 新习惯默认 `is_active = true`，分类复用任务分类，开始日期默认按北京时间今天。
- 启用习惯列表只按当前登录用户 ID、启用状态和未软删除条件查询。
- 习惯编辑 Server Action 已调用 `requireCurrentUser()`，并按当前用户 ID 和未软删除条件限定更新范围。
- 习惯停用 Server Action 已调用 `requireCurrentUser()`，并写入 `habits.is_active = false`；停用不删除 `habit_checkins` 历史打卡记录。
- 习惯打卡 Server Action 已调用 `requireCurrentUser()`，并校验习惯属于当前用户、处于启用状态且未软删除。
- 习惯打卡使用 `habit_checkins` 的 `habit_id + checkin_date` 唯一约束做 upsert；今日打卡写入或更新为 `status = checked`，取消今日打卡写入或更新为 `status = skipped`，避免同一习惯同一天生成重复有效记录。
- 习惯累计次数由该习惯所有 `status = checked` 的有效日期计算。
- 习惯连续天数从北京时间今日向前逐日计算；今日未打卡时连续天数显示为 0，漏打一天后连续天数断掉。
- 今日概览习惯卡显示当前启用习惯数和今日已完成打卡数。
- 日程创建 Server Action 已调用 `requireCurrentUser()`，并把日程写入当前用户的 `schedule_items.user_id`。
- 新日程最少包含标题、分类、日期和开始时间，结束时间可选；分类复用任务分类，日期默认按北京时间今天。
- 今日日程列表只按当前登录用户 ID、北京时间今日日期和未软删除条件查询，并按开始时间、创建时间排序展示。
- 今日概览日程卡显示当前用户今日真实日程数量。
- 随手记录保存 Server Action 已调用 `requireCurrentUser()`，并根据记录类型分别写入 `life_events` 或 `ideas`。
- 事件最少包含内容、日期和 AI 分析权限；情绪标签和普通标签可选；新事件默认 `ai_analysis_permission = summary_only`。
- 灵感最少包含内容和日期；新灵感默认 `status = to_review`。
- 今日事件列表只按当前登录用户 ID、北京时间今日日期和未软删除条件查询，按创建时间倒序展示。
- 今日灵感列表只按当前登录用户 ID、北京时间今日日期和未软删除条件查询，按创建时间倒序展示。
- 今日概览随手记录卡显示当前用户今日事件和灵感的真实总数。
- 保存事件或灵感不会触发 AI 调用；AI 只保留到后续复盘生成入口。
- 未登录用户仍可浏览页面。
- 未登录用户触发每日工作台写入入口时跳转登录提示。
- 登录用户可在侧边栏看到账号状态并退出。
- Supabase Auth 邮件确认完整链路需要在 Supabase Dashboard 中确认 Redirect URL 允许 `http://localhost:3001/auth/confirm`。
- 当前已建立 AI Provider Adapter 基础能力、每日复盘上下文生成能力、每日复盘发送预览能力和手动生成每日复盘能力。页面打开和预览不会调用 AI；只有用户确认生成时才调用 AI。
- 不配置 `SUPABASE_SERVICE_ROLE_KEY`，除非后续步骤确实需要并单独确认。
- 已完成基础页面壳、导航、基础视觉规范和真实基础数据闭环。
- 页面视觉应保持个人 dashboard 风格，不做营销首页。
- 视觉 token 使用低饱和、温暖、莫兰迪方向；紫色、绿色、蓝色用于区分状态和占位图表。
- 卡片圆角保持 8px 左右，避免过度装饰。

### 1.2 Current Route Map

- `/`: 成长主页。
- `/daily`: 每日工作台。
- `/records`: 成长记录。
- `/records/[kind]/[id]`: 成长记录详情。
- `/insights`: 洞察报告。
- `/manual`: 个人说明书，已支持登录用户读取、首次保存和完整字段手动编辑。
- `/settings`: 设置。
- `/login`: 登录/注册。
- `/auth/confirm`: Supabase 邮箱确认回调。

### 1.3 Base Feature Completion Snapshot

Step 7.3 后，当前基础闭环的实际用户流程是：

```text
登录或注册
  ↓
每日工作台创建任务、习惯、日程、事件和灵感
  ↓
习惯打卡、习惯编辑或停用、任务状态更新、任务编辑或软删除、日程编辑或软删除、事件编辑或软删除、灵感编辑或软删除和今日概览程序统计
  ↓
成长记录统一时间线和详情页查看
  ↓
洞察报告基础图表查看
  ↓
每日复盘发送预览
  ↓
确认生成或读取当天缓存复盘
```

当前基础闭环已经覆盖：

- 任务创建、状态更新、延期、编辑、软删除和今日任务完成率。
- 习惯创建、编辑、停用、今日打卡、取消打卡、累计次数和连续天数。
- 今日日程创建、编辑、软删除和按时间展示。
- 事件和灵感创建；事件支持情绪标签、普通标签、AI 分析权限、编辑和软删除；灵感支持状态、处理说明、编辑和软删除。
- 今日概览四类程序统计：任务、习惯、日程和随手记录。
- 成长记录统一时间线、基础筛选和五类记录详情。
- 洞察报告基础程序图表：任务完成率、习惯打卡、记录数量趋势和情绪基础统计。
- 每日复盘上下文生成、发送预览、用户确认、报告保存和缓存展示。
- 个人说明书读取、首次保存和完整字段手动编辑。
- 设置页应用状态、账号状态、数据库健康检查和 AI 配置状态展示。
- 统一错误提示，不向用户展示底层堆栈、数据库连接字符串或 API key。

当前仍未完成：

- 个人说明书与复盘上下文预留关联。
- 周复盘、月度复盘、纪念日、礼物记录、场景工具箱和 Obsidian 导入导出暂缓。

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
- 已建立认证安全跳转和登录后写入保护 helper。
- 已在真实数据库启用 Row Level Security；当前业务查询和写入通过 Supabase SSR client 携带用户会话，并在应用层继续按当前用户 ID 限定。

### 3.2.3 Supabase Auth Baseline

Step 2.4A 已接入 Supabase Auth 基线，Step 2.4B 已补充安全跳转和写入保护 helper：

- 使用 `src/lib/supabase/server.ts` 创建服务端 Supabase client。
- 使用 `src/lib/auth/session.ts` 读取当前用户。
- 使用 `src/lib/auth/session.ts` 中的 `requireCurrentUser()` 保护后续写入类 Server Action。
- 使用 `src/lib/auth/paths.ts` 统一校验登录和邮箱确认流程中的 `next` 参数。
- 使用 `src/app/auth/actions.ts` 执行登录、注册和退出。
- 使用 `src/app/auth/confirm/route.ts` 处理邮箱确认回调。
- `/login` 支持登录和注册模式，并通过安全的 `next` 参数返回原页面。

访问规则当前实现：

- 未登录用户可以访问首页、每日工作台、成长记录、洞察报告、个人说明书、设置页和登录页。
- 未登录用户在每日工作台看到写入拦截提示。
- 每日工作台里的写入入口在未登录状态下跳转 `/login?next=/daily&message=login_required`。
- 已登录用户在侧边栏显示邮箱，并可退出登录。
- 所有写入类 Server Action 应调用 `requireCurrentUser()`，并用返回的当前用户 ID 写入业务表 `user_id` 字段；当前每日工作台任务、习惯、习惯打卡、日程、事件和灵感写入已按此规则实现。
- `next` 参数只允许站内路径，外部 URL、双斜杠路径、反斜杠路径和控制字符会降级为 `/`。

当前限制：

- 每日工作台任务、习惯、习惯打卡、日程、事件、灵感和每日复盘已接入真实写入。
- Row Level Security 已在真实数据库启用。
- 登录后的每日工作台、成长记录、洞察报告和每日复盘查询已迁到 Supabase SSR client，并在查询层继续按当前用户 ID 隔离。
- 邮箱确认回调仍需要 Supabase Dashboard 允许 `http://localhost:3001/auth/confirm` 作为 Redirect URL。

### 3.2.4 Row Level Security Pre-Plan

当前 RLS 已在真实数据库启用。本节记录已选路线、迁移设计和验证结果。

当前关键约束：

- 业务表均已有 `user_id` 字段，应用层读写已经按当前登录用户 ID 限定。
- 用户态业务读写已经迁到 `src/lib/data/user-data.ts`，通过 Supabase SSR client 携带当前用户会话。
- `src/db/index.ts` 中的 Drizzle client 仍保留给 schema、迁移、设置页健康检查和必要的服务端内部维护用途。
- 所有用户态查询和写入继续显式限定当前用户 ID，不能只依赖 RLS。

推荐接入路线：

1. 先保持当前应用层 `user_id` 限定不变，作为现有安全基线。
2. 为 RLS 设计独立迁移，不混入业务功能开发。
3. 采用路线 A：用户态业务读写迁移到 Supabase SSR client，让请求携带用户会话，由 RLS 通过 `auth.uid()` 判定。
4. `drizzle/0001_rls_user_policies.sql` 已执行到真实 Supabase 数据库；由于 Drizzle CLI 首次执行时连接中断，本次采用同一份 SQL 按表分短事务补齐，并写入 Drizzle 迁移记录。

第一批 RLS 策略设计：

- `tasks`: 当前用户只能 `select`、`insert`、`update`、`delete` 自己的任务，基础条件为 `auth.uid() = user_id`。
- `habits`: 当前用户只能操作自己的习惯，基础条件为 `auth.uid() = user_id`。
- `habit_checkins`: 当前用户只能操作自己的打卡；写入时除了 `auth.uid() = user_id`，还应确保 `habit_id` 属于当前用户。
- `schedule_items`: 当前用户只能操作自己的日程，基础条件为 `auth.uid() = user_id`。
- `life_events`: 当前用户只能操作自己的人生笔记，基础条件为 `auth.uid() = user_id`。
- `ideas`: 当前用户只能操作自己的灵感；如果设置 `converted_task_id`，还应确保目标任务属于当前用户。
- `insight_reports`: 当前用户只能读取和生成自己的复盘报告，基础条件为 `auth.uid() = user_id`。
- `personal_manuals`: 当前用户只能读取和维护自己的个人说明书，基础条件为 `auth.uid() = user_id`。

真实启用后的验证记录：

- 未登录用户仍可访问公开页面，但无法读取个人数据。
- 数据库只读检查确认 8 张业务表均已启用 RLS，策略数量为 32。
- Drizzle 迁移记录已包含 `0001_rls_user_policies.sql` 对应 hash。
- 只读 RLS 探针确认模拟本人可见自己的任务、习惯、打卡、日程、事件、灵感和复盘；模拟随机其他用户时这些表均返回 0。
- 设置页数据库健康检查不展示底层错误和连接字符串。
- `npm run db:migrate` 再次执行通过，确认迁移记录与数据库状态一致。
- `npm run lint` 和 `npm run build` 通过。

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
Supabase SSR client query with explicit user_id filter
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

## 6. Current Data Model

Step 2.1 确定基础功能第一轮需要的数据模型，Step 2.3 已通过 Drizzle schema 和迁移文件落地到真实 Supabase Postgres。当前实际数据库结构以 `src/db/schema.ts` 和 `drizzle/0000_true_silver_sable.sql` 为准。

第一批基础表：

- `tasks`
- `habits`
- `habit_checkins`
- `schedule_items`
- `life_events`
- `ideas`
- `insight_reports`
- `personal_manuals`

当前 8 张基础表均已创建。任务、习惯、习惯打卡、日程、事件、灵感、每日复盘报告和个人说明书读取/完整字段手动编辑已经进入真实基础功能闭环；`personal_manuals` 与复盘上下文的预留关联能力留到后续 Step。

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
- 需要软删除时使用 `deleted_at`。当前任务、日程、事件和灵感已实现软删除；习惯维护当前优先使用 `is_active = false` 停用，习惯删除或软删除需先确认历史打卡展示和统计规则。
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
- 取消今日打卡时，将当天记录写入或更新为 `status = skipped`，不删除记录；累计次数和连续天数只统计 `status = checked` 的日期。
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
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
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

- 当前代码优先支持 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`，并兼容旧命名 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
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

Step 8.1 文档更新验证：

- 对照 `src/app` 检查页面结构是否一致。
- 对照 `src/db/schema.ts` 检查 8 张基础表和字段说明是否一致。
- 对照 `src/lib/ai` 和 `src/app/daily/actions.ts` 检查 AI 调用边界是否一致。
- 运行 `git diff --check -- memory-bank/@architecture.md`。
