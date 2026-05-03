# Growth Insight System - Architecture

## 1. Current Stage

当前项目已完成 Step 1.3，具备 Next.js App Router 基础应用骨架、初始目录结构、共享导航和基础页面壳。

当前已存在：

- Next.js 应用配置。
- TypeScript 配置。
- Tailwind CSS v4 基础样式入口。
- `src/app` 应用入口。
- `src/components`、`src/contexts`、`src/db` 和 `src/lib/ai` 初始目录。
- 共享应用壳和主导航。
- 成长主页、每日工作台、成长记录、洞察报告、个人说明书和设置页。
- shadcn/ui 预备配置。

尚未开始：

- Supabase 连接。
- Drizzle schema。
- 注册登录。
- 真实业务数据读写。
- AI provider adapter。
- 完整视觉规范。

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

当前 Step 1.1-Step 1.3 只建立应用骨架、目录和页面壳，不包含真实业务逻辑。各文件职责如下：

- `package.json`: 定义项目名称、运行脚本和基础依赖。当前脚本包括 `dev`、`build`、`start` 和 `lint`。
- `tsconfig.json`: TypeScript 配置，启用严格模式，并设置 `@/*` 指向 `src/*`。
- `next-env.d.ts`: Next.js 自动类型声明入口。
- `next.config.ts`: Next.js 配置文件，当前保持最小配置。
- `postcss.config.mjs`: Tailwind CSS v4 的 PostCSS 插件配置。
- `eslint.config.mjs`: ESLint flat config，继承 Next.js core web vitals 和 TypeScript 规则。
- `components.json`: shadcn/ui 配置，指定 UI 组件别名、样式入口和图标库。
- `.gitignore`: 忽略依赖、构建产物、环境变量、本地调试日志和 TypeScript 构建缓存。
- `src/app/layout.tsx`: App Router 根布局，定义页面 HTML 语言和全局 metadata。
- `src/app/page.tsx`: 成长主页页面壳，展示今日行动进度、本周指标和最近复盘等占位区。
- `src/app/daily/page.tsx`: 每日工作台页面壳，预留今日概览、今日任务、习惯打卡、今日日程和随手记录分区。
- `src/app/records/page.tsx`: 成长记录页面壳，预留任务、习惯、日程、事件和灵感记录入口。
- `src/app/insights/page.tsx`: 洞察报告页面壳，预留今日概览、本周趋势、习惯状态和情绪记录。
- `src/app/manual/page.tsx`: 个人说明书页面壳，预留人生阶段、目标、能力画像、情绪模式和常见内耗点。
- `src/app/settings/page.tsx`: 设置页页面壳，预留应用、数据库、AI 和账号状态。
- `src/app/globals.css`: 全局样式入口，导入 Tailwind CSS，并设置初始颜色变量和基础字体。
- `src/components/app-shell.tsx`: 共享应用壳，负责左侧或顶部主导航，并把页面内容包裹在统一布局中。
- `src/components/.gitkeep`: 保留业务组件目录。
- `src/components/ui/.gitkeep`: 保留 shadcn/ui 组件目录。
- `src/contexts/.gitkeep`: 保留 React context 目录。
- `src/db/.gitkeep`: 保留数据库 schema 和 query 目录。
- `src/lib/ai/.gitkeep`: 保留 AI provider adapter 目录。
- `src/lib/utils.ts`: 通用工具函数入口，当前提供 `cn()` 用于合并 Tailwind className。

当前骨架遵循的约束：

- 不接数据库。
- 不接认证。
- 不接 AI。
- 不写入任何环境变量。
- 只提供静态页面壳和导航，后续视觉系统在 Step 1.4 处理。

### 1.2 Current Route Map

- `/`: 成长主页。
- `/daily`: 每日工作台。
- `/records`: 成长记录。
- `/insights`: 洞察报告。
- `/manual`: 个人说明书。
- `/settings`: 设置。

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

具体字段在数据库设计 Step 细化。当前只确定实体边界。

- `users`
- `tasks`
- `habits`
- `habit_checkins`
- `schedule_items`
- `life_entries`
- `emotion_tags`
- `insight_reports`
- `personal_manuals`
- `anniversaries`
- `gift_records`
- `tool_sessions`

### 6.1 MVP Entity Semantics

- `tasks`: 任务，固定分类为学习、工作、生活、健康、关系、其他；状态包括未开始、进行中、已完成、延期。
- `tasks` 延期规则：延期任务需要保留延期标记，并允许同步修改任务日期到延期那一天。
- `habits`: 习惯，记录启用状态、分类、累计打卡天数和连续打卡天数。
- `habit_checkins`: 习惯每日打卡；同一习惯同一天只能有一条有效打卡。
- `schedule_items`: 单日日程项；第一版不做重复规则。
- `life_entries`: 随手记，类型只包括事件和灵感。
- `life_entries` 事件：片段式日记，记录每天比较有意义的事情，可手动选择情绪标签。
- `life_entries` 灵感：想做但当下还未安排做的事情，后续可以转为任务，也可以搁置或放弃。
- `life_entries` 需要记录 AI 分析权限：不参与 AI 分析、仅摘要参与、允许原文参与；默认仅摘要参与。
- `emotion_tags`: 手动选择的情绪标签；情绪不是独立记录类型。
- `emotion_tags` 第一版预设值：平静、开心、满足、期待、兴奋、焦虑、疲惫、低落、委屈、生气、压力、混乱、孤独、感激。
- `insight_reports`: AI 生成或缓存的每日、每周、月度复盘报告。

### 6.2 Time Rules

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
    entryId: string;
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
