import Link from "next/link";

const overviewCards = [
  {
    label: "今日行动进度",
    value: "0%",
    note: "等待接入真实任务数据",
    tone: "tone-lavender",
  },
  {
    label: "本周关键指标",
    value: "0",
    note: "等待接入统计服务",
    tone: "tone-sage",
  },
  {
    label: "最近复盘",
    value: "未生成",
    note: "每日复盘入口后续接入",
    tone: "tone-mist",
  },
];

export default function Home() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">成长主页</p>
            <h1 className="page-title">个人成长洞察工作台</h1>
          </div>
          <Link href="/daily" className="soft-button w-full sm:w-auto">
            进入每日工作台
          </Link>
        </div>
        <p className="page-description">
          用真实生活数据连接记录、统计、复盘和下一阶段行动。
        </p>
      </header>

      <section className="card-grid md:grid-cols-3">
        {overviewCards.map((card) => (
          <article
            key={card.label}
            className={`metric-card ${card.tone}`}
          >
            <p className="metric-label">{card.label}</p>
            <p className="metric-value">{card.value}</p>
            <p className="body-copy mt-2">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-heading">当前生活模式提醒</h2>
          <span className="status-pill">静态占位</span>
        </div>
        <p className="body-copy mt-4">
          这里后续展示由程序统计和复盘结果生成的阶段性提醒。当前页面只提供基础页面壳。
        </p>
      </section>
    </div>
  );
}
