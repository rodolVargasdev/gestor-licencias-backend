# Documentación Técnica Detallada - Sistema de Gestión de Licencias

## 📚 Índice
1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Backend](#backend)
3. [Frontend](#frontend)
4. [Base de Datos](#base-de-datos)
5. [Seguridad](#seguridad)
6. [Módulos del Sistema](#módulos-del-sistema)
7. [Flujos de Trabajo](#flujos-de-trabajo)
8. [Despliegue](#despliegue)
9. [Mantenimiento](#mantenimiento)

## 🏗️ Arquitectura del Sistema

### Diagrama de Arquitectura
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │     Backend     │     │  Base de Datos  │
│   (React SPA)   │◄───►│  (Node.js API)  │◄───►│   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Componentes Principales
1. **Frontend (Cliente)**
   - Single Page Application (SPA)
   - Arquitectura basada en componentes
   - Gestión de estado centralizada

2. **Backend (Servidor)**
   - API RESTful
   - Arquitectura en capas
   - Microservicios (opcional)

3. **Base de Datos**
   - PostgreSQL
   - Sistema de migraciones
   - Backup y recuperación

## 💻 Backend

### Tecnologías Principales
- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **TypeScript**: Superset de JavaScript
- **TypeORM**: ORM para PostgreSQL
- **JWT**: Autenticación
- **Express Validator**: Validación de datos

### Estructura de Directorios
```
src/
├── config/                 # Configuraciones
│   ├── database.ts        # Configuración de base de datos
│   ├── auth.ts           # Configuración de autenticación
│   └── app.ts            # Configuración de la aplicación
│
├── controllers/           # Controladores
│   ├── auth.controller.ts
│   ├── tipos-licencias.controller.ts
│   ├── trabajadores.controller.ts
│   └── validaciones.controller.ts
│
├── services/             # Lógica de negocio
│   ├── auth.service.ts
│   ├── tipos-licencias.service.ts
│   ├── trabajadores.service.ts
│   └── validaciones.service.ts
│
├── repositories/         # Acceso a datos
│   ├── tipos-licencias.repository.ts
│   ├── trabajadores.repository.ts
│   └── validaciones.repository.ts
│
├── middlewares/         # Middlewares
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
│
├── models/             # Entidades
│   ├── tipo-licencia.entity.ts
│   ├── trabajador.entity.ts
│   └── validacion.entity.ts
│
├── utils/             # Utilidades
│   ├── logger.ts
│   ├── errors.ts
│   └── validators.ts
│
└── app.ts            # Punto de entrada
```

### Patrones de Diseño
1. **Repository Pattern**
   ```typescript
   class TipoLicenciaRepository {
     async findById(id: number): Promise<TipoLicencia> {
       return await this.repository.findOne({ where: { id } });
     }
     
     async create(data: CreateTipoLicenciaDTO): Promise<TipoLicencia> {
       const tipoLicencia = this.repository.create(data);
       return await this.repository.save(tipoLicencia);
     }
   }
   ```

2. **Service Layer Pattern**
   ```typescript
   class TipoLicenciaService {
     constructor(private repository: TipoLicenciaRepository) {}
     
     async createTipoLicencia(data: CreateTipoLicenciaDTO): Promise<TipoLicencia> {
       // Validaciones de negocio
       // Lógica de negocio
       return await this.repository.create(data);
     }
   }
   ```

3. **Controller Pattern**
   ```typescript
   class TipoLicenciaController {
     constructor(private service: TipoLicenciaService) {}
     
     async create(req: Request, res: Response): Promise<void> {
       const tipoLicencia = await this.service.createTipoLicencia(req.body);
       res.status(201).json(tipoLicencia);
     }
   }
   ```

## 🎨 Frontend

### Tecnologías Principales
- **React**: Biblioteca UI
- **TypeScript**: Tipado estático
- **Material-UI**: Componentes UI
- **Redux Toolkit**: Gestión de estado
- **React Router**: Navegación
- **Formik & Yup**: Formularios y validación

### Estructura de Directorios
```
src/
├── components/           # Componentes reutilizables
│   ├── common/          # Componentes comunes
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   │
│   ├── layout/          # Componentes de layout
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   │
│   └── modules/         # Componentes específicos
│       ├── tipos-licencias/
│       ├── trabajadores/
│       └── validaciones/
│
├── pages/              # Páginas
│   ├── auth/
│   ├── tipos-licencias/
│   ├── trabajadores/
│   └── validaciones/
│
├── store/             # Estado Redux
│   ├── slices/
│   │   ├── auth.slice.ts
│   │   ├── tipos-licencias.slice.ts
│   │   └── validaciones.slice.ts
│   │
│   └── index.ts
│
├── services/          # Servicios API
│   ├── api.ts
│   ├── auth.service.ts
│   └── validaciones.service.ts
│
├── hooks/            # Hooks personalizados
│   ├── useAuth.ts
│   └── useForm.ts
│
├── utils/           # Utilidades
│   ├── formatters.ts
│   └── validators.ts
│
└── types/          # Tipos TypeScript
    ├── auth.types.ts
    └── validacion.types.ts
```

### Patrones de Diseño
1. **Container/Presenter Pattern**
   ```typescript
   // Container
   const ValidacionesContainer: React.FC = () => {
     const validaciones = useAppSelector(state => state.validaciones.items);
     const dispatch = useAppDispatch();
     
     return <ValidacionesPresenter validaciones={validaciones} />;
   };
   
   // Presenter
   const ValidacionesPresenter: React.FC<ValidacionesPresenterProps> = ({ validaciones }) => {
     return (
       <Table>
         {validaciones.map(validacion => (
           <TableRow key={validacion.id}>
             {/* ... */}
           </TableRow>
         ))}
       </Table>
     );
   };
   ```

2. **Custom Hooks Pattern**
   ```typescript
   const useValidaciones = () => {
     const dispatch = useAppDispatch();
     const validaciones = useAppSelector(state => state.validaciones.items);
     
     const fetchValidaciones = useCallback(() => {
       dispatch(fetchValidaciones());
     }, [dispatch]);
     
     return { validaciones, fetchValidaciones };
   };
   ```

## 🗄️ Base de Datos

### Esquema de Base de Datos
```sql
-- Tipos de Licencias
CREATE TABLE tipos_licencias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  dias_maximos INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trabajadores
CREATE TABLE trabajadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  documento VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Validaciones
CREATE TABLE validaciones (
  id SERIAL PRIMARY KEY,
  tipo_licencia_id INTEGER REFERENCES tipos_licencias(id),
  trabajador_id INTEGER REFERENCES trabajadores(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20) NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices y Restricciones
```sql
-- Índices
CREATE INDEX idx_validaciones_tipo_licencia ON validaciones(tipo_licencia_id);
CREATE INDEX idx_validaciones_trabajador ON validaciones(trabajador_id);
CREATE INDEX idx_validaciones_estado ON validaciones(estado);

-- Restricciones
ALTER TABLE validaciones
  ADD CONSTRAINT check_estado_valido
  CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA'));

ALTER TABLE validaciones
  ADD CONSTRAINT check_fechas_validas
  CHECK (fecha_fin > fecha_inicio);
```

## 🔒 Seguridad

### Autenticación
```typescript
// Middleware de autenticación
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Token no proporcionado');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Token inválido'));
  }
};
```

### Autorización
```typescript
// Middleware de autorización
const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('No tiene permisos para esta acción');
    }
    next();
  };
};
```

## 🔄 Flujos de Trabajo

### Proceso de Validación de Licencias
1. **Solicitud de Licencia**
   ```typescript
   // Frontend
   const handleSolicitud = async (data: CreateValidacionDTO) => {
     try {
       await dispatch(createValidacion(data)).unwrap();
       showSuccess('Solicitud creada correctamente');
     } catch (error) {
       showError('Error al crear la solicitud');
     }
   };
   ```

2. **Validación de Límites**
   ```typescript
   // Backend
   const validarLimites = async (trabajadorId: number, tipoLicenciaId: number) => {
     const diasUsados = await calcularDiasUsados(trabajadorId, tipoLicenciaId);
     const diasDisponibles = await obtenerDiasDisponibles(tipoLicenciaId);
     
     if (diasUsados >= diasDisponibles) {
       throw new Error('Límite de días excedido');
     }
   };
   ```

3. **Aprobación/Rechazo**
   ```typescript
   // Backend
   const procesarValidacion = async (id: number, estado: string, observaciones?: string) => {
     const validacion = await validacionesService.findById(id);
     if (!validacion) {
       throw new Error('Validación no encontrada');
     }
     
     await validacionesService.update(id, { estado, observaciones });
     await notificarTrabajador(validacion.trabajadorId, estado);
   };
   ```

## 🚀 Despliegue

### Backend
```bash
# Construir la aplicación
npm run build

# Configurar variables de entorno
cp .env.example .env.production

# Iniciar en producción
npm start
```

### Frontend
```bash
# Construir la aplicación
npm run build

# Servir archivos estáticos
npm run preview
```

### Docker
```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Mantenimiento

### Monitoreo
- Logs de aplicación
- Métricas de rendimiento
- Alertas automáticas

### Backup
```bash
# Script de backup
pg_dump -U usuario -d gestor_licencias > backup_$(date +%Y%m%d).sql
```

### Actualizaciones
1. Actualizar dependencias
2. Ejecutar migraciones
3. Probar cambios
4. Desplegar en producción

## 📊 Métricas y Monitoreo

### Métricas Clave
- Tiempo de respuesta API
- Uso de CPU/Memoria
- Errores por endpoint
- Tasa de éxito de validaciones

### Logs
```typescript
// Configuración de logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔍 Pruebas

### Backend
```typescript
// Prueba de integración
describe('Validaciones API', () => {
  it('should create a new validation', async () => {
    const response = await request(app)
      .post('/api/validaciones')
      .send({
        tipoLicenciaId: 1,
        trabajadorId: 1,
        fechaInicio: '2024-03-01',
        fechaFin: '2024-03-05'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### Frontend
```typescript
// Prueba de componente
describe('ValidacionesTable', () => {
  it('should render validations correctly', () => {
    const validaciones = [
      {
        id: 1,
        tipoLicencia: { nombre: 'Vacaciones' },
        trabajador: { nombre: 'Juan', apellido: 'Pérez' },
        fechaInicio: '2024-03-01',
        fechaFin: '2024-03-05',
        estado: 'PENDIENTE'
      }
    ];
    
    render(<ValidacionesTable validaciones={validaciones} />);
    expect(screen.getByText('Vacaciones')).toBeInTheDocument();
  });
});
``` 