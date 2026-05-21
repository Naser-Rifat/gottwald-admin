import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";

const Login = lazy(() => import("./pages/Login"));
const PillarsList = lazy(() => import("./pages/PillarsList"));
const PillarNew = lazy(() => import("./pages/PillarNew"));
const PillarEdit = lazy(() => import("./pages/PillarEdit"));

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-screen bg-zinc-950">
                  <Loader2 className="w-5 h-5 text-gold animate-spin" />
                </div>
              }
            >
              <Login />
            </Suspense>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<PillarsList />} />
            <Route path="/projects/new" element={<PillarNew />} />
            <Route path="/projects/:id" element={<PillarEdit />} />
          </Route>
        </Route>
      </Routes>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "!bg-zinc-950 !border !border-zinc-800/80 !shadow-2xl !shadow-black/50 !rounded-xl !font-sans",
            title:
              "!font-brand !text-zinc-100 !text-sm !uppercase !tracking-wide",
            description: "!text-zinc-400 !text-xs !mt-0.5",
            success:
              "!border-l-2 !border-l-[#c9a84c] !text-zinc-100",
            error: "!border-l-2 !border-l-red-500 !text-zinc-100",
            info: "!border-l-2 !border-l-zinc-600 !text-zinc-100",
          },
        }}
      />
    </AuthProvider>
  );
}
