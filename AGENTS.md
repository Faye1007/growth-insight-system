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
   - `git commit` 前必须单独说明提交范围和提交信息，等 Faye 允许。
   - `git push` 必须再次单独询问。

6. **进入下一 Step**
   - 当前 Step 验证、Faye 确认、必要文档更新和必要 Git 操作完成后，再询问是否进入下一 Step。

## Key Conventions

- **产品文档**: `memory-bank/@product-requirements-document.md`
- **架构文档**: `memory-bank/@architecture.md`
- **实施计划**: `memory-bank/implementation-plan.md`
- **进度记录**: `memory-bank/progress.md`
- **页面路由**: `src/app/` - Next.js App Router（创建应用后）
- **UI 组件**: `src/components/ui/` - shadcn/ui 组件（创建应用后）
- **业务组件**: `src/components/` - 按模块组织（创建应用后）
- **数据库模型**: `src/db/` - Drizzle schema and queries（创建应用后）
- **AI 适配层**: `src/lib/ai/` - provider adapter and review generation（创建应用后）
- **工具函数**: `src/lib/` - 通用工具函数（创建应用后）

## Architecture Notes

- 第一版是自用 Web 应用，但架构预留公开上线空间。
- 主数据库使用 Supabase Postgres。
- AI 接入必须走后端，不能把任何 API key 暴露在前端。
- AI 供应商使用 OpenAI-compatible adapter 设计，支持低成本模型、国内 API 和 OpenAI 之间切换。
- 普通统计和可视化由程序完成；AI 只用于复盘、生活模式归纳和行动建议。

## Git 上传规则

- 上传 GitHub 时：`memory-bank/@*` 和 `AGENTS.md` 除外。
- 其他人 clone 后应能在应用脚手架创建后执行 `npm install && npm run dev` 启动。

## Reference

- 产品需求文档: `memory-bank/@product-requirements-document.md`
- 架构文档: `memory-bank/@architecture.md`
- 实施计划: `memory-bank/implementation-plan.md`
- 进度记录: `memory-bank/progress.md`
