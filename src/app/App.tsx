import { RouterProvider } from "react-router";
import { router } from "./routes";
import { PlannerProvider } from "./context/planner-context";
import { Toaster } from "sonner";

export default function App() {
  return (
    <PlannerProvider>
      <div className="size-full">
        <RouterProvider router={router} />
        <Toaster position="bottom-right" />
      </div>
    </PlannerProvider>
  );
}