"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  MessageSquare,
  FolderKanban,
  FileBarChart,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { getNavItemsForRole, MOCK_CURRENT_USER } from "@/shared/constants/mock-dashboard";

const ICON_MAP = {
  LayoutDashboard,
  ShieldAlert,
  MessageSquare,
  FolderKanban,
  FileBarChart,
  Settings,
} as const;

function NavIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name as keyof typeof ICON_MAP] ?? LayoutDashboard;
  return <Icon className="w-5 h-5 shrink-0" />;
}

interface DashboardSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ open, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const role = MOCK_CURRENT_USER.role;
  const items = getNavItemsForRole(role);

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-full
        bg-industrial-sidebar border-r border-industrial-border
        transition-all duration-300 ease-out
        ${open ? "translate-x-0 w-64" : "-translate-x-full w-0 lg:translate-x-0 lg:w-64"}
      `}
    >
      <div className="flex h-full w-64 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-industrial-border px-4 lg:justify-end">
          <span className="text-sm font-semibold text-white lg:sr-only">TGRAF Dashboard</span>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-2 text-industrial-muted hover:bg-industrial-border hover:text-white lg:hidden"
            aria-label={open ? "Close sidebar" : "Open sidebar"}
          >
            {open ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                      ${isActive
                        ? "bg-industrial-accent/15 text-industrial-accent"
                        : "text-industrial-muted hover:bg-industrial-border/50 hover:text-white"}
                    `}
                  >
                    <NavIcon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-industrial-border p-3">
          <div className="rounded-lg bg-industrial-bg/80 px-3 py-2">
            <p className="truncate text-xs font-medium text-white">{MOCK_CURRENT_USER.name}</p>
            <p className="truncate text-xs text-industrial-muted">{MOCK_CURRENT_USER.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
