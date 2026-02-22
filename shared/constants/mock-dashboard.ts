/**
 * Mock data for dashboard layout (no database).
 * Replace with real auth/roles when backend is connected.
 */

export type DashboardRole = "admin" | "manager" | "viewer";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: DashboardRole[];
}

export const MOCK_CURRENT_USER = {
  name: "Alex Operator",
  email: "alex@tgraf.local",
  role: "manager" as DashboardRole,
  avatar: null as string | null,
};

export const MOCK_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "LayoutDashboard", roles: ["admin", "manager", "viewer"] },
  { href: "/dashboard/risk", label: "Risk Engine", icon: "ShieldAlert", roles: ["admin", "manager", "viewer"] },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: "MessageSquare", roles: ["admin", "manager", "viewer"] },
  { href: "/dashboard/projects", label: "Projects", icon: "FolderKanban", roles: ["admin", "manager"] },
  { href: "/dashboard/reports", label: "Reports", icon: "FileBarChart", roles: ["admin", "manager"] },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings", roles: ["admin"] },
];

export function getNavItemsForRole(role: DashboardRole): NavItem[] {
  return MOCK_NAV_ITEMS.filter((item) => item.roles.includes(role));
}
