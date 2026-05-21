import { Suspense, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useAuth } from "../context/useAuth";
import { LogOut, Loader2 } from "lucide-react";

function getInitial(name?: string, email?: string): string {
  const source = (name || email || "").trim();
  return source.charAt(0).toUpperCase() || "·";
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    <div className="flex h-screen overflow-hidden bg-zinc-950 bg-grain">
      {/* Sidebar with Logout */}
      <div
        className="flex flex-col w-64 shrink-0 border-r border-zinc-800/60"
        style={{
          background:
            "linear-gradient(180deg, rgb(24 24 27) 0%, rgb(9 9 11) 100%)",
        }}
      >
        <AdminSidebar />

        {/* User Info + Logout */}
        <div className="px-4 py-4 border-t border-zinc-800/60 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-1.5">
              <div className="shrink-0 w-9 h-9 rounded-full bg-zinc-900 ring-1 ring-gold/30 flex items-center justify-center">
                <span className="font-brand text-gold text-sm">
                  {getInitial(user.name, user.email)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-200 truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowLogoutModal(true)}
            disabled={loggingOut}
            className="group w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-zinc-800/80 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 hover:text-red-300 hover:border-red-900/50 hover:bg-red-950/20 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            )}
            End Session
          </button>
        </div>
      </div>

      {/* Main Content — gold hairline edge on left */}
      <main
        className="relative flex-1 overflow-y-scroll"
        style={{ scrollbarGutter: "stable" }}
      >
        {/* Hairline gold edge — book-binding accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.18) 30%, rgba(201,168,76,0.18) 70%, transparent 100%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-8 py-10">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-5 h-5 text-gold animate-spin" />
              </div>
            }
          >
            {/* Re-trigger fade on every route change */}
            <div key={location.pathname} className="page-fade-in">
              <Outlet />
            </div>
          </Suspense>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={showLogoutModal}
        title="End session?"
        description="You'll be returned to the sign-in screen. Any unsaved changes will be lost."
        confirmLabel="End session"
        cancelLabel="Stay"
        variant="danger"
        loading={loggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
