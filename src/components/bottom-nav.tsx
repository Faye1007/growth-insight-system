"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  ListTodo,
  MessageCircle,
  Settings,
  UserRound,
} from "lucide-react";

const bottomTabs = [
  { href: "/checklist", label: "清单", icon: ListTodo },
  { href: "/life", label: "人生", icon: UserRound },
  { href: "/ai", label: "AI", icon: MessageCircle },
  { href: "/insights", label: "复盘", icon: BarChart3 },
  { href: "/settings", label: "设置", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="底部导航">
      {bottomTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || (tab.href !== "/checklist" && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
