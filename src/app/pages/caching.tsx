import { useState } from "react";
import { usePlanner } from "../context/planner-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  HardDrive,
  Globe,
  Database,
  Clock,
  Plus,
  X,
  Layers,
  RefreshCw,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const invalidationStrategies = [
  {
    id: "time-based" as const,
    name: "Time-Based (TTL)",
    description: "Cache entries expire after a fixed duration. Simple and predictable.",
  },
  {
    id: "event-based" as const,
    name: "Event-Based",
    description: "Cache invalidated when data changes. Most accurate but requires event system.",
  },
  {
    id: "manual" as const,
    name: "Manual",
    description: "Developer explicitly purges cache. Full control but requires discipline.",
  },
];

const cdnProviders = ["Cloudflare", "AWS CloudFront", "Fastly", "Vercel Edge", "Akamai", "Bunny CDN"];

export function Caching() {
  const { plan, updateCache } = usePlanner();
  const [newCachedEndpoint, setNewCachedEndpoint] = useState("");

  function addCachedEndpoint() {
    if (!newCachedEndpoint.trim()) return;
    if (plan.cache.cachedEndpoints.includes(newCachedEndpoint.trim())) {
      toast.error("Endpoint already cached");
      return;
    }
    updateCache({ cachedEndpoints: [...plan.cache.cachedEndpoints, newCachedEndpoint.trim()] });
    setNewCachedEndpoint("");
  }

  function removeCachedEndpoint(ep: string) {
    updateCache({ cachedEndpoints: plan.cache.cachedEndpoints.filter((e) => e !== ep) });
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2">
          <HardDrive className="w-6 h-6 text-cyan-600" />
          Caching Strategy
        </h1>
        <p className="text-muted-foreground mt-1">
          Design your caching layers — CDN, browser storage, and service workers.
        </p>
      </div>

      {/* Cache Layers */}
      <div>
        <h2 className="mb-4">Cache Layers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`transition-all ${plan.cache.cdn ? "border-primary/30 ring-1 ring-primary/10" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h4>CDN</h4>
                </div>
                <Switch
                  checked={plan.cache.cdn}
                  onCheckedChange={(c) => updateCache({ cdn: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Edge caching for static assets and API responses worldwide.
              </p>
              {plan.cache.cdn && (
                <div className="mt-3">
                  <select
                    className="w-full px-2 py-1.5 rounded-lg border border-border bg-input-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={plan.cache.cdnProvider}
                    onChange={(e) => updateCache({ cdnProvider: e.target.value })}
                  >
                    {cdnProviders.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={`transition-all ${plan.cache.localStorage ? "border-primary/30 ring-1 ring-primary/10" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <h4>LocalStorage</h4>
                </div>
                <Switch
                  checked={plan.cache.localStorage}
                  onCheckedChange={(c) => updateCache({ localStorage: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Persistent browser storage for user preferences and cached data.
              </p>
            </CardContent>
          </Card>

          <Card className={`transition-all ${plan.cache.sessionStorage ? "border-primary/30 ring-1 ring-primary/10" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h4>SessionStorage</h4>
                </div>
                <Switch
                  checked={plan.cache.sessionStorage}
                  onCheckedChange={(c) => updateCache({ sessionStorage: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tab-scoped storage cleared when the browser tab closes.
              </p>
            </CardContent>
          </Card>

          <Card className={`transition-all ${plan.cache.serviceWorker ? "border-primary/30 ring-1 ring-primary/10" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <h4>Service Worker</h4>
                </div>
                <Switch
                  checked={plan.cache.serviceWorker}
                  onCheckedChange={(c) => updateCache({ serviceWorker: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Network proxy for offline support and background sync.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TTL & Stale-While-Revalidate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Time-To-Live (TTL)
            </CardTitle>
            <CardDescription>Default cache duration for entries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={10}
                max={3600}
                step={10}
                value={plan.cache.ttl}
                onChange={(e) => updateCache({ ttl: Number(e.target.value) })}
                className="flex-1 accent-primary"
              />
              <span className="text-sm tabular-nums w-20 text-right">{plan.cache.ttl}s</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10s (fresh)</span>
              <span>1h (aggressive)</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm">Stale-While-Revalidate</p>
                <p className="text-xs text-muted-foreground">
                  Serve stale content while fetching fresh data
                </p>
              </div>
              <Switch
                checked={plan.cache.staleWhileRevalidate}
                onCheckedChange={(c) => updateCache({ staleWhileRevalidate: c })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Invalidation Strategy
            </CardTitle>
            <CardDescription>How cached data gets refreshed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invalidationStrategies.map((s) => {
                const isActive = plan.cache.invalidationStrategy === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => updateCache({ invalidationStrategy: s.id })}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                      isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isActive ? "border-primary" : "border-muted-foreground/30"
                    }`}>
                      {isActive && <Check className="w-3 h-3 text-primary" />}
                    </div>
                    <div>
                      <p className="text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cached Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Cached Endpoints</CardTitle>
          <CardDescription>API endpoints that should be cached</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {plan.cache.cachedEndpoints.map((ep) => (
              <Badge key={ep} variant="secondary" className="gap-1 pr-1 py-1 font-mono text-xs">
                {ep}
                <button
                  onClick={() => removeCachedEndpoint(ep)}
                  className="ml-1 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {plan.cache.cachedEndpoints.length === 0 && (
              <p className="text-sm text-muted-foreground">No endpoints cached.</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-input-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="/api/products"
              value={newCachedEndpoint}
              onChange={(e) => setNewCachedEndpoint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCachedEndpoint()}
            />
            <Button size="sm" onClick={addCachedEndpoint} disabled={!newCachedEndpoint.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-accent/30">
        <CardContent className="p-5">
          <h4 className="mb-3">Cache Architecture Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">CDN</p>
              <p>{plan.cache.cdn ? plan.cache.cdnProvider : "Disabled"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Browser Storage</p>
              <p>
                {[
                  plan.cache.localStorage && "Local",
                  plan.cache.sessionStorage && "Session",
                ].filter(Boolean).join(", ") || "None"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Default TTL</p>
              <p>{plan.cache.ttl}s</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Invalidation</p>
              <p className="capitalize">{plan.cache.invalidationStrategy}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
