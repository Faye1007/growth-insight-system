const recordTypes = ["任务完成记录", "习惯打卡记录", "日程记录", "事件记录", "灵感记录"];

export default function RecordsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          成长记录
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          长期生活数据沉淀
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          后续会用统一时间线展示任务、习惯、日程和随手记录。
        </p>
      </header>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">近期记录</h2>
        <div className="mt-5 divide-y divide-[var(--border)]">
          {recordTypes.map((type) => (
            <div key={type} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium">{type}</span>
              <span className="text-sm text-[var(--muted-foreground)]">
                待接入
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
