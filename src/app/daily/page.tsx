import Link from "next/link";

import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";

const sections = [
  {
    title: "今日概览",
    note: "汇总今日任务、习惯、日程和随手记录。",
    status: "待接入统计",
    tone: "tone-mist",
  },
  {
    title: "今日任务",
    note: "后续支持创建、推进、完成和延期任务。",
    status: "待接入任务",
    tone: "tone-lavender",
  },
  {
    title: "习惯打卡",
    note: "后续展示连续天数、累计次数和今日打卡。",
    status: "待接入习惯",
    tone: "tone-sage",
  },
  {
    title: "今日日程",
    note: "后续记录当天固定事项、时间和分类。",
    status: "待接入日程",
    tone: "tone-clay",
  },
  {
    title: "随手记录",
    note: "后续沉淀事件、灵感和手动情绪标签。",
    status: "待接入记录",
    tone: "tone-mist",
  },
];

export default async function DailyPage() {
  const user = await getCurrentUser();
  const loginPath = buildLoginPath({ next: "/daily", message: loginRequiredMessage });

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">每日工作台</p>
            <h1 className="page-title">今天的记录与行动</h1>
          </div>
          <span className="status-pill w-fit">北京时间</span>
        </div>
        <p className="page-description">
          后续会在这里完成任务、打卡、记录日程和沉淀事件。
        </p>
      </header>

      {!user ? (
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
                真实写入入口会在后续 Step 接入，保存的数据会关联到当前账号。
              </p>
            </div>
            <span className="status-pill w-fit">可写入账号</span>
          </div>
        </section>
      )}

      <section className="card-grid lg:grid-cols-2">
        {sections.map((section) => (
          <article
            key={section.title}
            className={`metric-card ${section.tone}`}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="section-heading">{section.title}</h2>
              <span className="status-pill">{section.status}</span>
            </div>
            <p className="body-copy mt-3">{section.note}</p>
            <div className="mt-4">
              {user ? (
                <button className="soft-button" type="button" disabled>
                  即将接入创建
                </button>
              ) : (
                <Link className="soft-button" href={loginPath}>
                  登录后写入
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
