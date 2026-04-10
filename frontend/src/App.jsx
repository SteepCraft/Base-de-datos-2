import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Asignaturas from "./pages/Asignaturas";
import Auditorias from "./pages/Auditorias";
import Cursos from "./pages/Cursos";
import Dashboard from "./pages/Dashboard";
import DataTransfer from "./pages/DataTransfer";
import DetallePensums from "./pages/DetallePensums";
import Historias from "./pages/Historias";
import Login from "./pages/Login";
import Pensums from "./pages/Pensums";
import Prematriculas from "./pages/Prematriculas";
import Programas from "./pages/Programas";
import Terceros from "./pages/Terceros";
import TercPensums from "./pages/TercPensums";

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
            <Route path='/login' element={<Login />} />
            <Route
              path='/'
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path='data-transfer' element={<DataTransfer />} />
              <Route path='terceros' element={<Terceros />} />
              <Route path='asignaturas' element={<Asignaturas />} />
              <Route path='programas' element={<Programas />} />
              <Route path='cursos' element={<Cursos />} />
              <Route path='pensums' element={<Pensums />} />
              <Route path='historias' element={<Historias />} />
              <Route path='detalle-pensums' element={<DetallePensums />} />
              <Route path='terc-pensums' element={<TercPensums />} />
              <Route path='prematriculas' element={<Prematriculas />} />
              <Route path='auditorias' element={<Auditorias />} />
            </Route>
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
