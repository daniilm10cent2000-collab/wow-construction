"use client";

import { Menu } from "lucide-react";
import { MOCK_CURRENT_USER } from "@/shared/constants/mock-dashboard";

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-industrial-border bg-industrial-topbar px-4 backdrop-blur-sm">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-industrial-muted hover:bg-industrial-border hover:text-white lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-industrial-muted sm:inline">{MOCK_CURRENT_USER.email}</span>
        <div className="h-8 w-8 rounded-full bg-industrial-border flex items-center justify-center text-xs font-medium text-white">
          {MOCK_CURRENT_USER.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
      </div>
    </header>
  );
}
