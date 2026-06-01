import Link from "next/link";
import {
  BarChart3,
  ListTodo,
  LogIn,
  MessageCircle,
  Settings,
  UserRound,
} from "lucide-react";

import { BottomNav } from "@/components/bottom-nav";
import { SearchOverlay } from "@/components/search-overlay";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";

const navigationItems = [
  { href: "/checklist", label: "清单", icon: ListTodo },
  { href: "/life", label: "人生", icon: UserRound },
  { href: "/ai", label: "AI", icon: MessageCircle },
  { href: "/insights", label: "复盘", icon: BarChart3 },
  { href: "/settings", label: "设置", icon: Settings },
];

function getDisplayName(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  const nickname = user?.user_metadata?.nickname;

  if (typeof nickname === "string" && nickname.trim()) {
    return nickname.trim();
  }

  return "设置昵称";
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const loginPath = buildLoginPath({ next: "/checklist", message: loginRequiredMessage });
  const displayName = getDisplayName(user);

  return (
    <body>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-16 lg:pb-0">
        {/* Desktop top header with account entry */}
        <div className="hidden border-b border-[var(--border)] bg-[var(--sidebar)] px-6 py-3 lg:flex lg:items-center lg:justify-end lg:gap-3">
          {user ? (
            <Link className="desktop-account-button" href="/settings" aria-label="打开账号与应用设置">
              <UserRound aria-hidden="true" className="h-4 w-4" />
              <span className="truncate max-w-[10rem]">{displayName}</span>
            </Link>
          ) : (
            <Link className="desktop-account-button" href={loginPath}>
              <LogIn aria-hidden="true" className="h-4 w-4" />
              <span>登录 / 注册</span>
            </Link>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row">
          <aside className="hidden border-b border-[var(--border)] bg-[var(--sidebar)] px-4 py-4 lg:flex lg:w-[17rem] lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
            <Link
              href="/checklist"
              className="flex items-center gap-3 text-base font-bold text-[var(--foreground)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--lavender-soft)] text-sm font-bold text-[var(--lavender)]">
                GI
              </span>
              <span>Growth Insight</span>
            </Link>

            <nav
              aria-label="主导航"
              className="mt-6 flex gap-2 overflow-x-auto lg:mt-6 lg:flex-col lg:overflow-visible"
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
          </aside>

          <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
            {children}
          </main>
        </div>

        {/* SearchOverlay - rendered for both desktop and mobile */}
        <SearchOverlay />

        {/* Mobile bottom navigation */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </body>
  );
}
