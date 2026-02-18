import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────
export interface Field {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  isUnique: boolean;
  defaultValue: string;
  reference?: string; // "tableName.fieldName"
}

export interface DataModel {
  id: string;
  name: string;
  description: string;
  fields: Field[];
}

export interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  rateLimit: string;
  requestBody?: string;
  responseExample?: string;
}

export interface AuthConfig {
  strategy: "jwt" | "oauth" | "apikey" | "session" | "none";
  providers: string[];
  tokenExpiry: string;
  refreshTokens: boolean;
  mfa: boolean;
  rbac: boolean;
  roles: string[];
}

export interface RealtimeConfig {
  enabled: boolean;
  strategy: "websocket" | "sse" | "polling" | "none";
  pollingInterval: number;
  channels: string[];
  reconnectStrategy: "exponential" | "linear" | "none";
  maxRetries: number;
}

export interface CacheConfig {
  cdn: boolean;
  cdnProvider: string;
  localStorage: boolean;
  sessionStorage: boolean;
  serviceWorker: boolean;
  staleWhileRevalidate: boolean;
  ttl: number;
  invalidationStrategy: "time-based" | "event-based" | "manual";
  cachedEndpoints: string[];
}

export interface ErrorConfig {
  retryCount: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  offlineMode: boolean;
  offlineStorage: "indexeddb" | "localstorage" | "none";
  fallbackUI: boolean;
  errorBoundaries: boolean;
  logging: "console" | "sentry" | "custom" | "none";
  gracefulDegradation: boolean;
}

export interface FeatureConfig {
  infiniteScroll: boolean;
  pagination: boolean;
  pageSize: number;
  formValidation: "zod" | "yup" | "joi" | "custom" | "none";
  optimisticUpdates: boolean;
  userAccounts: boolean;
  userProfiles: boolean;
  preferences: boolean;
  search: boolean;
  searchStrategy: "client" | "server" | "elasticsearch" | "algolia";
  filters: boolean;
  sorting: boolean;
}

export interface ProjectConfig {
  name: string;
  websiteType: string;
  dataSource: string;
  description: string;
}

export interface IntegrationPlan {
  project: ProjectConfig;
  models: DataModel[];
  endpoints: Endpoint[];
  auth: AuthConfig;
  realtime: RealtimeConfig;
  cache: CacheConfig;
  errors: ErrorConfig;
  features: FeatureConfig;
}

// ─── Defaults ──────────────────────────────────────────────
const defaultPlan: IntegrationPlan = {
  project: {
    name: "My SaaS Platform",
    websiteType: "E-Commerce Platform",
    dataSource: "Supabase (PostgreSQL)",
    description: "A full-stack e-commerce platform with user accounts, product catalog, and real-time inventory tracking.",
  },
  models: [
    {
      id: "m1",
      name: "users",
      description: "User accounts and authentication",
      fields: [
        { id: "f1", name: "id", type: "uuid", nullable: false, isPrimary: true, isUnique: true, defaultValue: "gen_random_uuid()" },
        { id: "f2", name: "email", type: "text", nullable: false, isPrimary: false, isUnique: true, defaultValue: "" },
        { id: "f3", name: "full_name", type: "text", nullable: true, isPrimary: false, isUnique: false, defaultValue: "" },
        { id: "f4", name: "avatar_url", type: "text", nullable: true, isPrimary: false, isUnique: false, defaultValue: "" },
        { id: "f5", name: "role", type: "text", nullable: false, isPrimary: false, isUnique: false, defaultValue: "'customer'" },
        { id: "f6", name: "created_at", type: "timestamptz", nullable: false, isPrimary: false, isUnique: false, defaultValue: "now()" },
      ],
    },
    {
      id: "m2",
      name: "products",
      description: "Product catalog with pricing and inventory",
      fields: [
        { id: "f7", name: "id", type: "uuid", nullable: false, isPrimary: true, isUnique: true, defaultValue: "gen_random_uuid()" },
        { id: "f8", name: "name", type: "text", nullable: false, isPrimary: false, isUnique: false, defaultValue: "" },
        { id: "f9", name: "description", type: "text", nullable: true, isPrimary: false, isUnique: false, defaultValue: "" },
        { id: "f10", name: "price", type: "numeric", nullable: false, isPrimary: false, isUnique: false, defaultValue: "0" },
        { id: "f11", name: "stock_count", type: "integer", nullable: false, isPrimary: false, isUnique: false, defaultValue: "0" },
        { id: "f12", name: "category_id", type: "uuid", nullable: true, isPrimary: false, isUnique: false, defaultValue: "", reference: "categories.id" },
        { id: "f13", name: "created_at", type: "timestamptz", nullable: false, isPrimary: false, isUnique: false, defaultValue: "now()" },
      ],
    },
    {
      id: "m3",
      name: "orders",
      description: "Customer orders and transactions",
      fields: [
        { id: "f14", name: "id", type: "uuid", nullable: false, isPrimary: true, isUnique: true, defaultValue: "gen_random_uuid()" },
        { id: "f15", name: "user_id", type: "uuid", nullable: false, isPrimary: false, isUnique: false, defaultValue: "", reference: "users.id" },
        { id: "f16", name: "status", type: "text", nullable: false, isPrimary: false, isUnique: false, defaultValue: "'pending'" },
        { id: "f17", name: "total", type: "numeric", nullable: false, isPrimary: false, isUnique: false, defaultValue: "0" },
        { id: "f18", name: "created_at", type: "timestamptz", nullable: false, isPrimary: false, isUnique: false, defaultValue: "now()" },
      ],
    },
    {
      id: "m4",
      name: "categories",
      description: "Product categories for organization",
      fields: [
        { id: "f19", name: "id", type: "uuid", nullable: false, isPrimary: true, isUnique: true, defaultValue: "gen_random_uuid()" },
        { id: "f20", name: "name", type: "text", nullable: false, isPrimary: false, isUnique: true, defaultValue: "" },
        { id: "f21", name: "slug", type: "text", nullable: false, isPrimary: false, isUnique: true, defaultValue: "" },
        { id: "f22", name: "parent_id", type: "uuid", nullable: true, isPrimary: false, isUnique: false, defaultValue: "", reference: "categories.id" },
      ],
    },
  ],
  endpoints: [
    { id: "e1", method: "GET", path: "/api/products", description: "List all products with pagination & filters", auth: false, rateLimit: "100/min" },
    { id: "e2", method: "GET", path: "/api/products/:id", description: "Get single product details", auth: false, rateLimit: "200/min" },
    { id: "e3", method: "POST", path: "/api/products", description: "Create a new product (admin only)", auth: true, rateLimit: "30/min" },
    { id: "e4", method: "PUT", path: "/api/products/:id", description: "Update product details", auth: true, rateLimit: "30/min" },
    { id: "e5", method: "DELETE", path: "/api/products/:id", description: "Delete a product (admin only)", auth: true, rateLimit: "10/min" },
    { id: "e6", method: "POST", path: "/api/auth/signup", description: "Register new user account", auth: false, rateLimit: "5/min" },
    { id: "e7", method: "POST", path: "/api/auth/login", description: "Authenticate user and return JWT", auth: false, rateLimit: "10/min" },
    { id: "e8", method: "GET", path: "/api/orders", description: "List user's orders", auth: true, rateLimit: "50/min" },
    { id: "e9", method: "POST", path: "/api/orders", description: "Create a new order", auth: true, rateLimit: "20/min" },
    { id: "e10", method: "GET", path: "/api/categories", description: "List all product categories", auth: false, rateLimit: "100/min" },
  ],
  auth: {
    strategy: "jwt",
    providers: ["email", "google", "github"],
    tokenExpiry: "1h",
    refreshTokens: true,
    mfa: false,
    rbac: true,
    roles: ["admin", "customer", "manager"],
  },
  realtime: {
    enabled: true,
    strategy: "websocket",
    pollingInterval: 5000,
    channels: ["inventory-updates", "order-status", "notifications"],
    reconnectStrategy: "exponential",
    maxRetries: 5,
  },
  cache: {
    cdn: true,
    cdnProvider: "Cloudflare",
    localStorage: true,
    sessionStorage: false,
    serviceWorker: true,
    staleWhileRevalidate: true,
    ttl: 300,
    invalidationStrategy: "event-based",
    cachedEndpoints: ["/api/products", "/api/categories"],
  },
  errors: {
    retryCount: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    offlineMode: true,
    offlineStorage: "indexeddb",
    fallbackUI: true,
    errorBoundaries: true,
    logging: "sentry",
    gracefulDegradation: true,
  },
  features: {
    infiniteScroll: true,
    pagination: true,
    pageSize: 20,
    formValidation: "zod",
    optimisticUpdates: true,
    userAccounts: true,
    userProfiles: true,
    preferences: true,
    search: true,
    searchStrategy: "server",
    filters: true,
    sorting: true,
  },
};

// ─── Context ──────────────────────────────────────────────
interface PlannerContextType {
  plan: IntegrationPlan;
  updateProject: (project: Partial<ProjectConfig>) => void;
  addModel: (model: DataModel) => void;
  updateModel: (id: string, model: Partial<DataModel>) => void;
  removeModel: (id: string) => void;
  addFieldToModel: (modelId: string, field: Field) => void;
  removeFieldFromModel: (modelId: string, fieldId: string) => void;
  addEndpoint: (endpoint: Endpoint) => void;
  updateEndpoint: (id: string, endpoint: Partial<Endpoint>) => void;
  removeEndpoint: (id: string) => void;
  updateAuth: (auth: Partial<AuthConfig>) => void;
  updateRealtime: (rt: Partial<RealtimeConfig>) => void;
  updateCache: (cache: Partial<CacheConfig>) => void;
  updateErrors: (errors: Partial<ErrorConfig>) => void;
  updateFeatures: (features: Partial<FeatureConfig>) => void;
  completionPercentage: number;
}

const PlannerContext = createContext<PlannerContextType | null>(null);

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<IntegrationPlan>(defaultPlan);

  const updateProject = useCallback((project: Partial<ProjectConfig>) => {
    setPlan((p) => ({ ...p, project: { ...p.project, ...project } }));
  }, []);

  const addModel = useCallback((model: DataModel) => {
    setPlan((p) => ({ ...p, models: [...p.models, model] }));
  }, []);

  const updateModel = useCallback((id: string, model: Partial<DataModel>) => {
    setPlan((p) => ({
      ...p,
      models: p.models.map((m) => (m.id === id ? { ...m, ...model } : m)),
    }));
  }, []);

  const removeModel = useCallback((id: string) => {
    setPlan((p) => ({ ...p, models: p.models.filter((m) => m.id !== id) }));
  }, []);

  const addFieldToModel = useCallback((modelId: string, field: Field) => {
    setPlan((p) => ({
      ...p,
      models: p.models.map((m) =>
        m.id === modelId ? { ...m, fields: [...m.fields, field] } : m
      ),
    }));
  }, []);

  const removeFieldFromModel = useCallback((modelId: string, fieldId: string) => {
    setPlan((p) => ({
      ...p,
      models: p.models.map((m) =>
        m.id === modelId
          ? { ...m, fields: m.fields.filter((f) => f.id !== fieldId) }
          : m
      ),
    }));
  }, []);

  const addEndpoint = useCallback((endpoint: Endpoint) => {
    setPlan((p) => ({ ...p, endpoints: [...p.endpoints, endpoint] }));
  }, []);

  const updateEndpoint = useCallback((id: string, endpoint: Partial<Endpoint>) => {
    setPlan((p) => ({
      ...p,
      endpoints: p.endpoints.map((e) => (e.id === id ? { ...e, ...endpoint } : e)),
    }));
  }, []);

  const removeEndpoint = useCallback((id: string) => {
    setPlan((p) => ({ ...p, endpoints: p.endpoints.filter((e) => e.id !== id) }));
  }, []);

  const updateAuth = useCallback((auth: Partial<AuthConfig>) => {
    setPlan((p) => ({ ...p, auth: { ...p.auth, ...auth } }));
  }, []);

  const updateRealtime = useCallback((rt: Partial<RealtimeConfig>) => {
    setPlan((p) => ({ ...p, realtime: { ...p.realtime, ...rt } }));
  }, []);

  const updateCache = useCallback((cache: Partial<CacheConfig>) => {
    setPlan((p) => ({ ...p, cache: { ...p.cache, ...cache } }));
  }, []);

  const updateErrors = useCallback((errors: Partial<ErrorConfig>) => {
    setPlan((p) => ({ ...p, errors: { ...p.errors, ...errors } }));
  }, []);

  const updateFeatures = useCallback((features: Partial<FeatureConfig>) => {
    setPlan((p) => ({ ...p, features: { ...p.features, ...features } }));
  }, []);

  // Compute completion
  const completionPercentage = React.useMemo(() => {
    let score = 0;
    const total = 8;
    if (plan.project.name && plan.project.websiteType) score++;
    if (plan.models.length > 0) score++;
    if (plan.endpoints.length > 0) score++;
    if (plan.auth.strategy !== "none") score++;
    if (plan.realtime.enabled) score++;
    if (plan.cache.cdn || plan.cache.localStorage || plan.cache.serviceWorker) score++;
    if (plan.errors.retryCount > 0 || plan.errors.offlineMode) score++;
    if (plan.features.search || plan.features.userAccounts || plan.features.pagination) score++;
    return Math.round((score / total) * 100);
  }, [plan]);

  return (
    <PlannerContext.Provider
      value={{
        plan,
        updateProject,
        addModel,
        updateModel,
        removeModel,
        addFieldToModel,
        removeFieldFromModel,
        addEndpoint,
        updateEndpoint,
        removeEndpoint,
        updateAuth,
        updateRealtime,
        updateCache,
        updateErrors,
        updateFeatures,
        completionPercentage,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}
