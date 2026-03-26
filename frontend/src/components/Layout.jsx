import PropTypes from "prop-types";
import { useState } from "react";
import {
  FiHome,
  FiUsers,
  FiBookOpen,
  FiGrid,
  FiLayers,
  FiClipboard,
  FiList,
  FiGitMerge,
  FiCheckSquare,
  FiShield,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: FiHome },
    { name: "Terceros", href: "/terceros", icon: FiUsers },
    { name: "Asignaturas", href: "/asignaturas", icon: FiBookOpen },
    { name: "Programas", href: "/programas", icon: FiGrid },
    { name: "Cursos", href: "/cursos", icon: FiLayers },
    { name: "Pensums", href: "/pensums", icon: FiClipboard },
    { name: "Historias", href: "/historias", icon: FiList },
    { name: "Detalle Pensums", href: "/detalle-pensums", icon: FiGitMerge },
    { name: "Terc Pensums", href: "/terc-pensums", icon: FiCheckSquare },
    { name: "Prematriculas", href: "/prematriculas", icon: FiCheckSquare },
    { name: "Auditorias", href: "/auditorias", icon: FiShield },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Sidebar para móvil */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}
      >
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white transition-transform transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className='flex items-center justify-between h-16 px-4 border-b'>
            <span className='text-xl font-bold text-blue-600'>Tienda IT</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className='p-2 rounded-md hover:bg-gray-100'
            >
              <FiX className='w-6 h-6' />
            </button>
          </div>
          <nav className='flex-1 px-2 py-4 space-y-1'>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className='w-5 h-5 mr-3' />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className='hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col'>
        <div className='flex flex-col flex-grow overflow-y-auto bg-white border-r border-gray-200'>
          <div className='flex items-center flex-shrink-0 h-16 px-4 border-b'>
            <span className='text-xl font-bold text-blue-600'>Tienda IT</span>
          </div>
          <nav className='flex-1 px-2 py-4 space-y-1'>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className='w-5 h-5 mr-3' />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className='flex flex-shrink-0 p-4 border-t border-gray-200'>
            <div className='flex items-center w-full'>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {user?.nombres} {user?.apellidos}
                </p>
                <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className='p-2 ml-3 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100'
                title='Cerrar sesión'
              >
                <FiLogOut className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className='flex flex-col flex-1 lg:pl-64'>
        {/* Header móvil */}
        <div className='sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden'>
          <div className='flex items-center justify-between h-16 px-4'>
            <button
              onClick={() => setSidebarOpen(true)}
              className='p-2 text-gray-400 rounded-md hover:text-gray-600 hover:bg-gray-100'
            >
              <FiMenu className='w-6 h-6' />
            </button>
            <span className='text-lg font-bold text-blue-600'>Tienda IT</span>
            <button
              onClick={logout}
              className='p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100'
            >
              <FiLogOut className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <main className='flex-1'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;
