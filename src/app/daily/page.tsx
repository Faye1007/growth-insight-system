const sections = ["今日概览", "今日任务", "习惯打卡", "今日日程", "随手记录"];

export default function DailyPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          每日工作台
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          今天的记录与行动
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          后续会在这里完成任务、打卡、记录日程和沉淀事件。
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <article
            key={section}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-lg font-semibold">{section}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              该模块将在后续步骤接入真实数据和交互。
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
