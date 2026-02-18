import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { Overview } from "./pages/overview";
import { SchemaDesigner } from "./pages/schema-designer";
import { ApiEndpoints } from "./pages/api-endpoints";
import { Authentication } from "./pages/authentication";
import { Realtime } from "./pages/realtime";
import { Caching } from "./pages/caching";
import { ErrorHandling } from "./pages/error-handling";
import { Features } from "./pages/features";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Overview },
      { path: "schema", Component: SchemaDesigner },
      { path: "endpoints", Component: ApiEndpoints },
      { path: "auth", Component: Authentication },
      { path: "realtime", Component: Realtime },
      { path: "caching", Component: Caching },
      { path: "errors", Component: ErrorHandling },
      { path: "features", Component: Features },
    ],
  },
]);
