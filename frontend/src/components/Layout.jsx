import { useState } from "react";
import {
  FiArchive,
  FiFileText,
  FiHome,
  FiLogOut,
  FiMap,
  FiMenu,
  FiTool,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

const NAVIGATION_GROUPS = [
  {
    group: "General",
    items: [{ name: "Dashboard", href: "/", icon: FiHome }],
  },
  {
    group: "Operacion Academica",
    items: [
      { name: "Personas", href: "/personas", icon: FiUsers },
      { name: "Gestion Academica", href: "/academico", icon: FiMap },
      { name: "Estructura Curricular", href: "/curriculo", icon: FiArchive },
      { name: "Seguimiento", href: "/seguimiento", icon: FiFileText },
    ],
  },
  {
    group: "Herramientas",
    items: [{ name: "Importar / Exportar", href: "/data-transfer", icon: FiTool }],
  },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const filteredGroups = NAVIGATION_GROUPS;

  const renderNavigationItem = (item, onClick) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          isActive(item.href)
            ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
            : "text-slate-700 hover:bg-slate-100",
        )}
      >
        <Icon className="mr-3 size-4 shrink-0" />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}>
        <div
          className={`fixed inset-0 bg-slate-900/60 transition-opacity ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setSidebarOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Cerrar menu"
        />

        <aside
          className={`fixed inset-y-0 left-0 flex w-72 transform flex-col border-r border-slate-200 bg-white/95 shadow-xl transition-transform backdrop-blur ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  Sanaya Suite
                </p>
                <span className="text-xl font-extrabold text-slate-900">Uniremington</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                aria-label="Cerrar menu lateral"
              >
                <FiX className="size-5" />
              </Button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {filteredGroups.map((group) => (
              <section key={group.group} className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) =>
                    renderNavigationItem(item, () => setSidebarOpen(false)),
                  )}
                </div>
              </section>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-100 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.nombres} {user?.apellidos}
                </p>
                <p className="truncate text-xs text-slate-600">{user?.email}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Cerrar sesion"
                aria-label="Cerrar sesion"
              >
                <FiLogOut className="size-4" />
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <aside className="flex h-full flex-col border-r border-slate-200 bg-white/95 backdrop-blur">
          <div className="border-b border-slate-200 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
              Sanaya Suite
            </p>
            <span className="text-xl font-extrabold text-slate-900">Uniremington</span>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {filteredGroups.map((group) => (
              <section key={group.group} className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => renderNavigationItem(item))}
                </div>
              </section>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-100 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.nombres} {user?.apellidos}
                </p>
                <p className="truncate text-xs text-slate-600">{user?.email}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Cerrar sesion"
                aria-label="Cerrar sesion"
              >
                <FiLogOut className="size-4" />
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-1 flex-col lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <FiMenu className="size-5" />
            </Button>

            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                Sanaya
              </p>
              <span className="text-base font-bold text-slate-900">Uniremington</span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Cerrar sesion"
            >
              <FiLogOut className="size-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
