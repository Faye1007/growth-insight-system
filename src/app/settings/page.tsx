import Link from "next/link";
import { LogOut, Pencil } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/session";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { clearAccountDataAction, deleteAccountAction, signOutAction, updateNicknameAction } from "@/app/auth/actions";
import { ClearDataSubmitButton } from "@/components/settings/clear-data-submit-button";
import { DeleteAccountSubmitButton } from "@/components/settings/delete-account-submit-button";

type SettingsPageProps = {
  searchParams?: Promise<{
    accountDataCleared?: string;
    accountError?: string;
    nicknameError?: string;
    nicknameUpdated?: string;
  }>;
};

const accountErrorMessages: Record<string, string> = {
  clear_failed: "数据清除失败，请稍后重试",
  delete_failed: "账号注销失败，请稍后重试",
  missing_service_role: "账号注销需要管理员先配置服务端权限",
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const user = await getCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const loginPath = buildLoginPath({ next: "/settings", message: loginRequiredMessage });
  const nickname = (user?.user_metadata?.nickname as string) ?? "";
  const hasNickname = nickname.trim().length > 0;
  const displayName = hasNickname ? nickname.trim() : user?.email ?? "未登录";
  const accountDataCleared = params?.accountDataCleared === "1";
  const accountErrorMessage = params?.accountError ? accountErrorMessages[params.accountError] : undefined;
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
      {accountDataCleared && (
        <div className="panel-card" style={{ background: "var(--sage-soft)", border: "1px solid var(--sage)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--sage)" }}>账号数据已清除</p>
        </div>
      )}
      {accountErrorMessage && (
        <div className="panel-card" style={{ background: "var(--clay-soft)", border: "1px solid var(--clay)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--clay)" }}>{accountErrorMessage}</p>
        </div>
      )}

      <section className="panel-card">
        <div className="settings-account-heading">
          <details className="settings-inline-edit" open={!hasNickname && Boolean(user)}>
            <summary className="settings-inline-summary">
              <p className="page-kicker">账号信息</p>
              <h2 className="section-heading mt-1">
                {displayName}
                {user ? <Pencil aria-hidden="true" className="h-4 w-4" /> : null}
              </h2>
            </summary>
            {user ? (
              <form action={updateNicknameAction} className="settings-nickname-form">
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
            ) : null}
          </details>
          <span className="status-pill">{user ? "已登录" : "未登录"}</span>
        </div>

        {!user ? (
          <div className="settings-account-empty">
            <p className="body-copy">
              登录后才能保存任务、习惯、日程、事件、灵感和复盘数据。
            </p>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        ) : (
          <div className="settings-account-body">
            <div className="settings-account-meta">
              <div>
                <span>邮箱</span>
                <strong>{user.email}</strong>
              </div>
            </div>

            <div className="settings-account-actions">
              <form action={signOutAction}>
                <button className="soft-button settings-account-action-button text-sm" type="submit">
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  退出登录
                </button>
              </form>
              <div>
                <form action={clearAccountDataAction}>
                  <input type="hidden" name="confirmClear" value="CLEAR_MY_DATA" />
                  <ClearDataSubmitButton />
                </form>
              </div>
              <div>
                <form action={deleteAccountAction}>
                  <input type="hidden" name="confirmDelete" value="DELETE_MY_ACCOUNT" />
                  <DeleteAccountSubmitButton />
                </form>
              </div>
            </div>
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
