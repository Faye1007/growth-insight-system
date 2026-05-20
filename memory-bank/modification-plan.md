# Growth Insight System - Modification Plan

## 说明

本文记录基础闭环之后的迭代改造计划，用于承接真实使用中发现的体验问题、bug 修复、数据迁移和功能增强。

文档分工：

- `implementation-plan.md`: 从 0 到 1 的基础功能主线计划，保留历史，不再追加新的 Modification Step。
- `modification-plan.md`: 自用和上线后的迭代计划，按迭代顺序记录目标、完成内容和验证结果。
- `progress.md`: 权威完成流水账，按真实执行顺序记录每个已完成 Step。
- `@architecture.md`: 当前真实系统结构，只记录已经落地的重要结构变化。

执行原则：

- 每个迭代 Step 开始前说明目标、影响范围和验证方式。
- 涉及数据库 schema、真实迁移、环境变量、密钥、部署和 `git push` 时继续单独确认。
- 如测试需要写入真实数据库，测试通过后必须删除或软删除测试数据。
- 完成后更新 `progress.md`；涉及页面结构、数据结构、认证流程、核心数据流或重要视觉系统时同步更新 `@architecture.md`。

## Planned

### Modification Step 24：日程复选框、习惯打卡不跳转、人生页加载修复

基于 Faye 实际使用后的反馈，以下 3 项改进按 Step 循环逐步实施：

#### 改进点 1：日程增加复选框，可标注完成状态

- **现状**：日程列表没有复选框/完成状态标记，无法在清单页面标注日程是否已完成。
- **目标**：日程表增加 `isCompleted` 字段；清单页日程列表增加复选框，点击可切换完成/未完成状态；打卡后不跳转页面，保持在清单界面。
- **影响文件**：`src/db/schema.ts`、新建数据库迁移文件、`src/lib/data/user-data.ts`、`src/app/checklist/actions.ts`、`src/components/checklist/checklist-client.tsx`

#### 改进点 2：打卡习惯不跳转每日工作台

- **现状**：清单页打卡习惯后，`updateHabitCheckinAction` 统一 redirect 到 `/daily`，离开清单页面。
- **目标**：打卡 form 增加 `source` 隐藏字段；action 根据来源判断重定向到 `/checklist` 还是 `/daily`，清单页打卡后保持在清单界面。
- **影响文件**：`src/components/checklist/checklist-client.tsx`、`src/app/daily/actions.ts`

#### 改进点 3：人生页面加载修复

- **现状**：人生页面有时无法加载，`life/page.tsx` 第 175 行重复调用 `getUpcomingAnniversariesForUser` 可能抛异常。
- **目标**：移除重复调用，改用 `Promise.allSettled` 中已获取的 `upcomingAnniversaries` 结果。
- **影响文件**：`src/app/life/page.tsx`

## Planned Steps 执行顺序

1. **Step 24.1**：日程复选框（DB schema + migration + user-data + actions + UI）（改进点 1）
2. **Step 24.2**：打卡习惯不跳转（source 参数 + action 路由判断）（改进点 2）
3. **Step 24.3**：人生页加载修复（移除重复调用）（改进点 3）

### Modification Step 23：真实使用反馈改进（7 项）

基于 Faye 实际使用后的反馈，以下 7 项改进按 Step 循环逐步实施：

#### 改进点 1：清单/人生页内就地新建，不跳转每日工作台

- **现状**：清单页点击"新增"跳转 `/daily?view=tasks` 到每日工作台展开表单；人生页纪念日/礼物用 `<details>` 就地展开。
- **目标**：清单页（任务/日程/习惯/灵感）和人生页（事件）的"新增"按钮改为在当前页面弹出内联表单，提交后刷新当前列表，不跳转页面。
- **每日工作台收敛**：每日工作台下方不再显示各模块的创建表单区块，只保留概览卡和复盘入口。
- **影响文件**：`src/components/checklist/checklist-client.tsx`、`src/components/life/life-client.tsx`、`src/app/daily/page.tsx`、`src/app/checklist/page.tsx`

#### 改进点 2：AI 界面改造为微信式对话框

- **现状**：AI 页面有独立 header、消息区、快捷键和输入框分散布局。
- **目标**：整体包裹在统一背景框内；快捷键放在输入框上方作为快捷工具栏；用户消息靠右气泡，AI/系统消息靠左气泡；输入框固定在底部。
- **影响文件**：`src/components/ai/ai-chat-client.tsx`、`src/app/globals.css`

#### 改进点 3：习惯点击后显示详情页（支持编辑）

- **现状**：清单页习惯列表点击习惯名称没有跳转链接，无法编辑习惯。
- **目标**：清单页习惯名称添加跳转到习惯维护详情页的链接；新建 `/checklist/habits/[id]/page.tsx` 支持编辑名称、分类、说明、开始日期、停用、软删除。
- **影响文件**：`src/components/checklist/checklist-client.tsx`、新建 `src/app/checklist/habits/[id]/page.tsx`

#### 改进点 4：日程新建只需填开始日期和结束日期

- **现状**：日程创建表单有 `scheduleDate`、`startDate`、`endDate` 三个日期字段，冗余。
- **目标**：去掉独立的"日期"字段，只保留开始日期和结束日期；`scheduleDate` 在 Server Action 中自动等于 `startDate`。
- **影响文件**：`src/app/daily/page.tsx`、`src/components/checklist/checklist-client.tsx`、`src/app/daily/actions.ts`

#### 改进点 5：纪念日增强

- **5a**：纪念日可选择标签（纪念日/生日），schema 新增 `type` 枚举字段。
- **5b**：提醒机制支持按年提示，选择后自动计算最新提醒日期，schema 新增 `reminderMode` 枚举。
- **5c**：生日支持农历日期，schema 新增 `isLunar` 布尔字段，需引入农历转换库。
- **5d**：礼物记录"用途"改名"对方回礼"，改为非必填项。
- **影响文件**：`src/db/schema.ts`、新建数据库迁移文件、`src/app/life/actions.ts`、`src/components/life/life-client.tsx`、`src/lib/data/user-data.ts`

#### 改进点 6：成长记录显示所有历史数据

- **现状**：每种类型只取最近 12 条（`recentLimitPerType = 12`），总共最多 40 条。
- **目标**："全部近期"改为"全部历史"，取消数量限制；保留"今天"和"最近 7 天"快捷筛选。
- **影响文件**：`src/app/records/page.tsx`、`src/lib/data/user-data.ts`

#### 改进点 7：人生页和成长记录页顶部纪念日/生日提醒

- **目标**：在人生页和成长记录页顶部增加提醒横幅，显示未来 7 天内和当天的纪念日/生日；按时间排序，区分"今天"和"X 天后"提示文案。
- **影响文件**：`src/components/life/life-client.tsx`、`src/app/records/page.tsx`、`src/lib/data/user-data.ts`

## Planned Steps 执行顺序

1. **Step 23.1**：清单页就地新建 + 每日工作台收敛（改进点 1）
2. **Step 23.2**：AI 界面微信式改造（改进点 2）
3. **Step 23.3**：习惯详情页（改进点 3）
4. **Step 23.4**：日程表单简化（改进点 4）
5. **Step 23.5**：纪念日增强 + 数据库迁移（改进点 5）
6. **Step 23.6**：成长记录全部历史数据（改进点 6）
7. **Step 23.7**：顶部纪念日提醒横幅（改进点 7）

## Completed

### ✅ Modification Step 16.1：工作台简洁化与移动端导航优化

完成内容：

- 每日工作台移除单独登录提示卡，账号状态统一交给应用壳。
- 今日任务、习惯打卡、今日日程和随手记录改为简洁列表，编辑下沉到详情页。
- 任务和习惯左侧提供快速完成/打卡按钮，任务状态用不同颜色显示。
- 移动端共享导航改为左侧抽屉菜单。
- 事件详情页、每日工作台和洞察报告增加情绪/标签兜底解析。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 16.2：日程循环规则

完成内容：

- 日程支持开始日期、结束日期和循环周期：不循环、每天、每周、每月。
- `schedule_items` 增加 `start_date`、`end_date` 和 `recurrence` 字段。
- 新增 `schedule_recurrence` 数据库枚举并执行真实迁移。
- 今日列表会显示命中今天的循环日程。
- 日程详情页可查看和编辑循环字段。

验证：

- `npm run db:generate` 通过。
- `npm run db:migrate` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.1：导航收敛与导出入口回收

完成内容：

- 主导航移除 Markdown 导出、个人说明书和场景工具箱独立入口。
- 周复盘、月复盘区域直接提供 Markdown 导出入口。
- `/export` 旧页面回到洞察报告，下载能力保留在 `/export/markdown`。
- 场景工具箱改名为“问题拆解”，通过洞察报告快捷入口进入。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.2：每日工作台去掉重复概览

完成内容：

- 今日概览从统计卡改为简洁清单卡。
- 今日任务、今日习惯、今日日程和随手记录在概览卡内展示可点击条目。
- 移除每日工作台四个分区底部重复提示标签行。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.3：成长主页能力并入洞察报告

完成内容：

- `/` 改为进入 `/daily`。
- 主导航移除“成长主页”。
- 洞察报告新增“成长概览”，承接原成长主页统计内容。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.4：个人说明书并入 AI 复盘

完成内容：

- 洞察报告 AI 复盘区域增加“个人说明书”快捷入口。
- 个人说明书页面定位为 AI 复盘可参考的长期背景资料。
- 个人说明书如参与 AI 输入，仍必须先在发送预览中明示并由用户确认。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 18.1：移动端导航修复与每日工作台概览改造

完成内容：

- 修复移动端左上角目录不弹出的问题。
- 每日工作台今日概览改为今日任务、今日习惯、今日日程、随手记录四个入口。
- 晚间复盘入口放到长列表之前。
- 随手记录列表只显示单行预览，完整内容进入详情页查看。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 18.2：列表置顶、习惯删除与排序规则

完成内容：

- 今日任务、习惯、日程、事件和灵感支持置顶/取消置顶。
- 习惯支持软删除，历史打卡记录保留。
- 各列表置顶项优先显示。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 18.3：洞察报告入口分流与问题拆解排版优化

完成内容：

- 洞察报告默认页只展示复盘入口和成长概览。
- 周复盘和月复盘通过视图入口分流展示。
- 问题拆解入口保留在洞察报告 AI 复盘区域。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 18.4：PC 账号入口右上角与公开版设置页改造

完成内容：

- PC 端账号入口移到右上角，左侧导航只保留主导航和产品标识。
- 设置页改为“账号与应用设置”。
- 设置页移除 Supabase、Database URL、service role key、AI API key、AI provider 等内部配置字段。
- 设置页新增功能可用性和 AI 复盘说明。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Step 19.1：灵感表增加转化字段

完成内容：

- `ideas` 表增加 `converted_to_type`、`converted_to_id`、`shelved_at` 字段。
- 生成并执行真实 Supabase 数据库迁移。
- 更新 Drizzle schema。

验证：

- `npm run db:generate` 通过。
- `npm run db:migrate` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。

### ✅ Step 19.2：底部导航重构（5 Tab）

完成内容：

- 移动端改为底部 5 Tab：清单、人生、AI、复盘、设置。
- 新增 `/checklist` 和 `/ai` 页面。
- 桌面端侧边栏导航保留。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。

### ✅ Step 19.3：清单页重构（4类切换 + 复选框 + 周历）

完成内容：

- `/checklist` 顶部切换任务、日程、习惯、灵感。
- 任务和习惯支持复选框操作。
- 支持列表视图和周日历视图。
- 新增清单页数据获取函数和客户端组件。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。

### ✅ Step 19.4：人生页重构（事件移入 + 3类切换）

完成内容：

- 事件移入 `/life`。
- 人生页顶部切换事件、纪念日、礼物。
- 新增 `LifeClient` 客户端组件。
- 保留纪念日和礼物创建、编辑、软删除能力。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。

### ✅ Step 19.5：AI 聊天界面 + 快捷键 + 规则解析 MVP

完成内容：

- 新增 `/ai` 聊天式页面。
- 输入框上方提供创建任务、日程、习惯、记录事件、记录灵感、创建纪念日快捷键。
- 支持规则解析 MVP 和确认卡片，不直接依赖 AI 调用。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。

### ✅ Step 19.6：复盘页移动端优化

完成内容：

- 洞察报告页移动端布局优化。
- 图表容器、趋势卡、复盘入口和底部安全区适配手机宽度。
- 修复 AI 聊天组件缺失日期函数导致的构建错误。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。

### ✅ Step 19.7：独立 API 层（为小程序准备）

完成内容：

- 新增 API Key 认证 helper。
- 新增 `/api/tasks`、`/api/habits`、`/api/schedules`、`/api/events`、`/api/ideas`、`/api/reviews` Route Handlers。
- `.env.example` 补充 API 环境变量说明。
- 保留网页端 Server Actions。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。

### ✅ Modification Step 20.1：Excel 历史数据迁移 dry-run

完成内容：

- 新增只读 dry-run 脚本解析 `Faye的成长计划.xlsx`。
- 明确 Excel 工作表到系统表的映射。
- dry-run 识别计划导入 125 条、跳过 7 条、提示 5 条。

验证：

- `python3 scripts/import_growth_plan_dry_run.py` 通过。
- `python3 scripts/import_growth_plan_dry_run.py --format json` 通过。
- `git diff --check` 通过。

### ✅ Modification Step 20.2：Excel 历史数据迁移真实导入准备

完成内容：

- 新增真实导入辅助脚本，支持 `plan`、`check`、`probe`、`probe-insert`、`simulate`、`apply` 模式。
- `apply` 模式必须显式提供确认参数。
- 只读确认目标账号和已有数据量。

验证：

- `node --check scripts/import_growth_plan_apply.mjs` 通过。
- `node scripts/import_growth_plan_apply.mjs --mode plan` 通过。
- `node scripts/import_growth_plan_apply.mjs --mode check --email 2215128728@qq.com` 通过。
- `npm run lint` 通过。

### ✅ Modification Step 20.3：Excel 历史数据真实导入

完成内容：

- 将确认可迁移的 Excel 历史数据导入 `2215128728@qq.com` 账号。
- 导入脚本改为每条记录使用新连接、写完立即关闭的保守模式。
- 导入后只读计数：`tasks` 85、`habits` 8、`habit_checkins` 7、`schedule_items` 9、`ideas` 5、`life_events` 7、`anniversaries` 13、`gift_records` 6。
- 未写入飞书外部 ID。

验证：

- 真实导入命令完成。
- 导入后只读检查通过。
- `npm run lint` 通过。
- `git diff --check` 通过。

### ✅ Modification Step 21.0：人生页面修复（清理重复代码）

完成内容：

- 清理 `/life` 页面重复纪念日/礼物 CRUD 区块。
- 页面展示统一交给 `LifeClient`。
- 未登录状态在各 tab 显示登录入口。

验证：

- `npm run build` 通过。

### ✅ Modification Step 21.1：设置页登录入口与昵称编辑 + 账号注销

完成内容：

- 设置页未登录状态显示登录/注册入口。
- 已登录状态支持修改昵称，昵称存储在 Supabase Auth `user_metadata`。
- 新增账号注销能力：确认弹窗、当时为软删除业务数据并退出登录；后续 Modification Step 22.4 已修正为物理清除业务数据并删除 Auth 用户。

验证：

- `npm run build` 通过。

### ✅ Modification Step 21.2：清单列表与统计体验修正

完成内容：

- 清单页任务、日程、灵感列表按日期分组。
- 去掉任务、日程、习惯列表中的冗余状态标签。
- 已完成任务标题加删除线。
- 清单 tab 列表视图统计改为今日数量，周历视图保持本周数量。
- 清单页增加成长记录入口。

说明：

- 此项最初在文档中拆成计划态 21.1 / 21.2；实际完成后归并为 21.2，避免与设置页 21.1 编号冲突。

验证：

- 以对应完成时的 build 验证为准。

### ✅ Modification Step 21.3：清单页各模块新增按钮

完成内容：

- 清单页任务、日程、习惯、灵感列表右上角添加新增按钮。
- 点击后跳转到每日工作台对应旧入口并展开创建表单。

验证：

- `npm run build` 通过。

### ✅ Modification Step 21.4：复盘页成长概览置顶

完成内容：

- 复盘页默认视图中成长概览移动到页面上方。

验证：

- `npm run build` 通过。

### ✅ Modification Step 21.5：AI 快捷键顺序调整 + 礼物记录

完成内容：

- AI 快捷键调整为两行。
- 新增礼物记录快捷键。

验证：

- `npm run build` 通过。

### ✅ Modification Step 21.6：AI 界面对话框样式改造

完成内容：

- AI 页面改为聊天气泡样式。
- 输入区和快捷键放在统一背景框中。

验证：

- `npm run build` 通过。

### ✅ Modification Step 21.7：人生页加载兜底与设置页昵称入口修复

完成内容：

- `/life` 事件标签增加运行时数组兜底。
- `/life` 事件、纪念日、礼物三类数据改为 `Promise.allSettled` 分组读取。
- 设置页已有昵称时优先展示昵称，点击后才展开编辑。
- PC 右上角账号入口只显示昵称并跳转设置页。
- 账号注销确认逻辑移入客户端组件。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地 `/life` 和 `/settings` 返回 `200`。

### ✅ Modification Step 22.1：人生页列表分组、快捷新增与详情入口

完成内容：

- 人生页事件、纪念日、礼物列表按日期分组。
- 事件列表最多展示两行，点击进入事件详情。
- 纪念日和礼物标题可进入详情页查看和编辑。
- 人生页三个 tab 右上角提供新增入口。
- 新增 `/life/[kind]/[id]` 详情路由，支持纪念日和礼物。
- 纪念日详情页直接展示关联历史礼物记录。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地 `/life` 返回 `200`。

### ✅ Modification Step 22.2：成长记录页移动端概览压缩与按天分组

完成内容：

- `/records` 移动端近期概览改为三列紧凑网格。
- 近期记录列表按北京时间日期分组。
- 成长记录里的事件条目最多展示两行。
- 原有类型筛选、日期筛选和详情页跳转保留。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地 `/records` 返回 `200`。

### ✅ Modification Step 22.3：设置页账号信息精简与每日工作台入口收敛

完成内容：

- 设置页账号区改为紧凑摘要，昵称作为主标题，邮箱和登录状态作为次级信息。
- 点击昵称旁边笔图标展开昵称编辑。
- 退出登录和注销账号并列显示、尺寸一致，注销保留确认弹窗。
- `/` 继续默认进入 `/daily`。
- `/daily` 默认只展示今日概览和晚间总结入口，不再直接铺开四类列表。
- 今日概览四张卡片变成快捷入口：任务、习惯、日程跳转清单页对应 tab，随手记录跳转人生事件列表。
- 晚间总结快捷入口跳转复盘页 `/insights`。
- 保留 `/daily?view=...` 旧入口，供清单页新增按钮继续打开对应创建表单。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地 `/daily` 和 `/settings` 返回 `200`。

### ✅ Modification Step 23.7：顶部纪念日提醒横幅

完成内容：

- 人生页和成长记录页顶部新增纪念日提醒横幅。
- 显示未来 7 天内和当天的纪念日/生日。
- 按时间排序，区分"今天"和"X 天后"提示文案。
- 新增 `getUpcomingAnniversariesForUser` 数据函数，支持按年提醒模式自动计算下次日期。
- 新增 `UpcomingAnniversary` 类型，包含 `upcomingDate`、`daysUntil`、`isToday` 字段。
- 新增 `.anniversary-reminder-banner`、`.anniversary-days`、`.anniversary-today` 样式。
- 横幅中纪念日标题可点击进入详情页。

验证：

- `npm run build` 通过。

### ✅ Modification Step 23.6：成长记录全部历史数据

完成内容：

- 日期范围筛选项"全部近期"改为"全部历史"，取消数量限制。
- 保留"今天"和"最近 7 天"快捷筛选。
- 移除 `timelineLimit = 40` 的全局截断。
-  wrapper 函数（`getRecentTasks`、`getRecentHabitCheckins` 等）改为接受 `limit` 参数。
- "全部历史"模式下 limit 设为 9999，获取全部数据。
- 页面文案更新：近期概览 → 历史概览，近期记录 → 历史记录，暂无近期记录 → 暂无历史记录。
- 默认筛选从 `recent` 改为 `all`。

验证：

- `npm run build` 通过。

### ✅ Modification Step 23.5：纪念日增强 + 数据库迁移

完成内容：

- 纪念日新增 `type` 字段（纪念日/生日），`anniversary_type` 数据库枚举。
- 纪念日新增 `reminderMode` 字段（一次性/按年），`reminder_mode` 数据库枚举。
- 纪念日新增 `isLunar` 布尔字段，支持生日农历标记。
- 礼物记录 `purpose` 字段改名为 `return_gift`（对方回礼），改为非必填项。
- 执行真实数据库迁移（`0008_anniversary_enhancements.sql`），包含枚举创建、列添加、数据迁移和旧列删除。
- 更新 `src/db/schema.ts` 新增枚举定义和表结构。
- 更新 `src/lib/data/user-data.ts` 类型、mapper 函数和 CRUD 函数。
- 更新 `src/app/life/actions.ts` 表单解析逻辑。
- 更新 `src/components/life/life-client.tsx` 表单 UI：纪念日新增类型、提醒模式、农历复选框；礼物用途改为对方回礼并选填。
- 更新 `src/app/life/[kind]/[id]/page.tsx` 详情页：纪念日详情和编辑表单展示新字段；礼物详情页展示对方回礼。
- 历史数据兼容：迁移脚本自动将 `purpose` 数据复制到 `return_gift`。

验证：

- `npm run db:generate` 跳过（手动编写迁移 SQL）。
- `npm run db:migrate` 通过，真实 Supabase 数据库迁移成功。
- `npm run build` 通过。

### ✅ Modification Step 23.4：日程表单简化

完成内容：

- `createScheduleItemAction` 改为以 `startDate` 为主日期字段，`scheduleDate` 自动等于 `startDate`。
- 清单页日程内联表单已只包含开始日期和结束日期（Step 23.1 已完成）。
- AI 聊天界面创建日程时发送的 `scheduleDate` 会被 `startDate` 覆盖，确保一致性。

验证：

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

### ✅ Modification Step 24.2：打卡习惯不跳转

完成内容：

- `updateHabitCheckinAction` 增加 `source` 参数读取。
- 当 `source === "checklist"` 时，重定向到 `/checklist?tab=habits`，保持在清单页面。
- 默认行为不变，仍重定向到 `/daily`。
- 清单页习惯打卡 form 增加 `<input type="hidden" name="source" value="checklist" />`。
- 同时 `revalidatePath("/checklist")` 确保清单页数据刷新。

验证：

- `npm run build` 通过。

### ✅ Modification Step 24.1：日程复选框

完成内容：

- `schedule_items` 表增加 `is_completed` 布尔字段，默认 `false`。
- 执行真实数据库迁移（`0009_schedule_completion.sql`）。
- 更新 `src/db/schema.ts` 新增 `isCompleted` 字段。
- 更新 `src/lib/data/user-data.ts`：`ScheduleItemRow`、`TodayScheduleItem`、`ChecklistSchedule` 类型增加 `isCompleted`；`getChecklistSchedulesForUser` 查询和映射增加该字段；新增 `updateScheduleCompletionForUser` 函数。
- 新增 `toggleScheduleCompletionAction` Server Action 到 `src/app/checklist/actions.ts`。
- 清单页日程列表增加复选框，点击可切换完成/未完成状态；已完成日程标题加删除线，状态色变为 completed。

验证：

- `npm run db:migrate` 通过，真实 Supabase 数据库迁移成功。
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

### ✅ Modification Step 22.4：账号数据清除与真实注销修正

完成内容：

- 设置页账号操作区在退出登录和注销账号之间新增"清除数据"按钮。
- "清除数据"会物理删除当前账号所有业务数据，但保留 Supabase Auth 账号并保持登录。
- "注销账号"按钮文案从"确认注销账号"改为"注销账号"。
- 注销账号流程改为先物理删除所有业务数据，再通过 Supabase Admin API 删除 Auth 用户，最后退出登录。
- 注销账号需要服务端配置 `SUPABASE_SERVICE_ROLE_KEY`；未配置时不清除数据，并在设置页显示明确提示。
- 清理表范围覆盖 `tasks`、`habits`、`habit_checkins`、`schedule_items`、`life_events`、`ideas`、`insight_reports`、`personal_manuals`、`anniversaries`、`gift_records` 和 `tool_sessions`。

验证：

- `npm run lint` 通过。
- `npm run build` 通过。

## Candidate Modifications

- 继续观察真实使用中每日工作台入口收敛后，清单页新增入口是否仍符合预期。
- 后续若写入真实数据库做测试，测试通过后必须删除或软删除对应测试数据。
