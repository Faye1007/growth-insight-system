import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  NotebookPen,
  Plus,
  Repeat2,
} from "lucide-react";

import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";

const beijingDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

const beijingShortDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit",
});

const overviewCards = [
  {
    label: "今日任务",
    value: "0",
    note: "暂无待办，下一步接入创建任务。",
    tone: "tone-lavender",
  },
  {
    label: "习惯打卡",
    value: "0/0",
    note: "暂无启用习惯，后续从习惯列表读取。",
    tone: "tone-sage",
  },
  {
    label: "今日日程",
    value: "0",
    note: "暂无固定事项，后续支持手动记录。",
    tone: "tone-mist",
  },
  {
    label: "随手记录",
    value: "0",
    note: "暂无事件或灵感，后续支持快速记录。",
    tone: "tone-clay",
  },
];

const dailySections = [
  {
    id: "tasks",
    title: "今日任务",
    eyebrow: "行动",
    description: "用于安排今天要推进的学习、工作、生活、健康和关系任务。",
    emptyTitle: "暂无今日任务",
    emptyDescription: "创建任务功能会在 Step 3.2 接入，默认日期会落在今天。",
    actionLabel: "新建任务",
    Icon: ClipboardList,
    EmptyIcon: Plus,
    tone: "tone-lavender",
    previewItems: ["未开始", "进行中", "已完成", "延期"],
  },
  {
    title: "习惯打卡",
    eyebrow: "稳定性",
    description: "用于记录今天是否完成长期习惯，并为连续天数和累计次数提供数据。",
    emptyTitle: "暂无启用习惯",
    emptyDescription: "后续会先创建习惯，再在这里完成每日打卡。",
    actionLabel: "添加习惯",
    Icon: Repeat2,
    EmptyIcon: CheckCircle2,
    tone: "tone-sage",
    previewItems: ["今日完成", "今日跳过", "连续天数", "复盘原因"],
  },
  {
    title: "今日日程",
    eyebrow: "时间",
    description: "用于记录今天的固定事项、开始时间和分类，先做单日记录。",
    emptyTitle: "暂无今日日程",
    emptyDescription: "后续会按开始时间排序，没有时间的事项排在后面。",
    actionLabel: "记录日程",
    Icon: CalendarDays,
    EmptyIcon: CalendarDays,
    tone: "tone-clay",
    previewItems: ["开始时间", "结束时间", "分类", "说明"],
  },
  {
    title: "随手记录",
    eyebrow: "沉淀",
    description: "用于记录已经发生的事件、灵感、情绪标签和下次行动。",
    emptyTitle: "暂无随手记录",
    emptyDescription: "事件和灵感会分开保存；情绪作为事件的手动标签。",
    actionLabel: "写一条记录",
    Icon: NotebookPen,
    EmptyIcon: Lightbulb,
    tone: "tone-mist",
    previewItems: ["事件", "灵感", "情绪标签", "下次行动"],
  },
];

function WriteAction({
  isLoggedIn,
  label,
  loginPath,
}: {
  isLoggedIn: boolean;
  label: string;
  loginPath: string;
}) {
  if (!isLoggedIn) {
    return (
      <Link className="soft-button w-full sm:w-auto" href={loginPath}>
        <Plus aria-hidden="true" className="h-4 w-4" />
        登录后{label}
      </Link>
    );
  }

  return (
    <button className="soft-button w-full sm:w-auto" type="button" disabled>
      <Plus aria-hidden="true" className="h-4 w-4" />
      {label}待接入
    </button>
  );
}

export default async function DailyPage() {
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: "/daily", message: loginRequiredMessage });
  const now = new Date();
  const beijingDate = beijingDateFormatter.format(now);
  const shortDate = beijingShortDateFormatter.format(now);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">每日工作台</p>
            <h1 className="page-title">今天的记录与行动</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="status-pill w-fit">北京时间</span>
            <span className="status-pill w-fit">{shortDate}</span>
          </div>
        </div>
        <p className="page-description">
          {beijingDate}。这里用于快速查看今天的任务、习惯、日程和随手记录。
        </p>
      </header>

      {!isLoggedIn ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">保存个人数据前需要登录</h2>
              <p className="body-copy mt-2">
                你仍然可以浏览每日工作台；创建任务、打卡、记录事件或生成复盘时需要注册或登录。
              </p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      ) : (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">已登录</h2>
              <p className="body-copy mt-2">
                页面结构已准备好；后续接入的保存动作会关联到当前账号。
              </p>
            </div>
            <span className="status-pill w-fit">可写入账号</span>
          </div>
        </section>
      )}

      <section aria-labelledby="daily-overview" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">今日概览</p>
            <h2 id="daily-overview" className="section-heading mt-1">
              今日基础状态
            </h2>
          </div>
          <span className="status-pill w-fit">待接入真实统计</span>
        </div>
        <div className="daily-summary-grid mt-5">
          {overviewCards.map((card) => (
            <article key={card.label} className={`daily-summary-card ${card.tone}`}>
              <p className="metric-label">{card.label}</p>
              <p className="metric-value">{card.value}</p>
              <p className="body-copy mt-2">{card.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="每日工作台分区" className="workspace-grid">
        {dailySections.map((section) => {
          const Icon = section.Icon;
          const EmptyIcon = section.EmptyIcon;

          return (
          <article
            key={section.title}
            className={`workspace-panel ${section.tone}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <span className="nav-icon">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <p className="page-kicker">{section.eyebrow}</p>
                  <h2 className="section-heading mt-1">{section.title}</h2>
                  <p className="body-copy mt-2">{section.description}</p>
                </div>
              </div>
              <WriteAction isLoggedIn={isLoggedIn} label={section.actionLabel} loginPath={loginPath} />
            </div>

            <div className="empty-state mt-5">
              <span className="empty-icon">
                <EmptyIcon aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">{section.emptyTitle}</p>
                <p className="body-copy mt-1">{section.emptyDescription}</p>
              </div>
            </div>

            <div className="preview-row mt-4">
              {section.previewItems.map((item) => (
                <span key={item} className="status-pill">
                  {item}
                </span>
              ))}
            </div>
          </article>
          );
        })}
      </section>
    </div>
  );
}
