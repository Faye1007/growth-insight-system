import Link from "next/link";
import { Brain, CalendarClock, Filter, Sparkles, Wind } from "lucide-react";

import { createToolSessionAction } from "@/app/toolbox/actions";
import { FeedbackMessage } from "@/components/feedback-message";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getToolSessionsForUser,
  type ToolSessionRecord,
  type ToolType,
} from "@/lib/data/user-data";
import type { FeedbackMessage as FeedbackMessageType } from "@/lib/feedback";

type ToolboxPageProps = {
  searchParams?: Promise<{
    toolError?: string;
    toolSaved?: string;
    toolType?: string;
  }>;
};

const toolOptions: Array<{
  type: ToolType;
  title: string;
  description: string;
  icon: typeof Brain;
}> = [
  {
    type: "emotion_review",
    title: "情绪复盘",
    description: "把一段情绪体验整理成触发事件、需要和下一步动作。",
    icon: Brain,
  },
  {
    type: "stress_sorting",
    title: "压力整理",
    description: "把压力源拆成可推进和需接受的部分，减少混乱感。",
    icon: Wind,
  },
  {
    type: "tomorrow_plan",
    title: "明日计划",
    description: "把明天压缩成少量重点、必要任务和恢复安排。",
    icon: CalendarClock,
  },
];

const toolLabels: Record<ToolType, string> = {
  emotion_review: "情绪复盘",
  stress_sorting: "压力整理",
  tomorrow_plan: "明日计划",
};

const toolErrorFeedback: Record<string, FeedbackMessageType> = {
  invalid_input: {
    tone: "error",
    title: "拆解输入还没填完整",
    detail: "请选择拆解类型，并写下这次想整理的内容。",
  },
  save_failed: {
    tone: "error",
    title: "问题拆解记录没有保存成功",
    detail: "请稍后重试；这次操作不会影响其他记录。",
  },
};

const toolSavedFeedback: Record<string, FeedbackMessageType> = {
  created: {
    tone: "success",
    title: "问题拆解记录已保存",
    detail: "本次输入和程序化整理结果已关联到当前账号。",
  },
};

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function isToolType(value: string | undefined): value is ToolType {
  return toolOptions.some((tool) => tool.type === value);
}

function ToolSessionCard({ session }: { session: ToolSessionRecord }) {
  return (
    <article className="record-timeline-item tone-lavender">
      <div className="nav-icon">
        <Sparkles aria-hidden="true" className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="record-item-heading">
          <span className="status-pill">{toolLabels[session.toolType]}</span>
          <span className="status-pill">
            {dateTimeFormatter.format(session.createdAt)}
          </span>
          <span className="status-pill">{session.aiUsed ? "AI 输出" : "程序输出"}</span>
        </div>
        <h3 className="list-label mt-3">{session.title}</h3>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="field-tile">
            <span>输入</span>
            <p className="body-copy mt-2 whitespace-pre-wrap">{session.inputContent}</p>
          </div>
          <div className="field-tile">
            <span>输出</span>
            <p className="body-copy mt-2 whitespace-pre-wrap">{session.outputContent}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function ToolboxPage({ searchParams }: ToolboxPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedToolType = isToolType(params?.toolType) ? params.toolType : undefined;
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: "/toolbox", message: loginRequiredMessage });
  const sessions = user
    ? await getToolSessionsForUser({
        userId: user.id,
        toolType: selectedToolType,
      })
    : [];
  const feedback =
    toolErrorFeedback[params?.toolError ?? ""] ??
    toolSavedFeedback[params?.toolSaved ?? ""] ??
    null;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">问题拆解</p>
            <h1 className="page-title">即时问题整理</h1>
          </div>
          <span className="status-pill w-fit">当前：基础版</span>
        </div>
        <p className="page-description">
          用来临时拆解情绪、压力和明日计划。当前默认使用程序化输出，不自动调用 AI。
        </p>
      </header>

      <FeedbackMessage feedback={feedback} />

      {!isLoggedIn ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">登录后保存问题拆解</h2>
              <p className="body-copy mt-2">
                未登录时可以浏览结构；登录后可以保存输入和整理结果。
              </p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="tool-options-title" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">拆解类型</p>
            <h2 id="tool-options-title" className="section-heading mt-1">
              选择一个整理方向
            </h2>
            <p className="body-copy mt-2">选中后会带到下方记录表单，输出仍然是程序化整理。</p>
          </div>
          <span className="status-pill w-fit">不自动调用 AI</span>
        </div>
        <div className="tool-option-grid mt-5">
          {toolOptions.map((tool) => {
            const Icon = tool.icon;
            const isSelected = selectedToolType === tool.type;

            return (
              <Link
                key={tool.type}
                className={`tool-option-card ${isSelected ? "is-active" : ""}`}
                href={`/toolbox?toolType=${tool.type}#new-tool-session`}
              >
                <span className="nav-icon">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="tool-option-copy">
                  <strong>{tool.title}</strong>
                  <small>{tool.description}</small>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="new-tool-session" aria-labelledby="new-tool-title" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">新记录</p>
            <h2 id="new-tool-title" className="section-heading mt-1">
              保存一次问题拆解
            </h2>
          </div>
          <span className="status-pill w-fit">保存输入 + 输出</span>
        </div>

        {isLoggedIn ? (
          <form action={createToolSessionAction} className="task-form mt-5">
            <div className="task-form-grid">
              <label className="form-field">
                拆解类型
                <select name="toolType" defaultValue={selectedToolType ?? "emotion_review"}>
                  {toolOptions.map((tool) => (
                    <option key={tool.type} value={tool.type}>
                      {tool.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field sm:col-span-2">
                输入内容
                <textarea
                  name="inputContent"
                  rows={6}
                  required
                  placeholder="写下当前情绪、压力源，或你对明天的初步想法。"
                />
              </label>
            </div>
            <div className="task-edit-actions">
              <button className="soft-button" type="submit">
                保存问题拆解
              </button>
            </div>
          </form>
        ) : (
          <div className="empty-state mt-5">
            <span className="empty-icon">
              <Sparkles aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="list-label">登录后可以保存</p>
              <p className="body-copy mt-1">问题拆解记录会关联到当前账号，不会写入展示数据。</p>
            </div>
          </div>
        )}
      </section>

      <section id="tool-history" aria-labelledby="tool-history-title" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">历史</p>
            <h2 id="tool-history-title" className="section-heading mt-1">
              最近问题拆解记录
            </h2>
          </div>
          <span className="status-pill w-fit">最多显示 20 条</span>
        </div>

        {isLoggedIn ? (
          <form action="/toolbox#tool-history" className="task-form mt-5">
            <div className="task-form-grid">
              <label className="form-field">
                <Filter aria-hidden="true" className="h-4 w-4" />
                按拆解类型筛选
                <select name="toolType" defaultValue={selectedToolType ?? ""}>
                  <option value="">全部类型</option>
                  {toolOptions.map((tool) => (
                    <option key={tool.type} value={tool.type}>
                      {tool.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="task-edit-actions">
              <button className="soft-button" type="submit">
                应用筛选
              </button>
              <Link className="quiet-button" href="/toolbox#tool-history">
                清除筛选
              </Link>
            </div>
          </form>
        ) : null}

        {sessions.length ? (
          <div className="record-timeline mt-5">
            {sessions.map((session) => (
              <ToolSessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="empty-state mt-5">
            <span className="empty-icon">
              <Sparkles aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="list-label">暂无问题拆解记录</p>
              <p className="body-copy mt-1">
                保存一次情绪复盘、压力整理或明日计划后，会在这里看到历史记录。
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
