import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AcademicoWorkspace from "./pages/AcademicoWorkspace";
import CurriculoWorkspace from "./pages/CurriculoWorkspace";
import Dashboard from "./pages/Dashboard";
import DataTransfer from "./pages/DataTransfer";
import Login from "./pages/Login";
import SeguimientoWorkspace from "./pages/SeguimientoWorkspace";
import Terceros from "./pages/Terceros";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="personas" element={<Terceros />} />
              <Route path="academico" element={<AcademicoWorkspace />} />
              <Route path="curriculo" element={<CurriculoWorkspace />} />
              <Route path="seguimiento" element={<SeguimientoWorkspace />} />
              <Route path="data-transfer" element={<DataTransfer />} />

              {/* Legacy URLs -> redirects to grouped modules */}
              <Route path="terceros" element={<Navigate to="/personas" replace />} />
              <Route
                path="asignaturas"
                element={<Navigate to="/academico?tab=catalogo" replace />}
              />
              <Route path="programas" element={<Navigate to="/academico?tab=catalogo" replace />} />
              <Route path="cursos" element={<Navigate to="/academico?tab=oferta" replace />} />
              <Route path="pensums" element={<Navigate to="/curriculo?tab=planes" replace />} />
              <Route
                path="detalle-pensums"
                element={<Navigate to="/curriculo?tab=planes" replace />}
              />
              <Route
                path="terc-pensums"
                element={<Navigate to="/curriculo?tab=terc-pensums" replace />}
              />
              <Route
                path="prematriculas"
                element={<Navigate to="/seguimiento?tab=proceso" replace />}
              />
              <Route
                path="historias"
                element={<Navigate to="/seguimiento?tab=proceso" replace />}
              />
              <Route
                path="auditorias"
                element={<Navigate to="/seguimiento?tab=auditorias" replace />}
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
