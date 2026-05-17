"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Gift,
  LogIn,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";

const navigationItems = [
  { href: "/daily", label: "每日工作台", icon: CalendarCheck },
  { href: "/records", label: "成长记录", icon: ClipboardList },
  { href: "/insights", label: "洞察报告", icon: BarChart3 },
  { href: "/life", label: "纪念日", icon: Gift },
  { href: "/settings", label: "设置", icon: Settings },
];

export function MobileNavDrawer({
  loginPath,
  userEmail,
}: {
  loginPath: string;
  userEmail: string | null;
}) {
  const [open, setOpen] = useState(false);
  const portalTarget = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const drawer = open ? (
    <div className="mobile-nav-layer" role="dialog" aria-modal="true" aria-label="主导航">
      <button
        aria-label="关闭主导航"
        className="mobile-nav-backdrop-button"
        type="button"
        onClick={() => setOpen(false)}
      />
      <aside className="mobile-nav-panel">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-3 text-base font-bold text-[var(--foreground)]"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--lavender-soft)] text-sm font-bold text-[var(--lavender)]">
              GI
            </span>
            <span>Growth Insight</span>
          </Link>
          <button
            aria-label="关闭主导航"
            className="mobile-nav-close"
            type="button"
            onClick={() => setOpen(false)}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="移动端主导航" className="mt-5 grid gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                <span className="nav-icon">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2">
            <span className="nav-icon">
              <UserRound aria-hidden="true" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--subtle-foreground)]">
                账号状态
              </p>
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                {userEmail ?? "未登录"}
              </p>
            </div>
          </div>
          {userEmail ? (
            <p className="body-copy mt-3">可在页面右上角退出当前账号。</p>
          ) : (
            <Link
              className="soft-button mt-3 w-full"
              href={loginPath}
              onClick={() => setOpen(false)}
            >
              <LogIn aria-hidden="true" className="h-4 w-4" />
              登录 / 注册
            </Link>
          )}
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <>
      <button
        aria-expanded={open}
        aria-label="打开主导航"
        className="mobile-nav-trigger"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" className="h-4 w-4" />
      </button>
      {portalTarget ? createPortal(drawer, portalTarget) : null}
    </>
  );
}
