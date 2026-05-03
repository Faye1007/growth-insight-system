const manualItems = ["当前人生阶段", "当前主要目标", "能力画像", "情绪模式", "常见内耗点"];

export default function ManualPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          个人说明书
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          面向自己的长期说明书
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          第一版先支持手动维护，后续再由复盘结果提出更新建议。
        </p>
      </header>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">说明书条目</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {manualItems.map((item) => (
            <div
              key={item}
              className="rounded-md border border-[var(--border)] px-4 py-3 text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
