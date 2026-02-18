import { usePlanner } from "../context/planner-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { useNavigate } from "react-router";
import {
  Database,
  Globe,
  Shield,
  Radio,
  HardDrive,
  AlertTriangle,
  Layers,
  ArrowRight,
  Server,
  Zap,
  Lock,
  BarChart3,
} from "lucide-react";

const sectionCards = [
  {
    title: "Data Models",
    icon: Database,
    path: "/schema",
    color: "bg-blue-500/10 text-blue-600",
    key: "models" as const,
  },
  {
    title: "API Endpoints",
    icon: Globe,
    path: "/endpoints",
    color: "bg-green-500/10 text-green-600",
    key: "endpoints" as const,
  },
  {
    title: "Authentication",
    icon: Shield,
    path: "/auth",
    color: "bg-purple-500/10 text-purple-600",
    key: "auth" as const,
  },
  {
    title: "Real-time",
    icon: Radio,
    path: "/realtime",
    color: "bg-orange-500/10 text-orange-600",
    key: "realtime" as const,
  },
  {
    title: "Caching",
    icon: HardDrive,
    path: "/caching",
    color: "bg-cyan-500/10 text-cyan-600",
    key: "cache" as const,
  },
  {
    title: "Error Handling",
    icon: AlertTriangle,
    path: "/errors",
    color: "bg-red-500/10 text-red-600",
    key: "errors" as const,
  },
  {
    title: "User Features",
    icon: Layers,
    path: "/features",
    color: "bg-indigo-500/10 text-indigo-600",
    key: "features" as const,
  },
];

export function Overview() {
  const { plan, completionPercentage, updateProject } = usePlanner();
  const navigate = useNavigate();

  function getSectionSummary(key: string): string {
    switch (key) {
      case "models":
        return `${plan.models.length} tables, ${plan.models.reduce((a, m) => a + m.fields.length, 0)} fields`;
      case "endpoints":
        return `${plan.endpoints.length} endpoints defined`;
      case "auth":
        return `${plan.auth.strategy.toUpperCase()} with ${plan.auth.providers.length} providers`;
      case "realtime":
        return plan.realtime.enabled
          ? `${plan.realtime.strategy} (${plan.realtime.channels.length} channels)`
          : "Not configured";
      case "cache":
        return `TTL: ${plan.cache.ttl}s, ${plan.cache.invalidationStrategy}`;
      case "errors":
        return `${plan.errors.retryCount} retries, ${plan.errors.logging} logging`;
      case "features":
        const feats = [];
        if (plan.features.search) feats.push("Search");
        if (plan.features.pagination) feats.push("Pagination");
        if (plan.features.userAccounts) feats.push("Accounts");
        return feats.join(", ") || "None configured";
      default:
        return "";
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1>Data Integration Planner</h1>
        <p className="text-muted-foreground mt-1">
          Design your full-stack data architecture — models, APIs, auth, caching, and more.
        </p>
      </div>

      {/* Project Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            Project Configuration
          </CardTitle>
          <CardDescription>Define your website type and data sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Project Name</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={plan.project.name}
                  onChange={(e) => updateProject({ name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Website Type</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={plan.project.websiteType}
                  onChange={(e) => updateProject({ websiteType: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Data Source</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={plan.project.dataSource}
                  onChange={(e) => updateProject({ dataSource: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Description</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  rows={2}
                  value={plan.project.description}
                  onChange={(e) => updateProject({ description: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl tabular-nums">{plan.models.length}</p>
              <p className="text-xs text-muted-foreground">Data Models</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl tabular-nums">{plan.endpoints.length}</p>
              <p className="text-xs text-muted-foreground">API Endpoints</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl tabular-nums">{plan.auth.providers.length}</p>
              <p className="text-xs text-muted-foreground">Auth Providers</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl tabular-nums">{completionPercentage}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Completion Bar */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3>Architecture Completion</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {completionPercentage === 100
                ? "All sections are fully configured."
                : "Configure each section to complete your integration plan."}
            </p>
          </div>
          <span className="text-2xl tabular-nums">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </Card>

      {/* Section Cards Grid */}
      <div>
        <h2 className="mb-4">Integration Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sectionCards.map((section) => (
            <Card
              key={section.key}
              className="cursor-pointer hover:border-primary/30 transition-colors group"
              onClick={() => navigate(section.path)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="mb-1">{section.title}</h4>
                <p className="text-xs text-muted-foreground">{getSectionSummary(section.key)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Architecture Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture Summary</CardTitle>
          <CardDescription>Quick glance at your integration decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Auth Strategy</span>
              <Badge variant="secondary">{plan.auth.strategy.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Real-time</span>
              <Badge variant="secondary">
                {plan.realtime.enabled ? plan.realtime.strategy : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Cache TTL</span>
              <Badge variant="secondary">{plan.cache.ttl}s</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Error Logging</span>
              <Badge variant="secondary">{plan.errors.logging}</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Search</span>
              <Badge variant="secondary">{plan.features.searchStrategy}</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Validation</span>
              <Badge variant="secondary">{plan.features.formValidation}</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Offline Mode</span>
              <Badge variant={plan.errors.offlineMode ? "default" : "outline"}>
                {plan.errors.offlineMode ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">CDN</span>
              <Badge variant={plan.cache.cdn ? "default" : "outline"}>
                {plan.cache.cdn ? plan.cache.cdnProvider : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
