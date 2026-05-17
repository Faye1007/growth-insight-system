import { getCurrentUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">设置</p>
        <h1 className="page-title">账号与应用设置</h1>
        <p className="page-description">
          管理你的账号信息和应用使用状态。
        </p>
      </header>

      <section className="panel-card">
        <h2 className="section-heading">账号信息</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="body-copy">
              {user
                ? "你当前已登录，可以正常使用所有个人数据功能。"
                : "你当前未登录，可以浏览应用界面，但无法保存个人数据。"}
            </p>
          </div>
          <div className="overview-detail-row">
            <span className="status-pill">
              {user ? "账号已登录" : "账号未登录"}
            </span>
          </div>
        </div>
        {user && (
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card-muted)] px-4 py-3">
            <p className="text-sm text-[var(--muted-foreground)]">
              当前账号：<span className="font-medium text-[var(--foreground)]">{user.email}</span>
            </p>
          </div>
        )}
      </section>

      <section className="panel-card">
        <h2 className="section-heading">功能可用性</h2>
        <p className="body-copy mt-2">
          Growth Insight System 提供任务管理、习惯打卡、日程记录、随手记录和 AI 复盘等功能。
          所有个人数据功能需要登录后使用。
        </p>
        <div className="mt-4 panel-list">
          <div className="list-row">
            <span className="list-label">任务管理</span>
            <span className="status-pill">{user ? "可用" : "需登录"}</span>
          </div>
          <div className="list-row">
            <span className="list-label">习惯打卡</span>
            <span className="status-pill">{user ? "可用" : "需登录"}</span>
          </div>
          <div className="list-row">
            <span className="list-label">日程记录</span>
            <span className="status-pill">{user ? "可用" : "需登录"}</span>
          </div>
          <div className="list-row">
            <span className="list-label">随手记录</span>
            <span className="status-pill">{user ? "可用" : "需登录"}</span>
          </div>
          <div className="list-row">
            <span className="list-label">洞察报告与图表</span>
            <span className="status-pill">{user ? "可用" : "需登录"}</span>
          </div>
          <div className="list-row">
            <span className="list-label">AI 复盘</span>
            <span className="status-pill">
              {user ? "配置后可用" : "需登录"}
            </span>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <h2 className="section-heading">关于 AI 复盘</h2>
        <p className="body-copy mt-2">
          AI 复盘是可选增强功能，用于生成每日、每周和每月的生活模式洞察与行动建议。
          未配置 AI 时，你仍可以使用所有普通记录、程序统计和图表功能。
        </p>
        <p className="body-copy mt-3">
          如需启用 AI 复盘，请联系管理员配置 AI 环境变量。
        </p>
      </section>
    </div>
  );
}
