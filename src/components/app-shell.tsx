import Link from "next/link";
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Gift,
  LogIn,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";

import { signOutAction } from "@/app/auth/actions";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";

const navigationItems = [
  { href: "/daily", label: "每日工作台", icon: CalendarCheck },
  { href: "/records", label: "成长记录", icon: ClipboardList },
  { href: "/insights", label: "洞察报告", icon: BarChart3 },
  { href: "/life", label: "纪念日", icon: Gift },
  { href: "/settings", label: "设置", icon: Settings },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const loginPath = buildLoginPath({ next: "/daily", message: loginRequiredMessage });

  return (
    <body>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
          <header className="mobile-shell-header lg:hidden">
            <MobileNavDrawer loginPath={loginPath} userEmail={user?.email ?? null} />

            <Link href="/" className="mobile-shell-brand">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--lavender-soft)] text-xs font-bold text-[var(--lavender)]">
                GI
              </span>
              <span>Growth Insight</span>
            </Link>

            {user ? (
              <form action={signOutAction}>
                <button className="mobile-account-button" type="submit" aria-label="退出登录">
                  <UserRound aria-hidden="true" className="h-4 w-4" />
                  <span>已登录</span>
                </button>
              </form>
            ) : (
              <Link className="mobile-account-button" href={loginPath}>
                <LogIn aria-hidden="true" className="h-4 w-4" />
                <span>登录</span>
              </Link>
            )}
          </header>

          <aside className="hidden border-b border-[var(--border)] bg-[var(--sidebar)] px-4 py-4 lg:flex lg:w-[17rem] lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
            <div className="flex items-center justify-between gap-4 lg:block">
              <Link
                href="/"
                className="flex items-center gap-3 text-base font-bold text-[var(--foreground)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--lavender-soft)] text-sm font-bold text-[var(--lavender)]">
                  GI
                </span>
                <span>Growth Insight</span>
              </Link>
              <p className="hidden text-xs leading-5 text-[var(--muted-foreground)] lg:mt-3 lg:block">
                个人成长洞察系统
              </p>
            </div>

            <nav
              aria-label="主导航"
              className="mt-4 flex gap-2 overflow-x-auto lg:mt-8 lg:flex-col lg:overflow-visible"
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-link"
                  >
                    <span className="nav-icon">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 lg:block">
              <p className="text-xs font-semibold text-[var(--subtle-foreground)]">
                当前阶段
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                认证基线接入
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                数据库迁移已完成，正在接入登录和写入拦截。
              </p>
            </div>

            <div className="mt-4 hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 lg:block">
              <div className="flex items-center gap-2">
                <span className="nav-icon">
                  <UserRound aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--subtle-foreground)]">
                    账号状态
                  </p>
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {user?.email ?? "未登录"}
                  </p>
                </div>
              </div>
              {user ? (
                <form action={signOutAction} className="mt-3">
                  <button className="soft-button w-full" type="submit">
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    退出
                  </button>
                </form>
              ) : (
                <Link className="soft-button mt-3 w-full" href={loginPath}>
                  <LogIn aria-hidden="true" className="h-4 w-4" />
                  登录 / 注册
                </Link>
              )}
            </div>
          </aside>

          <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </body>
  );
}
