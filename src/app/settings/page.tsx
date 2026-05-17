import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { deleteAccountAction, signOutAction, updateNicknameAction } from "@/app/auth/actions";
import { DeleteAccountSubmitButton } from "@/components/settings/delete-account-submit-button";

type SettingsPageProps = {
  searchParams?: Promise<{
    nicknameError?: string;
    nicknameUpdated?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const user = await getCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const loginPath = buildLoginPath({ next: "/settings", message: loginRequiredMessage });
  const nickname = (user?.user_metadata?.nickname as string) ?? "";
  const hasNickname = nickname.trim().length > 0;
  const nicknameError = params?.nicknameError;
  const nicknameUpdated = params?.nicknameUpdated === "1";

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">设置</p>
        <h1 className="page-title">账号与应用设置</h1>
        <p className="page-description">
          管理你的账号信息和应用使用状态。
        </p>
      </header>

      {nicknameError === "empty" && (
        <div className="panel-card" style={{ background: "var(--clay-soft)", border: "1px solid var(--clay)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--clay)" }}>昵称不能为空</p>
        </div>
      )}
      {nicknameError === "failed" && (
        <div className="panel-card" style={{ background: "var(--clay-soft)", border: "1px solid var(--clay)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--clay)" }}>昵称保存失败，请稍后重试</p>
        </div>
      )}
      {nicknameUpdated && (
        <div className="panel-card" style={{ background: "var(--sage-soft)", border: "1px solid var(--sage)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--sage)" }}>昵称已更新</p>
        </div>
      )}

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

        {!user ? (
          <div className="mt-4">
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-muted)] px-4 py-3">
              <div className="grid gap-2">
                <p className="text-sm text-[var(--muted-foreground)]">
                  昵称：<span className="font-medium text-[var(--foreground)]">{hasNickname ? nickname : "未设置"}</span>
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  当前账号：<span className="font-medium text-[var(--foreground)]">{user.email}</span>
                </p>
              </div>
            </div>

            <details className="create-disclosure" open={!hasNickname}>
              <summary className="create-summary quiet-button w-fit">
                {hasNickname ? "修改昵称" : "设置昵称"}
              </summary>
              <form action={updateNicknameAction} className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--card-muted)] px-4 py-3">
                <label className="form-field">
                  昵称
                  <input
                    name="nickname"
                    type="text"
                    defaultValue={nickname}
                    placeholder="输入你的昵称"
                    maxLength={50}
                  />
                </label>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button className="soft-button text-sm" type="submit">
                    保存昵称
                  </button>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    昵称会显示在右上角账号入口。
                  </span>
                </div>
              </form>
            </details>

            <form action={signOutAction}>
              <button className="soft-button text-sm" type="submit">
                退出登录
              </button>
            </form>

            <details className="create-disclosure">
              <summary className="create-summary quiet-button w-fit" style={{ color: "var(--clay)" }}>
                注销账号
              </summary>
              <div className="mt-3 rounded-lg border border-[var(--clay)] bg-[var(--clay-soft)] px-4 py-3">
                <p className="text-sm font-medium" style={{ color: "var(--clay)" }}>
                  注销后无法恢复
                </p>
                <p className="body-copy mt-1 text-sm" style={{ color: "var(--clay)" }}>
                  注销将软删除你所有的任务、习惯、日程、事件、灵感、复盘报告等数据。
                  此操作不可撤销。
                </p>
                <form action={deleteAccountAction} className="mt-3">
                  <input type="hidden" name="confirmDelete" value="DELETE_MY_ACCOUNT" />
                  <DeleteAccountSubmitButton />
                </form>
              </div>
            </details>
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
