import { NavLink } from "react-router-dom";
import { FolderKanban } from "lucide-react";

const navItems = [
  { to: "/projects", label: "Pillars", icon: FolderKanban },
];

export default function AdminSidebar() {
  return (
    <>
      {/* Brand — masthead */}
      <div className="flex flex-col items-center px-6 py-8 border-b border-zinc-800/60">
        <img
          src="/logo.png"
          alt="GOTT WALD Holding LLC"
          width={56}
          height={56}
          className="rounded-full ring-1 ring-gold/40 shadow-lg shadow-black/40"
        />
        <span className="mt-4 font-brand text-base text-gold uppercase tracking-[0.2em]">
          Gott Wald
        </span>
        <span className="mt-1 text-[9px] text-zinc-600 uppercase tracking-[0.25em]">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-sm font-medium transition-all overflow-hidden ${
                isActive
                  ? "bg-zinc-900 text-gold"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r transition-all ${
                    isActive ? "bg-gold" : "bg-transparent group-hover:bg-zinc-700"
                  }`}
                />
                <item.icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-gold" : ""
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-zinc-800/80">
        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
          GOTT WALD Holding LLC
        </p>
      </div>
    </>
  );
}
