const overviewCards = [
  { label: "今日行动进度", value: "0%", note: "等待接入真实任务数据" },
  { label: "本周关键指标", value: "0", note: "等待接入统计服务" },
  { label: "最近复盘", value: "未生成", note: "每日复盘入口后续接入" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          成长主页
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl">
          个人成长洞察工作台
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          用真实生活数据连接记录、统计、复盘和下一阶段行动。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {overviewCards.map((card) => (
          <article
            key={card.label}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <p className="text-sm text-[var(--muted-foreground)]">
              {card.label}
            </p>
            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {card.note}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">当前生活模式提醒</h2>
        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          这里后续展示由程序统计和复盘结果生成的阶段性提醒。当前页面只提供基础页面壳。
        </p>
      </section>
    </div>
  );
}
