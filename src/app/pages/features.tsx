import { usePlanner } from "../context/planner-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import {
  Layers,
  ScrollText,
  FileText,
  User,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Check,
  ListFilter,
} from "lucide-react";

const validationLibraries = [
  { id: "zod" as const, name: "Zod", description: "TypeScript-first schema validation with static type inference." },
  { id: "yup" as const, name: "Yup", description: "Schema builder for value parsing and validation." },
  { id: "joi" as const, name: "Joi", description: "Powerful schema description and data validation." },
  { id: "custom" as const, name: "Custom", description: "Roll your own validation logic." },
  { id: "none" as const, name: "None", description: "No form validation library." },
];

const searchStrategies = [
  { id: "client" as const, name: "Client-Side", description: "Filter data already loaded in the browser. Fast but limited." },
  { id: "server" as const, name: "Server-Side", description: "Database queries with LIKE/full-text search. Scalable." },
  { id: "elasticsearch" as const, name: "Elasticsearch", description: "Dedicated search engine for complex full-text search." },
  { id: "algolia" as const, name: "Algolia", description: "Managed search-as-a-service with instant results." },
];

export function Features() {
  const { plan, updateFeatures } = usePlanner();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-indigo-600" />
          User-Facing Features
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure dynamic content loading, forms, user accounts, and search.
        </p>
      </div>

      {/* Content Loading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-blue-600" />
            Dynamic Content Loading
          </CardTitle>
          <CardDescription>How users browse through large datasets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border transition-colors ${
              plan.features.infiniteScroll ? "border-primary/30 bg-primary/5" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm">Infinite Scroll</h4>
                <Switch
                  checked={plan.features.infiniteScroll}
                  onCheckedChange={(c) => updateFeatures({ infiniteScroll: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically load more content as the user scrolls down.
              </p>
            </div>

            <div className={`p-4 rounded-lg border transition-colors ${
              plan.features.pagination ? "border-primary/30 bg-primary/5" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm">Pagination</h4>
                <Switch
                  checked={plan.features.pagination}
                  onCheckedChange={(c) => updateFeatures({ pagination: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Traditional page-based navigation with page numbers.
              </p>
            </div>

            <div className={`p-4 rounded-lg border transition-colors ${
              plan.features.optimisticUpdates ? "border-primary/30 bg-primary/5" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm">Optimistic Updates</h4>
                <Switch
                  checked={plan.features.optimisticUpdates}
                  onCheckedChange={(c) => updateFeatures({ optimisticUpdates: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Update UI immediately before server confirms the change.
              </p>
            </div>
          </div>

          {plan.features.pagination && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                <label className="text-sm text-muted-foreground">Page Size:</label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={plan.features.pageSize}
                  onChange={(e) => updateFeatures({ pageSize: Number(e.target.value) })}
                  className="flex-1 accent-primary max-w-xs"
                />
                <span className="text-sm tabular-nums w-16 text-right">{plan.features.pageSize} items</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Form Submissions
          </CardTitle>
          <CardDescription>Validation library and form handling strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {validationLibraries.map((lib) => {
              const isActive = plan.features.formValidation === lib.id;
              return (
                <button
                  key={lib.id}
                  onClick={() => updateFeatures({ formValidation: lib.id })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm">{lib.name}</h4>
                    {isActive && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{lib.description}</p>
                </button>
              );
            })}
          </div>
          <div className="mt-4 p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Form features included:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">Client-side validation</Badge>
              <Badge variant="secondary" className="text-xs">Server-side validation</Badge>
              <Badge variant="secondary" className="text-xs">Error messages</Badge>
              <Badge variant="secondary" className="text-xs">Success states</Badge>
              <Badge variant="secondary" className="text-xs">Loading states</Badge>
              {plan.features.optimisticUpdates && (
                <Badge className="text-xs">Optimistic updates</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            User Accounts
          </CardTitle>
          <CardDescription>User management and personalization features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border transition-colors ${
              plan.features.userAccounts ? "border-primary/30 bg-primary/5" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <h4 className="text-sm">User Accounts</h4>
                </div>
                <Switch
                  checked={plan.features.userAccounts}
                  onCheckedChange={(c) => updateFeatures({ userAccounts: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Registration, login, and account management.
              </p>
            </div>

            <div className={`p-4 rounded-lg border transition-colors ${
              plan.features.userProfiles ? "border-primary/30 bg-primary/5" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-sm">User Profiles</h4>
                </div>
                <Switch
                  checked={plan.features.userProfiles}
                  onCheckedChange={(c) => updateFeatures({ userProfiles: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Profile pages with avatars, bios, and activity.
              </p>
            </div>

            <div className={`p-4 rounded-lg border transition-colors ${
              plan.features.preferences ? "border-primary/30 bg-primary/5" : "border-border"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <h4 className="text-sm">Preferences</h4>
                </div>
                <Switch
                  checked={plan.features.preferences}
                  onCheckedChange={(c) => updateFeatures({ preferences: c })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Theme, notification, and display settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-600" />
                Search Functionality
              </CardTitle>
              <CardDescription>Search, filter, and sort capabilities</CardDescription>
            </div>
            <Switch
              checked={plan.features.search}
              onCheckedChange={(c) => updateFeatures({ search: c })}
            />
          </div>
        </CardHeader>
        {plan.features.search && (
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm mb-3">Search Strategy</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {searchStrategies.map((s) => {
                  const isActive = plan.features.searchStrategy === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => updateFeatures({ searchStrategy: s.id })}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm">{s.name}</h4>
                        {isActive && (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border transition-colors ${
                plan.features.filters ? "border-primary/30 bg-primary/5" : "border-border"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm">Filters</h4>
                  </div>
                  <Switch
                    checked={plan.features.filters}
                    onCheckedChange={(c) => updateFeatures({ filters: c })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Category, price range, date, and custom attribute filters.
                </p>
              </div>

              <div className={`p-4 rounded-lg border transition-colors ${
                plan.features.sorting ? "border-primary/30 bg-primary/5" : "border-border"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm">Sorting</h4>
                  </div>
                  <Switch
                    checked={plan.features.sorting}
                    onCheckedChange={(c) => updateFeatures({ sorting: c })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Sort by name, price, date, relevance, and popularity.
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Features Summary */}
      <Card className="bg-accent/30">
        <CardContent className="p-5">
          <h4 className="mb-3">Feature Summary</h4>
          <div className="flex flex-wrap gap-2">
            {plan.features.infiniteScroll && <Badge>Infinite Scroll</Badge>}
            {plan.features.pagination && <Badge>Pagination ({plan.features.pageSize}/page)</Badge>}
            {plan.features.optimisticUpdates && <Badge>Optimistic Updates</Badge>}
            {plan.features.formValidation !== "none" && (
              <Badge>Validation: {plan.features.formValidation}</Badge>
            )}
            {plan.features.userAccounts && <Badge>User Accounts</Badge>}
            {plan.features.userProfiles && <Badge>User Profiles</Badge>}
            {plan.features.preferences && <Badge>Preferences</Badge>}
            {plan.features.search && <Badge>Search: {plan.features.searchStrategy}</Badge>}
            {plan.features.filters && <Badge>Filters</Badge>}
            {plan.features.sorting && <Badge>Sorting</Badge>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
