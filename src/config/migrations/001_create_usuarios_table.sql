-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    departamento_id INTEGER REFERENCES departamentos(id),
    puesto_id INTEGER REFERENCES puestos(id),
    rol VARCHAR(50) NOT NULL DEFAULT 'usuario',
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_codigo ON usuarios(codigo);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_departamento ON usuarios(departamento_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_puesto ON usuarios(puesto_id);

-- Comentarios de la tabla
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema';
COMMENT ON COLUMN usuarios.id IS 'Identificador único del usuario';
COMMENT ON COLUMN usuarios.codigo IS 'Código único del usuario';
COMMENT ON COLUMN usuarios.nombre IS 'Nombre del usuario';
COMMENT ON COLUMN usuarios.apellido IS 'Apellido del usuario';
COMMENT ON COLUMN usuarios.email IS 'Correo electrónico del usuario (único)';
COMMENT ON COLUMN usuarios.password IS 'Contraseña encriptada del usuario';
COMMENT ON COLUMN usuarios.departamento_id IS 'ID del departamento al que pertenece el usuario';
COMMENT ON COLUMN usuarios.puesto_id IS 'ID del puesto que ocupa el usuario';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario (admin, supervisor, usuario)';
COMMENT ON COLUMN usuarios.activo IS 'Indica si el usuario está activo';
COMMENT ON COLUMN usuarios.fecha_creacion IS 'Fecha de creación del registro';
COMMENT ON COLUMN usuarios.fecha_actualizacion IS 'Fecha de última actualización';

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (codigo, nombre, apellido, email, password, rol)
VALUES (
    'ADMIN001',
    'Admin',
    'Sistema',
    'admin@example.com',
    '$2b$10$YourHashedPasswordHere', -- Reemplazar con una contraseña hasheada real
    'admin'
) ON CONFLICT (email) DO NOTHING; 