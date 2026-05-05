import Link from "next/link";

import { signInAction, signUpAction } from "@/app/auth/actions";
import { FeedbackMessage } from "@/components/feedback-message";
import { buildLoginPath, getSafeNextPath } from "@/lib/auth/paths";
import {
  authErrorFeedback,
  authMessageFeedback,
  defaultAuthErrorFeedback,
  getFeedbackByCode,
} from "@/lib/feedback";

type LoginPageProps = {
  searchParams?: Promise<{
    mode?: string;
    message?: string;
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const mode = params?.mode === "signup" ? "signup" : "login";
  const next = getSafeNextPath(params?.next);
  const formAction = mode === "signup" ? signUpAction : signInAction;
  const messageFeedback = getFeedbackByCode(params?.message, authMessageFeedback, {
    tone: "info",
    title: "操作已完成",
    detail: "可以继续下一步。",
  });
  const errorFeedback = getFeedbackByCode(params?.error, authErrorFeedback, defaultAuthErrorFeedback);

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
        <FeedbackMessage feedback={messageFeedback} />
        <FeedbackMessage feedback={errorFeedback} />

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
              <Link className="text-[var(--mist)] font-semibold" href={buildLoginPath({ mode: "login", next })}>
                去登录
              </Link>
            </p>
          ) : (
            <p className="body-copy">
              还没有账号？{" "}
              <Link className="text-[var(--mist)] font-semibold" href={buildLoginPath({ mode: "signup", next })}>
                去注册
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
