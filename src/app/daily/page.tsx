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

export default function DailyPage() {
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
          </article>
        ))}
      </section>
    </div>
  );
}
