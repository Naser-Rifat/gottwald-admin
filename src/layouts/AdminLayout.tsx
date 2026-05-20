import { Suspense, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useAuth } from "../context/useAuth";
import { LogOut, Loader2 } from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {/* Sidebar with Logout */}
      <div className="flex flex-col w-64 shrink-0 bg-zinc-900 border-r border-zinc-800">
        <AdminSidebar />

        {/* User Info + Logout */}
        <div className="px-4 py-4 border-t border-zinc-800 space-y-3">
          {user && (
            <div className="px-2">
              <p className="text-xs font-medium text-zinc-300 truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => setShowLogoutModal(true)}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-colors disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-scroll" style={{ scrollbarGutter: "stable" }}>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={showLogoutModal}
        title="Sign out?"
        description="You'll be returned to the login screen. Any unsaved changes will be lost."
        confirmLabel="Sign out"
        cancelLabel="Stay"
        variant="danger"
        loading={loggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
