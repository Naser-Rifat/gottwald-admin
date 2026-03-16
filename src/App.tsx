import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import ProjectsList from "./pages/ProjectsList";
import ProjectNew from "./pages/ProjectNew";
import ProjectEdit from "./pages/ProjectEdit";


import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public route — no auth needed */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes — must be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/new" element={<ProjectNew />} />
            <Route path="/projects/:slug" element={<ProjectEdit />} />
          </Route>
        </Route>
      </Routes>
      <Toaster theme="dark" position="bottom-right" richColors />
    </AuthProvider>
  );
}
