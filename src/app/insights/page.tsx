const insightBlocks = ["今日概览", "本周趋势", "习惯状态", "情绪记录"];

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          洞察报告
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          程序统计与复盘报告
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          基础图表由程序计算，AI 只在复盘节点介入。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {insightBlocks.map((block) => (
          <article
            key={block}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-lg font-semibold">{block}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              后续接入真实统计和图表。
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
