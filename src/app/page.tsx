const metrics = [
  { label: "今日任务", value: "0", note: "等待记录" },
  { label: "习惯打卡", value: "0", note: "等待创建" },
  { label: "随手记录", value: "0", note: "等待沉淀" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-3 border-b border-[var(--border)] pb-6">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Growth Insight System
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-[var(--foreground)] sm:text-4xl">
            个人成长洞察工作台
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            用真实生活数据连接记录、统计、复盘和下一阶段行动。
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <p className="text-sm text-[var(--muted-foreground)]">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {metric.note}
              </p>
            </article>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-lg font-semibold">每日工作台</h2>
            <div className="mt-5 space-y-3">
              {["今日任务", "习惯打卡", "今日日程", "随手记录"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-md border border-[var(--border)] px-4 py-3"
                  >
                    <span className="text-sm font-medium">{item}</span>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      待接入
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>

          <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-lg font-semibold">复盘入口</h2>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
              AI 只在固定复盘节点介入，普通记录和统计由程序完成。
            </p>
          </aside>
        </section>
      </section>
    </main>
  );
}
