import { getAiConfigStatus } from "@/lib/ai/config";
import { getSupabaseConfigStatus } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/session";

type DatabaseHealthStatus = {
  label: string;
  detail: string;
};

async function getDatabaseHealthStatus(hasDatabaseUrl: boolean): Promise<DatabaseHealthStatus> {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!hasDatabaseUrl || !databaseUrl) {
    return {
      label: "未配置",
      detail: "缺少数据库连接配置，真实数据读写暂不可用。",
    };
  }

  const { default: postgres } = await import("postgres");
  const client = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: "require",
    connect_timeout: 3,
  });

  try {
    await client`select 1`;

    return {
      label: "连接正常",
      detail: "数据库只读健康检查已通过。",
    };
  } catch {
    return {
      label: "连接异常",
      detail: "数据库配置已存在，但当前连接检查失败。请稍后重试或检查服务端配置。",
    };
  } finally {
    await client.end({ timeout: 3 });
  }
}

export default async function SettingsPage() {
  const aiStatus = getAiConfigStatus();
  const supabaseStatus = getSupabaseConfigStatus();
  const databaseHealth = await getDatabaseHealthStatus(supabaseStatus.hasDatabaseUrl);
  const user = await getCurrentUser();
  const supabaseSettings = [
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
      label: "数据库连接检查",
      status: databaseHealth.label,
    },
  ];
  const aiSettings = [
    {
      label: "AI provider",
      status: aiStatus.providerName ?? "未配置",
    },
    {
      label: "AI base URL",
      status: aiStatus.hasBaseUrl ? "已配置" : "未配置",
    },
    {
      label: "AI API key",
      status: aiStatus.hasApiKey ? "已配置" : "未配置",
    },
    {
      label: "每日复盘模型",
      status: aiStatus.dailyModelName ?? "未配置",
    },
    {
      label: "周复盘模型",
      status: aiStatus.weeklyModelName ?? "未配置",
    },
    {
      label: "月度复盘模型",
      status: aiStatus.monthlyModelName ?? "未配置",
    },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">设置</p>
        <h1 className="page-title">应用配置与安全状态</h1>
        <p className="page-description">
          这里只展示 Supabase、数据库和 AI 配置是否存在，不展示任何密钥或连接字符串。
        </p>
      </header>

      <section className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-heading">应用状态</h2>
            <p className="body-copy mt-2">
              当前应用可以打开。写入能力取决于登录状态；AI 复盘是可选增强，不影响普通记录、统计和图表。
            </p>
          </div>
          <div className="overview-detail-row">
            <span className="status-pill">应用可运行</span>
            <span className="status-pill">{user ? "账号已登录" : "账号未登录"}</span>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-heading">Supabase 接入状态</h2>
            <p className="body-copy mt-2">
              朋友试用前需要补齐 Supabase public client 和 Database URL；AI 环境变量可以后续再配置。
            </p>
          </div>
          <div className="overview-detail-row">
            <span className="status-pill">
              {supabaseStatus.isPublicClientReady ? "客户端已就绪" : "等待配置"}
            </span>
            <span className="status-pill">{databaseHealth.label}</span>
          </div>
        </div>
        <p className="body-copy mt-4">{databaseHealth.detail}</p>
        <div className="panel-list">
          {supabaseSettings.map((item) => (
            <div key={item.label} className="list-row">
              <span className="list-label">{item.label}</span>
              <span className="status-pill">{item.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-heading">AI 配置状态</h2>
            <p className="body-copy mt-2">
              AI 配置只在服务端读取。未配置 AI 时，每日复盘会显示程序摘要，普通记录、统计和图表仍可正常使用。
            </p>
          </div>
          <span className="status-pill">
            {aiStatus.isDailyReviewReady ? "每日复盘可用" : "每日复盘待配置"}
          </span>
        </div>
        <div className="panel-list">
          {aiSettings.map((item) => (
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
          Vercel 首版部署只需要 Supabase URL、Supabase publishable key 和 Database URL。
          `SUPABASE_SERVICE_ROLE_KEY` 暂不配置，后续确实需要服务端高权限操作时再单独确认。
          AI 环境变量是可选项，等你决定接入 AI 复盘后再补齐并重新部署。
        </p>
      </section>
    </div>
  );
}
