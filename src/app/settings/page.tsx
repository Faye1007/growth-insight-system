const settings = ["应用状态", "数据库连接状态", "AI 配置状态", "账号状态"];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-[var(--border)] pb-6">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          设置
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          应用配置与安全状态
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          后续会在这里展示数据库和 AI 配置状态，但不会展示任何密钥。
        </p>
      </header>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">基础状态</h2>
        <div className="mt-5 divide-y divide-[var(--border)]">
          {settings.map((item) => (
            <div key={item} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium">{item}</span>
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
