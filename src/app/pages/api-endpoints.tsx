import { useState } from "react";
import { usePlanner, type Endpoint } from "../context/planner-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Globe, Plus, Trash2, Shield, Clock, Filter } from "lucide-react";
import { toast } from "sonner";

const methodColors: Record<string, string> = {
  GET: "bg-green-500/10 text-green-700 border-green-200",
  POST: "bg-blue-500/10 text-blue-700 border-blue-200",
  PUT: "bg-amber-500/10 text-amber-700 border-amber-200",
  PATCH: "bg-purple-500/10 text-purple-700 border-purple-200",
  DELETE: "bg-red-500/10 text-red-700 border-red-200",
};

const methods: Endpoint["method"][] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function ApiEndpoints() {
  const { plan, addEndpoint, removeEndpoint, updateEndpoint } = usePlanner();
  const [showAdd, setShowAdd] = useState(false);
  const [filterMethod, setFilterMethod] = useState<string>("ALL");
  const [newEndpoint, setNewEndpoint] = useState<Partial<Endpoint>>({
    method: "GET",
    path: "/api/",
    description: "",
    auth: false,
    rateLimit: "100/min",
  });

  function handleAdd() {
    if (!newEndpoint.path?.trim()) return;
    const ep: Endpoint = {
      id: "e" + Date.now().toString(36),
      method: newEndpoint.method as Endpoint["method"],
      path: newEndpoint.path!.trim(),
      description: newEndpoint.description || "",
      auth: newEndpoint.auth ?? false,
      rateLimit: newEndpoint.rateLimit || "100/min",
    };
    addEndpoint(ep);
    setNewEndpoint({ method: "GET", path: "/api/", description: "", auth: false, rateLimit: "100/min" });
    setShowAdd(false);
    toast.success(`Endpoint ${ep.method} ${ep.path} added`);
  }

  const filtered = filterMethod === "ALL"
    ? plan.endpoints
    : plan.endpoints.filter((e) => e.method === filterMethod);

  const methodCounts = methods.reduce(
    (acc, m) => ({ ...acc, [m]: plan.endpoints.filter((e) => e.method === m).length }),
    {} as Record<string, number>
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-green-600" />
            API Endpoints
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan your REST API endpoints with methods, paths, and access controls.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Endpoint
        </Button>
      </div>

      {/* Method summary badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterMethod("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
            filterMethod === "ALL"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border hover:bg-accent"
          }`}
        >
          All ({plan.endpoints.length})
        </button>
        {methods.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMethod(m)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              filterMethod === m
                ? "bg-primary text-primary-foreground border-primary"
                : `${methodColors[m]} hover:opacity-80`
            }`}
          >
            {m} ({methodCounts[m] || 0})
          </button>
        ))}
      </div>

      {/* Endpoints list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.map((ep) => (
              <div key={ep.id} className="px-5 py-4 flex items-center gap-4 hover:bg-accent/20 transition-colors">
                <Badge
                  className={`${methodColors[ep.method]} w-16 justify-center font-mono text-xs`}
                >
                  {ep.method}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate">{ep.path}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ep.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {ep.auth && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Shield className="w-3.5 h-3.5" />
                      Auth
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {ep.rateLimit}
                  </div>
                  <button
                    onClick={() => updateEndpoint(ep.id, { auth: !ep.auth })}
                    className={`p-1.5 rounded-md transition-colors ${
                      ep.auth ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"
                    }`}
                    title={ep.auth ? "Remove auth requirement" : "Require auth"}
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeEndpoint(ep.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center text-muted-foreground">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No endpoints {filterMethod !== "ALL" ? `for ${filterMethod}` : "yet"}.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-2xl tabular-nums">{plan.endpoints.filter((e) => e.auth).length}</p>
              <p className="text-xs text-muted-foreground">Protected Endpoints</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl tabular-nums">{plan.endpoints.filter((e) => !e.auth).length}</p>
              <p className="text-xs text-muted-foreground">Public Endpoints</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl tabular-nums">
                {new Set(plan.endpoints.map((e) => e.path.split("/").slice(0, 3).join("/"))).size}
              </p>
              <p className="text-xs text-muted-foreground">Resource Groups</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Endpoint Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add API Endpoint</DialogTitle>
            <DialogDescription>Define a new REST API endpoint</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div className="w-28">
                <label className="text-sm text-muted-foreground block mb-1.5">Method</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={newEndpoint.method}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, method: e.target.value as Endpoint["method"] })}
                >
                  {methods.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground block mb-1.5">Path</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="/api/resource/:id"
                  value={newEndpoint.path || ""}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, path: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Description</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="What does this endpoint do?"
                value={newEndpoint.description || ""}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEndpoint.auth}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, auth: e.target.checked })}
                  className="rounded"
                />
                Requires Authentication
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Rate Limit:</label>
                <input
                  className="w-24 px-2 py-1.5 rounded-lg border border-border bg-input-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={newEndpoint.rateLimit || ""}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, rateLimit: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!newEndpoint.path?.trim()}>
              Add Endpoint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
