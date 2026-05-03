import { getSupabaseConfigStatus } from "@/lib/supabase/config";

export default function SettingsPage() {
  const supabaseStatus = getSupabaseConfigStatus();
  const settings = [
    {
      label: "应用状态",
      status: "可运行",
    },
    {
      label: "Supabase URL",
      status: supabaseStatus.hasUrl ? "已配置" : "未配置",
    },
    {
      label: "Supabase public key",
      status: supabaseStatus.hasPublicKey ? "已配置" : "未配置",
    },
    {
      label: "Supabase service role key",
      status: supabaseStatus.hasServiceRoleKey ? "已配置" : "未配置",
    },
    {
      label: "Database URL",
      status: supabaseStatus.hasDatabaseUrl ? "已配置" : "未配置",
    },
    {
      label: "账号状态",
      status: "待接入认证",
    },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">设置</p>
        <h1 className="page-title">应用配置与安全状态</h1>
        <p className="page-description">
          这里只展示 Supabase 配置是否存在，不展示任何密钥或连接字符串。
        </p>
      </header>

      <section className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-heading">Supabase 接入状态</h2>
            <p className="body-copy mt-2">
              未配置真实环境变量时，应用仍可打开；后续写入数据前需要补齐 Supabase
              项目配置。
            </p>
          </div>
          <span className="status-pill">
            {supabaseStatus.isPublicClientReady ? "客户端已就绪" : "等待配置"}
          </span>
        </div>
        <div className="panel-list">
          {settings.map((item) => (
            <div key={item.label} className="list-row">
              <span className="list-label">{item.label}</span>
              <span className="status-pill">{item.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <h2 className="section-heading">下一步需要的配置</h2>
        <p className="body-copy mt-2">
          真实连接 Supabase 前，需要在本地 `.env.local` 中填写项目地址、public key、
          service role key 和数据库连接字符串。`SUPABASE_SERVICE_ROLE_KEY` 与
          `DATABASE_URL` 只允许服务端读取。
        </p>
      </section>
    </div>
  );
}
