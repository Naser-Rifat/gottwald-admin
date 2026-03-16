import { NavLink } from "react-router-dom";
import { FolderKanban, Settings } from "lucide-react";



const navItems = [
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "#", label: "Settings", icon: Settings, disabled: true },
];

export default function AdminSidebar() {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-zinc-800">
        <img src="/logo.png" alt="Gottwald Admin" width={32} height={32} className="rounded-full" />
        <span className="text-sm font-bold tracking-wide text-zinc-100 uppercase">
          Gottwald Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.disabled
                  ? "text-zinc-600 cursor-not-allowed pointer-events-none"
                  : isActive
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
