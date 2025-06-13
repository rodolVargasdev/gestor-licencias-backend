-- Crear tabla de solicitudes de licencias
CREATE TABLE IF NOT EXISTS solicitudes_licencias (
    id INTEGER PRIMARY KEY,
    trabajador_id INTEGER NOT NULL,
    tipo_licencia_id INTEGER NOT NULL,
    fecha_hora_solicitud TIMESTAMP NOT NULL,
    fecha_hora_inicio_permiso TIMESTAMP NOT NULL,
    fecha_hora_fin_permiso TIMESTAMP NOT NULL,
    fecha_evento DATE,
    fecha_suceso TIMESTAMP,
    fecha_aprobacion TIMESTAMP,
    fecha_hora_decision TIMESTAMP,
    documentos_adicionales JSONB,
    motivo VARCHAR(255),
    observaciones TEXT,
    relacion_parentesco VARCHAR(50),
    nombre_paciente VARCHAR(100),
    tipo_olvido VARCHAR(50),
    archivo_soporte VARCHAR(255),
    estado VARCHAR(20) CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA')) NOT NULL DEFAULT 'PENDIENTE',
    motivo_rechazo TEXT,
    comentario_aprobacion VARCHAR(255),
    aprobado_por VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id),
    FOREIGN KEY (tipo_licencia_id) REFERENCES tipos_licencias(id)
);

-- Crear tabla de control de límites
CREATE TABLE IF NOT EXISTS control_limites (
    id INTEGER PRIMARY KEY,
    trabajador_id INTEGER NOT NULL,
    tipo_licencia_id INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    dias_utilizados INTEGER DEFAULT 0,
    horas_utilizadas INTEGER DEFAULT 0,
    cantidad_utilizada INTEGER DEFAULT 0,
    FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id),
    FOREIGN KEY (tipo_licencia_id) REFERENCES tipos_licencias(id),
    UNIQUE (trabajador_id, tipo_licencia_id, anio, mes)
);

-- Crear tabla de auditoría de solicitudes
CREATE TABLE IF NOT EXISTS auditoria_solicitudes (
    id INTEGER PRIMARY KEY,
    solicitud_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    fecha_hora_accion TIMESTAMP NOT NULL,
    fecha_limite_presentacion TIMESTAMP,
    accion VARCHAR(20) CHECK (accion IN ('CREACION', 'ACTUALIZACION', 'APROBACION', 'RECHAZO', 'CANCELACION', 'CAMBIO_ESTADO')) NOT NULL,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20),
    comentario TEXT,
    ip_usuario INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes_licencias(id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_solicitudes_trabajador ON solicitudes_licencias(trabajador_id);
CREATE INDEX idx_solicitudes_tipo ON solicitudes_licencias(tipo_licencia_id);
CREATE INDEX idx_solicitudes_estado ON solicitudes_licencias(estado);
CREATE INDEX idx_solicitudes_fecha ON solicitudes_licencias(fecha_hora_solicitud);
CREATE INDEX idx_control_limites_trabajador ON control_limites(trabajador_id);
CREATE INDEX idx_control_limites_tipo ON control_limites(tipo_licencia_id);
CREATE INDEX idx_auditoria_solicitud ON auditoria_solicitudes(solicitud_id);
CREATE INDEX idx_auditoria_usuario ON auditoria_solicitudes(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_solicitudes(fecha_hora_accion);

-- Crear función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_solicitudes_updated_at
    BEFORE UPDATE ON solicitudes_licencias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 