import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Flag,
  Users,
  UserX,
  FileText,
  LogOut,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/reports", label: "Reports", icon: Flag },
  { to: "/users", label: "Users", icon: Users },
  { to: "/banned", label: "Banned Users", icon: UserX },
  { to: "/posts", label: "Posts", icon: FileText },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white font-bold">
            B
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">BMAD Admin</div>
            <div className="text-xs text-slate-500">Moderation Console</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-rose-50 text-rose-700"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 text-sm">
            <div className="font-medium text-slate-900">
              {user?.user_name || "Admin"}
            </div>
            <div className="truncate text-xs text-slate-500">
              {user?.user_email}
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
