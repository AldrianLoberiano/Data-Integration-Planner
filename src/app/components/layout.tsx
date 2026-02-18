import { NavLink, Outlet } from "react-router";
import { usePlanner } from "../context/planner-context";
import { Progress } from "./ui/progress";
import {
  LayoutDashboard,
  Database,
  Globe,
  Shield,
  Radio,
  HardDrive,
  AlertTriangle,
  Layers,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/schema", icon: Database, label: "Data Models" },
  { to: "/endpoints", icon: Globe, label: "API Endpoints" },
  { to: "/auth", icon: Shield, label: "Authentication" },
  { to: "/realtime", icon: Radio, label: "Real-time" },
  { to: "/caching", icon: HardDrive, label: "Caching" },
  { to: "/errors", icon: AlertTriangle, label: "Error Handling" },
  { to: "/features", icon: Layers, label: "Features" },
];

export function Layout() {
  const { completionPercentage, plan } = usePlanner();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:relative lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Database className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm tracking-tight">Integration Planner</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Full-Stack Architect</p>
              </div>
            </div>
            <button
              className="lg:hidden p-1 hover:bg-accent rounded"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project info */}
        <div className="px-5 py-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-1">Project</p>
          <p className="text-sm truncate">{plan.project.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{plan.project.websiteType}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Completion */}
        <div className="p-5 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Plan Completion</span>
            <span className="text-xs tabular-nums">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-2">
            {completionPercentage === 100
              ? "All sections configured!"
              : `${Math.round((completionPercentage / 100) * 8)}/8 sections complete`}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button
            className="p-1.5 hover:bg-accent rounded-lg"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-sm">Integration Planner</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
