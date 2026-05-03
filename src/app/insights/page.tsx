const insightBlocks = [
  {
    title: "今日概览",
    note: "后续展示任务完成率、记录数量和今日状态。",
    tone: "tone-mist",
  },
  {
    title: "本周趋势",
    note: "后续展示最近 7 天任务、习惯和记录变化。",
    tone: "tone-lavender",
  },
  {
    title: "习惯状态",
    note: "后续展示连续天数、累计次数和中断原因。",
    tone: "tone-sage",
  },
  {
    title: "情绪记录",
    note: "后续展示手动情绪标签的分布和趋势。",
    tone: "tone-clay",
  },
];

export default function InsightsPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">洞察报告</p>
        <h1 className="page-title">程序统计与复盘报告</h1>
        <p className="page-description">
          基础图表由程序计算，AI 只在复盘节点介入。
        </p>
      </header>

      <section className="card-grid md:grid-cols-2">
        {insightBlocks.map((block) => (
          <article
            key={block.title}
            className={`metric-card ${block.tone}`}
          >
            <h2 className="section-heading">{block.title}</h2>
            <p className="body-copy mt-3">{block.note}</p>
            <div className="mt-5 h-2 rounded-full bg-[var(--surface-strong)]">
              <div className="h-2 w-1/3 rounded-full bg-[var(--accent)]" />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
