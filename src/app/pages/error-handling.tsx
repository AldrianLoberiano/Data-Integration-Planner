import { usePlanner } from "../context/planner-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Shield,
  Bug,
  Check,
  Timer,
  Layers,
  Activity,
} from "lucide-react";

const loggingOptions = [
  {
    id: "console" as const,
    name: "Console",
    description: "Browser console logging. Good for development.",
    level: "Basic",
  },
  {
    id: "sentry" as const,
    name: "Sentry",
    description: "Production error tracking with stack traces and context.",
    level: "Advanced",
  },
  {
    id: "custom" as const,
    name: "Custom Logger",
    description: "Your own logging service or aggregator.",
    level: "Flexible",
  },
  {
    id: "none" as const,
    name: "None",
    description: "No error logging. Not recommended for production.",
    level: "N/A",
  },
];

const offlineStorageOptions = [
  {
    id: "indexeddb" as const,
    name: "IndexedDB",
    description: "Structured database for large offline datasets. Best for complex apps.",
  },
  {
    id: "localstorage" as const,
    name: "LocalStorage",
    description: "Simple key-value storage. Limited to ~5MB. Good for small state.",
  },
  {
    id: "none" as const,
    name: "None",
    description: "No offline storage. App requires network connection.",
  },
];

export function ErrorHandling() {
  const { plan, updateErrors } = usePlanner();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Error Handling
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure fallbacks, retries, offline mode, and error logging strategies.
        </p>
      </div>

      {/* Retry Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Retry Strategy
            </CardTitle>
            <CardDescription>How failed requests are retried</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Retry Count</label>
                <span className="text-sm tabular-nums">{plan.errors.retryCount}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={plan.errors.retryCount}
                onChange={(e) => updateErrors({ retryCount: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>No retries</span>
                <span>10 retries</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Initial Delay</label>
                <span className="text-sm tabular-nums">{plan.errors.retryDelay}ms</span>
              </div>
              <input
                type="range"
                min={100}
                max={5000}
                step={100}
                value={plan.errors.retryDelay}
                onChange={(e) => updateErrors({ retryDelay: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>100ms</span>
                <span>5000ms</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Exponential Backoff</p>
                <p className="text-xs text-muted-foreground">Double delay after each retry</p>
              </div>
              <Switch
                checked={plan.errors.exponentialBackoff}
                onCheckedChange={(c) => updateErrors({ exponentialBackoff: c })}
              />
            </div>

            {/* Retry timeline preview */}
            {plan.errors.retryCount > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2">Retry Timeline</p>
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">Request</Badge>
                  {Array.from({ length: Math.min(plan.errors.retryCount, 5) }).map((_, i) => {
                    const delay = plan.errors.exponentialBackoff
                      ? plan.errors.retryDelay * Math.pow(2, i)
                      : plan.errors.retryDelay * (i + 1);
                    return (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">→ {delay}ms →</span>
                        <Badge variant="secondary" className="text-xs">
                          Retry {i + 1}
                        </Badge>
                      </div>
                    );
                  })}
                  {plan.errors.retryCount > 5 && (
                    <span className="text-xs text-muted-foreground">...+{plan.errors.retryCount - 5} more</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offline Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-orange-600" />
              Offline Mode
            </CardTitle>
            <CardDescription>Handle network disconnections gracefully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Enable Offline Mode</p>
                <p className="text-xs text-muted-foreground">Queue actions when offline</p>
              </div>
              <Switch
                checked={plan.errors.offlineMode}
                onCheckedChange={(c) => updateErrors({ offlineMode: c })}
              />
            </div>

            {plan.errors.offlineMode && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Offline Storage</p>
                {offlineStorageOptions.map((opt) => {
                  const isActive = plan.errors.offlineStorage === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => updateErrors({ offlineStorage: opt.id })}
                      className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                        isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isActive ? "border-primary" : "border-muted-foreground/30"
                      }`}>
                        {isActive && <Check className="w-2.5 h-2.5 text-primary" />}
                      </div>
                      <div>
                        <p className="text-sm">{opt.name}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* UI Fallbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            UI Resilience
          </CardTitle>
          <CardDescription>How the UI handles errors and degradation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border transition-colors ${
              plan.errors.fallbackUI ? "border-primary/30 bg-primary/5" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <p className="text-sm">Fallback UI</p>
                </div>
                <Switch
                  checked={plan.errors.fallbackUI}
                  onCheckedChange={(c) => updateErrors({ fallbackUI: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Show placeholder content when data fails to load.
              </p>
            </div>

            <div className={`p-4 rounded-lg border transition-colors ${
              plan.errors.errorBoundaries ? "border-primary/30 bg-primary/5" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm">Error Boundaries</p>
                </div>
                <Switch
                  checked={plan.errors.errorBoundaries}
                  onCheckedChange={(c) => updateErrors({ errorBoundaries: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Catch rendering errors without crashing the whole app.
              </p>
            </div>

            <div className={`p-4 rounded-lg border transition-colors ${
              plan.errors.gracefulDegradation ? "border-primary/30 bg-primary/5" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <p className="text-sm">Graceful Degradation</p>
                </div>
                <Switch
                  checked={plan.errors.gracefulDegradation}
                  onCheckedChange={(c) => updateErrors({ gracefulDegradation: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Progressively reduce features when services fail.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Logging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-purple-600" />
            Error Logging
          </CardTitle>
          <CardDescription>Where errors are reported and tracked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {loggingOptions.map((opt) => {
              const isActive = plan.errors.logging === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => updateErrors({ logging: opt.id })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm">{opt.name}</h4>
                    {isActive && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {opt.level}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error Handling Summary */}
      <Card className="bg-accent/30">
        <CardContent className="p-5">
          <h4 className="mb-3">Error Strategy Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Retries</p>
              <p className="text-sm">
                {plan.errors.retryCount}x{" "}
                {plan.errors.exponentialBackoff ? "(exponential)" : "(linear)"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Offline</p>
              <p className="text-sm">
                {plan.errors.offlineMode ? plan.errors.offlineStorage : "Disabled"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Logging</p>
              <p className="text-sm capitalize">{plan.errors.logging}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resilience</p>
              <p className="text-sm">
                {[
                  plan.errors.fallbackUI && "Fallback",
                  plan.errors.errorBoundaries && "Boundaries",
                  plan.errors.gracefulDegradation && "Degradation",
                ].filter(Boolean).join(", ") || "None"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
