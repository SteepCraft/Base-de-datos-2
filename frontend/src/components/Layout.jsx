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
} from "react-icons/fi";
import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

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
            ? "bg-primary/15 text-foreground ring-1 ring-primary/35"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Icon className="mr-3 size-4 shrink-0" />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <aside className="flex h-full flex-col border-r border-border bg-card/95 backdrop-blur">
          <div className="border-b border-border px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Sanaya Suite
            </p>
            <span className="text-xl font-extrabold text-foreground">Uniremington</span>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {NAVIGATION_GROUPS.map((group) => (
              <section key={group.group} className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => renderNavigationItem(item))}
                </div>
              </section>
            ))}
          </nav>

          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/70 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {user?.nombres} {user?.apellidos}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
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
          </div>
        </aside>
      </div>

      <div className="flex flex-1 flex-col lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="Abrir menu">
                  <FiMenu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-r border-border bg-card/95 p-0">
                <div className="border-b border-border px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Sanaya Suite
                  </p>
                  <span className="text-xl font-extrabold text-foreground">Uniremington</span>
                </div>

                <nav className="h-[calc(100%-152px)] overflow-y-auto px-3 py-3">
                  {NAVIGATION_GROUPS.map((group) => (
                    <section key={group.group} className="mb-5">
                      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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

                <div className="border-t border-border p-4">
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/70 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user?.nombres} {user?.apellidos}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThemeToggle />
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
                </div>
              </SheetContent>
            </Sheet>

            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                Sanaya
              </p>
              <span className="text-base font-bold text-foreground">Uniremington</span>
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
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
