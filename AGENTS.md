# AGENTS.md - growth-insight-system

## Always Rules

- 写任何代码前必须完整阅读 `memory-bank/@architecture.md`
- 写任何代码前必须完整阅读 `memory-bank/@product-requirements-document.md`
- 每完成一个重大功能或里程碑后，必须更新 `memory-bank/@architecture.md`

## Project Overview

- **Type**: Web application, personal growth insight system
- **Tech Stack**: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Postgres/Auth, Drizzle ORM, Recharts, OpenAI-compatible AI provider adapter
- **Location**: `/home/faye/projects/growth-insight-system`

## Developer Commands

应用脚手架创建前暂无可执行命令。创建 Next.js 应用后默认使用：

```bash
# 开发
cd growth-insight-system && npm run dev

# 构建（验证）
cd growth-insight-system && npm run build

# lint 检查
cd growth-insight-system && npm run lint
```

## Step Workflow（分步确认）

涉及功能开发、重构、视觉改版、数据处理、文档更新或 Git 协作时，必须按 Step 循环推进：

1. **Step 开始前**
   - 说明本 Step 的目标、预计影响文件和验证方式。
   - 等 Faye 明确确认后再执行。

2. **Step 实现后**
   - 先运行项目规定的验证命令。
   - 如果只是文档修改，可说明无需运行构建，但仍需给出检查结果。

3. **Faye 验收**
   - Codex 汇报改了什么、验证是否通过、需要 Faye 检查什么。
   - 等 Faye 确认通过后，才把本 Step 视为完成。

4. **文档更新**
   - Faye 确认通过后，再更新 `memory-bank/progress.md`。
   - 如果修改了页面结构、数据结构、认证流程、核心数据流或重要视觉系统，同步更新 `memory-bank/@architecture.md`。
   - 未经 Faye 确认，不写“已完成”状态。

5. **Git 提交**
   - Faye 已确认本项目内不需要每次重复确认 `git commit`。
   - `git commit` 前仍需说明提交范围和提交信息；若范围清晰且 Faye 已要求提交，可直接执行。
   - `git push` 必须再次单独询问。

6. **进入下一 Step**
   - 当前 Step 验证、Faye 确认、必要文档更新和必要 Git 操作完成后，再询问是否进入下一 Step。

## Key Conventions

- **产品文档**: `memory-bank/@product-requirements-document.md`
- **架构文档**: `memory-bank/@architecture.md`
- **实施计划**: `memory-bank/implementation-plan.md`
- **迭代计划**: `memory-bank/modification-plan.md`
- **进度记录**: `memory-bank/progress.md`
- **页面路由**: `src/app/` - Next.js App Router（创建应用后）
- **UI 组件**: `src/components/ui/` - shadcn/ui 组件（创建应用后）
- **业务组件**: `src/components/` - 按模块组织（创建应用后）
- **数据库模型**: `src/db/` - Drizzle schema and queries（创建应用后）
- **AI 适配层**: `src/lib/ai/` - provider adapter and review generation（创建应用后）
- **工具函数**: `src/lib/` - 通用工具函数（创建应用后）

## Memory Bank 文档分工

进入项目后，优先按以下顺序判断上下文：

1. `AGENTS.md`
   - 项目规则、验证方式、文档分工、红线操作。
   - 只记录长期有效的协作规则，不记录具体功能完成流水账。
2. `memory-bank/progress.md`
   - 当前项目状态的权威入口。
   - 顶部必须能快速回答：已完成到哪一步、下一步是什么、最近一次完成了什么。
   - 详细历史可以保留在 `Completed` 区域，不要再堆进顶部摘要。
3. `memory-bank/modification-plan.md`
   - 基础闭环之后的当前和未来迭代计划。
   - 只追加真实准备执行的 Modification Step；已完成内容只保留简短结果和验证摘要。
   - 不再承接从 0 到 1 的基础实施计划。
4. `memory-bank/implementation-plan.md`
   - 从 0 到 1 的历史基础功能计划。
   - 当前视为冻结文档，除非需要修正文档错误，不再追加新的 Modification Step。
5. `memory-bank/@architecture.md`
   - 当前真实系统结构、数据结构、核心数据流和重要技术约束。
   - 只记录已经落地的结构变化，不记录计划或执行流水账。
6. `memory-bank/@product-requirements-document.md`
   - 产品目标、范围、原则和非 MVP 边界。
   - 产品方向变化先改这里，再改计划和实现。
7. `memory-bank/tech-stack.md`
   - 技术栈和关键依赖说明。
   - 只有技术选型或核心依赖发生变化时才更新。

文档整理原则：

- `progress.md` 顶部保持短摘要；长历史放在后面。
- `modification-plan.md` 只负责“接下来怎么改”，不要重复粘贴完整进度流水账。
- `@architecture.md` 只写当前真实架构，不写未来计划。
- 只做文档整理时不需要运行 `npm run build`；需检查 Markdown 结构、链接路径和 Git diff。

## Architecture Notes

- 第一版是自用 Web 应用，但架构预留公开上线空间。
- 主数据库使用 Supabase Postgres。
- AI 接入必须走后端，不能把任何 API key 暴露在前端。
- AI 供应商使用 OpenAI-compatible adapter 设计，支持低成本模型、国内 API 和 OpenAI 之间切换。
- 普通统计和可视化由程序完成；AI 只用于复盘、生活模式归纳和行动建议。

## Supabase 安全策略变更（2026年10月30日生效）

Supabase 已通知：2026年10月30日起，所有现有项目的 `public` schema 下新建的表，不再默认对 Data API（supabase-js、PostgREST、GraphQL）开放访问。

**影响范围**：
- 本项目使用 supabase-js（SSR client），属于 Data API 用户，会受影响。
- 2026年10月30日之前已创建的表保持当前权限不变。
- 2026年10月30日之后新建的表需要显式 `GRANT` 才能被 supabase-js 访问。

**已完成的 GRANT 迁移**：
- `0010_supabase_js_grants.sql`：anniversaries, gift_records, tool_sessions
- `0014_remaining_table_grants.sql`：tasks, habits, habit_checkins, schedule_items, life_events, ideas, insight_reports, personal_manuals, schedule_completions

**后续新建表时必须做的**：
在迁移文件中为每个新表加上显式授权：

```sql
-- 授权给 anon（未登录用户，通常只读）
GRANT SELECT ON public.your_table TO anon;

-- 授权给 authenticated（登录用户，读写）
GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO authenticated;

-- 授权给 service_role（服务端，完全权限）
GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO service_role;

-- 启用 RLS
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

-- 添加 RLS 策略（示例）
CREATE POLICY "users can read their own rows"
  ON public.your_table FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

**注意**：通过 `DATABASE_URL` 直连的 Drizzle ORM 不受此规则影响，但 supabase-js 客户端读写新表时会返回 `42501` 错误，直到补上 GRANT 语句。

## Git 上传规则

- 上传 GitHub 时：`memory-bank/@*` 除外；项目级 `AGENTS.md` 可以上传，用于让协作者和其他 AI 工具读取项目规则。
- 其他人 clone 后应能在应用脚手架创建后执行 `npm install && npm run dev` 启动。

## Reference

- 产品需求文档: `memory-bank/@product-requirements-document.md`
- 架构文档: `memory-bank/@architecture.md`
- 实施计划: `memory-bank/implementation-plan.md`
- 进度记录: `memory-bank/progress.md`
