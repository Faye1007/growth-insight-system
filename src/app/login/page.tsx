import Link from "next/link";

import { signInAction, signUpAction } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams?: Promise<{
    mode?: string;
    message?: string;
    error?: string;
    next?: string;
  }>;
};

const messageText: Record<string, string> = {
  check_email: "注册邮件已发送，请按邮件提示完成确认后再登录。",
  login_required: "保存个人数据前需要先注册或登录。",
};

const errorText: Record<string, string> = {
  missing_fields: "请填写邮箱和密码。",
  login_failed: "登录失败，请检查邮箱和密码。",
  signup_failed: "注册失败，请稍后重试，或确认这个邮箱是否已经注册。",
  confirm_failed: "邮箱确认失败，请重新打开确认邮件或重新注册。",
};

function getSafeNextPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const mode = params?.mode === "signup" ? "signup" : "login";
  const next = getSafeNextPath(params?.next);
  const formAction = mode === "signup" ? signUpAction : signInAction;

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">账号</p>
        <h1 className="page-title">{mode === "signup" ? "创建账号" : "登录账号"}</h1>
        <p className="page-description">
          登录后才能保存任务、习惯、日程、事件、灵感和复盘结果。
        </p>
      </header>

      <section className="panel-card max-w-xl">
        {params?.message ? (
          <p className="auth-message">{messageText[params.message] ?? "操作已完成。"}</p>
        ) : null}
        {params?.error ? (
          <p className="auth-message auth-message-error">
            {errorText[params.error] ?? "操作失败，请稍后重试。"}
          </p>
        ) : null}

        <form action={formAction} className="auth-form">
          <input type="hidden" name="next" value={next} />
          <label className="form-field">
            <span>邮箱</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="form-field">
            <span>密码</span>
            <input
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
            />
          </label>
          <button className="soft-button w-full" type="submit">
            {mode === "signup" ? "注册" : "登录"}
          </button>
        </form>

        <div className="mt-5 border-t border-[var(--border)] pt-4">
          {mode === "signup" ? (
            <p className="body-copy">
              已有账号？{" "}
              <Link className="text-[var(--mist)] font-semibold" href={`/login?mode=login&next=${encodeURIComponent(next)}`}>
                去登录
              </Link>
            </p>
          ) : (
            <p className="body-copy">
              还没有账号？{" "}
              <Link className="text-[var(--mist)] font-semibold" href={`/login?mode=signup&next=${encodeURIComponent(next)}`}>
                去注册
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
