"use client";

import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((o) => !o);

  return (
    <div className="min-h-screen bg-industrial-bg">
      <DashboardSidebar open={sidebarOpen} onToggle={toggleSidebar} />
      <div className="lg:pl-64">
        <DashboardTopbar onMenuClick={toggleSidebar} />
        <main className="min-h-[calc(100vh-3.5rem)] p-4 lg:p-6">{children}</main>
      </div>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close overlay"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
