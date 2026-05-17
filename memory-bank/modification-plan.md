# Growth Insight System - Modification Plan

## 说明

本文记录产品进入可用闭环后的迭代改造计划，用于承接真实使用过程中发现的体验问题、bug 修复和功能增强。

文档分工：

- `implementation-plan.md`: 从 0 到 1 的基础功能主线计划，保留历史，不继续塞入所有后续改造。
- `modification-plan.md`: 自用和上线后的迭代计划，包括体验优化、bug 修复和功能增强。
- `progress.md`: 所有已完成 Step 的完成态记录，不区分来源于 implementation 还是 modification。
- `@architecture.md`: 当前真实系统结构，只记录已经落地的重要结构变化。

执行原则：

- 每个迭代 Step 开始前说明目标、影响范围和验证方式。
- 涉及数据库 schema、真实迁移、环境变量、密钥、部署和 `git push` 时继续单独确认。
- 如测试需要写入真实数据库，测试通过后必须删除或软删除测试数据。
- 完成后更新 `progress.md`；涉及页面结构、数据结构、认证流程、核心数据流或重要视觉系统时同步更新 `@architecture.md`。

## Planned

### Modification Step 22.2：成长记录页移动端概览压缩与按天分组

目标：

- 成长记录页移动端"近期概览"减少垂直占用，改为更紧凑的网格；移动端优先一行 3 个。
- 成长记录列表改为按日期分组展示，参考清单页的分天列表，而不是一整条时间线直接拉下来。

实施要点：

- 保持现有类型筛选和日期筛选能力。
- 按日期分组后，每条记录仍可进入原有详情页。
- 桌面端也可以沿用更清晰的分组结构，但移动端是重点。

预计影响文件：

- `src/app/records/page.tsx`
- 可能补充 `src/app/globals.css`

验证：

- `npm run lint`
- `npm run build`
- 本地打开 `/records`，检查移动端近期概览和按天分组列表。
- 检查筛选条件和详情页跳转不受影响。

### Modification Step 22.3：设置页账号信息排版精简

目标：

- 精简设置页"账号信息"区域，减少重复说明和视觉负担。
- 保留昵称展示、昵称编辑、邮箱、登录状态、退出登录和注销账号，但让主区域更轻。

实施要点：

- 已有昵称时仍优先展示昵称，修改昵称放在折叠或次级入口中。
- 注销账号继续保留在危险操作折叠区域，避免误触。
- 不展示 Supabase、数据库连接、AI key 等内部配置字段。

预计影响文件：

- `src/app/settings/page.tsx`
- 可能补充 `src/app/globals.css`

验证：

- `npm run lint`
- `npm run build`
- 本地打开 `/settings`，检查未登录和已登录状态。

## Completed

### ✅ Modification Step 22.1：人生页列表分组、快捷新增与详情入口

目标：

- 人生页的事件、纪念日和礼物列表改为按日期分组展示，避免一整条长列表直接拉下来。
- 三个 tab 的列表右上角都提供"新增"快捷入口。
- 事件列表每条最多展示两行内容，完整内容进入详情页查看。
- 移动端人生页顶部 tab 排版改为第一行"事件"，第二行"纪念日 / 礼物"。
- 事件、纪念日和礼物都可以点击标题进入详情页查看和编辑。

完成内容：

- `/life` 事件、纪念日和礼物列表统一改为按日期分组展示，复用清单页的列表样式。
- 事件列表内容最多展示两行，点击内容进入 `/records/event/[id]` 查看和编辑。
- 纪念日列表标题点击进入 `/life/anniversary/[id]`。
- 礼物列表标题点击进入 `/life/gift/[id]`。
- 人生页三个 tab 右上角提供新增入口：事件跳转每日工作台记录入口，纪念日和礼物在当前 tab 内展开轻量创建表单。
- 移动端人生页 tab 排版改为第一行事件，第二行纪念日和礼物。
- 新增 `/life/[kind]/[id]` 详情路由，支持纪念日和礼物查看、编辑和软删除。
- 纪念日详情页直接展示关联的历史礼物记录列表，礼物标题可继续进入礼物详情页查看和编辑。

影响文件：

- `src/components/life/life-client.tsx`
- `src/app/life/[kind]/[id]/page.tsx`
- `src/app/life/actions.ts`
- `src/lib/data/user-data.ts`
- `src/app/globals.css`

验证：

- `npm run lint` 通过。
- `npm run build` 通过。
- 本地生产服务 `/life` 返回 `200`。
- Faye 已确认历史礼物记录在纪念日详情页直接展开显示。

### ✅ Modification Step 16.1：工作台简洁化与移动端导航优化

目标：

- 将每日工作台从偏后台管理的复杂展示，改为更适合每天使用的简洁列表。
- 移动端导航改为左侧抽屉菜单，账号入口保留在右上角。

完成内容：

- 移动端共享导航改为左侧抽屉菜单。
- 每日工作台移除“已登录”提示卡。
- 今日任务、习惯打卡、今日日程和随手记录改为简洁列表。
- 任务名、日程名和记录内容可进入详情页，编辑下沉到详情页。
- 任务和习惯左侧提供快速完成/打卡按钮。
- 任务状态用不同颜色显示。
- 事件详情页、每日工作台和洞察报告增加情绪/标签兜底解析，避免字符串拆字。
- 洞察报告优先展示今日，再展示周和月，并压缩今日概览与图表区域。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 16.2：日程循环规则

目标：

- 让日程支持开始日期、结束日期和循环周期，覆盖固定课、咨询、周期性安排等真实使用场景。

完成内容：

- 新增循环周期：不循环、每天、每周、每月。
- `schedule_items` 增加 `start_date`、`end_date` 和 `recurrence` 字段。
- 新增 `schedule_recurrence` 数据库枚举。
- 生成并执行真实数据库迁移 `drizzle/0005_remarkable_doctor_strange.sql`。
- 迁移中回填旧日程 `start_date = schedule_date`。
- 每日工作台创建日程时可设置开始日期、结束日期和循环周期。
- 今日列表会显示命中今天的循环日程。
- 日程详情页可查看和编辑循环字段。
- 增加日期范围校验：结束日期不能早于开始日期。
- 本 Step 未写入测试业务数据，因此无需清理测试数据。

验证：

- `npm run db:generate` 通过。
- `npm run db:migrate` 第二次执行通过，真实 Supabase 数据库迁移成功。
- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.1：导航收敛与导出入口回收

目标：

- 不再把 Markdown 导出作为独立导航页面。
- 在洞察报告的周复盘、月复盘对应位置直接提供“导出 Markdown”快捷入口。
- 复盘导出按复盘类型区分，避免用户进入单独页面后再选择。
- 将“场景工具箱”改名为“问题拆解”，并从主导航下架，作为洞察报告中 AI 复盘旁边的辅助入口。

完成内容：

- 导航移除“Markdown 导出”入口。
- 导航移除“个人说明书”入口；后续并入洞察报告的 AI 复盘区域。
- 导航移除“场景工具箱”入口。
- `/export` 独立页面界面不再展示，改为回到洞察报告；下载能力继续由 `/export/markdown` 承接。
- `/export/markdown` 支持周复盘、月复盘按类型导出。
- 同步把“生活扩展”界面命名改为“纪念日”，路由暂不改，避免无必要破坏现有链接。
- `/toolbox` 页面改名为“问题拆解”；它用于临时整理情绪、压力或明日计划，当前默认程序化输出，不自动调用 AI。
- 洞察报告顶部新增“AI 复盘与问题拆解”快捷入口，包含问题拆解、周复盘和月复盘。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.2：每日工作台去掉重复概览

目标：

- 每日工作台只保留每天真正要看的清单：今日任务、今日习惯、今日日程、随手记录。
- 删除底部“行动稳定性”“时间沉淀”等与今日概览、洞察报告重复的统计模块，不做隐藏。

完成内容：

- 今日概览从统计卡改为简洁清单卡。
- 今日任务和今日习惯在概览卡内直接展示复选框和名称，可快速完成任务或打卡习惯。
- 今日日程和随手记录在概览卡内展示时间/名称或记录内容，点击可进入详情页。
- 点击任务名或日程名进入详情页编辑。
- 移除每日工作台四个分区底部的提示标签行，减少“行动、稳定性、时间、沉淀”等重复信息。
- 清理今日概览里的完成率、数量、进度条等统计展示，把统计和复盘归回洞察报告。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.3：成长主页能力并入洞察报告

目标：

- 打开网页时优先进入每日工作台，像任务面板一样直接看到当天清单。
- 成长主页中有价值的统计内容迁移到洞察报告页面的横向快捷入口下方。

完成内容：

- `/` 已改为直接进入 `/daily`。
- 主导航移除“成长主页”，每日打开优先进入每日工作台。
- 洞察报告新增“成长概览”，承接原成长主页的今日行动进度、本周关键指标和最近复盘状态。
- 原成长主页的静态占位内容不再作为独立页面展示。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 17.4：个人说明书并入 AI 复盘

目标：

- 个人说明书不再作为独立主导航页面。
- 保留它作为 AI 复盘的“长期背景资料”，而不是每天手动维护的独立模块。

完成内容：

- 洞察报告的 AI 复盘区域增加“个人说明书”快捷入口。
- 点击后进入个人说明书查看和编辑页面。
- 个人说明书页面文案改为“洞察报告里 AI 复盘可参考的长期背景资料”。
- 个人说明书是否进入 AI 输入，仍必须在发送预览中明示并由用户确认。
- 保留后续由周复盘、月复盘生成“建议更新项”的方向，用户确认后再写入，降低纯手动维护负担。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 18.1：移动端导航修复与每日工作台概览改造

目标：

- 修复移动端点击左上角目录后不弹出目录的问题，让手机端主导航可以稳定打开、关闭和跳转。
- 将每日工作台的今日概览改为四个快捷切换入口：今日任务、今日习惯、今日日程、随手记录。
- 点击某个快捷入口后仍停留在每日工作台，只切换下方显示的对应列表。
- 将晚间复盘放到今日概览和四类列表上方，避免任务、日程或记录列表过长时需要下拉很久才能复盘。
- 每日工作台里的随手记录列表只显示单行内容预览，超出部分用省略号处理，完整内容仍在详情页查看。

完成内容：

- 移动端主导航改为 `MobileNavDrawer` 客户端组件，通过 portal 挂载到 `document.body`，避免被移动端 header 层级和背景效果遮挡。
- 点击左上角三横线后弹出左侧长条目录，显示每日工作台、成长记录、洞察报告、纪念日和设置。
- 今日概览四个入口不再依赖移动端横向滑动；未选择入口时只显示选择提示。
- 通过 `/daily?view=tasks|habits|schedule|notes` 控制当前列表。
- 对应列表右上角提供“新增”按钮，点击后展开当前列表的创建表单。
- 晚间复盘入口放在当前列表上方。
- 随手记录列表改为单行省略。
- 本 Step 未修改数据库 schema，未生成迁移，未执行真实数据库迁移，未写入测试业务数据。

影响范围：

- `src/components/mobile-nav-drawer.tsx`
- `src/components/app-shell.tsx`
- `src/app/daily/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`
- `memory-bank/progress.md`
- `memory-bank/modification-plan.md`

验证：

- 手机宽度下点击目录按钮能打开左侧目录。
- 手机宽度下目录遮罩和面板不被页面内容遮挡。
- 点击目录中的导航链接能正常跳转。
- 每日工作台四个快捷入口能切换当前显示列表，不离开 `/daily`。
- 晚间复盘入口在长列表上方可见。
- 随手记录列表内容单行省略，不把长文本全部铺开。
- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 18.2：列表置顶、习惯删除与排序规则

目标：

- 今日任务、今日习惯、今日日程和随手记录都支持将某一条置顶。
- 置顶项优先显示在每日工作台对应列表顶部；未置顶项沿用当前排序规则。
- 习惯增加删除能力，采用软删除方式写入 `deleted_at`，不物理删除历史数据。
- 习惯删除后不再出现在今日打卡、洞察报告启用习惯统计和后续选择列表；历史打卡记录仍保留给成长记录和复盘统计使用。

完成内容：

- 为 `tasks`、`habits`、`schedule_items`、`life_events` 和 `ideas` 增加 `is_pinned` 字段，默认 `false`。
- 生成并执行真实数据库迁移 `drizzle/0006_wandering_slayback.sql`。
- 每日工作台今日任务、今日习惯、今日日程和随手记录支持置顶与取消置顶。
- 用户态数据读取层按置顶优先排序，再沿用原有列表排序。
- 习惯增加软删除 Action 和页面入口，删除时写入 `deleted_at` 并同步 `is_active = false`。
- 习惯详情页增加删除入口，历史习惯打卡记录仍可保留。
- 统一补充置顶和习惯删除反馈文案。

验证：

- `npm run db:generate` 通过。
- 迁移 SQL 检查通过，不包含密钥、连接字符串或无关表结构改动。
- Faye 单独确认后已执行 `npm run db:migrate`。
- `npm run db:migrate` 通过，真实 Supabase 数据库迁移成功。
- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。

### ✅ Modification Step 18.3：洞察报告入口分流与问题拆解排版优化

目标：

- 洞察报告主界面保留横向入口：问题拆解、周复盘、月复盘。
- 洞察报告主界面不再直接堆叠展示完整周复盘程序统计、周复盘发送预览、本周趋势、记录数量趋势、习惯状态、情绪记录和月复盘细节。
- 点击周复盘入口后进入周复盘对应视图，再展示最近 7 天程序统计、发送预览、报告缓存、趋势图表、习惯状态和情绪记录。
- 点击月复盘入口后进入月复盘对应视图，再展示本月程序统计、发送预览、报告缓存和已有周复盘摘要。
- 问题拆解页面的三类模块重新排版，让情绪复盘、压力整理和明日计划更像可选择的工具入口，而不是普通信息卡片。

完成内容：

- `/insights` 默认只展示复盘入口和成长概览，不再直接展示周/月复盘长内容。
- `/insights?view=weekly` 展示周复盘程序统计、周复盘发送预览、周复盘报告缓存、本周趋势、记录数量趋势、习惯状态和情绪记录。
- `/insights?view=monthly` 展示月复盘程序统计、月复盘发送预览、月复盘报告缓存和已有周复盘摘要。
- 周/月复盘生成、缓存和错误跳转会保留在对应 `view` 视图中。
- 洞察报告默认页移除原今日概览，今日完成情况合并回每日工作台。
- 每日工作台今日概览先展示任务完成率、习惯打卡、今日日程和随手记录完成情况，再展示四个列表入口。
- 问题拆解页面三类模块改成可点击工具入口，点击后定位到新增记录表单。

影响范围：

- `src/app/daily/page.tsx`
- `src/app/insights/actions.ts`
- `src/app/insights/page.tsx`
- `src/app/toolbox/page.tsx`
- `src/app/globals.css`
- `memory-bank/@architecture.md`（本 Step 验收通过后更新完成态）

验证：

- `/insights` 默认只展示洞察报告入口和必要总览，不再直接堆很长的周/月复盘细节。
- `/insights?view=weekly` 或等价入口能展示周复盘相关内容。
- `/insights?view=monthly` 或等价入口能展示月复盘相关内容。
- 周复盘、月复盘发送预览仍只预览，不自动调用 AI。
- 每日工作台今日概览先显示完成情况，再显示列表入口。
- 问题拆解三类工具在 PC 和手机端都清晰、不拥挤、不文字重叠。
- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。
- `/daily`、`/insights`、`/insights?view=weekly`、`/insights?view=monthly` 和 `/toolbox` 本地返回 `200`。

## Completed

### ✅ Modification Step 18.4：PC 账号入口右上角与公开版设置页改造

目标：

- PC 端账号登录状态从左下角移到页面右上角，和移动端右上角账号入口保持一致。
- 左侧导航只保留主导航和产品标识，不再展示过时的内部阶段卡片。
- 设置页改成适合公开版用户看到的"账号与应用设置"，不再对外展示 Supabase URL、Database URL、service role key、AI API key、AI provider 等内部配置状态。
- 外部用户不适合看到的内部部署、密钥、数据库健康检查和开发阶段说明从公开界面移除。
- 对于只有基础页面壳、暂不适合公开暴露的入口，优先收敛到主流程或通过登录/空状态解释，避免像内部开发后台。

完成内容：

- PC 端新增顶部横条，账号状态和登录/退出入口统一放在右上角。
- 移除左侧导航底部的"当前阶段"内部卡片。
- 移除左侧导航底部的"账号状态"卡片，账号能力统一由顶部横条负责。
- 设置页改名为"账号与应用设置"，只展示用户可理解的账号信息和功能可用性状态。
- 设置页移除 Supabase URL、public key、service role key、Database URL、数据库连接检查、AI provider、AI base URL、AI API key、各复盘模型名称等内部配置字段。
- 设置页新增"功能可用性"区块，按任务管理、习惯打卡、日程记录、随手记录、洞察报告与图表、AI 复盘展示当前可用状态。
- 设置页新增"关于 AI 复盘"说明，明确 AI 是可选增强，未配置时不影响普通功能。
- 新增 `.desktop-account-button` 样式，保持与移动端账号按钮一致的视觉风格。

验证：

- `npm run lint` 通过。
- `git diff --check` 通过。
- `npm run build` 通过。
- PC 端右上角能看到账号状态和登录/退出入口。
- 左侧导航底部不再显示"认证基线接入"等内部阶段说明。
- 设置页不出现 Supabase、Database URL、service role key、AI API key、AI provider 等内部配置字段。
- 未登录和已登录状态下设置页都不会泄露密钥、连接字符串或底层错误。

## Planned

### Modification Step 20.1：Excel 历史数据迁移 dry-run

**目标**：

- 将 `Faye的成长计划.xlsx` 中从 Coze + 飞书多维表格沉淀的数据迁移到当前系统前，先做只读预览。
- 明确 Excel 工作表到系统数据表的字段映射、分类映射、状态映射、日期转换和需要人工确认的边界。
- 新增 dry-run 脚本，只解析 Excel 并输出计划导入数量、跳过数量、警告和样例，不连接数据库、不写入真实数据。

**预计影响范围**：

- `memory-bank/modification-plan.md`
- `scripts/README.md`
- `scripts/import_growth_plan_dry_run.py`

**迁移范围**：

- `固定日程` -> `schedule_items`
- `任务` -> `tasks`
- `习惯` -> `habits`
- `打卡记录` -> `habit_checkins`
- `灵感` -> `ideas`
- `人生笔记` -> `life_events`
- `纪念日` -> `anniversaries`
- `礼物记录` -> `gift_records`

**边界**：

- 本 Step 不写数据库，不读取或修改 `.env.local`，不执行真实导入。
- 真实导入必须在 dry-run 结果确认后单独 Step 执行，并再次确认目标账号 `user_id`。
- Excel 中的飞书任务 ID、飞书日历事件 ID 只作为导入时的临时关联依据，不写入当前业务表。

**dry-run 当前预览结果**：

- Excel 工作表记录数：`固定日程` 6、`任务` 80、`习惯` 8、`打卡记录` 3、`灵感` 9、`人生笔记` 6、`纪念日` 13、`礼物记录` 6。
- 计划导入总数：125 条；跳过：7 条；提示：5 条。
- 计划导入：`schedule_items` 5、`tasks` 80、`habits` 8、`habit_checkins` 3、`ideas` 5、`life_events` 5、`anniversaries` 13、`gift_records` 6。
- 跳过规则：停用固定日程因当前系统无 `is_active` 字段默认跳过；灵感/人生笔记缺少内容或日期默认跳过。
- 需要确认：`每周三、周日` 固定日程会拆成 2 条 weekly 日程；2 条固定日程 `是否启用` 为空，dry-run 暂按启用；2 条礼物记录缺少礼物内容，dry-run 暂用对方反馈作为礼物名称。

**验证**：

- dry-run 能输出每个工作表的计划导入数量、跳过数量、警告和样例。
- `git diff --check` 通过。

### Modification Step 20.2：Excel 历史数据迁移真实导入准备

**目标**：

- 在不立即写入数据库的前提下，准备真实导入脚本。
- 真实导入脚本复用 Step 20.1 的 Excel 解析与字段映射，避免 dry-run 和 apply 规则分叉。
- 导入前必须先确认目标 Supabase 账号，并能查看该账号当前已有数据量。

**预计影响范围**：

- `scripts/README.md`
- `scripts/import_growth_plan_dry_run.py`
- `scripts/import_growth_plan_apply.mjs`
- `memory-bank/modification-plan.md`

**导入脚本边界**：

- `--mode plan`：不连接数据库，只输出计划数量。
- `--mode check`：只读数据库，确认目标账号与现有数据量。
- `--mode apply`：写入数据库，必须额外提供 `--confirm-import IMPORT_FAYE_GROWTH_PLAN`，且执行前需要再次单独确认。
- 所有业务表写入都带目标账号 `user_id`；飞书外部 ID 只用于导入期间关联灵感、任务和礼物，不写入业务表。
- 导入脚本做基础去重，优先按当前账号下的日期、标题、内容、对象等自然键判断，避免重复导入同一批历史数据。

**只读账号检查结果**：

- 目标账号：`2215128728@qq.com`
- 目标 `user_id`：`98779cb3-d200-4a9f-9b84-7ea206f89e0d`
- 本次计划导入：125 条。
- 该账号当前已有数据量：`tasks` 8、`habits` 1、`habit_checkins` 4、`schedule_items` 4、`ideas` 0、`life_events` 2、`anniversaries` 0、`gift_records` 0。
- 本检查只读数据库，没有写入数据。

**验证**：

- `python3 scripts/import_growth_plan_dry_run.py --format json` 能输出完整 JSON 计划。
- `node --check scripts/import_growth_plan_apply.mjs` 通过。
- `node scripts/import_growth_plan_apply.mjs --mode plan` 能输出计划数量且不连接数据库。
- `node scripts/import_growth_plan_apply.mjs --mode check --email 2215128728@qq.com` 能只读确认目标账号和现有数据量。
- `git diff --check` 通过。

### Modification Step 20.3：Excel 历史数据真实导入

**目标**：

- 将 `Faye的成长计划.xlsx` 中确认可导入的历史数据写入 `2215128728@qq.com` 账号下。
- 保留当前账号已有数据，导入脚本按自然键查重，避免重复写入同一批历史数据。

**执行结果**：

- 已执行真实导入，目标账号 `2215128728@qq.com`，目标 `user_id` 为 `98779cb3-d200-4a9f-9b84-7ea206f89e0d`。
- 由于当前 Node 22 + `postgres` 连接在连续写入时会出现 `CONNECTION_CLOSED`，导入脚本改为每条记录使用新连接、写完立即关闭的保守模式；该方式较慢但可恢复，失败后可安全重跑。
- 导入完成后的只读计数：`tasks` 85、`habits` 8、`habit_checkins` 7、`schedule_items` 9、`ideas` 5、`life_events` 7、`anniversaries` 13、`gift_records` 6。
- 本次导入没有写入飞书任务 ID 或飞书日历事件 ID；这些外部 ID 只用于导入期间关联灵感、任务、纪念日和礼物。
- Excel 中被跳过的数据保持为：2 条停用固定日程、4 条空灵感、1 条空人生笔记。

**验证**：

- `node scripts/import_growth_plan_apply.mjs --mode check --email 2215128728@qq.com` 通过，只读确认导入后计数。
- `python3 scripts/import_growth_plan_dry_run.py` 通过。
- `node --check scripts/import_growth_plan_apply.mjs` 通过。
- `git diff --check` 通过。

### Modification Step 19：移动端优先重构与 AI 自然语言输入

**背景**：
- 当前系统以桌面端每日工作台为核心，移动端体验受限。
- 用户希望通过自然语言轻松记录任务、日程、习惯、事件、灵感等，同时保留手动查看、创建、编辑能力。
- 优先移动端界面使用，后续可能扩展为小程序。
- 脱离飞书，数据完全由 growth-insight-system 管理。

**核心变更**：

1. **底部 5 Tab 导航**（替代当前桌面端侧边栏）
   - 清单：任务 / 日程 / 习惯 / 灵感（顶部切换）
   - 人生：事件 / 纪念日 / 礼物（顶部切换）
   - AI：聊天式界面 + 创建快捷键 + 输入框
   - 复盘：数据可视化 + 历史记录 + 导出
   - 设置：账号与应用设置

2. **清单页重构**
   - 顶部切换：任务 / 日程 / 习惯 / 灵感
   - 任务 + 日程 + 习惯：列表 + 复选框（标记完成/打卡）
   - 灵感：内容预览 + 日期 + 状态 + 转化入口
   - 视图切换：列表视图 / 周日历视图（横向滑动，每周 7 天）
   - 周历：日程按时间线在上方，任务在下方，合并显示

3. **人生页重构**
   - 事件从原"随手记录"移入人生页，定位为日记式记录
   - 顶部切换：事件 / 纪念日 / 礼物
   - 事件：内容预览 + 日期 + 情绪标签
   - 纪念日 + 礼物：已有，移动端优化

4. **AI 聊天界面**
   - 聊天式 UI，底部输入框
   - 输入框上方快捷键（只含创建类）：创建任务 / 创建日程 / 创建习惯 / 记录事件 / 记录灵感 / 创建纪念日
   - 点击快捷键 → 指定类型 → 输入内容 → 直接创建（不调用 AI 解析）
   - 不点快捷键直接输入 → AI 自动识别意图 → 返回确认卡片 → 确认后创建
   - 不包含打卡、转化等操作，这些在清单/人生页手动操作
   - 第一阶段用规则解析做 MVP，后续可切换 AI 解析

5. **数据层**
   - 任务表和日程表保持独立，不合并
   - 灵感表增加转化相关字段：`converted_to_type`、`converted_to_id`、`shelved_at`
   - 第一阶段使用 Server Actions，后续做小程序时再抽成独立 API

**分阶段执行**：

| 阶段 | 内容 |
|---|---|
| 19.1 | 灵感表增加转化字段 + 迁移 |
| 19.2 | 底部导航重构（5 Tab） |
| 19.3 | 清单页重构（4类切换 + 复选框 + 周历） |
| 19.4 | 人生页重构（事件移入 + 3类切换） |
| 19.5 | AI 聊天界面 + 快捷键 + 规则解析 MVP |
| 19.6 | 复盘页移动端优化 |
| 19.7 | 独立 API 层（为小程序准备） |

**预计影响范围**：
- `src/components/` - 新增底部导航、清单页、人生页、AI 聊天组件
- `src/app/` - 新增路由和页面
- `src/db/schema.ts` - 灵感表增加字段
- `drizzle/` - 新增迁移文件
- `memory-bank/@architecture.md` - 更新页面结构和路由
- `memory-bank/progress.md` - 记录进度

## Completed

### ✅ Modification Step 21：移动端体验优化与功能增强

**目标**：
- 修复人生页面新旧代码冲突导致的显示异常
- 优化复盘页、AI界面、清单页的移动端体验
- 新增设置页登录入口、昵称编辑和账号注销功能

**完成内容**：

1. **人生页面修复（Step 21.0）**
   - 清理 `src/app/life/page.tsx` 中重复的纪念日/礼物 CRUD 区块（约140行代码）
   - 删除不再使用的组件和辅助函数
   - 更新 `LifeClient` 组件，新增 `isLoggedIn` 和 `loginPath` props
   - 未登录状态在各 tab 显示清晰的登录入口

2. **设置页登录入口与昵称编辑 + 账号注销（Step 21.1）**
   - 未登录状态显示"登录/注册"按钮
   - 已登录状态支持修改昵称，存储在 Supabase Auth `user_metadata` 中
   - 账号注销功能：二次确认 + 软删除所有业务数据 + 退出登录
   - 新增 `updateNicknameAction` 和 `deleteAccountAction`

3. **清单页各模块新增按钮（Step 21.3）**
   - 任务/日程/习惯/灵感列表右上角添加"新增"按钮
   - 点击后跳转到每日工作台对应视图并展开创建表单

4. **复盘页成长概览置顶（Step 21.4）**
   - 将"成长概览"KPI 卡片移到复盘页面最上方显示
   - 纯 UI 顺序调整

5. **AI 快捷键顺序调整 + 礼物记录（Step 21.5）**
   - 快捷键调整为两行：第一行（任务/日程/习惯/灵感），第二行（事件/纪念日/礼物）
   - 新增"礼物记录"快捷键，支持 AI 对话中直接创建礼物

6. **AI 界面对话框样式改造（Step 21.6）**
   - 改为微信风格聊天气泡样式
   - AI 消息左对齐浅色背景，用户消息右对齐深色背景
   - 输入区域和快捷键包裹在统一背景框内

**影响文件**：
- `src/app/life/page.tsx`
- `src/components/life/life-client.tsx`
- `src/app/settings/page.tsx`
- `src/app/auth/actions.ts`
- `src/components/checklist/checklist-client.tsx`
- `src/app/insights/page.tsx`
- `src/components/ai/ai-chat-client.tsx`
- `src/app/globals.css`
- `memory-bank/progress.md`

**验证**：
- `npm run build` 通过。
- 所有路由正常生成（22个路由）。

## Candidate Modifications

### 后续观察

- 本地页面验收和必要的测试数据闭环；如写入真实数据库，测试通过后必须删除或软删除测试数据。
- 继续观察日程循环在真实使用中的边界，例如每月 29/30/31 日、无结束日期的长期循环、跨月展示。
