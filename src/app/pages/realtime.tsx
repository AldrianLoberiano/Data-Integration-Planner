import { useState } from "react";
import { usePlanner } from "../context/planner-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Radio, Plus, X, Wifi, WifiOff, Timer, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

const realtimeStrategies = [
  {
    id: "websocket" as const,
    name: "WebSockets",
    description: "Full-duplex, persistent connection. Best for real-time bidirectional communication.",
    latency: "~50ms",
    scalability: "Medium",
    complexity: "High",
  },
  {
    id: "sse" as const,
    name: "Server-Sent Events",
    description: "One-way server-to-client streaming. Good for live feeds and notifications.",
    latency: "~100ms",
    scalability: "High",
    complexity: "Low",
  },
  {
    id: "polling" as const,
    name: "Long Polling",
    description: "Client polls server at intervals. Simplest to implement, higher latency.",
    latency: "Variable",
    scalability: "Low",
    complexity: "Very Low",
  },
];

const reconnectStrategies = [
  { id: "exponential" as const, name: "Exponential Backoff", description: "1s, 2s, 4s, 8s..." },
  { id: "linear" as const, name: "Linear", description: "1s, 2s, 3s, 4s..." },
  { id: "none" as const, name: "No Reconnect", description: "Connection drops permanently" },
];

export function Realtime() {
  const { plan, updateRealtime } = usePlanner();
  const [newChannel, setNewChannel] = useState("");

  function addChannel() {
    if (!newChannel.trim()) return;
    if (plan.realtime.channels.includes(newChannel.trim())) {
      toast.error("Channel already exists");
      return;
    }
    updateRealtime({ channels: [...plan.realtime.channels, newChannel.trim()] });
    setNewChannel("");
    toast.success(`Channel "${newChannel.trim()}" added`);
  }

  function removeChannel(ch: string) {
    updateRealtime({ channels: plan.realtime.channels.filter((c) => c !== ch) });
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-orange-600" />
            Real-time Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure real-time data synchronization between client and server.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Enable Real-time</span>
          <Switch
            checked={plan.realtime.enabled}
            onCheckedChange={(c) => updateRealtime({ enabled: c })}
          />
        </div>
      </div>

      {!plan.realtime.enabled ? (
        <Card className="p-12 text-center">
          <WifiOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="mb-2">Real-time Disabled</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enable real-time to configure WebSocket, SSE, or polling strategies for live data
            updates in your application.
          </p>
        </Card>
      ) : (
        <>
          {/* Strategy Selection */}
          <div>
            <h2 className="mb-4">Transport Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {realtimeStrategies.map((s) => {
                const isActive = plan.realtime.strategy === s.id;
                return (
                  <Card
                    key={s.id}
                    className={`cursor-pointer transition-all ${
                      isActive ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"
                    }`}
                    onClick={() => updateRealtime({ strategy: s.id })}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4>{s.name}</h4>
                        {isActive && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{s.description}</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Latency</span>
                          <span>{s.latency}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Scalability</span>
                          <span>{s.scalability}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Complexity</span>
                          <span>{s.complexity}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Polling interval (only for polling) */}
          {plan.realtime.strategy === "polling" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-600" />
                  Polling Interval
                </CardTitle>
                <CardDescription>How frequently the client should poll the server</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1000}
                    max={30000}
                    step={1000}
                    value={plan.realtime.pollingInterval}
                    onChange={(e) => updateRealtime({ pollingInterval: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-sm tabular-nums w-20 text-right">
                    {plan.realtime.pollingInterval / 1000}s
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1s (aggressive)</span>
                  <span>30s (relaxed)</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-green-600" />
                Channels / Topics
              </CardTitle>
              <CardDescription>
                Define the real-time channels your application subscribes to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {plan.realtime.channels.map((ch) => (
                  <Badge key={ch} variant="secondary" className="gap-1 pr-1 py-1">
                    <Wifi className="w-3 h-3" />
                    {ch}
                    <button
                      onClick={() => removeChannel(ch)}
                      className="ml-1 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {plan.realtime.channels.length === 0 && (
                  <p className="text-sm text-muted-foreground">No channels defined yet.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. inventory-updates, chat-messages"
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addChannel()}
                />
                <Button size="sm" onClick={addChannel} disabled={!newChannel.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reconnection Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                Reconnection Strategy
              </CardTitle>
              <CardDescription>How to handle dropped connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {reconnectStrategies.map((rs) => {
                  const isActive = plan.realtime.reconnectStrategy === rs.id;
                  return (
                    <button
                      key={rs.id}
                      onClick={() => updateRealtime({ reconnectStrategy: rs.id })}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className="text-sm">{rs.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{rs.description}</p>
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1.5">Max Retries</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={plan.realtime.maxRetries}
                    onChange={(e) => updateRealtime({ maxRetries: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-sm tabular-nums w-12 text-right">
                    {plan.realtime.maxRetries === 0 ? "∞" : plan.realtime.maxRetries}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
