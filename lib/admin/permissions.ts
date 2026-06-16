import type { AppRole } from "@/lib/supabase/database.types";

export type AdminSection =
  | "dashboard"
  | "leads"
  | "projects"
  | "blog"
  | "analytics"
  | "team"
  | "settings";

export const ROLE_LABELS: Record<AppRole, string> = {
  owner: "Owner",
  project_lead: "Project lead",
  editor: "Editor",
  viewer: "Viewer",
};

export const ADMIN_NAV: Array<{
  section: AdminSection;
  label: string;
  href: string;
}> = [
  { section: "dashboard", label: "Dashboard", href: "/admin" },
  { section: "leads", label: "Leads", href: "/admin/leads" },
  { section: "projects", label: "Projects", href: "/admin/projects" },
  { section: "blog", label: "Blog", href: "/admin/blog" },
  { section: "analytics", label: "Analytics", href: "/admin/analytics" },
  { section: "team", label: "Team", href: "/admin/team" },
  { section: "settings", label: "Settings", href: "/admin/settings" },
];

const ACCESS: Record<AdminSection, AppRole[]> = {
  dashboard: ["owner", "project_lead", "editor", "viewer"],
  leads: ["owner", "project_lead", "viewer"],
  projects: ["owner", "project_lead", "viewer"],
  blog: ["owner", "editor"],
  analytics: ["owner", "project_lead", "viewer"],
  team: ["owner"],
  settings: ["owner"],
};

export function canAccess(role: AppRole, section: AdminSection) {
  return ACCESS[section].includes(role);
}

export function canEditLeads(role: AppRole) {
  return role === "owner" || role === "project_lead";
}

export function canEditProjects(role: AppRole) {
  return role === "owner" || role === "project_lead";
}

export function canEditBlog(role: AppRole) {
  return role === "owner" || role === "editor";
}

export function isOwner(role: AppRole) {
  return role === "owner";
}
