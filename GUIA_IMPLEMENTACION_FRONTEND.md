# Guía de Implementación Frontend - Gestor de Licencias

## 1. Configuración Inicial

### 1.1 Requisitos Previos
- Node.js (v14 o superior)
- npm o yarn
- Conocimientos básicos de React
- Conocimientos de TypeScript (opcional pero recomendado)

### 1.2 Crear Proyecto React
```bash
npx create-react-app gestor-licencias-frontend
cd gestor-licencias-frontend
```

### 1.3 Instalar Dependencias Necesarias
```bash
npm install @mui/material @emotion/react @emotion/styled  # Material UI
npm install @mui/icons-material                          # Iconos de Material UI
npm install react-router-dom                             # Enrutamiento
npm install axios                                        # Cliente HTTP
npm install @reduxjs/toolkit react-redux                 # Estado global
npm install formik yup                                   # Manejo de formularios y validaciones
npm install date-fns                                     # Manejo de fechas
npm install recharts                                     # Gráficos para reportes
```

## 2. Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── pages/              # Páginas principales
├── services/           # Servicios API
├── store/              # Estado global (Redux)
├── types/              # Tipos TypeScript
├── utils/              # Utilidades
└── App.tsx            # Componente principal
```

## 3. Configuración de Servicios API

### 3.1 Configuración de Axios
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

### 3.2 Servicios por Módulo

#### Tipos de Licencias
```typescript
// src/services/tiposLicencias.service.ts
import api from './api';

export const tiposLicenciasService = {
  getAll: () => api.get('/tipos-licencias'),
  getById: (id: number) => api.get(`/tipos-licencias/${id}`),
  create: (data: any) => api.post('/tipos-licencias', data),
  update: (id: number, data: any) => api.put(`/tipos-licencias/${id}`, data),
  delete: (id: number) => api.delete(`/tipos-licencias/${id}`),
  getByCodigo: (codigo: string) => api.get(`/tipos-licencias/codigo/${codigo}`),
  getByPersonalOperativo: () => api.get('/tipos-licencias/personal-operativo'),
  getByPersonalAdministrativo: () => api.get('/tipos-licencias/personal-administrativo'),
  getByGoceSalario: () => api.get('/tipos-licencias/goce-salario')
};
```

#### Control Límites
```typescript
// src/services/controlLimites.service.ts
import api from './api';

export const controlLimitesService = {
  getAll: () => api.get('/control-limites'),
  getById: (id: number) => api.get(`/control-limites/${id}`),
  create: (data: any) => api.post('/control-limites', data),
  update: (id: number, data: any) => api.put(`/control-limites/${id}`, data),
  delete: (id: number) => api.delete(`/control-limites/${id}`),
  getByTrabajador: (trabajadorId: number) => api.get(`/control-limites/trabajador/${trabajadorId}`),
  getByTipoLicencia: (tipoLicenciaId: number) => api.get(`/control-limites/tipo-licencia/${tipoLicenciaId}`),
  getByAnio: (anio: number) => api.get(`/control-limites/anio/${anio}`)
};
```

#### Validaciones
```typescript
// src/services/validaciones.service.ts
import api from './api';

export const validacionesService = {
  getAll: () => api.get('/validaciones'),
  getById: (id: number) => api.get(`/validaciones/${id}`),
  create: (data: any) => api.post('/validaciones', data),
  update: (id: number, data: any) => api.put(`/validaciones/${id}`, data),
  delete: (id: number) => api.delete(`/validaciones/${id}`),
  getByTipoLicencia: (tipoLicenciaId: number) => api.get(`/validaciones/tipo-licencia/${tipoLicenciaId}`),
  getByTrabajador: (trabajadorId: number) => api.get(`/validaciones/trabajador/${trabajadorId}`)
};
```

#### Solicitudes
```typescript
// src/services/solicitudes.service.ts
import api from './api';

export const solicitudesService = {
  getAll: () => api.get('/solicitudes'),
  getById: (id: number) => api.get(`/solicitudes/${id}`),
  create: (data: any) => api.post('/solicitudes', data),
  update: (id: number, data: any) => api.put(`/solicitudes/${id}`, data),
  delete: (id: number) => api.delete(`/solicitudes/${id}`),
  getByTrabajador: (trabajadorId: number) => api.get(`/solicitudes/trabajador/${trabajadorId}`),
  getByEstado: (estado: string) => api.get(`/solicitudes/estado/${estado}`),
  getByFecha: (fecha: string) => api.get(`/solicitudes/fecha/${fecha}`),
  getByRangoFechas: (fechaInicio: string, fechaFin: string) => 
    api.get(`/solicitudes/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
};
```

#### Licencias
```typescript
// src/services/licencias.service.ts
import api from './api';

export const licenciasService = {
  getAll: () => api.get('/licencias'),
  getById: (id: number) => api.get(`/licencias/${id}`),
  create: (data: any) => api.post('/licencias', data),
  update: (id: number, data: any) => api.put(`/licencias/${id}`, data),
  delete: (id: number) => api.delete(`/licencias/${id}`),
  getByTrabajador: (trabajadorId: number) => api.get(`/licencias/trabajador/${trabajadorId}`),
  getByTipoLicencia: (tipoLicenciaId: number) => api.get(`/licencias/tipo-licencia/${tipoLicenciaId}`),
  getByEstado: (estado: string) => api.get(`/licencias/estado/${estado}`),
  getByFecha: (fecha: string) => api.get(`/licencias/fecha/${fecha}`),
  getByRangoFechas: (fechaInicio: string, fechaFin: string) => 
    api.get(`/licencias/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
};
```

#### Auditoría
```typescript
// src/services/auditoria.service.ts
import api from './api';

export const auditoriaService = {
  getAll: () => api.get('/auditoria'),
  getById: (id: number) => api.get(`/auditoria/${id}`),
  getByTipoOperacion: (tipoOperacion: string) => api.get(`/auditoria/tipo-operacion/${tipoOperacion}`),
  getByUsuario: (usuarioId: number) => api.get(`/auditoria/usuario/${usuarioId}`),
  getByFecha: (fecha: string) => api.get(`/auditoria/fecha/${fecha}`),
  getByRangoFechas: (fechaInicio: string, fechaFin: string) => 
    api.get(`/auditoria/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
};
```

#### Disponibilidad
```typescript
// src/services/disponibilidad.service.ts
import api from './api';

export const disponibilidadService = {
  getAll: () => api.get('/disponibilidad'),
  getById: (id: number) => api.get(`/disponibilidad/${id}`),
  create: (data: any) => api.post('/disponibilidad', data),
  update: (id: number, data: any) => api.put(`/disponibilidad/${id}`, data),
  delete: (id: number) => api.delete(`/disponibilidad/${id}`),
  getByTrabajador: (trabajadorId: number) => api.get(`/disponibilidad/trabajador/${trabajadorId}`),
  getByFecha: (fecha: string) => api.get(`/disponibilidad/fecha/${fecha}`),
  getByRangoFechas: (fechaInicio: string, fechaFin: string) => 
    api.get(`/disponibilidad/rango-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
  getByDisponibilidad: (disponible: boolean) => api.get(`/disponibilidad/estado/${disponible}`),
  verificarDisponibilidad: (trabajadorId: number, fecha: string) => 
    api.get(`/disponibilidad/verificar?trabajadorId=${trabajadorId}&fecha=${fecha}`)
};
```

#### Reportes
```typescript
// src/services/reportes.service.ts
import api from './api';

export const reportesService = {
  getLicenciasPorPeriodo: (fechaInicio: string, fechaFin: string) => 
    api.get(`/reportes/licencias-periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
  getSolicitudesPorEstado: (fechaInicio: string, fechaFin: string) => 
    api.get(`/reportes/solicitudes-estado?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
  getDisponibilidadPorPeriodo: (fechaInicio: string, fechaFin: string) => 
    api.get(`/reportes/disponibilidad-periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
  getLimitesPorTipoLicencia: (anio: number) => 
    api.get(`/reportes/limites-tipo-licencia?anio=${anio}`)
};
```

## 4. Componentes Principales

### 4.1 Layout Principal
```typescript
// src/components/Layout/MainLayout.tsx
import React from 'react';
import { Box, AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const MainLayout: React.FC = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6">Gestor de Licencias</Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent">
        <List>
          <ListItem button component={Link} to="/tipos-licencias">
            <ListItemIcon><AssignmentIcon /></ListItemIcon>
            <ListItemText primary="Tipos de Licencias" />
          </ListItem>
          {/* Agregar más items del menú */}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
```

### 4.2 Componentes de Formulario
```typescript
// src/components/Forms/TipoLicenciaForm.tsx
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Grid } from '@mui/material';

const TipoLicenciaForm: React.FC = ({ onSubmit, initialValues }) => {
  const formik = useFormik({
    initialValues: initialValues || {
      codigo: '',
      nombre: '',
      descripcion: '',
      dias_maximos: 0,
      personal_operativo: false,
      personal_administrativo: false,
      goce_salario: false
    },
    validationSchema: Yup.object({
      codigo: Yup.string().required('Código es requerido'),
      nombre: Yup.string().required('Nombre es requerido'),
      dias_maximos: Yup.number().required('Días máximos es requerido')
    }),
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="codigo"
            label="Código"
            value={formik.values.codigo}
            onChange={formik.handleChange}
            error={formik.touched.codigo && Boolean(formik.errors.codigo)}
            helperText={formik.touched.codigo && formik.errors.codigo}
          />
        </Grid>
        {/* Agregar más campos */}
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default TipoLicenciaForm;
```

## 5. Páginas Principales

### 5.1 Tipos de Licencias
```typescript
// src/pages/TiposLicencias/TiposLicenciasPage.tsx
import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { tiposLicenciasService } from '../../services/tiposLicencias.service';

const TiposLicenciasPage: React.FC = () => {
  const [tiposLicencias, setTiposLicencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTiposLicencias();
  }, []);

  const loadTiposLicencias = async () => {
    try {
      const response = await tiposLicenciasService.getAll();
      setTiposLicencias(response.data);
    } catch (error) {
      console.error('Error loading tipos de licencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'codigo', headerName: 'Código', width: 130 },
    { field: 'nombre', headerName: 'Nombre', width: 200 },
    { field: 'dias_maximos', headerName: 'Días Máximos', width: 130 },
    // Agregar más columnas
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={tiposLicencias}
        columns={columns}
        pageSize={5}
        loading={loading}
        checkboxSelection
      />
    </div>
  );
};

export default TiposLicenciasPage;
```

## 6. Estado Global (Redux)

### 6.1 Configuración de Redux
```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import tiposLicenciasReducer from './slices/tiposLicenciasSlice';
import solicitudesReducer from './slices/solicitudesSlice';
// Importar más reducers

export const store = configureStore({
  reducer: {
    tiposLicencias: tiposLicenciasReducer,
    solicitudes: solicitudesReducer,
    // Agregar más reducers
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 6.2 Ejemplo de Slice
```typescript
// src/store/slices/tiposLicenciasSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tiposLicenciasService } from '../../services/tiposLicencias.service';

export const fetchTiposLicencias = createAsyncThunk(
  'tiposLicencias/fetchAll',
  async () => {
    const response = await tiposLicenciasService.getAll();
    return response.data;
  }
);

const tiposLicenciasSlice = createSlice({
  name: 'tiposLicencias',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTiposLicencias.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTiposLicencias.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTiposLicencias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default tiposLicenciasSlice.reducer;
```

## 7. Rutas de la Aplicación

```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import TiposLicenciasPage from './pages/TiposLicencias/TiposLicenciasPage';
// Importar más páginas

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/tipos-licencias" element={<TiposLicenciasPage />} />
          {/* Agregar más rutas */}
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;
```

## 8. Prompt para Solicitar el Frontend

```
Necesito desarrollar un frontend en React para un sistema de gestión de licencias con las siguientes características:

1. Tecnologías y Librerías:
   - React con TypeScript
   - Material UI para la interfaz
   - Redux Toolkit para el estado global
   - React Router para la navegación
   - Axios para las llamadas API
   - Formik y Yup para formularios y validaciones
   - Recharts para gráficos en reportes

2. Módulos a Implementar:
   - Tipos de Licencias (CRUD completo)
   - Control de Límites
   - Validaciones
   - Solicitudes
   - Licencias
   - Auditoría
   - Disponibilidad
   - Reportes

3. Características Específicas:
   - Dashboard con resumen de datos
   - Formularios con validación
   - Tablas con paginación y filtros
   - Gráficos para reportes
   - Calendario de disponibilidad
   - Sistema de notificaciones
   - Gestión de permisos por rol

4. Diseño:
   - Interfaz moderna y responsiva
   - Tema claro/oscuro
   - Navegación intuitiva
   - Feedback visual para acciones
   - Mensajes de error claros

5. Integración:
   - Conexión con el backend existente
   - Manejo de tokens JWT (esto no)
   - Interceptores para errores
   - Caché de datos

Por favor, proporciona una implementación completa que cumpla con estos requisitos.
```

## 9. Consideraciones Adicionales

1. **Seguridad**:
   - Implementar autenticación JWT
   - Proteger rutas sensibles
   - Validar datos en el cliente
   - Sanitizar inputs

2. **Performance**:
   - Implementar lazy loading
   - Optimizar re-renders
   - Usar memoización cuando sea necesario
   - Implementar caché de datos

3. **Testing**:
   - Unit tests con Jest
   - Integration tests con React Testing Library
   - E2E tests con Cypress

4. **Documentación**:
   - Documentar componentes
   - Documentar funciones
   - Crear guía de estilo
   - Documentar flujos de trabajo

5. **Mantenimiento**:
   - Seguir principios SOLID
   - Implementar logging
   - Manejar errores globalmente
   - Mantener consistencia en el código 