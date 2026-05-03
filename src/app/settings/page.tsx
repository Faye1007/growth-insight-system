const settings = ["应用状态", "数据库连接状态", "AI 配置状态", "账号状态"];

export default function SettingsPage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">设置</p>
        <h1 className="page-title">应用配置与安全状态</h1>
        <p className="page-description">
          后续会在这里展示数据库和 AI 配置状态，但不会展示任何密钥。
        </p>
      </header>

      <section className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-heading">基础状态</h2>
          <span className="status-pill">安全占位</span>
        </div>
        <div className="panel-list">
          {settings.map((item) => (
            <div key={item} className="list-row">
              <span className="list-label">{item}</span>
              <span className="status-pill">待接入</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
