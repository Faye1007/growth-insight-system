import Link from "next/link";
import {
  BarChart3,
  BookOpenText,
  CalendarCheck,
  ClipboardList,
  Home,
  Settings,
} from "lucide-react";

const navigationItems = [
  { href: "/", label: "成长主页", icon: Home },
  { href: "/daily", label: "每日工作台", icon: CalendarCheck },
  { href: "/records", label: "成长记录", icon: ClipboardList },
  { href: "/insights", label: "洞察报告", icon: BarChart3 },
  { href: "/manual", label: "个人说明书", icon: BookOpenText },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <body>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
          <aside className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
            <div className="flex items-center justify-between gap-4 lg:block">
              <Link
                href="/"
                className="block text-base font-semibold text-[var(--foreground)]"
              >
                Growth Insight
              </Link>
              <p className="hidden text-xs text-[var(--muted-foreground)] lg:mt-2 lg:block">
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
                    className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--nav-hover)] hover:text-[var(--foreground)]"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4" />
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
      </div>
    </body>
  );
}
