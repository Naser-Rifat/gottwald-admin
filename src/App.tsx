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
                  <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
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
      <Toaster theme="dark" position="bottom-right" richColors />
    </AuthProvider>
  );
}
