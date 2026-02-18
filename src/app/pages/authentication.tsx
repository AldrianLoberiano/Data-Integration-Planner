import { useState } from "react";
import { usePlanner } from "../context/planner-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  Shield,
  Key,
  Users,
  Lock,
  Fingerprint,
  Plus,
  X,
  Check,
  Mail,
  Github,
  Chrome,
} from "lucide-react";
import { toast } from "sonner";

const strategies = [
  {
    id: "jwt" as const,
    name: "JWT (JSON Web Tokens)",
    description: "Stateless authentication with signed tokens. Ideal for APIs and SPAs.",
    icon: Key,
    pros: ["Stateless", "Scalable", "Cross-domain"],
    cons: ["Token revocation complex", "Payload size"],
  },
  {
    id: "oauth" as const,
    name: "OAuth 2.0",
    description: "Delegated authorization via third-party providers (Google, GitHub, etc).",
    icon: Users,
    pros: ["Social login", "Delegated auth", "Standard protocol"],
    cons: ["Complex flow", "Provider dependency"],
  },
  {
    id: "apikey" as const,
    name: "API Keys",
    description: "Simple token-based access for service-to-service communication.",
    icon: Lock,
    pros: ["Simple", "Easy to rotate", "Good for M2M"],
    cons: ["No user context", "Less secure in browser"],
  },
  {
    id: "session" as const,
    name: "Session-based",
    description: "Server-side sessions with cookies. Traditional web app authentication.",
    icon: Fingerprint,
    pros: ["Server control", "Easy revocation", "CSRF protection"],
    cons: ["Stateful", "Scaling challenges"],
  },
];

const availableProviders = [
  { id: "email", label: "Email/Password", icon: Mail },
  { id: "google", label: "Google", icon: Chrome },
  { id: "github", label: "GitHub", icon: Github },
  { id: "magic-link", label: "Magic Link", icon: Mail },
  { id: "phone", label: "Phone/SMS", icon: Key },
];

export function Authentication() {
  const { plan, updateAuth } = usePlanner();
  const [newRole, setNewRole] = useState("");

  function toggleProvider(providerId: string) {
    const current = plan.auth.providers;
    const updated = current.includes(providerId)
      ? current.filter((p) => p !== providerId)
      : [...current, providerId];
    updateAuth({ providers: updated });
  }

  function addRole() {
    if (!newRole.trim()) return;
    if (plan.auth.roles.includes(newRole.trim())) {
      toast.error("Role already exists");
      return;
    }
    updateAuth({ roles: [...plan.auth.roles, newRole.trim()] });
    setNewRole("");
    toast.success(`Role "${newRole.trim()}" added`);
  }

  function removeRole(role: string) {
    updateAuth({ roles: plan.auth.roles.filter((r) => r !== role) });
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-600" />
          Authentication Strategy
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your authentication approach, providers, and access control.
        </p>
      </div>

      {/* Strategy Selection */}
      <div>
        <h2 className="mb-4">Select Strategy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map((s) => {
            const isActive = plan.auth.strategy === s.id;
            return (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all ${
                  isActive ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30"
                }`}
                onClick={() => updateAuth({ strategy: s.id })}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-accent"
                      }`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4>{s.name}</h4>
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-green-600 mb-1">Pros</p>
                      {s.pros.map((p) => (
                        <p key={p} className="text-xs text-muted-foreground">+ {p}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-amber-600 mb-1">Cons</p>
                      {s.cons.map((c) => (
                        <p key={c} className="text-xs text-muted-foreground">- {c}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Auth Providers</CardTitle>
          <CardDescription>Enable authentication providers for your users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableProviders.map((provider) => {
              const enabled = plan.auth.providers.includes(provider.id);
              return (
                <div
                  key={provider.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                    enabled ? "border-primary/30 bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <provider.icon className="w-4 h-4" />
                    <span className="text-sm">{provider.label}</span>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggleProvider(provider.id)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Token Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Token Configuration</CardTitle>
            <CardDescription>Set token expiry and refresh behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">Token Expiry</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={plan.auth.tokenExpiry}
                onChange={(e) => updateAuth({ tokenExpiry: e.target.value })}
              >
                <option value="15m">15 minutes</option>
                <option value="30m">30 minutes</option>
                <option value="1h">1 hour</option>
                <option value="4h">4 hours</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Refresh Tokens</p>
                <p className="text-xs text-muted-foreground">Issue refresh tokens for session renewal</p>
              </div>
              <Switch
                checked={plan.auth.refreshTokens}
                onCheckedChange={(c) => updateAuth({ refreshTokens: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Multi-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Require MFA for sensitive operations</p>
              </div>
              <Switch
                checked={plan.auth.mfa}
                onCheckedChange={(c) => updateAuth({ mfa: c })}
              />
            </div>
          </CardContent>
        </Card>

        {/* RBAC */}
        <Card>
          <CardHeader>
            <CardTitle>Role-Based Access Control</CardTitle>
            <CardDescription>Define user roles for authorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Enable RBAC</p>
                <p className="text-xs text-muted-foreground">Role-based permission system</p>
              </div>
              <Switch
                checked={plan.auth.rbac}
                onCheckedChange={(c) => updateAuth({ rbac: c })}
              />
            </div>
            {plan.auth.rbac && (
              <>
                <div className="flex flex-wrap gap-2">
                  {plan.auth.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="gap-1 pr-1">
                      {role}
                      <button
                        onClick={() => removeRole(role)}
                        className="ml-0.5 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Add a role..."
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addRole()}
                  />
                  <Button size="sm" onClick={addRole} disabled={!newRole.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Auth Flow Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Flow</CardTitle>
          <CardDescription>Visual overview of your auth configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-200 text-sm">
              <p className="text-xs text-blue-600 mb-0.5">Strategy</p>
              <p>{plan.auth.strategy.toUpperCase()}</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="px-4 py-3 rounded-lg bg-green-500/10 border border-green-200 text-sm">
              <p className="text-xs text-green-600 mb-0.5">Providers</p>
              <p>{plan.auth.providers.join(", ") || "None"}</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="px-4 py-3 rounded-lg bg-purple-500/10 border border-purple-200 text-sm">
              <p className="text-xs text-purple-600 mb-0.5">Token</p>
              <p>Expires: {plan.auth.tokenExpiry}</p>
            </div>
            {plan.auth.refreshTokens && (
              <>
                <span className="text-muted-foreground">→</span>
                <div className="px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-200 text-sm">
                  <p className="text-xs text-amber-600 mb-0.5">Refresh</p>
                  <p>Enabled</p>
                </div>
              </>
            )}
            {plan.auth.rbac && (
              <>
                <span className="text-muted-foreground">→</span>
                <div className="px-4 py-3 rounded-lg bg-cyan-500/10 border border-cyan-200 text-sm">
                  <p className="text-xs text-cyan-600 mb-0.5">RBAC</p>
                  <p>{plan.auth.roles.length} roles</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
