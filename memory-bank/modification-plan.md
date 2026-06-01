# Growth Insight System - Modification Plan

## 说明

本文记录基础闭环之后的迭代改造计划，用于承接真实使用中发现的体验问题、bug 修复、数据迁移和功能增强。

当前使用方式：

- 先看 `progress.md` 判断项目已完成到哪一步。
- 再看本文 `Planned` 区域确认下一轮准备做什么。
- 本文不作为权威完成流水账；已完成状态以 `progress.md` 为准。
- 已完成的 Modification Step 可以在本文保留简短结果，避免重复记录完整执行历史。

文档分工：

- `implementation-plan.md`: 从 0 到 1 的基础功能主线计划，保留历史，不再追加新的 Modification Step。
- `modification-plan.md`: 自用和上线后的迭代计划，重点记录当前和未来要做的目标、范围和验证方式。
- `progress.md`: 权威当前状态和完成流水账，按真实执行顺序记录每个已完成 Step。
- `@architecture.md`: 当前真实系统结构，只记录已经落地的重要结构变化。

执行原则：

- 每个迭代 Step 开始前说明目标、影响范围和验证方式。
- 涉及数据库 schema、真实迁移、环境变量、密钥、部署和 `git push` 时继续单独确认。
- 如测试需要写入真实数据库，测试通过后必须删除或软删除测试数据。
- 完成后更新 `progress.md`；涉及页面结构、数据结构、认证流程、核心数据流或重要视觉系统时同步更新 `@architecture.md`。

## Planned

### Modification Step 27：产品体验全面审查修复（4 大类 12 项）

基于 Faye 从产品视角提出的全面审查反馈，以下按优先级分 4 类逐步修复：

#### 一、P0 功能缺失 / 核心逻辑 Bug

##### ✅ Step 27.1：清单页日程表单补齐循环选项（已完成）

- **现状**：清单页日程新增表单（`checklist-client.tsx:647-680`）没有循环周期选择器；`checklist/actions.ts:119` 硬编码 `recurrence: "none"`。用户无法从清单页创建循环日程，循环功能形同虚设。
- **目标**：清单页日程新增表单增加"循环周期"下拉选择（不循环/每天/每周/每月），默认"不循环"；对应 action 读取表单值，不再硬编码。
- **影响文件**：`src/components/checklist/checklist-client.tsx`、`src/app/checklist/actions.ts`
- **完成结果**：清单页新增日程已支持选择循环周期；`createChecklistScheduleAction()` 会校验并写入 `recurrence`，非法或缺失时回退为 `none`。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过；`npm run lint` 因项目既有 lint 问题未通过，本 Step 未扩大范围处理。

##### ✅ Step 27.2：日程详情页补齐循环字段编辑（核对完成）

- **现状**：日程详情页编辑表单（`records/[kind]/[id]/page.tsx`）不支持编辑 `recurrence`、`start_date`、`end_date` 字段。架构文档确认"日程详情支持编辑标题、分类、日期、开始时间、结束时间、说明和软删除"——缺少循环相关字段。
- **目标**：日程详情编辑表单增加开始日期、结束日期和循环周期字段；保存时写入对应字段。
- **影响文件**：`src/app/records/[kind]/[id]/page.tsx`
- **核对结果**：当前代码已经支持查看和编辑开始日期、结束日期、循环周期；`updateScheduleItemAction()` 会校验并写入 `startDate`、`endDate`、`recurrence`，数据层同步更新 `start_date`、`end_date`、`recurrence`。
- **文档修正**：同步修正 `@architecture.md` 中日程详情和 `schedule_items` 的旧描述，移除 `schedule_date` 残留表述。

##### ✅ Step 27.3：灵感列表增加复选框快捷操作（转化→新建任务）（已完成）

- **现状**：清单页灵感列表（`checklist-client.tsx:984-1020`）左侧无快捷操作，`isSelecting=false` 时渲染 `null`。灵感的状态有"待处理/已转任务/已搁置/已放弃"，但目前只能进详情页修改。
- **目标**：
  - 灵感列表左侧增加复选框，勾选后弹出确认：「将此灵感转化为新任务？」
  - 确认后：(1) 将灵感 `status` 改为 `converted`，写入 `converted_to_type=task`；(2) 跳转到清单页任务 tab 并展开新增表单，预填标题为灵感内容
  - 已转化/已搁置/已放弃的灵感不显示复选框，只显示对应状态标签
- **影响文件**：`src/components/checklist/checklist-client.tsx`、`src/app/checklist/actions.ts`
- **完成结果**：清单页待处理灵感左侧显示转化复选框；勾选并确认后直接创建新任务，并将灵感更新为 `converted_to_task`，写入 `converted_to_type=task` 和 `converted_to_id=新任务 ID`；已转化/已搁置/已放弃灵感只显示状态标签。
- **实现调整**：实际落地采用“确认后直接创建任务并回填真实任务 ID”，不采用“只预填任务表单”的中间态，避免灵感已转化但任务未保存造成数据不一致。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过；`npm run lint` 因项目既有 lint 问题未通过，本 Step 未扩大范围处理。

#### 二、P1 交互 Bug / 数据准确性

##### ✅ Step 27.4：修复推迟日期时区 Bug（已完成）

- **现状**：`checklist-client.tsx:553-556` 的推迟日期计算使用 `new Date()` + `toISOString().slice(0,10)`，这是 UTC 时间。如果用户在 UTC 和北京日期不一致的时段操作（如 UTC 23:00 = 北京次日 07:00），推迟目标日期会错误。
- **目标**：改用项目统一的 `getBeijingDateAfter()` 计算推迟目标日期。
- **影响文件**：`src/components/checklist/checklist-client.tsx`
- **完成结果**：推迟 1/3/7 天日期计算已改用 `getBeijingDateAfter(offset)`，按北京时间计算，消除 UTC 时区差异导致的日期偏差。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

##### ✅ Step 27.5：日程完成切换消除整页刷新（已完成）

- **现状**：`toggleScheduleCompletionAction`（`checklist/actions.ts:250-281`）使用 `redirect()` 导致整页刷新。任务和习惯的切换都已改为 `useActionState` 局部更新（Step 26.2/26.3），但日程没改。
- **目标**：日程完成切换改为与任务/习惯一致的 `useActionState` + 客户端状态更新，不 redirect。
- **影响文件**：`src/app/checklist/actions.ts`、`src/components/checklist/checklist-client.tsx`
- **完成结果**：`toggleScheduleCompletionAction` 改为 `useActionState` 签名，新建 `ScheduleCompletionToggle` 客户端组件，清单页日程复选框已替换为局部更新模式。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

##### ✅ Step 27.6：修复每日概览统计灵感日期口径（已完成）

- **现状**：`getDailyOverviewStatsForUser`（`user-data.ts:3636-3640`）统计灵感数量时没有日期过滤条件，列表展示按 `idea_date`。如果创建日期和灵感日期不一致，统计和列表会不匹配。任务和事件都用各自业务日期字段过滤，灵感也应该用 `idea_date`。
- **目标**：灵感统计查询改用 `idea_date` 过滤，与其他统计口径一致。
- **影响文件**：`src/lib/data/user-data.ts`
- **完成结果**：灵感统计查询补上 `.eq("idea_date", todayDate)`，与任务用 `task_date`、事件用 `event_date` 保持一致。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

##### ✅ Step 27.7：清理废弃的 `schedule_items.is_completed` 字段（已完成）

- **现状**：`schedule_items` 表有 `is_completed` 布尔字段（migration 0009），但实际完成状态已迁移到 `schedule_completions` 表（migration 0011）。`is_completed` 字段是死代码，应用代码已无引用。
- **目标**：从 schema 和数据库中删除 `is_completed` 字段。
- **影响文件**：`src/db/schema.ts`、新建数据库迁移文件
- **完成结果**：已从 Drizzle schema 移除字段定义，生成迁移 `0013_drop_is_completed.sql` 删除列并已执行到真实数据库。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过；应用代码已无 `is_completed` 引用。

#### 三、P2 搜索覆盖 / 移动端体验

##### ✅ Step 27.8：搜索扩展到日程和习惯（已完成）

- **现状**：`searchAllForUser`（`user-data.ts:3550-3556`）的 `searchTableConfig` 只覆盖 tasks、life_events、ideas、anniversaries、gift_records 五张表。搜日程标题或习惯名称无结果。
- **目标**：`searchTableConfig` 增加 `schedule_items`（搜 title）和 `habits`（搜 name）两张表。
- **影响文件**：`src/lib/data/user-data.ts`
- **完成结果**：`searchTableConfig` 新增日程和习惯配置，全局搜索已覆盖 7 张表。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

##### ✅ Step 27.9：手机端搜索入口（已完成）

- **现状**：`SearchOverlay` 只在桌面端 header（`hidden ... lg:flex`）渲染，移动端无搜索入口。
- **目标**：在移动端底部导航栏或页面顶部增加搜索入口，点击后打开搜索 overlay。
- **影响文件**：`src/components/bottom-nav.tsx`
- **完成结果**：底部导航首位新增搜索按钮，点击 dispatch Ctrl+K 事件触发 `SearchOverlay`。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

#### 四、P3 代码质量 / 性能

##### ✅ Step 27.10：日程列表查询增加数据库级日期过滤（已完成）

- **现状**：`getChecklistSchedulesForUser`（`user-data.ts:2848-2888`）加载用户所有未删除日程，然后在 JS 层做日期过滤。随着日程积累会越来越慢。
- **目标**：在 Supabase 查询层增加 `start_date` 范围过滤，减少返回数据量。
- **影响文件**：`src/lib/data/user-data.ts`
- **完成结果**：查询增加 `.lte("start_date", dateTo)`，只加载开始日期在周范围内的日程。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

##### ✅ Step 27.11：统一服务端和客户端循环日程判断逻辑（已完成）

- **现状**：循环日程的"是否命中某天"逻辑在服务端（`user-data.ts:scheduleOccursOnDate`）和客户端（`checklist-client.tsx:786-792`）各实现了一份，用的算法略有不同（服务端用 `getDaysBetween`，客户端用毫秒差值）。改了一边容易忘另一边。
- **目标**：提取 `scheduleOccursOnDate` 到 `src/lib/date.ts` 或 `src/lib/schedules/options.ts`，服务端和客户端统一调用。
- **影响文件**：`src/lib/schedules/options.ts`、`src/lib/data/user-data.ts`、`src/components/checklist/checklist-client.tsx`
- **完成结果**：`scheduleOccursOnDate` 提取到 `src/lib/schedules/options.ts`，两端统一调用；同时修正服务端 daily 循环缺少 endDate 检查的 Bug。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

##### ✅ Step 27.12：纪念日/礼物页图标与布局对齐

- **现状**：
  - 纪念日"新增"summary 缺少 `<Plus>` 图标（`life-client.tsx:372` 只有文字"新增"）
  - 纪念日"选择"和"新增"不在同一个 flex 容器，导致不对齐（`life-client.tsx:357-422` 结构问题）
  - 礼物列表需检查是否有同样问题
- **目标**：纪念日和礼物的"选择"+"新增"按钮放入同一个 `flex items-center gap-2` 容器，所有"新增"summary 统一包含 `<Plus>` 图标，与清单页保持一致。
- **影响文件**：`src/components/life/life-client.tsx`
- **完成结果**：纪念日和礼物的"新增"summary 均补上 `<Plus>` 图标；"选择"和"新增"放入同一 `flex items-center gap-2` 容器。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

#### Step 27 执行顺序

1. **Step 27.1**：清单页日程表单补齐循环选项（功能缺失，最高优先）
2. **Step 27.2**：日程详情页补齐循环字段编辑
3. **Step 27.3**：灵感列表复选框→转化任务
4. ✅ **Step 27.4**：推迟日期时区 Bug
5. ✅ **Step 27.5**：日程完成切换消除整页刷新
6. ✅ **Step 27.6**：灵感统计日期口径修正
7. ✅ **Step 27.7**：清理废弃 is_completed 字段（需数据库迁移）
8. ✅ **Step 27.8**：搜索扩展到日程和习惯
9. ✅ **Step 27.9**：手机端搜索入口
10. ✅ **Step 27.10**：日程查询数据库级过滤
11. ✅ **Step 27.11**：统一循环判断逻辑
12. ✅ **Step 27.12**：纪念日/礼物页图标与布局对齐

---

### Modification Step 28：移动端体验优化与习惯补打卡

基于 Faye 实际使用中发现的移动端体验问题，以下按优先级逐步修复：

#### 一、P0 功能 Bug

##### ✅ Step 28.1：修复移动端搜索按钮不弹出搜索框（已完成）

- **现状**：底部导航搜索按钮通过 `window.dispatchEvent(new KeyboardEvent("keydown", { ctrlKey: true, key: "k" }))` 触发搜索，但移动端某些浏览器对程序触发的 `KeyboardEvent` 有限制，导致搜索框不弹出。
- **目标**：改用自定义事件机制，确保移动端搜索按钮能可靠触发搜索框。
- **影响文件**：`src/components/bottom-nav.tsx`、`src/components/search-overlay.tsx`
- **验证方式**：移动端点击搜索按钮，搜索框正常弹出；桌面端 Ctrl+K 快捷键仍正常工作。

##### ✅ Step 28.2：新增习惯补打卡功能（已完成）

- **现状**：`toggleHabitCheckinAction`（`src/app/daily/actions.ts:272`）硬编码 `todayDate = getBeijingDateValue()`，只能打卡/取消今天。用户漏打卡时无法补打。
- **目标**：
  - 修改 `toggleHabitCheckinAction` 支持可选的 `checkinDate` 参数
  - 在习惯详情页（`/checklist/habits/[id]`）添加补打卡 UI
  - 补打卡日期范围限制为最近 30 天内
  - 增加日期校验，防止超出范围
- **影响文件**：`src/app/daily/actions.ts`、`src/app/checklist/habits/[id]/page.tsx`
- **验证方式**：
  - 打卡今天正常工作（默认行为）
  - 在习惯详情页选择过去 30 天内的日期补打卡成功
  - 选择超出 30 天范围的日期被拒绝
  - 补打卡后累计次数和连续天数正确更新

#### 二、P1 交互优化

##### ✅ Step 28.3：清单页选择按钮与新增按钮样式统一并排（已完成）

- **现状**：清单页任务/日程/习惯/灵感列表的"选择"按钮使用 `quiet-button` 样式，"新增"按钮使用 `soft-button` 样式，两者视觉效果不一致。且两个按钮没有明确的并排布局。
- **目标**：
  - 将"选择"按钮改为 `soft-button` 样式，与"新增"保持一致
  - 确保两个按钮在同一 `flex items-center gap-2` 容器内并排展示
- **影响文件**：`src/components/checklist/checklist-client.tsx`
- **验证方式**：清单页四个 tab 的"选择"和"新增"按钮视觉风格一致、并排对齐。

#### 三、P2 待排查

##### ✅ Step 28.4：排查日程新建/修改功能（已完成）

- **现状**：用户报告移动端日程无法新建和修改。从代码结构看，日程创建表单（清单页日程 tab）和编辑表单（日程详情页）都存在。
- **目标**：排查并修复可能导致移动端日程新建/修改失败的问题。
- **可能原因**：
  - 清单页日程 tab 的 `<details>/<summary>` 元素在移动端交互异常
  - 日程创建 Action 执行后页面刷新问题
  - 表单字段验证问题
- **影响文件**：`src/components/checklist/checklist-client.tsx`、`src/app/checklist/actions.ts`
- **验证方式**：移动端能正常新建日程、编辑日程。

#### Step 28 执行顺序

1. ✅ **Step 28.1**：修复移动端搜索按钮（功能 Bug，最高优先）
2. ✅ **Step 28.2**：新增习惯补打卡功能（功能增强）
3. ✅ **Step 28.3**：清单页按钮样式统一（交互优化）
4. ✅ **Step 28.4**：排查日程新建/修改问题（已完成）

---

### Modification Step 26：消除整页刷新、日程/延期改进、批量删除、搜索、规则引擎优化与代码清理

基于 Faye 确认的改进方向，以下按优先级排序逐步实施：

#### ✅ Step 26.1：重复工具函数提取（已完成）

- **完成内容**：
  - 新建 `src/lib/date.ts`：`getBeijingDateValue`、`getBeijingDateAfter`（统一 `string | Date` 签名）、`getBeijingMonthStart`、`getBeijingMonthEnd`、`getDateValuesBetween`
  - `src/lib/utils.ts`：新增 `normalizeStringList`
  - 16 个文件的本地重复定义已删除，统一导入公共模块
  - `export/markdown/route.ts` 的 zh-CN 显示格式版本保持本地定义
- **验证**：`npx tsc --noEmit` 通过

#### ✅ Step 26.2：消除任务复选框整页刷新（已完成）

- **完成内容**：
  - 新建 `src/components/task-completion-toggle.tsx`：客户端组件，`useActionState` + `isPending` 禁用态
  - `src/app/daily/actions.ts` 新增 `toggleTaskCompletionAction`：`useActionState` 签名，不 redirect，返回 `{ success, error }`
  - `src/app/daily/page.tsx` 和 `src/components/checklist/checklist-client.tsx` 的内联 `<form>` 全部替换为 `<TaskCompletionToggle>`
- **验证**：`npx tsc --noEmit` 通过

#### ✅ Step 26.3：消除习惯打卡/删除/置顶整页刷新（已完成）

- **现状**：习惯打卡、删除记录、置顶/取消置顶同样触发整页刷新。
- **目标**：与 Step 26.2 同理改造习惯打卡、删除、置顶按钮，统一做到操作无刷新。
- **方案**：
  - `HabitCheckinAction`、`DeleteScheduleAction`、`DeleteLifeEventAction`、`DeleteIdeaAction`、`PinAction` 等内联表单改为客户端 `form action` + `useActionState`
  - 对应 action 取消 redirect，返回操作结果
  - 列表组件更新本地状态
- **影响文件**：`src/app/daily/page.tsx`、`src/app/daily/actions.ts`、`src/components/checklist/checklist-client.tsx`

#### ✅ Step 26.4：修复习惯周历矩阵显示 Bug（已完成）

- **现状**：清单页习惯的周历视图（`checklist-client.tsx:810-815`）对 7 天中每一天都只显示 `habit.isCheckedOnDate`（即今天的打卡状态），导致周历矩阵实际上只反映今天，没有按日显示历史打卡。
- **目标**：周历按日显示每个习惯的真实打卡状态。
- **方案**：在 `user-data.ts` 中新增批量查询函数，按 habitIds + 日期范围查询打卡记录；checklist-client 的周历用该数据填充每日点阵。
- **影响文件**：`src/lib/data/user-data.ts`、`src/components/checklist/checklist-client.tsx`
- **完成结果**：`getChecklistHabitsForUser` 函数已返回 `checkedDates` 数组，包含指定日期范围内所有打卡日期；清单页周历视图已改用 `habit.checkedDates.includes(d.date)` 显示每日打卡状态。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

#### ✅ Step 26.5：日程字段简化 + 循环日程按天打卡修复（已完成）

- **现状**：
  - `schedule_items` 表存在 `schedule_date`、`start_date`、`end_date` 三个日期字段，且创建表单同时展示三者，冗余且困惑。
  - 已存在 `schedule_completions` 表（`schedule_id + completion_date` 唯一约束），但循环日程（daily/weekly/monthly）的按天打卡未正确工作——首次打卡后所有日期都显示已完成。
- **目标**：
  - 去掉 `schedule_date` 字段，只依赖 `start_date` + 循环规则判断日程是否命中某天。
  - 修复循环日程的 `schedule_completions` 写入逻辑，实现每日期独立打卡。
- **方案**：
  - **数据库迁移**：`schedule_items` 删除 `schedule_date` 列。
  - **查询修复**：`getTodayScheduleItemsForUser` 改为纯靠 `start_date <= today AND (end_date IS NULL OR end_date >= today) AND 循环规则命中今天`。成长记录、洞察报告、导出等所有使用 `schedule_date` 的地方同步清理。
  - **打卡修复**：检查 `toggleScheduleCompletionAction` 和清单页周历中循环日程的完成判断逻辑，确保循环日程每日期独立写入/读取 `schedule_completions`。
  - **验证**：创建每天循环日程如"吃异维A"→周一打卡→周二列表仍显示该日程且未完成→周二打卡→周一保持已完成。
- **影响文件**：`src/db/schema.ts`、新建数据库迁移文件、`src/lib/data/user-data.ts`、`src/app/checklist/actions.ts`、`src/app/daily/actions.ts`、`src/components/checklist/checklist-client.tsx`、`src/app/daily/page.tsx`、`src/app/insights/page.tsx`、`src/app/records/page.tsx`
- **完成结果**：已创建迁移文件 `0011_schedule_completions.sql`（新建 `schedule_completions` 表）和 `0012_remove_schedule_date.sql`（删除 `schedule_items.schedule_date` 列）；所有查询已统一使用 `start_date + recurrence` 规则判断日程是否命中某天；循环日程按天打卡已正常工作。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过；数据库迁移已执行。

#### ✅ Step 26.6：任务延期逻辑改进（已完成）

- **现状**：
  - 延期把 `task_date` 直接改成新日期，任务从原日期消失，原日期的完成率被影响。
  - 必须选具体日期，没有"以后再说"选项。
  - 交互路径长：点延期→跳详情页或展开表单→选日期→提交。
- **目标**（三点一起改）：
  - **A. 延期不搬走**：不改 `task_date`，仅在原日期标记为"已延期 → X月X日"，原日期统计不受影响。
  - **B. 无限延期**：`postponed_to_date` 允许 `null`，表示"以后再说"。
  - **C. 简化交互**：行内快捷菜单，一键操作无刷新。
  - **D. 归属规则**：延期任务完成时，`completed_at` 写入实际完成日期，统计归实际完成日期，`task_date` 始终保留原始日期。
- **方案**：
  - **Server Action 改造**：`updateTaskStatusAction` 中的延期逻辑不再修改 `task_date`，只设置 `is_postponed=true`、`postponed_to_date`（可选）。新增 `postponeTaskAction` 简便 action。
  - **快捷菜单**：任务行末尾加延期按钮，点击弹出菜单（CSS dropdown）：
    ```
    推迟 1 天 │ 推迟 3 天 │ 推迟 1 周 │ 以后再说 │ 取消
    ```
    选择后直接调用 `postponeTaskAction`，无页面刷新。
  - **展示改造**：延期任务在原日期列表中显示"已延期 → 5/28"样式标签，`postponed_to_date=null` 时显示"已延期 · 待定"。
  - **完成归属**：当延期任务被标记完成时，`completed_at` 使用实际完成日期（系统当前时间），`task_date` 不改，统计归入实际完成日期。
  - **延期任务专区**（如 Step 25.x 未完成则一并做）：清单页顶部展示所有 `is_postponed=true AND status!=completed` 的任务。
- **影响文件**：`src/app/daily/page.tsx`、`src/app/daily/actions.ts`、`src/components/checklist/checklist-client.tsx`、`src/app/checklist/page.tsx`、`src/app/globals.css`
- **完成结果**：`postponeTaskForUser` 函数已实现"延期不搬走"逻辑（不修改 `task_date`）；`postponeTaskAction` 已新增，支持 `postponed_to_date` 为 `null`；清单页已实现延期快捷菜单和延期任务专区；延期任务展示已改为"已延期 → X月X日"或"已延期 · 待定"样式。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

#### ✅ Step 26.7：批量删除（清单页 + 人生页）（已完成）

- **现状**：删除一条记录需要点进详情页或列表上的删除按钮，逐个操作。
- **目标**：在清单页（任务/日程/习惯/灵感）和人生页（事件/纪念日/礼物）各 tab 增加选择模式。
- **方案**：
  - 每个 tab 顶部加"选择"按钮，进入选择模式后每行左侧出现 checkbox
  - 选中后底部出现"删除 N 项"确认按钮
  - 确认后弹二次确认对话框，执行批量软删除
  - 新增 Server Action：`batchSoftDeleteAction`，接收 `{ kind: string, ids: string[] }`
- **影响文件**：`src/components/checklist/checklist-client.tsx`、`src/components/life/life-client.tsx`、`src/app/checklist/actions.ts`、`src/app/life/actions.ts`、`src/app/daily/actions.ts`、`src/app/globals.css`
- **完成结果**：清单页和人生页已实现选择模式，每个 tab 顶部有"选择"按钮，进入选择模式后每行左侧出现 checkbox；选中后底部出现"删除 N 项"确认按钮；`batchSoftDeleteAction` 已在 `checklist/actions.ts` 和 `life/actions.ts` 中实现，支持批量软删除任务、日程、习惯、灵感、事件、纪念日和礼物。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

#### ✅ Step 26.8：全局搜索（已完成）

- **现状**：无法搜索已有记录。想找一条之前的事件或任务只能翻成长记录。
- **目标**：在顶部导航栏增加搜索入口，支持搜索任务标题、事件内容、灵感内容、纪念日标题、礼物名称。
- **方案**：
  - 在 `app-shell.tsx` 的顶部区域增加搜索图标/输入框
  - 按 `Ctrl+K` 或点击搜索框打开搜索界面
  - 模糊匹配标题和内容，按时间倒序排列
  - 可点击跳转到对应详情页
  - 新增搜索路由 `/api/search` 或服务端搜索函数
- **影响文件**：`src/components/app-shell.tsx`、`src/lib/data/user-data.ts`（新增搜索函数）、`src/app/globals.css`
- **完成结果**：`SearchOverlay` 组件已实现，支持 `Ctrl+K` 快捷键打开；`searchAllForUser` 函数已实现，支持搜索 7 张表（任务、事件、灵感、纪念日、礼物、日程、习惯）；移动端底部导航栏已新增搜索按钮（Step 27.9）；搜索路由 `/api/search` 已实现。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

#### ✅ Step 26.9：AI 规则引擎提取与增强（已完成）

- **现状**：`parseIntent` 混在 `ai-chat-client.tsx` 中，时间解析弱（不支持"下午3点"、"三点"），日期只认今天，分类不推断，回退策略粗暴（≥2 字符直接当 task）。
- **目标**：提取独立解析器，增强识别能力，提高首次创建准确率。
- **方案**：
  - 新建 `src/lib/intent-parser.ts`，从 `ai-chat-client.tsx` 中剥离全部解析逻辑
  - 时间增强：支持 `下午3点`、`15:00`、`三点`、`3:00pm` 等多种格式
  - 日期增强：支持 `明天`、`后天`、`下周一`、`这周五` 等相对日期
  - 分类推断：`看医生/牙医/体检` → health，`读书/学习/上课` → study，`开会/汇报/面试` → work
  - 回退优化：置信度低时展示"未识别，请选择类型"而不是硬当 task 创建
  - 不影响现有 `AiChatClient` 的调用方式
- **影响文件**：新建 `src/lib/intent-parser.ts`、`src/components/ai/ai-chat-client.tsx`
- **完成结果**：`src/lib/intent-parser.ts` 已创建，包含 `parseIntent` 函数和相关类型定义；`ai-chat-client.tsx` 已改为从 `intent-parser.ts` 导入 `parseIntent`；解析逻辑已增强，支持多种时间格式、相对日期和分类推断。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

#### ✅ Step 26.10：反馈系统改用客户端状态（已完成）

- **现状**：成功/错误提示全部通过 URL searchParams 传递（如 `?taskCreated=1`），导致 URL 膨胀 + 整页刷新。
- **目标**：改用 `useActionState` 返回值 + Toast 组件，URL 不再携带操作反馈。
- **方案**：
  - 在 layout 或 app-shell 中增加全局 Toast 容器
  - Server Action 返回 `{ success: boolean, message: string }`
  - 客户端组件根据返回值触发 Toast
  - 逐步淘汰 URL param 反馈，保留兼容
- **影响文件**：`src/components/app-shell.tsx`、`src/app/daily/page.tsx`、`src/app/checklist/page.tsx`、各 action 文件
- **完成结果**：`ToastProvider` 组件已创建并在 `layout.tsx` 中集成；`useToast` hook 已实现；清单页和人生页已使用 `addToast` 显示操作反馈；批量删除、延期等操作已改用 Toast 提示。
- **验证摘要**：`npm run build` 通过；`git diff --check` 通过。

#### Step 26.11：数据按需加载（概览页只取聚合数据）

- **现状**：每日工作台默认只显示 4 张概览卡 + 晚间总结，但服务端仍然查询了全部任务、习惯、日程、事件、灵感数据，造成浪费。
- **目标**：默认只查聚合计数；点击"查看今日任务"等入口后再加载完整列表。
- **方案**：新增 `getDailyOverviewStats` 只返回计数；列表数据改为客户端按需请求或懒加载。
- **影响文件**：`src/lib/data/user-data.ts`、`src/app/daily/page.tsx`

## Planned Steps 执行顺序

1. ✅ **Step 26.1**：重复工具函数提取
2. ✅ **Step 26.2**：整页刷新消除——任务复选框改为客户端 useActionState
3. ✅ **Step 26.3**：整页刷新消除——习惯打卡、删除/置顶按钮同理改造
4. ✅ **Step 26.4**：修复习惯周历矩阵 Bug
5. ✅ **Step 26.5**：日程字段简化 + 循环日程按天打卡修复（数据库迁移）
6. ✅ **Step 26.6**：任务延期逻辑改进（延期不搬走 + 无限延期 + 快捷菜单）
7. ✅ **Step 26.7**：批量删除
8. ✅ **Step 26.8**：全局搜索
9. ✅ **Step 26.9**：AI 规则引擎提取与增强
10. ✅ **Step 26.10**：反馈系统改用 Toast
11. ✅ **Step 26.11**：数据按需加载

### Modification Step 25：周视图日期格式、循环日程打卡、任务完成不跳转、延期任务专区、日程列表过滤、成长记录状态展示

基于 Faye 实际使用后的反馈，以下 6 项改进按 Step 循环逐步实施：

#### 改进点 1：周视图日期范围去掉年份

- **现状**：清单页周视图的日期范围显示为 `2026-05-18 ~ 2026-05-24`，占用空间较长。
- **目标**：改为 `05-18 ~ 05-24`，去掉年份，更紧凑。
- **影响文件**：`src/components/checklist/checklist-client.tsx`

#### 改进点 2：循环日程按日期记录完成状态

- **现状**：日程的 `isCompleted` 是永久布尔值，打在日程本身。每天循环的日程（如异维A）第一天打卡后，第二天仍显示已完成状态，无法重新打卡。
- **目标**：新建 `schedule_completions` 表（`schedule_id + completion_date` 唯一约束），打卡 action 改为 upsert 到此表；清单页和每日工作台按日期判断是否完成；周视图按日期显示打卡状态。
- **影响文件**：`src/db/schema.ts`、新建数据库迁移文件、`src/lib/data/user-data.ts`、`src/app/checklist/actions.ts`、`src/components/checklist/checklist-client.tsx`、`src/app/daily/page.tsx`（如每日工作台也展示日程完成状态）

#### 改进点 3：任务标注完成后停留在清单页

- **现状**：清单页点击任务复选框后，`updateTaskStatusAction` 统一 redirect 到 `/daily`，离开清单页面。
- **目标**：打卡 form 增加 `source` 隐藏字段；action 根据来源判断重定向到 `/checklist` 还是 `/daily`，清单页标注完成后保持在清单界面。
- **影响文件**：`src/components/checklist/checklist-client.tsx`、`src/app/daily/actions.ts`

#### 改进点 4：延期任务专区

- **现状**：清单页只查询 `task_date` 在当前周范围内的任务，延期到未来周或过去的任务不会显示在清单里。
- **目标**：在清单任务列表顶部增加"延期任务"专区，展示所有未完成且已延期的任务（`is_postponed = true` 且 `status != completed`），按 `postponed_to_date` 排序；正常任务列表保持按周范围过滤。
- **影响文件**：`src/lib/data/user-data.ts`（新增查询延期任务的函数）、`src/app/checklist/page.tsx`、`src/components/checklist/checklist-client.tsx`

#### 改进点 5：清单日程列表只显示今天及之前的日程

- **现状**：清单日程列表显示当前周范围内的所有日程，包括未来的日程。
- **目标**：清单日程列表只显示今天及今天之前的日程；明天及未来的日程不在清单显示，需到成长记录里查看。
- **影响文件**：`src/components/checklist/checklist-client.tsx`

#### 改进点 6：成长记录列表完成状态改为复选框+颜色

- **现状**：成长记录列表中任务/习惯/日程的完成状态通过标题下方的文字标签（已完成、未完成、未开始、延期）展示。
- **目标**：改为像清单列表一样，左侧放复选框，通过勾选状态和颜色变化来表达是否已完成，去掉文字状态标签。
- **影响文件**：`src/app/records/page.tsx`、`src/app/globals.css`

## Planned Steps 执行顺序

1. **Step 25.1**：周视图日期格式精简（UI 改动，最轻量）
2. **Step 25.2**：任务标注完成不跳转（source 参数 + action 路由判断）
3. **Step 25.3**：延期任务专区（新增查询 + UI 专区）
4. **Step 25.4**：清单日程列表只显示今天及之前的日程（UI 过滤）
5. **Step 25.5**：成长记录列表完成状态改为复选框+颜色（UI 改造）
6. **Step 25.6**：循环日程按日期打卡（DB schema + migration + user-data + actions + UI）

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

### ✅ Modification Step 24.3：人生页加载修复

完成内容：

- 移除 `life/page.tsx` 第 175 行重复调用 `getUpcomingAnniversariesForUser(user.id)`。
- 将 `upcomingAnniversaries` 变量提升到函数顶层作用域，使用 `Promise.allSettled` 中已获取的结果。
- 避免重复数据库查询导致的潜在加载失败问题。

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
