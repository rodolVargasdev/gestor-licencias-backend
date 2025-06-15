import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TiposLicenciasPage from './pages/TiposLicencias/TiposLicenciasPage';
import CreateTipoLicenciaPage from './pages/TiposLicencias/CreateTipoLicenciaPage';
import EditTipoLicenciaPage from './pages/TiposLicencias/EditTipoLicenciaPage';
import TrabajadoresPage from './pages/Trabajadores/TrabajadoresPage';
import CreateTrabajadorPage from './pages/Trabajadores/CreateTrabajadorPage';
import EditTrabajadorPage from './pages/Trabajadores/EditTrabajadorPage';
import DepartamentosPage from './pages/Departamentos/DepartamentosPage';
import CreateDepartamentoPage from './pages/Departamentos/CreateDepartamentoPage';
import EditDepartamentoPage from './pages/Departamentos/EditDepartamentoPage';
import PuestosPage from './pages/Puestos/PuestosPage';
import CreatePuestoPage from './pages/Puestos/CreatePuestoPage';
import EditPuestoPage from './pages/Puestos/EditPuestoPage';
import ReportesIndex from './pages/Reportes';
import ReporteDepartamentoPage from './pages/Reportes/ReporteDepartamentoPage';
import ReporteTrabajadorPage from './pages/Reportes/ReporteTrabajadorPage';
import ReporteTipoLicenciaPage from './pages/Reportes/ReporteTipoLicenciaPage';
import ReporteTendenciasPage from './pages/Reportes/ReporteTendenciasPage';
import LicenciasPage from './pages/Licencias/LicenciasPage';
import CreateLicenciaPage from './pages/Licencias/CreateLicenciaPage';
import EditLicenciaPage from './pages/Licencias/EditLicenciaPage';
import LicenciaDetailsPage from './pages/Licencias/LicenciaDetailsPage';
import DisponibilidadPage from "./pages/Disponibilidad/DisponibilidadPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Rutas de Tipos de Licencias */}
            <Route path="/tipos-licencias" element={<TiposLicenciasPage />} />
            <Route path="/tipos-licencias/nuevo" element={<CreateTipoLicenciaPage />} />
            <Route path="/tipos-licencias/editar/:id" element={<EditTipoLicenciaPage />} />
            
            {/* Rutas de Trabajadores */}
            <Route path="/trabajadores" element={<TrabajadoresPage />} />
            <Route path="/trabajadores/nuevo" element={<CreateTrabajadorPage />} />
            <Route path="/trabajadores/editar/:id" element={<EditTrabajadorPage />} />
            
            {/* Rutas de Validaciones */}
            {/* Rutas deshabilitadas por simplificación del flujo */}
            {/* <Route path="/validaciones" element={<ValidacionesPage />} /> */}
            {/* <Route path="/validaciones/nueva" element={<CreateValidacionPage />} /> */}
            {/* <Route path="/validaciones/editar/:id" element={<EditValidacionPage />} /> */}
            
            {/* Rutas de Departamentos */}
            <Route path="/departamentos" element={<DepartamentosPage />} />
            <Route path="/departamentos/nuevo" element={<CreateDepartamentoPage />} />
            <Route path="/departamentos/editar/:id" element={<EditDepartamentoPage />} />
            
            {/* Rutas de Puestos */}
            <Route path="/puestos" element={<PuestosPage />} />
            <Route path="/puestos/nuevo" element={<CreatePuestoPage />} />
            <Route path="/puestos/editar/:id" element={<EditPuestoPage />} />
            
            {/* Rutas de Reportes */}
            <Route path="/reportes" element={<ReportesIndex />} />
            <Route path="/reportes/departamento" element={<ReporteDepartamentoPage />} />
            <Route path="/reportes/trabajador" element={<ReporteTrabajadorPage />} />
            <Route path="/reportes/tipo-licencia" element={<ReporteTipoLicenciaPage />} />
            <Route path="/reportes/tendencias" element={<ReporteTendenciasPage />} />

            {/* Rutas de Licencias */}
            <Route path="/licencias" element={<LicenciasPage />} />
            <Route path="/licencias/nueva" element={<CreateLicenciaPage />} />
            <Route path="/licencias/:id" element={<LicenciaDetailsPage />} />
            <Route path="/licencias/:id/editar" element={<EditLicenciaPage />} />

            {/* Rutas de Disponibilidad */}
            <Route path="/disponibilidad" element={<DisponibilidadPage />} />

            {/* Rutas de Solicitudes */}
            {/* Rutas deshabilitadas por simplificación del flujo */}
            {/* <Route path="/solicitudes" element={<SolicitudesPage />} /> */}
            {/* <Route path="/solicitudes/crear" element={<CreateSolicitudPage />} /> */}
            {/* <Route path="/solicitudes/editar/:id" element={<EditSolicitudPage />} /> */}
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
