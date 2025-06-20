--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auditoria_solicitudes_estado_anterior_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.auditoria_solicitudes_estado_anterior_enum AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA',
    'CANCELADA'
);


--
-- Name: auditoria_solicitudes_estado_nuevo_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.auditoria_solicitudes_estado_nuevo_enum AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA',
    'CANCELADA'
);


--
-- Name: historico_uso_licencias_unidad_disponibilidad_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.historico_uso_licencias_unidad_disponibilidad_enum AS ENUM (
    'HORAS',
    'DIAS',
    'VECES',
    'CAMBIOS'
);


--
-- Name: licencias_estado_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.licencias_estado_enum AS ENUM (
    'ACTIVA',
    'FINALIZADA',
    'CANCELADA'
);


--
-- Name: licencias_tipo_olvido_marcacion_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.licencias_tipo_olvido_marcacion_enum AS ENUM (
    'ENTRADA',
    'SALIDA'
);


--
-- Name: solicitudes_estado_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.solicitudes_estado_enum AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA',
    'CANCELADA'
);


--
-- Name: solicitudes_tipo_olvido_marcacion_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.solicitudes_tipo_olvido_marcacion_enum AS ENUM (
    'ENTRADA',
    'SALIDA'
);


--
-- Name: tipos_licencias_genero_aplicable_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipos_licencias_genero_aplicable_enum AS ENUM (
    'M',
    'F',
    'A'
);


--
-- Name: tipos_licencias_periodo_control_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipos_licencias_periodo_control_enum AS ENUM (
    'mes',
    'año',
    'ninguno'
);


--
-- Name: tipos_licencias_unidad_control_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipos_licencias_unidad_control_enum AS ENUM (
    'horas',
    'días',
    'ninguno'
);


--
-- Name: trabajadores_tipo_personal_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.trabajadores_tipo_personal_enum AS ENUM (
    'OPERATIVO',
    'ADMINISTRATIVO'
);


--
-- Name: validaciones_estado_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.validaciones_estado_enum AS ENUM (
    'PENDIENTE',
    'APROBADO',
    'RECHAZADO'
);


--
-- Name: actualizar_control_limites(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.actualizar_control_limites() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.estado = 'aprobada' AND (OLD.estado IS NULL OR OLD.estado != 'aprobada') THEN
        DECLARE
            dias_utilizados INT := EXTRACT(DAY FROM (NEW.fecha_hora_fin_permiso - NEW.fecha_hora_inicio_permiso)) + 1;
            horas_utilizadas INT := EXTRACT(EPOCH FROM (NEW.fecha_hora_fin_permiso - NEW.fecha_hora_inicio_permiso)) / 3600;
            anio_actual INT := EXTRACT(YEAR FROM NEW.fecha_hora_inicio_permiso);
            mes_actual INT := EXTRACT(MONTH FROM NEW.fecha_hora_inicio_permiso);
        BEGIN
            -- Control anual
            INSERT INTO control_limites (trabajador_id, tipo_licencia_id, anio, dias_utilizados, horas_utilizadas, cantidad_utilizada)
            VALUES (NEW.trabajador_id, NEW.tipo_licencia_id, anio_actual, dias_utilizados, horas_utilizadas, 1)
            ON CONFLICT (trabajador_id, tipo_licencia_id, anio, mes)
            DO UPDATE SET 
                dias_utilizados = control_limites.dias_utilizados + dias_utilizados,
                horas_utilizadas = control_limites.horas_utilizadas + horas_utilizadas,
                cantidad_utilizada = control_limites.cantidad_utilizada + 1;

            -- Control mensual si aplica
            IF EXISTS (SELECT 1 FROM tipos_licencias WHERE id = NEW.tipo_licencia_id AND limite_mensual IS NOT NULL) THEN
                INSERT INTO control_limites (trabajador_id, tipo_licencia_id, anio, mes, cantidad_utilizada)
                VALUES (NEW.trabajador_id, NEW.tipo_licencia_id, anio_actual, mes_actual, 1)
                ON CONFLICT (trabajador_id, tipo_licencia_id, anio, mes)
                DO UPDATE SET cantidad_utilizada = control_limites.cantidad_utilizada + 1;
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: actualizar_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.actualizar_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: estadisticas_tiempo_respuesta(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.estadisticas_tiempo_respuesta(p_fecha_inicio date DEFAULT NULL::date, p_fecha_fin date DEFAULT NULL::date) RETURNS TABLE(promedio_horas_respuesta numeric, mediana_horas_respuesta numeric, total_solicitudes bigint, solicitudes_pendientes bigint, solicitudes_aprobadas bigint, solicitudes_rechazadas bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        AVG(EXTRACT(EPOCH FROM (fecha_hora_decision - fecha_hora_solicitud)) / 3600) AS promedio_horas_respuesta,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (fecha_hora_decision - fecha_hora_solicitud)) / 3600) AS mediana_horas_respuesta,
        COUNT(*) AS total_solicitudes,
        COUNT(*) FILTER (WHERE estado = 'pendiente') AS solicitudes_pendientes,
        COUNT(*) FILTER (WHERE estado = 'aprobada') AS solicitudes_aprobadas,
        COUNT(*) FILTER (WHERE estado = 'rechazada') AS solicitudes_rechazadas
    FROM solicitudes_licencias
    WHERE 
        (p_fecha_inicio IS NULL OR DATE(fecha_hora_solicitud) >= p_fecha_inicio)
        AND (p_fecha_fin IS NULL OR DATE(fecha_hora_solicitud) <= p_fecha_fin);
END;
$$;


--
-- Name: trigger_auditoria_solicitudes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_auditoria_solicitudes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Auditar cambios de estado
    IF TG_OP = 'UPDATE' AND OLD.estado != NEW.estado THEN
        INSERT INTO auditoria_solicitudes (
            solicitud_id, 
            accion, 
            estado_anterior, 
            estado_nuevo, 
            usuario_id,
            comentario
        ) VALUES (
            NEW.id,
            'cambio_estado',
            OLD.estado,
            NEW.estado,
            NEW.aprobado_por,
            CASE 
                WHEN NEW.estado = 'rechazada' THEN NEW.motivo_rechazo
                ELSE NULL
            END
        );
    END IF;
    
    -- Auditar creación
    IF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria_solicitudes (
            solicitud_id, 
            accion, 
            estado_nuevo, 
            usuario_id
        ) VALUES (
            NEW.id,
            'creacion',
            NEW.estado,
            NEW.trabajador_id
        );
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: validar_anticipacion_licencia(integer, timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validar_anticipacion_licencia(p_tipo_licencia_id integer, p_fecha_solicitud timestamp without time zone, p_fecha_inicio_permiso timestamp without time zone) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    dias_anticipacion_requerida INT;
    dias_anticipacion_actual INT;
BEGIN
    SELECT anticipacion_requerida INTO dias_anticipacion_requerida 
    FROM tipos_licencias 
    WHERE id = p_tipo_licencia_id;
    
    dias_anticipacion_actual := EXTRACT(DAY FROM (p_fecha_inicio_permiso - p_fecha_solicitud));
    
    RETURN dias_anticipacion_actual >= COALESCE(dias_anticipacion_requerida, 0);
END;
$$;


--
-- Name: validar_limites_licencia(integer, integer, timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validar_limites_licencia(p_trabajador_id integer, p_tipo_licencia_id integer, p_fecha_inicio timestamp without time zone, p_fecha_fin timestamp without time zone) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    tipo_licencia RECORD;
    limite_anual RECORD;
    limite_mensual RECORD;
    dias_solicitados INT;
    horas_solicitadas INT;
    anio_actual INT := EXTRACT(YEAR FROM p_fecha_inicio);
    mes_actual INT := EXTRACT(MONTH FROM p_fecha_inicio);
    resultado JSONB := '{"valido": true, "errores": []}'::JSONB;
BEGIN
    SELECT * INTO tipo_licencia FROM tipos_licencias WHERE id = p_tipo_licencia_id;
    
    dias_solicitados := EXTRACT(DAY FROM (p_fecha_fin - p_fecha_inicio)) + 1;
    horas_solicitadas := EXTRACT(EPOCH FROM (p_fecha_fin - p_fecha_inicio)) / 3600;
    
    -- Validar límite anual
    IF tipo_licencia.dias_anuales IS NOT NULL THEN
        SELECT * INTO limite_anual 
        FROM control_limites 
        WHERE trabajador_id = p_trabajador_id 
        AND tipo_licencia_id = p_tipo_licencia_id 
        AND anio = anio_actual 
        AND mes IS NULL;
        
        IF (COALESCE(limite_anual.dias_utilizados, 0) + dias_solicitados) > tipo_licencia.dias_anuales THEN
            resultado := jsonb_set(resultado, '{valido}', 'false');
            resultado := jsonb_set(resultado, '{errores}', 
                (resultado->'errores') || jsonb_build_array(
                    format('Excede límite anual de %s días. Utilizados: %s, Solicitados: %s', 
                           tipo_licencia.dias_anuales, 
                           COALESCE(limite_anual.dias_utilizados, 0), 
                           dias_solicitados)
                )
            );
        END IF;
    END IF;
    
    -- Validar límite mensual
    IF tipo_licencia.limite_mensual IS NOT NULL THEN
        SELECT * INTO limite_mensual 
        FROM control_limites 
        WHERE trabajador_id = p_trabajador_id 
        AND tipo_licencia_id = p_tipo_licencia_id 
        AND anio = anio_actual 
        AND mes = mes_actual;
        
        IF (COALESCE(limite_mensual.cantidad_utilizada, 0) + 1) > tipo_licencia.limite_mensual THEN
            resultado := jsonb_set(resultado, '{valido}', 'false');
            resultado := jsonb_set(resultado, '{errores}', 
                (resultado->'errores') || jsonb_build_array(
                    format('Excede límite mensual de %s solicitudes. Utilizadas: %s', 
                           tipo_licencia.limite_mensual, 
                           COALESCE(limite_mensual.cantidad_utilizada, 0))
                )
            );
        END IF;
    END IF;
    
    RETURN resultado;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auditoria_solicitudes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria_solicitudes (
    id integer NOT NULL,
    solicitud_id integer NOT NULL,
    estado_anterior public.auditoria_solicitudes_estado_anterior_enum,
    estado_nuevo public.auditoria_solicitudes_estado_nuevo_enum NOT NULL,
    motivo_cambio character varying(500),
    usuario_id integer,
    fecha_cambio timestamp without time zone DEFAULT now() NOT NULL,
    detalles_cambio json
);


--
-- Name: auditoria_solicitudes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auditoria_solicitudes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auditoria_solicitudes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auditoria_solicitudes_id_seq OWNED BY public.auditoria_solicitudes.id;


--
-- Name: control_limites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.control_limites (
    id integer NOT NULL,
    trabajador_id integer NOT NULL,
    tipo_licencia_id integer NOT NULL,
    anio integer NOT NULL,
    dias_totales integer NOT NULL,
    dias_utilizados integer DEFAULT 0 NOT NULL,
    dias_disponibles integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL,
    mes integer,
    horas_utilizadas integer DEFAULT 0 NOT NULL,
    cantidad_utilizada integer DEFAULT 0 NOT NULL
);


--
-- Name: control_limites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.control_limites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: control_limites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.control_limites_id_seq OWNED BY public.control_limites.id;


--
-- Name: departamentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departamentos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: departamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departamentos_id_seq OWNED BY public.departamentos.id;


--
-- Name: disponibilidad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disponibilidad (
    id integer NOT NULL,
    trabajador_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL,
    tipo_licencia_id integer NOT NULL,
    dias_disponibles integer DEFAULT 0 NOT NULL,
    dias_usados integer DEFAULT 0 NOT NULL,
    dias_restantes integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: disponibilidad_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.disponibilidad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: disponibilidad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.disponibilidad_id_seq OWNED BY public.disponibilidad.id;


--
-- Name: documentos_licencia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documentos_licencia (
    id integer NOT NULL,
    licencia_id integer NOT NULL,
    tipo_documento character varying(100) NOT NULL,
    url_archivo text NOT NULL,
    descripcion text,
    fecha_subida timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: documentos_licencia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documentos_licencia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documentos_licencia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documentos_licencia_id_seq OWNED BY public.documentos_licencia.id;


--
-- Name: historico_uso_licencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historico_uso_licencias (
    id integer NOT NULL,
    trabajador_id integer NOT NULL,
    tipo_licencia_id integer NOT NULL,
    departamento_id integer NOT NULL,
    anio integer NOT NULL,
    mes integer,
    total_veces integer DEFAULT 0 NOT NULL,
    total_horas numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    total_dias integer DEFAULT 0 NOT NULL,
    unidad_disponibilidad public.historico_uso_licencias_unidad_disponibilidad_enum NOT NULL,
    fecha_generado timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: historico_uso_licencias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.historico_uso_licencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: historico_uso_licencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.historico_uso_licencias_id_seq OWNED BY public.historico_uso_licencias.id;


--
-- Name: licencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.licencias (
    id integer NOT NULL,
    solicitud_id integer NOT NULL,
    trabajador_id integer NOT NULL,
    tipo_licencia_id integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    dias_totales integer NOT NULL,
    dias_habiles integer NOT NULL,
    dias_calendario integer NOT NULL,
    estado public.licencias_estado_enum NOT NULL,
    motivo_cancelacion text,
    fecha_cancelacion timestamp without time zone,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_no_asiste date,
    fecha_si_asiste date,
    trabajador_cambio_id integer,
    tipo_olvido_marcacion public.licencias_tipo_olvido_marcacion_enum,
    horas_totales numeric(10,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: licencias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.licencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: licencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.licencias_id_seq OWNED BY public.licencias.id;


--
-- Name: limites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.limites (
    id integer NOT NULL,
    trabajador_id integer NOT NULL,
    tipo_licencia_id integer NOT NULL,
    anio integer NOT NULL,
    dias_disponibles integer NOT NULL,
    dias_utilizados integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: limites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.limites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: limites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.limites_id_seq OWNED BY public.limites.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: movimientos_plan_trabajo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimientos_plan_trabajo (
    id integer NOT NULL,
    trabajador_id integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    descripcion text,
    justificacion text,
    registrado_por integer NOT NULL,
    fecha_registro timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: movimientos_plan_trabajo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.movimientos_plan_trabajo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: movimientos_plan_trabajo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.movimientos_plan_trabajo_id_seq OWNED BY public.movimientos_plan_trabajo.id;


--
-- Name: puestos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.puestos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: puestos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.puestos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: puestos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.puestos_id_seq OWNED BY public.puestos.id;


--
-- Name: solicitudes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes (
    id integer NOT NULL,
    trabajador_id integer NOT NULL,
    tipo_licencia_id integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    motivo text NOT NULL,
    estado public.solicitudes_estado_enum NOT NULL,
    dias_solicitados integer NOT NULL,
    dias_habiles integer NOT NULL,
    dias_calendario integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_decision timestamp without time zone,
    tipo_olvido_marcacion public.solicitudes_tipo_olvido_marcacion_enum
);


--
-- Name: solicitudes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitudes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitudes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitudes_id_seq OWNED BY public.solicitudes.id;


--
-- Name: tipos_licencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tipos_licencias (
    id integer NOT NULL,
    codigo character varying(10) NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    duracion_maxima integer DEFAULT 0 NOT NULL,
    requiere_justificacion boolean DEFAULT false NOT NULL,
    requiere_aprobacion_especial boolean DEFAULT false NOT NULL,
    requiere_documentacion boolean DEFAULT false NOT NULL,
    pago_haberes boolean DEFAULT true NOT NULL,
    acumulable boolean DEFAULT false NOT NULL,
    transferible boolean DEFAULT false NOT NULL,
    aplica_genero boolean DEFAULT false NOT NULL,
    genero_aplicable public.tipos_licencias_genero_aplicable_enum DEFAULT 'A'::public.tipos_licencias_genero_aplicable_enum NOT NULL,
    aplica_antiguedad boolean DEFAULT false NOT NULL,
    antiguedad_minima integer,
    aplica_edad boolean DEFAULT false NOT NULL,
    edad_minima integer,
    edad_maxima integer,
    aplica_departamento boolean DEFAULT false NOT NULL,
    departamentos_aplicables text,
    aplica_cargo boolean DEFAULT false NOT NULL,
    cargos_aplicables text,
    aplica_tipo_personal boolean DEFAULT false NOT NULL,
    tipos_personal_aplicables text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    unidad_control public.tipos_licencias_unidad_control_enum DEFAULT 'días'::public.tipos_licencias_unidad_control_enum NOT NULL,
    periodo_control public.tipos_licencias_periodo_control_enum DEFAULT 'año'::public.tipos_licencias_periodo_control_enum NOT NULL
);


--
-- Name: tipos_licencias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tipos_licencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tipos_licencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tipos_licencias_id_seq OWNED BY public.tipos_licencias.id;


--
-- Name: trabajadores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trabajadores (
    id integer NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre_completo character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    telefono character varying(20),
    departamento_id integer,
    puesto_id integer,
    tipo_personal public.trabajadores_tipo_personal_enum NOT NULL,
    fecha_ingreso date NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: trabajadores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trabajadores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trabajadores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trabajadores_id_seq OWNED BY public.trabajadores.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    departamento_id integer,
    puesto_id integer,
    rol character varying(50) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: validaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.validaciones (
    id integer NOT NULL,
    solicitud_id integer NOT NULL,
    validado_por integer NOT NULL,
    estado public.validaciones_estado_enum NOT NULL,
    observaciones text,
    fecha_validacion timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: validaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.validaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: validaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.validaciones_id_seq OWNED BY public.validaciones.id;


--
-- Name: auditoria_solicitudes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_solicitudes ALTER COLUMN id SET DEFAULT nextval('public.auditoria_solicitudes_id_seq'::regclass);


--
-- Name: control_limites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.control_limites ALTER COLUMN id SET DEFAULT nextval('public.control_limites_id_seq'::regclass);


--
-- Name: departamentos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamentos ALTER COLUMN id SET DEFAULT nextval('public.departamentos_id_seq'::regclass);


--
-- Name: disponibilidad id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad ALTER COLUMN id SET DEFAULT nextval('public.disponibilidad_id_seq'::regclass);


--
-- Name: documentos_licencia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_licencia ALTER COLUMN id SET DEFAULT nextval('public.documentos_licencia_id_seq'::regclass);


--
-- Name: historico_uso_licencias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_uso_licencias ALTER COLUMN id SET DEFAULT nextval('public.historico_uso_licencias_id_seq'::regclass);


--
-- Name: licencias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licencias ALTER COLUMN id SET DEFAULT nextval('public.licencias_id_seq'::regclass);


--
-- Name: limites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.limites ALTER COLUMN id SET DEFAULT nextval('public.limites_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: movimientos_plan_trabajo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_plan_trabajo ALTER COLUMN id SET DEFAULT nextval('public.movimientos_plan_trabajo_id_seq'::regclass);


--
-- Name: puestos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.puestos ALTER COLUMN id SET DEFAULT nextval('public.puestos_id_seq'::regclass);


--
-- Name: solicitudes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_id_seq'::regclass);


--
-- Name: tipos_licencias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_licencias ALTER COLUMN id SET DEFAULT nextval('public.tipos_licencias_id_seq'::regclass);


--
-- Name: trabajadores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores ALTER COLUMN id SET DEFAULT nextval('public.trabajadores_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: validaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.validaciones ALTER COLUMN id SET DEFAULT nextval('public.validaciones_id_seq'::regclass);


--
-- Data for Name: auditoria_solicitudes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: control_limites; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: departamentos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.departamentos VALUES (1, 'MEDICOS', 'Departamento de médicos', true, '2025-06-11 18:57:54.557774', '2025-06-11 18:57:54.557774');
INSERT INTO public.departamentos VALUES (2, 'CALL CENTER', 'Departamento de atención telefónica', true, '2025-06-11 18:57:54.588755', '2025-06-11 18:57:54.588755');
INSERT INTO public.departamentos VALUES (3, 'ENFERMERÍA', 'Departamento de enfermería', true, '2025-06-11 18:57:54.607441', '2025-06-11 18:57:54.607441');
INSERT INTO public.departamentos VALUES (4, 'ADMINISTRACIÓN', 'Departamento administrativo', true, '2025-06-11 18:57:54.630259', '2025-06-11 18:57:54.630259');
INSERT INTO public.departamentos VALUES (5, 'RECURSOS HUMANOS', 'Departamento de RRHH', true, '2025-06-11 18:57:54.651852', '2025-06-11 18:57:54.651852');
INSERT INTO public.departamentos VALUES (6, 'LABORATORIO', 'Departamento de laboratorio clínico', true, '2025-06-11 18:57:54.669086', '2025-06-11 18:57:54.669086');
INSERT INTO public.departamentos VALUES (7, 'FARMACIA', 'Departamento de farmacia', true, '2025-06-11 18:57:54.682542', '2025-06-11 18:57:54.682542');
INSERT INTO public.departamentos VALUES (8, 'DEPARTAMENTO IT', 'Departamento de Soporte Técnico', true, '2025-06-13 20:29:01.596728', '2025-06-13 20:32:20.847558');
INSERT INTO public.departamentos VALUES (9, 'ddd', 'dddd123', false, '2025-06-15 06:44:30.808901', '2025-06-15 06:44:40.97445');


--
-- Data for Name: disponibilidad; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.disponibilidad VALUES (4, 1, '2025-06-13 23:12:34.407546', '2025-06-19 06:45:42.441346', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (3, 1, '2025-06-13 23:12:34.406028', '2025-06-14 04:54:28.570692', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (19, 2, '2025-06-14 04:46:33.797702', '2025-06-18 07:11:41.664349', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (5, 1, '2025-06-13 23:12:34.409121', '2025-06-18 05:02:40.235203', 15, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (11, 1, '2025-06-13 23:12:34.453299', '2025-06-18 07:20:08.139861', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (9, 1, '2025-06-13 23:12:34.447933', '2025-06-14 04:54:28.612849', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (7, 1, '2025-06-13 23:12:34.417147', '2025-06-13 23:12:34.519075', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (8, 1, '2025-06-13 23:12:34.424863', '2025-06-13 23:12:34.520393', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (39, 3, '2025-06-14 04:46:33.909761', '2025-06-14 07:56:53.54001', 5, 17, 59, -42, true);
INSERT INTO public.disponibilidad VALUES (6, 1, '2025-06-13 23:12:34.411546', '2025-06-18 20:04:39.124805', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (12, 1, '2025-06-13 23:12:34.455927', '2025-06-14 04:54:28.641586', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (16, 1, '2025-06-13 23:12:34.46017', '2025-06-19 08:29:40.767896', 13, 0, 8, 0, true);
INSERT INTO public.disponibilidad VALUES (14, 1, '2025-06-13 23:12:34.458305', '2025-06-14 04:54:28.660761', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (15, 1, '2025-06-13 23:12:34.459541', '2025-06-14 04:54:28.668864', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (21, 2, '2025-06-14 04:46:33.809005', '2025-06-18 07:20:16.320759', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (30, 2, '2025-06-14 04:46:33.855349', '2025-06-19 03:03:09.640853', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (17, 2, '2025-06-14 04:46:33.775313', '2025-06-14 04:46:33.775313', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (18, 2, '2025-06-14 04:46:33.792113', '2025-06-14 04:46:33.792113', 13, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (20, 2, '2025-06-14 04:46:33.803586', '2025-06-14 04:46:33.803586', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (22, 2, '2025-06-14 04:46:33.813896', '2025-06-14 04:46:33.813896', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (23, 2, '2025-06-14 04:46:33.818689', '2025-06-14 04:46:33.818689', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (27, 2, '2025-06-14 04:46:33.84016', '2025-06-14 04:46:33.84016', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (28, 2, '2025-06-14 04:46:33.845042', '2025-06-14 04:46:33.845042', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (29, 2, '2025-06-14 04:46:33.850269', '2025-06-14 04:46:33.850269', 15, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (33, 3, '2025-06-14 04:46:33.872794', '2025-06-14 04:46:33.872794', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (34, 3, '2025-06-14 04:46:33.8782', '2025-06-14 04:46:33.8782', 13, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (35, 3, '2025-06-14 04:46:33.883739', '2025-06-14 04:46:33.883739', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (36, 3, '2025-06-14 04:46:33.890475', '2025-06-14 04:46:33.890475', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (37, 3, '2025-06-14 04:46:33.89607', '2025-06-14 04:46:33.89607', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (41, 3, '2025-06-14 04:46:33.921193', '2025-06-14 04:46:33.921193', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (42, 3, '2025-06-14 04:46:33.926236', '2025-06-14 04:46:33.926236', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (43, 3, '2025-06-14 04:46:33.931032', '2025-06-14 04:46:33.931032', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (44, 3, '2025-06-14 04:46:33.935805', '2025-06-14 04:46:33.935805', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (45, 3, '2025-06-14 04:46:33.940793', '2025-06-14 04:46:33.940793', 15, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (48, 3, '2025-06-14 04:46:33.955369', '2025-06-14 04:46:33.955369', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (49, 4, '2025-06-14 04:46:33.960596', '2025-06-14 04:46:33.960596', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (50, 4, '2025-06-14 04:46:33.965393', '2025-06-14 04:46:33.965393', 13, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (51, 4, '2025-06-14 04:46:33.970634', '2025-06-14 04:46:33.970634', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (52, 4, '2025-06-14 04:46:33.975495', '2025-06-14 04:46:33.975495', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (53, 4, '2025-06-14 04:46:33.980511', '2025-06-14 04:46:33.980511', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (54, 4, '2025-06-14 04:46:33.98553', '2025-06-14 04:46:33.98553', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (55, 4, '2025-06-14 04:46:33.991093', '2025-06-14 04:46:33.991093', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (56, 4, '2025-06-14 04:46:33.996545', '2025-06-14 04:46:33.996545', 8, 180, 0, 180, true);
INSERT INTO public.disponibilidad VALUES (57, 4, '2025-06-14 04:46:34.001807', '2025-06-14 04:46:34.001807', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (58, 4, '2025-06-14 04:46:34.006966', '2025-06-14 04:46:34.006966', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (59, 4, '2025-06-14 04:46:34.011843', '2025-06-14 04:46:34.011843', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (60, 4, '2025-06-14 04:46:34.016926', '2025-06-14 04:46:34.016926', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (61, 4, '2025-06-14 04:46:34.02318', '2025-06-14 04:46:34.02318', 15, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (64, 4, '2025-06-14 04:46:34.039143', '2025-06-14 04:46:34.039143', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (65, 6, '2025-06-14 04:46:34.044147', '2025-06-14 04:46:34.044147', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (66, 6, '2025-06-14 04:46:34.048972', '2025-06-14 04:46:34.048972', 13, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (67, 6, '2025-06-14 04:46:34.054105', '2025-06-14 04:46:34.054105', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (69, 6, '2025-06-14 04:46:34.063395', '2025-06-14 04:46:34.063395', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (70, 6, '2025-06-14 04:46:34.068183', '2025-06-14 04:46:34.068183', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (71, 6, '2025-06-14 04:46:34.07441', '2025-06-14 04:46:34.07441', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (72, 6, '2025-06-14 04:46:34.07903', '2025-06-14 04:46:34.07903', 8, 180, 0, 180, true);
INSERT INTO public.disponibilidad VALUES (74, 6, '2025-06-14 04:46:34.089661', '2025-06-14 04:46:34.089661', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (75, 6, '2025-06-14 04:46:34.094842', '2025-06-14 04:46:34.094842', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (76, 6, '2025-06-14 04:46:34.099442', '2025-06-14 04:46:34.099442', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (77, 6, '2025-06-14 04:46:34.105788', '2025-06-14 04:46:34.105788', 15, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (81, 7, '2025-06-14 04:46:34.129709', '2025-06-14 04:46:34.129709', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (82, 7, '2025-06-14 04:46:34.136493', '2025-06-14 04:46:34.136493', 13, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (83, 7, '2025-06-14 04:46:34.144762', '2025-06-14 04:46:34.144762', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (84, 7, '2025-06-14 04:46:34.150463', '2025-06-14 04:46:34.150463', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (85, 7, '2025-06-14 04:46:34.156491', '2025-06-14 04:46:34.156491', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (86, 7, '2025-06-14 04:46:34.163371', '2025-06-14 04:46:34.163371', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (87, 7, '2025-06-14 04:46:34.170887', '2025-06-14 04:46:34.170887', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (88, 7, '2025-06-14 04:46:34.177765', '2025-06-14 04:46:34.177765', 8, 180, 0, 180, true);
INSERT INTO public.disponibilidad VALUES (89, 7, '2025-06-14 04:46:34.183273', '2025-06-14 04:46:34.183273', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (90, 7, '2025-06-14 04:46:34.189523', '2025-06-14 04:46:34.189523', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (91, 7, '2025-06-14 04:46:34.195312', '2025-06-14 04:46:34.195312', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (92, 7, '2025-06-14 04:46:34.200071', '2025-06-14 04:46:34.200071', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (93, 7, '2025-06-14 04:46:34.207008', '2025-06-14 04:46:34.207008', 15, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (96, 7, '2025-06-14 04:46:34.229866', '2025-06-14 04:46:34.229866', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (31, 2, '2025-06-14 04:46:33.861073', '2025-06-19 03:03:09.647712', 3, 480, 0, 480, true);
INSERT INTO public.disponibilidad VALUES (10, 1, '2025-06-13 23:12:34.448631', '2025-06-14 07:53:05.097', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (32, 2, '2025-06-14 04:46:33.866502', '2025-06-19 00:02:43.893956', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (40, 3, '2025-06-14 04:46:33.915423', '2025-06-14 07:56:53.562614', 8, 180, 50, 130, true);
INSERT INTO public.disponibilidad VALUES (79, 6, '2025-06-14 04:46:34.117686', '2025-06-19 03:03:09.698647', 3, 480, 456, 24, true);
INSERT INTO public.disponibilidad VALUES (2, 1, '2025-06-13 23:12:34.40463', '2025-06-19 06:45:34.46476', 3, 480, 0, 480, true);
INSERT INTO public.disponibilidad VALUES (80, 6, '2025-06-14 04:46:34.12446', '2025-06-14 08:18:06.098', 10, 3, 59, -56, true);
INSERT INTO public.disponibilidad VALUES (38, 3, '2025-06-14 04:46:33.903284', '2025-06-18 06:24:39.252611', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (73, 6, '2025-06-14 04:46:34.083965', '2025-06-14 08:18:06.105451', 7, 112, 58, 54, true);
INSERT INTO public.disponibilidad VALUES (68, 6, '2025-06-14 04:46:34.058898', '2025-06-14 04:46:34.058', 16, 3, 22, -19, true);
INSERT INTO public.disponibilidad VALUES (13, 1, '2025-06-13 23:12:34.457635', '2025-06-19 08:32:25.069498', 8, 180, 275, -95, true);
INSERT INTO public.disponibilidad VALUES (46, 3, '2025-06-14 04:46:33.945565', '2025-06-19 03:03:09.653905', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (62, 4, '2025-06-14 04:46:34.028723', '2025-06-19 03:03:09.659227', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (63, 4, '2025-06-14 04:46:34.033591', '2025-06-19 03:03:09.665163', 3, 480, 0, 480, true);
INSERT INTO public.disponibilidad VALUES (78, 6, '2025-06-14 04:46:34.111871', '2025-06-19 03:03:09.671622', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (94, 7, '2025-06-14 04:46:34.214084', '2025-06-19 03:03:09.678692', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (95, 7, '2025-06-14 04:46:34.221816', '2025-06-19 03:03:09.685048', 3, 480, 0, 480, true);
INSERT INTO public.disponibilidad VALUES (47, 3, '2025-06-14 04:46:33.950249', '2025-06-19 03:03:09.691816', 3, 480, 624, -144, true);
INSERT INTO public.disponibilidad VALUES (97, 8, '2025-06-14 04:46:34.237055', '2025-06-14 04:46:34.237055', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (98, 8, '2025-06-14 04:46:34.247952', '2025-06-14 04:46:34.247952', 13, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (99, 8, '2025-06-14 04:46:34.253263', '2025-06-14 04:46:34.253263', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (100, 8, '2025-06-14 04:46:34.259642', '2025-06-14 04:46:34.259642', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (101, 8, '2025-06-14 04:46:34.265015', '2025-06-14 04:46:34.265015', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (102, 8, '2025-06-14 04:46:34.270464', '2025-06-14 04:46:34.270464', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (103, 8, '2025-06-14 04:46:34.276414', '2025-06-14 04:46:34.276414', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (104, 8, '2025-06-14 04:46:34.282396', '2025-06-14 04:46:34.282396', 8, 180, 0, 180, true);
INSERT INTO public.disponibilidad VALUES (105, 8, '2025-06-14 04:46:34.287414', '2025-06-14 04:46:34.287414', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (106, 8, '2025-06-14 04:46:34.29276', '2025-06-14 04:46:34.29276', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (107, 8, '2025-06-14 04:46:34.297508', '2025-06-14 04:46:34.297508', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (108, 8, '2025-06-14 04:46:34.302629', '2025-06-14 04:46:34.302629', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (109, 8, '2025-06-14 04:46:34.307997', '2025-06-14 04:46:34.307997', 15, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (112, 8, '2025-06-14 04:46:34.32278', '2025-06-14 04:46:34.32278', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (113, 9, '2025-06-14 04:46:34.327855', '2025-06-14 04:46:34.327855', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (115, 9, '2025-06-14 04:46:34.337149', '2025-06-14 04:46:34.337149', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (116, 9, '2025-06-14 04:46:34.341973', '2025-06-14 04:46:34.341973', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (117, 9, '2025-06-14 04:46:34.347263', '2025-06-14 04:46:34.347263', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (118, 9, '2025-06-14 04:46:34.352502', '2025-06-14 04:46:34.352502', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (119, 9, '2025-06-14 04:46:34.359708', '2025-06-14 04:46:34.359708', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (120, 9, '2025-06-14 04:46:34.365612', '2025-06-14 04:46:34.365612', 8, 180, 0, 180, true);
INSERT INTO public.disponibilidad VALUES (121, 9, '2025-06-14 04:46:34.372092', '2025-06-14 04:46:34.372092', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (122, 9, '2025-06-14 04:46:34.377694', '2025-06-14 04:46:34.377694', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (124, 9, '2025-06-14 04:46:34.387848', '2025-06-14 04:46:34.387848', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (125, 9, '2025-06-14 04:46:34.392824', '2025-06-14 04:46:34.392824', 15, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (128, 9, '2025-06-14 04:46:34.40793', '2025-06-14 04:46:34.40793', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (166, 9, '2025-06-19 08:18:04.887498', '2025-06-19 08:18:04.887498', 18, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (167, 4, '2025-06-19 08:18:04.892372', '2025-06-19 08:18:04.892372', 18, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (129, 10, '2025-06-15 05:46:20.718132', '2025-06-15 05:46:20.718132', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (130, 10, '2025-06-15 05:46:20.728212', '2025-06-15 05:46:20.728212', 13, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (131, 10, '2025-06-15 05:46:20.738889', '2025-06-15 05:46:20.738889', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (132, 10, '2025-06-15 05:46:20.752195', '2025-06-15 05:46:20.752195', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (133, 10, '2025-06-15 05:46:20.758474', '2025-06-15 05:46:20.758474', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (134, 10, '2025-06-15 05:46:20.767759', '2025-06-15 05:46:20.767759', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (135, 10, '2025-06-15 05:46:20.774265', '2025-06-15 05:46:20.774265', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (136, 10, '2025-06-15 05:46:20.783853', '2025-06-15 05:46:20.783853', 8, 180, 0, 180, true);
INSERT INTO public.disponibilidad VALUES (137, 10, '2025-06-15 05:46:20.791077', '2025-06-15 05:46:20.791077', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (138, 10, '2025-06-15 05:46:20.800889', '2025-06-15 05:46:20.800889', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (139, 10, '2025-06-15 05:46:20.807707', '2025-06-15 05:46:20.807707', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (140, 10, '2025-06-15 05:46:20.817252', '2025-06-15 05:46:20.817252', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (141, 10, '2025-06-15 05:46:20.823871', '2025-06-15 05:46:20.823871', 15, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (144, 10, '2025-06-15 05:46:20.854411', '2025-06-15 05:46:20.854411', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (145, 11, '2025-06-15 05:59:37.537082', '2025-06-15 05:59:37.537082', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (146, 11, '2025-06-15 05:59:37.553325', '2025-06-15 05:59:37.553325', 13, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (147, 11, '2025-06-15 05:59:37.565708', '2025-06-15 05:59:37.565708', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (149, 11, '2025-06-15 05:59:37.586367', '2025-06-15 05:59:37.586367', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (150, 11, '2025-06-15 05:59:37.596065', '2025-06-15 05:59:37.596065', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (151, 11, '2025-06-15 05:59:37.60519', '2025-06-15 05:59:37.60519', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (152, 11, '2025-06-15 05:59:37.613739', '2025-06-15 05:59:37.613739', 8, 180, 0, 180, true);
INSERT INTO public.disponibilidad VALUES (153, 11, '2025-06-15 05:59:37.621458', '2025-06-15 05:59:37.621458', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (154, 11, '2025-06-15 05:59:37.630844', '2025-06-15 05:59:37.630844', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (155, 11, '2025-06-15 05:59:37.639758', '2025-06-15 05:59:37.639758', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (156, 11, '2025-06-15 05:59:37.648354', '2025-06-15 05:59:37.648354', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (157, 11, '2025-06-15 05:59:37.658241', '2025-06-15 05:59:37.658241', 15, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (160, 11, '2025-06-15 05:59:37.684635', '2025-06-15 05:59:37.684635', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (168, 8, '2025-06-19 08:18:04.899056', '2025-06-19 08:18:04.899056', 18, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (169, 11, '2025-06-19 08:18:04.90616', '2025-06-19 08:18:04.90616', 18, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (123, 9, '2025-06-14 04:46:34.382187', '2025-06-18 06:29:35.013678', 11, 15, -3, 18, true);
INSERT INTO public.disponibilidad VALUES (114, 9, '2025-06-14 04:46:34.332329', '2025-06-18 06:29:42.976958', 13, 0, -98, 98, true);
INSERT INTO public.disponibilidad VALUES (170, 10, '2025-06-19 08:18:04.911825', '2025-06-19 08:18:04.911825', 18, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (26, 2, '2025-06-14 04:46:33.834476', '2025-06-18 07:11:41.653818', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (24, 2, '2025-06-14 04:46:33.824524', '2025-06-18 07:11:41.668972', 8, 180, 0, 180, true);
INSERT INTO public.disponibilidad VALUES (171, 12, '2025-06-19 09:41:52.095696', '2025-06-19 09:41:52.095696', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (148, 11, '2025-06-15 05:59:37.575501', '2025-06-18 07:20:22.797935', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (25, 2, '2025-06-14 04:46:33.829287', '2025-06-19 00:02:43.380857', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (110, 8, '2025-06-14 04:46:34.313067', '2025-06-19 03:03:09.704963', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (111, 8, '2025-06-14 04:46:34.31773', '2025-06-19 03:03:09.712257', 3, 480, 0, 480, true);
INSERT INTO public.disponibilidad VALUES (126, 9, '2025-06-14 04:46:34.397295', '2025-06-19 03:03:09.718436', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (127, 9, '2025-06-14 04:46:34.402218', '2025-06-19 03:03:09.724668', 3, 480, 0, 480, true);
INSERT INTO public.disponibilidad VALUES (142, 10, '2025-06-15 05:46:20.835974', '2025-06-19 03:03:09.730238', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (143, 10, '2025-06-15 05:46:20.845009', '2025-06-19 03:03:09.736256', 3, 480, 0, 480, true);
INSERT INTO public.disponibilidad VALUES (158, 11, '2025-06-15 05:59:37.666876', '2025-06-19 03:03:09.742388', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (159, 11, '2025-06-15 05:59:37.676843', '2025-06-19 03:03:09.748482', 3, 480, 0, 480, true);
INSERT INTO public.disponibilidad VALUES (172, 12, '2025-06-19 09:41:52.106476', '2025-06-19 09:41:52.106476', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (173, 12, '2025-06-19 09:41:52.113379', '2025-06-19 09:41:52.113379', 3, 480, 0, 480, true);
INSERT INTO public.disponibilidad VALUES (174, 12, '2025-06-19 09:41:52.122681', '2025-06-19 09:41:52.122681', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (175, 12, '2025-06-19 09:41:52.129639', '2025-06-19 09:41:52.129639', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (176, 12, '2025-06-19 09:41:52.139128', '2025-06-19 09:41:52.139128', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (177, 12, '2025-06-19 09:41:52.145966', '2025-06-19 09:41:52.145966', 8, 180, 0, 180, true);
INSERT INTO public.disponibilidad VALUES (178, 12, '2025-06-19 09:41:52.156415', '2025-06-19 09:41:52.156415', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (179, 12, '2025-06-19 09:41:52.165251', '2025-06-19 09:41:52.165251', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (1, 1, '2025-06-13 23:12:34.399184', '2025-06-19 06:45:37.078799', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (161, 1, '2025-06-19 08:18:04.849169', '2025-06-19 08:18:04.849169', 18, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (162, 2, '2025-06-19 08:18:04.859845', '2025-06-19 08:18:04.859845', 18, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (163, 3, '2025-06-19 08:18:04.867409', '2025-06-19 08:18:04.867409', 18, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (164, 6, '2025-06-19 08:18:04.874216', '2025-06-19 08:18:04.874216', 18, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (165, 7, '2025-06-19 08:18:04.881309', '2025-06-19 08:18:04.881309', 18, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (180, 12, '2025-06-19 09:41:52.173248', '2025-06-19 09:41:52.173248', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (181, 12, '2025-06-19 09:41:52.180968', '2025-06-19 09:41:52.180968', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (182, 12, '2025-06-19 09:41:52.189357', '2025-06-19 09:41:52.189357', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (183, 12, '2025-06-19 09:41:52.196474', '2025-06-19 09:41:52.196474', 13, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (184, 12, '2025-06-19 09:41:52.204166', '2025-06-19 09:41:52.204166', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (185, 12, '2025-06-19 09:41:52.210922', '2025-06-19 09:41:52.210922', 17, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (186, 13, '2025-06-19 09:41:52.252979', '2025-06-19 09:41:52.252979', 4, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (187, 13, '2025-06-19 09:41:52.264393', '2025-06-19 09:41:52.264393', 14, 2, 0, 2, true);
INSERT INTO public.disponibilidad VALUES (188, 13, '2025-06-19 09:41:52.273085', '2025-06-19 09:41:52.273085', 3, 480, 0, 480, true);
INSERT INTO public.disponibilidad VALUES (189, 13, '2025-06-19 09:41:52.281519', '2025-06-19 09:41:52.281519', 5, 17, 0, 17, true);
INSERT INTO public.disponibilidad VALUES (190, 13, '2025-06-19 09:41:52.291725', '2025-06-19 09:41:52.291725', 6, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (191, 13, '2025-06-19 09:41:52.300416', '2025-06-19 09:41:52.300416', 7, 112, 0, 112, true);
INSERT INTO public.disponibilidad VALUES (192, 13, '2025-06-19 09:41:52.307579', '2025-06-19 09:41:52.307579', 8, 180, 0, 180, true);
INSERT INTO public.disponibilidad VALUES (193, 13, '2025-06-19 09:41:52.315693', '2025-06-19 09:41:52.315693', 9, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (194, 13, '2025-06-19 09:41:52.325151', '2025-06-19 09:41:52.325151', 10, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (195, 13, '2025-06-19 09:41:52.33406', '2025-06-19 09:41:52.33406', 11, 15, 0, 15, true);
INSERT INTO public.disponibilidad VALUES (196, 13, '2025-06-19 09:41:52.340562', '2025-06-19 09:41:52.340562', 2, 40, 0, 40, true);
INSERT INTO public.disponibilidad VALUES (197, 13, '2025-06-19 09:41:52.350018', '2025-06-19 09:41:52.350018', 12, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (198, 13, '2025-06-19 09:41:52.357772', '2025-06-19 09:41:52.357772', 13, 0, 0, 0, true);
INSERT INTO public.disponibilidad VALUES (199, 13, '2025-06-19 09:41:52.363996', '2025-06-19 09:41:52.363996', 16, 3, 0, 3, true);
INSERT INTO public.disponibilidad VALUES (200, 13, '2025-06-19 09:41:52.370789', '2025-06-19 09:41:52.370789', 17, 0, 0, 0, true);


--
-- Data for Name: documentos_licencia; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: historico_uso_licencias; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: licencias; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.licencias VALUES (70, 73, 1, 13, '2025-06-19', '2025-06-26', 8, 6, 8, 'ACTIVA', NULL, NULL, true, '2025-06-19 08:29:40.652', '2025-06-19 08:29:40.652', NULL, NULL, NULL, NULL, 0.00);
INSERT INTO public.licencias VALUES (71, 74, 1, 8, '2025-06-19', '2026-03-20', 275, 197, 275, 'ACTIVA', NULL, NULL, true, '2025-06-19 08:32:24.936158', '2025-06-19 08:32:24.936158', NULL, NULL, NULL, NULL, 0.00);


--
-- Data for Name: limites; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.limites VALUES (1, 1, 1, 2025, 5, 0, true, '2025-06-11 19:05:07.489442', '2025-06-11 19:05:07.489442');
INSERT INTO public.limites VALUES (3, 1, 3, 2025, 60, 0, true, '2025-06-11 19:05:07.515579', '2025-06-11 19:05:07.515579');
INSERT INTO public.limites VALUES (4, 1, 4, 2025, 365, 0, true, '2025-06-11 19:05:07.52462', '2025-06-11 19:05:07.52462');
INSERT INTO public.limites VALUES (5, 1, 5, 2025, 17, 0, true, '2025-06-11 19:05:07.534898', '2025-06-11 19:05:07.534898');
INSERT INTO public.limites VALUES (6, 1, 6, 2025, 3, 0, true, '2025-06-11 19:05:07.547867', '2025-06-11 19:05:07.547867');
INSERT INTO public.limites VALUES (7, 1, 7, 2025, 112, 0, true, '2025-06-11 19:05:07.560177', '2025-06-11 19:05:07.560177');
INSERT INTO public.limites VALUES (9, 1, 9, 2025, 3, 0, true, '2025-06-11 19:05:07.584853', '2025-06-11 19:05:07.584853');
INSERT INTO public.limites VALUES (10, 1, 10, 2025, 3, 0, true, '2025-06-11 19:05:07.59732', '2025-06-11 19:05:07.59732');
INSERT INTO public.limites VALUES (11, 1, 11, 2025, 15, 0, true, '2025-06-11 19:05:07.610157', '2025-06-11 19:05:07.610157');
INSERT INTO public.limites VALUES (12, 1, 12, 2025, 30, 0, true, '2025-06-11 19:05:07.623727', '2025-06-11 19:05:07.623727');
INSERT INTO public.limites VALUES (14, 1, 14, 2025, 2, 0, true, '2025-06-11 19:05:07.653807', '2025-06-11 19:05:07.653807');
INSERT INTO public.limites VALUES (15, 1, 15, 2025, 2, 0, true, '2025-06-11 19:05:07.665875', '2025-06-11 19:05:07.665875');
INSERT INTO public.limites VALUES (17, 1, 17, 2025, 30, 0, true, '2025-06-11 19:05:07.690557', '2025-06-11 19:05:07.690557');
INSERT INTO public.limites VALUES (18, 2, 1, 2025, 5, 0, true, '2025-06-11 19:05:07.703152', '2025-06-11 19:05:07.703152');
INSERT INTO public.limites VALUES (19, 2, 2, 2025, 5, 0, true, '2025-06-11 19:05:07.716444', '2025-06-11 19:05:07.716444');
INSERT INTO public.limites VALUES (20, 2, 3, 2025, 60, 0, true, '2025-06-11 19:05:07.728249', '2025-06-11 19:05:07.728249');
INSERT INTO public.limites VALUES (21, 2, 4, 2025, 365, 0, true, '2025-06-11 19:05:07.73961', '2025-06-11 19:05:07.73961');
INSERT INTO public.limites VALUES (22, 2, 5, 2025, 17, 0, true, '2025-06-11 19:05:07.751038', '2025-06-11 19:05:07.751038');
INSERT INTO public.limites VALUES (23, 2, 6, 2025, 3, 0, true, '2025-06-11 19:05:07.760786', '2025-06-11 19:05:07.760786');
INSERT INTO public.limites VALUES (27, 2, 10, 2025, 3, 0, true, '2025-06-11 19:05:07.801804', '2025-06-11 19:05:07.801804');
INSERT INTO public.limites VALUES (28, 2, 11, 2025, 15, 0, true, '2025-06-11 19:05:07.812133', '2025-06-11 19:05:07.812133');
INSERT INTO public.limites VALUES (29, 2, 12, 2025, 30, 0, true, '2025-06-11 19:05:07.822685', '2025-06-11 19:05:07.822685');
INSERT INTO public.limites VALUES (30, 2, 13, 2025, 10, 0, true, '2025-06-11 19:05:07.833893', '2025-06-11 19:05:07.833893');
INSERT INTO public.limites VALUES (31, 2, 14, 2025, 2, 0, true, '2025-06-11 19:05:07.843835', '2025-06-11 19:05:07.843835');
INSERT INTO public.limites VALUES (32, 2, 15, 2025, 2, 0, true, '2025-06-11 19:05:07.860372', '2025-06-11 19:05:07.860372');
INSERT INTO public.limites VALUES (33, 2, 16, 2025, 3, 0, true, '2025-06-11 19:05:07.87193', '2025-06-11 19:05:07.87193');
INSERT INTO public.limites VALUES (35, 3, 1, 2025, 5, 0, true, '2025-06-11 19:05:07.889976', '2025-06-11 19:05:07.889976');
INSERT INTO public.limites VALUES (36, 3, 2, 2025, 5, 0, true, '2025-06-11 19:05:07.898738', '2025-06-11 19:05:07.898738');
INSERT INTO public.limites VALUES (40, 3, 6, 2025, 3, 0, true, '2025-06-11 19:05:07.942875', '2025-06-11 19:05:07.942875');
INSERT INTO public.limites VALUES (41, 3, 7, 2025, 112, 0, true, '2025-06-11 19:05:07.953283', '2025-06-11 19:05:07.953283');
INSERT INTO public.limites VALUES (43, 3, 9, 2025, 3, 0, true, '2025-06-11 19:05:07.973286', '2025-06-11 19:05:07.973286');
INSERT INTO public.limites VALUES (44, 3, 10, 2025, 3, 0, true, '2025-06-11 19:05:07.985358', '2025-06-11 19:05:07.985358');
INSERT INTO public.limites VALUES (45, 3, 11, 2025, 15, 0, true, '2025-06-11 19:05:07.997415', '2025-06-11 19:05:07.997415');
INSERT INTO public.limites VALUES (46, 3, 12, 2025, 30, 0, true, '2025-06-11 19:05:08.008354', '2025-06-11 19:05:08.008354');
INSERT INTO public.limites VALUES (47, 3, 13, 2025, 10, 0, true, '2025-06-11 19:05:08.017126', '2025-06-11 19:05:08.017126');
INSERT INTO public.limites VALUES (48, 3, 14, 2025, 2, 0, true, '2025-06-11 19:05:08.027291', '2025-06-11 19:05:08.027291');
INSERT INTO public.limites VALUES (49, 3, 15, 2025, 2, 0, true, '2025-06-11 19:05:08.037092', '2025-06-11 19:05:08.037092');
INSERT INTO public.limites VALUES (50, 3, 16, 2025, 3, 0, true, '2025-06-11 19:05:08.047313', '2025-06-11 19:05:08.047313');
INSERT INTO public.limites VALUES (51, 3, 17, 2025, 30, 0, true, '2025-06-11 19:05:08.056415', '2025-06-11 19:05:08.056415');
INSERT INTO public.limites VALUES (52, 4, 1, 2025, 5, 0, true, '2025-06-11 19:05:08.068385', '2025-06-11 19:05:08.068385');
INSERT INTO public.limites VALUES (53, 4, 2, 2025, 5, 0, true, '2025-06-11 19:05:08.082393', '2025-06-11 19:05:08.082393');
INSERT INTO public.limites VALUES (54, 4, 3, 2025, 60, 0, true, '2025-06-11 19:05:08.093045', '2025-06-11 19:05:08.093045');
INSERT INTO public.limites VALUES (55, 4, 4, 2025, 365, 0, true, '2025-06-11 19:05:08.102779', '2025-06-11 19:05:08.102779');
INSERT INTO public.limites VALUES (56, 4, 5, 2025, 17, 0, true, '2025-06-11 19:05:08.113101', '2025-06-11 19:05:08.113101');
INSERT INTO public.limites VALUES (57, 4, 6, 2025, 3, 0, true, '2025-06-11 19:05:08.123293', '2025-06-11 19:05:08.123293');
INSERT INTO public.limites VALUES (58, 4, 7, 2025, 112, 0, true, '2025-06-11 19:05:08.133354', '2025-06-11 19:05:08.133354');
INSERT INTO public.limites VALUES (60, 4, 9, 2025, 3, 0, true, '2025-06-11 19:05:08.14979', '2025-06-11 19:05:08.14979');
INSERT INTO public.limites VALUES (61, 4, 10, 2025, 3, 0, true, '2025-06-11 19:05:08.157272', '2025-06-11 19:05:08.157272');
INSERT INTO public.limites VALUES (63, 4, 12, 2025, 30, 0, true, '2025-06-11 19:05:08.177007', '2025-06-11 19:05:08.177007');
INSERT INTO public.limites VALUES (64, 4, 13, 2025, 10, 0, true, '2025-06-11 19:05:08.189756', '2025-06-11 19:05:08.189756');
INSERT INTO public.limites VALUES (67, 4, 16, 2025, 3, 0, true, '2025-06-11 19:05:08.223989', '2025-06-11 19:05:08.223989');
INSERT INTO public.limites VALUES (68, 4, 17, 2025, 30, 0, true, '2025-06-11 19:05:08.233222', '2025-06-11 19:05:08.233222');
INSERT INTO public.limites VALUES (69, 6, 1, 2025, 5, 0, true, '2025-06-11 19:05:08.241776', '2025-06-11 19:05:08.241776');
INSERT INTO public.limites VALUES (70, 6, 2, 2025, 5, 0, true, '2025-06-11 19:05:08.25195', '2025-06-11 19:05:08.25195');
INSERT INTO public.limites VALUES (72, 6, 4, 2025, 365, 0, true, '2025-06-11 19:05:08.279687', '2025-06-11 19:05:08.279687');
INSERT INTO public.limites VALUES (73, 6, 5, 2025, 17, 0, true, '2025-06-11 19:05:08.301166', '2025-06-11 19:05:08.301166');
INSERT INTO public.limites VALUES (74, 6, 6, 2025, 3, 0, true, '2025-06-11 19:05:08.317299', '2025-06-11 19:05:08.317299');
INSERT INTO public.limites VALUES (76, 6, 8, 2025, 180, 0, true, '2025-06-11 19:05:08.33896', '2025-06-11 19:05:08.33896');
INSERT INTO public.limites VALUES (77, 6, 9, 2025, 3, 0, true, '2025-06-11 19:05:08.350003', '2025-06-11 19:05:08.350003');
INSERT INTO public.limites VALUES (79, 6, 11, 2025, 15, 0, true, '2025-06-11 19:05:08.366851', '2025-06-11 19:05:08.366851');
INSERT INTO public.limites VALUES (80, 6, 12, 2025, 30, 0, true, '2025-06-11 19:05:08.374005', '2025-06-11 19:05:08.374005');
INSERT INTO public.limites VALUES (81, 6, 13, 2025, 10, 0, true, '2025-06-11 19:05:08.384147', '2025-06-11 19:05:08.384147');
INSERT INTO public.limites VALUES (82, 6, 14, 2025, 2, 0, true, '2025-06-11 19:05:08.393287', '2025-06-11 19:05:08.393287');
INSERT INTO public.limites VALUES (83, 6, 15, 2025, 2, 0, true, '2025-06-11 19:05:08.403337', '2025-06-11 19:05:08.403337');
INSERT INTO public.limites VALUES (85, 6, 17, 2025, 30, 0, true, '2025-06-11 19:05:08.421249', '2025-06-11 19:05:08.421249');
INSERT INTO public.limites VALUES (87, 7, 2, 2025, 5, 0, true, '2025-06-11 19:05:08.437732', '2025-06-11 19:05:08.437732');
INSERT INTO public.limites VALUES (88, 7, 3, 2025, 60, 0, true, '2025-06-11 19:05:08.445446', '2025-06-11 19:05:08.445446');
INSERT INTO public.limites VALUES (89, 7, 4, 2025, 365, 0, true, '2025-06-11 19:05:08.457849', '2025-06-11 19:05:08.457849');
INSERT INTO public.limites VALUES (90, 7, 5, 2025, 17, 0, true, '2025-06-11 19:05:08.466483', '2025-06-11 19:05:08.466483');
INSERT INTO public.limites VALUES (92, 7, 7, 2025, 112, 0, true, '2025-06-11 19:05:08.482656', '2025-06-11 19:05:08.482656');
INSERT INTO public.limites VALUES (93, 7, 8, 2025, 180, 0, true, '2025-06-11 19:05:08.491628', '2025-06-11 19:05:08.491628');
INSERT INTO public.limites VALUES (94, 7, 9, 2025, 3, 0, true, '2025-06-11 19:05:08.499881', '2025-06-11 19:05:08.499881');
INSERT INTO public.limites VALUES (95, 7, 10, 2025, 3, 0, true, '2025-06-11 19:05:08.507968', '2025-06-11 19:05:08.507968');
INSERT INTO public.limites VALUES (96, 7, 11, 2025, 15, 0, true, '2025-06-11 19:05:08.521881', '2025-06-11 19:05:08.521881');
INSERT INTO public.limites VALUES (97, 7, 12, 2025, 30, 0, true, '2025-06-11 19:05:08.532347', '2025-06-11 19:05:08.532347');
INSERT INTO public.limites VALUES (99, 7, 14, 2025, 2, 0, true, '2025-06-11 19:05:08.54895', '2025-06-11 19:05:08.54895');
INSERT INTO public.limites VALUES (100, 7, 15, 2025, 2, 0, true, '2025-06-11 19:05:08.562843', '2025-06-11 19:05:08.562843');
INSERT INTO public.limites VALUES (101, 7, 16, 2025, 3, 0, true, '2025-06-11 19:05:08.571228', '2025-06-11 19:05:08.571228');
INSERT INTO public.limites VALUES (103, 8, 1, 2025, 5, 0, true, '2025-06-11 19:05:08.588718', '2025-06-11 19:05:08.588718');
INSERT INTO public.limites VALUES (104, 8, 2, 2025, 5, 0, true, '2025-06-11 19:05:08.597556', '2025-06-11 19:05:08.597556');
INSERT INTO public.limites VALUES (105, 8, 3, 2025, 60, 0, true, '2025-06-11 19:05:08.609257', '2025-06-11 19:05:08.609257');
INSERT INTO public.limites VALUES (106, 8, 4, 2025, 365, 0, true, '2025-06-11 19:05:08.622587', '2025-06-11 19:05:08.622587');
INSERT INTO public.limites VALUES (13, 1, 13, 2025, 10, 39, true, '2025-06-11 19:05:07.639731', '2025-06-11 19:05:09.01698');
INSERT INTO public.limites VALUES (24, 2, 7, 2025, 112, 37, true, '2025-06-11 19:05:07.771211', '2025-06-11 19:05:09.064128');
INSERT INTO public.limites VALUES (34, 2, 17, 2025, 30, 74, true, '2025-06-11 19:05:07.882224', '2025-06-11 19:05:09.102075');
INSERT INTO public.limites VALUES (38, 3, 4, 2025, 365, 10, true, '2025-06-11 19:05:07.923996', '2025-06-11 19:05:09.14746');
INSERT INTO public.limites VALUES (37, 3, 3, 2025, 60, 78, true, '2025-06-11 19:05:07.913487', '2025-06-11 19:05:09.187892');
INSERT INTO public.limites VALUES (66, 4, 15, 2025, 2, 6, true, '2025-06-11 19:05:08.212777', '2025-06-11 19:05:09.231197');
INSERT INTO public.limites VALUES (62, 4, 11, 2025, 15, 150, true, '2025-06-11 19:05:08.16752', '2025-06-11 19:05:09.277434');
INSERT INTO public.limites VALUES (71, 6, 3, 2025, 60, 57, true, '2025-06-11 19:05:08.264997', '2025-06-11 19:05:09.309288');
INSERT INTO public.limites VALUES (84, 6, 16, 2025, 3, 22, true, '2025-06-11 19:05:08.411463', '2025-06-11 19:05:09.336644');
INSERT INTO public.limites VALUES (98, 7, 13, 2025, 10, 20, true, '2025-06-11 19:05:08.538965', '2025-06-11 19:05:09.394793');
INSERT INTO public.limites VALUES (8, 1, 8, 2025, 180, 112, true, '2025-06-11 19:05:07.57204', '2025-06-11 19:07:27.08563');
INSERT INTO public.limites VALUES (16, 1, 16, 2025, 3, 97, true, '2025-06-11 19:05:07.677937', '2025-06-11 19:07:27.117797');
INSERT INTO public.limites VALUES (26, 2, 9, 2025, 3, 105, true, '2025-06-11 19:05:07.79033', '2025-06-11 19:07:27.147605');
INSERT INTO public.limites VALUES (25, 2, 8, 2025, 180, 104, true, '2025-06-11 19:05:07.780076', '2025-06-11 19:07:27.170995');
INSERT INTO public.limites VALUES (39, 3, 5, 2025, 17, 59, true, '2025-06-11 19:05:07.933935', '2025-06-11 19:07:27.194089');
INSERT INTO public.limites VALUES (42, 3, 8, 2025, 180, 50, true, '2025-06-11 19:05:07.963822', '2025-06-11 19:07:27.216842');
INSERT INTO public.limites VALUES (59, 4, 8, 2025, 180, 123, true, '2025-06-11 19:05:08.141747', '2025-06-11 19:07:27.238933');
INSERT INTO public.limites VALUES (65, 4, 14, 2025, 2, 47, true, '2025-06-11 19:05:08.20042', '2025-06-11 19:07:27.263219');
INSERT INTO public.limites VALUES (78, 6, 10, 2025, 3, 59, true, '2025-06-11 19:05:08.358741', '2025-06-11 19:07:27.284969');
INSERT INTO public.limites VALUES (75, 6, 7, 2025, 112, 58, true, '2025-06-11 19:05:08.32855', '2025-06-11 19:07:27.306791');
INSERT INTO public.limites VALUES (86, 7, 1, 2025, 5, 4, true, '2025-06-11 19:05:08.429453', '2025-06-11 19:07:27.329608');
INSERT INTO public.limites VALUES (102, 7, 17, 2025, 30, 35, true, '2025-06-11 19:05:08.579085', '2025-06-11 19:07:27.351055');
INSERT INTO public.limites VALUES (107, 8, 5, 2025, 17, 131, true, '2025-06-11 19:05:08.636274', '2025-06-11 19:07:27.372692');
INSERT INTO public.limites VALUES (108, 8, 6, 2025, 3, 0, true, '2025-06-11 19:05:08.644869', '2025-06-11 19:05:08.644869');
INSERT INTO public.limites VALUES (109, 8, 7, 2025, 112, 0, true, '2025-06-11 19:05:08.653838', '2025-06-11 19:05:08.653838');
INSERT INTO public.limites VALUES (110, 8, 8, 2025, 180, 0, true, '2025-06-11 19:05:08.66217', '2025-06-11 19:05:08.66217');
INSERT INTO public.limites VALUES (112, 8, 10, 2025, 3, 0, true, '2025-06-11 19:05:08.674636', '2025-06-11 19:05:08.674636');
INSERT INTO public.limites VALUES (113, 8, 11, 2025, 15, 0, true, '2025-06-11 19:05:08.681568', '2025-06-11 19:05:08.681568');
INSERT INTO public.limites VALUES (114, 8, 12, 2025, 30, 0, true, '2025-06-11 19:05:08.688469', '2025-06-11 19:05:08.688469');
INSERT INTO public.limites VALUES (116, 8, 14, 2025, 2, 0, true, '2025-06-11 19:05:08.70055', '2025-06-11 19:05:08.70055');
INSERT INTO public.limites VALUES (117, 8, 15, 2025, 2, 0, true, '2025-06-11 19:05:08.708399', '2025-06-11 19:05:08.708399');
INSERT INTO public.limites VALUES (119, 8, 17, 2025, 30, 0, true, '2025-06-11 19:05:08.721678', '2025-06-11 19:05:08.721678');
INSERT INTO public.limites VALUES (120, 9, 1, 2025, 5, 0, true, '2025-06-11 19:05:08.727926', '2025-06-11 19:05:08.727926');
INSERT INTO public.limites VALUES (121, 9, 2, 2025, 5, 0, true, '2025-06-11 19:05:08.73538', '2025-06-11 19:05:08.73538');
INSERT INTO public.limites VALUES (122, 9, 3, 2025, 60, 0, true, '2025-06-11 19:05:08.741725', '2025-06-11 19:05:08.741725');
INSERT INTO public.limites VALUES (123, 9, 4, 2025, 365, 0, true, '2025-06-11 19:05:08.749011', '2025-06-11 19:05:08.749011');
INSERT INTO public.limites VALUES (124, 9, 5, 2025, 17, 0, true, '2025-06-11 19:05:08.757468', '2025-06-11 19:05:08.757468');
INSERT INTO public.limites VALUES (126, 9, 7, 2025, 112, 0, true, '2025-06-11 19:05:08.781387', '2025-06-11 19:05:08.781387');
INSERT INTO public.limites VALUES (127, 9, 8, 2025, 180, 0, true, '2025-06-11 19:05:08.788181', '2025-06-11 19:05:08.788181');
INSERT INTO public.limites VALUES (128, 9, 9, 2025, 3, 0, true, '2025-06-11 19:05:08.796126', '2025-06-11 19:05:08.796126');
INSERT INTO public.limites VALUES (129, 9, 10, 2025, 3, 0, true, '2025-06-11 19:05:08.804212', '2025-06-11 19:05:08.804212');
INSERT INTO public.limites VALUES (131, 9, 12, 2025, 30, 0, true, '2025-06-11 19:05:08.82646', '2025-06-11 19:05:08.82646');
INSERT INTO public.limites VALUES (133, 9, 14, 2025, 2, 0, true, '2025-06-11 19:05:08.844621', '2025-06-11 19:05:08.844621');
INSERT INTO public.limites VALUES (134, 9, 15, 2025, 2, 0, true, '2025-06-11 19:05:08.857474', '2025-06-11 19:05:08.857474');
INSERT INTO public.limites VALUES (135, 9, 16, 2025, 3, 0, true, '2025-06-11 19:05:08.879875', '2025-06-11 19:05:08.879875');
INSERT INTO public.limites VALUES (136, 9, 17, 2025, 30, 0, true, '2025-06-11 19:05:08.894316', '2025-06-11 19:05:08.894316');
INSERT INTO public.limites VALUES (2, 1, 2, 2025, 5, 83, true, '2025-06-11 19:05:07.506027', '2025-06-11 19:05:08.950516');
INSERT INTO public.limites VALUES (91, 7, 6, 2025, 3, 6, true, '2025-06-11 19:05:08.473011', '2025-06-11 19:05:09.364028');
INSERT INTO public.limites VALUES (118, 8, 16, 2025, 3, 63, true, '2025-06-11 19:05:08.716233', '2025-06-11 19:05:09.423742');
INSERT INTO public.limites VALUES (115, 8, 13, 2025, 10, 4, true, '2025-06-11 19:05:08.694668', '2025-06-11 19:05:09.447313');
INSERT INTO public.limites VALUES (125, 9, 6, 2025, 3, 99, true, '2025-06-11 19:05:08.770064', '2025-06-11 19:05:09.503381');
INSERT INTO public.limites VALUES (111, 8, 9, 2025, 3, 75, true, '2025-06-11 19:05:08.668713', '2025-06-11 19:07:27.395735');
INSERT INTO public.limites VALUES (132, 9, 13, 2025, 10, 154, true, '2025-06-11 19:05:08.834714', '2025-06-11 19:07:27.443536');
INSERT INTO public.limites VALUES (130, 9, 11, 2025, 15, 3, true, '2025-06-11 19:05:08.813444', '2025-06-11 19:07:27.489484');


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: movimientos_plan_trabajo; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: puestos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.puestos VALUES (1, 'MEDICO DE MEDICINA GENERAL', 'Atención médica general', true, '2025-06-11 18:57:54.692706', '2025-06-11 18:57:54.692706');
INSERT INTO public.puestos VALUES (2, 'AGENTE ATENCION AL USUARIO', 'Atención a usuarios en call center', true, '2025-06-11 18:57:54.703125', '2025-06-11 18:57:54.703125');
INSERT INTO public.puestos VALUES (3, 'ENFERMERO/A', 'Atención de enfermería', true, '2025-06-11 18:57:54.715204', '2025-06-11 18:57:54.715204');
INSERT INTO public.puestos VALUES (4, 'AUXILIAR ADMINISTRATIVO', 'Apoyo administrativo', true, '2025-06-11 18:57:54.724355', '2025-06-11 18:57:54.724355');
INSERT INTO public.puestos VALUES (5, 'JEFE DE RECURSOS HUMANOS', 'Jefatura de RRHH', true, '2025-06-11 18:57:54.734746', '2025-06-11 18:57:54.734746');
INSERT INTO public.puestos VALUES (6, 'QUIMICO DE LABORATORIO', 'Procesos de laboratorio clínico', true, '2025-06-11 18:57:54.744061', '2025-06-11 18:57:54.744061');
INSERT INTO public.puestos VALUES (7, 'FARMACEUTICO', 'Gestión de farmacia', true, '2025-06-11 18:57:54.755695', '2025-06-11 18:57:54.755695');
INSERT INTO public.puestos VALUES (10, 'Soporte Técnico ITcd', 'XDs', false, '2025-06-13 21:43:20.694418', '2025-06-13 21:44:31.511045');
INSERT INTO public.puestos VALUES (9, 'Soporte Técnico IT', 'XDs', false, '2025-06-13 21:43:17.18426', '2025-06-13 21:44:37.069986');
INSERT INTO public.puestos VALUES (8, 'Soporte Técnico IT', 'Soporte Técnico en todas las áreas', true, '2025-06-13 21:43:15.183393', '2025-06-13 21:45:39.394561');
INSERT INTO public.puestos VALUES (11, 'jljlkjk', '123123121111', false, '2025-06-15 06:46:43.273136', '2025-06-15 06:47:09.169529');


--
-- Data for Name: solicitudes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.solicitudes VALUES (74, 1, 8, '2025-06-19', '2026-03-20', '123', 'APROBADA', 275, 197, 275, true, '2025-06-19 08:32:24.929043', '2025-06-19 08:32:24.929043', NULL, NULL);
INSERT INTO public.solicitudes VALUES (73, 1, 13, '2025-06-19', '2025-06-26', '123', 'APROBADA', 8, 6, 8, true, '2025-06-19 08:29:40.639363', '2025-06-19 08:29:40.639363', NULL, NULL);


--
-- Data for Name: tipos_licencias; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tipos_licencias VALUES (1, 'vb100', 'permiso personal', 'permiso personal', 0, false, false, false, true, false, false, false, 'A', false, NULL, false, NULL, NULL, false, NULL, false, NULL, false, NULL, '2025-06-12 18:23:53.11865', '2025-06-13 20:23:47.897248', false, 'días', 'año');
INSERT INTO public.tipos_licencias VALUES (15, 'OLVIDO-SAL', 'Olvido de marcación de salida', 'Hasta 2 olvidos al mes. Registrar fecha del suceso, fecha de solicitud y fecha de aprobación.', 2, true, false, false, true, false, false, false, 'A', false, NULL, false, NULL, NULL, false, NULL, false, NULL, false, NULL, '2025-06-12 18:23:53.11865', '2025-06-18 23:56:22.657685', false, 'días', 'mes');
INSERT INTO public.tipos_licencias VALUES (4, 'ENFERMEDAD', 'Licencia por enfermedad (certificación médica)', 'De 1 a 3 días con goce, del 4to en adelante sin goce. Requiere certificación médica del ISSS.', 3, true, false, false, true, false, false, false, 'A', false, NULL, false, NULL, NULL, false, NULL, false, NULL, false, NULL, '2025-06-12 18:23:53.11865', '2025-06-14 02:57:48.120902', true, 'días', 'ninguno');
INSERT INTO public.tipos_licencias VALUES (14, 'OLVIDO-ENT', 'Olvido de marcación', 'Hasta 2 olvidos al mes. Registrar fecha del suceso, fecha de solicitud y fecha de aprobación.', 2, true, false, false, true, false, false, false, 'A', false, 0, false, 0, 0, false, '{}', false, '{}', false, '{}', '2025-06-12 18:23:53.11865', '2025-06-19 02:23:42.672633', true, 'días', 'mes');
INSERT INTO public.tipos_licencias VALUES (3, 'PER-SIN-GO', 'Permiso personal sin goce de salario', 'Hasta 60 días anuales. A discreción de la jefatura, siempre que el servicio no quede descubierto. Solicitar con anticipación.', 480, true, false, false, false, false, false, false, 'A', false, 0, false, 0, 0, false, '{}', false, '{}', false, '{}', '2025-06-12 18:23:53.11865', '2025-06-19 02:54:15.628281', true, 'horas', 'año');
INSERT INTO public.tipos_licencias VALUES (5, 'ENF-GRAVE-', 'Licencia por enfermedad gravísima de pariente', 'Hasta 17 días anuales. Solo para parientes en primer grado de afinidad. Requiere certificación médica y documento de parentesco.', 17, true, false, false, true, false, false, false, 'A', false, NULL, false, NULL, NULL, false, NULL, false, NULL, false, NULL, '2025-06-12 18:23:53.11865', '2025-06-14 02:58:51.559722', true, 'días', 'año');
INSERT INTO public.tipos_licencias VALUES (6, 'DUELO', 'Licencia por duelo', '3 días por fallecimiento de pariente en primer grado de afinidad. Requiere partida de defunción y documento de parentesco.', 3, true, true, false, true, false, false, false, 'A', false, 0, false, 0, 0, false, '{}', false, '{}', false, '{}', '2025-06-12 18:23:53.11865', '2025-06-15 06:42:19.988048', true, 'días', 'ninguno');
INSERT INTO public.tipos_licencias VALUES (7, 'MATERNIDAD', 'Licencia por maternidad', '112 días por parto. Puede ser 30 días antes y 82 después, o 112 días desde el parto. Requiere certificación médica.', 112, true, false, true, true, false, false, true, 'F', false, 0, false, 0, 0, false, '{}', false, '{}', false, '{}', '2025-06-12 18:23:53.11865', '2025-06-15 06:36:57.446783', true, 'días', 'ninguno');
INSERT INTO public.tipos_licencias VALUES (18, 'TIEMPO-IND', 'Licencia de Tiempo Indefinido', 'Licencia sin límite de tiempo para casos especiales', 0, true, false, false, true, false, false, false, 'A', false, NULL, false, NULL, NULL, false, NULL, false, NULL, false, NULL, '2025-06-19 08:18:04.818503', '2025-06-19 08:58:18.177847', false, 'días', 'ninguno');
INSERT INTO public.tipos_licencias VALUES (8, 'LACTANCIA', 'Licencia por lactancia materna', '6 meses a partir del nacimiento. 1 hora diaria (puede fraccionarse). Requiere carta solicitud y partida de nacimiento.', 180, true, false, false, true, false, false, true, 'F', false, 0, false, 0, 0, false, '{}', false, '{}', false, '{}', '2025-06-12 18:23:53.11865', '2025-06-15 06:28:51.661476', true, 'días', 'ninguno');
INSERT INTO public.tipos_licencias VALUES (9, 'PATERNIDAD', 'Licencia por paternidad, nacimiento o adopción', '3 días por nacimiento o adopción. Requiere partida de nacimiento o sentencia de adopción.', 3, true, false, true, true, false, false, true, 'M', false, 0, false, 0, 0, false, '{}', false, '{}', false, '{}', '2025-06-12 18:23:53.11865', '2025-06-15 06:41:08.467142', true, 'días', 'ninguno');
INSERT INTO public.tipos_licencias VALUES (10, 'MATRIMONIO', 'Permiso por matrimonio', '3 días. Requiere certificación de matrimonio o partida de nacimiento con marginación.', 3, true, false, false, true, false, false, false, 'A', false, NULL, false, NULL, NULL, false, NULL, false, NULL, false, NULL, '2025-06-12 18:23:53.11865', '2025-06-16 21:06:18.659974', true, 'días', 'ninguno');
INSERT INTO public.tipos_licencias VALUES (11, 'VACACIONES', 'Licencia por vacaciones anuales', '15 días para personal operativo. Personal administrativo en dos periodos. Requiere control de licencia.', 15, true, false, false, true, false, false, false, 'A', false, NULL, false, NULL, NULL, false, NULL, false, NULL, false, NULL, '2025-06-12 18:23:53.11865', '2025-06-14 02:59:57.284337', true, 'días', 'año');
INSERT INTO public.tipos_licencias VALUES (2, 'PER-GOCE', 'Permiso personal con goce de salario', 'Hasta 5 días anuales. A discreción de la jefatura, siempre que el servicio no quede descubierto. Puede ser media jornada o jornada completa.', 40, true, false, false, true, false, false, false, 'A', false, 0, false, 0, 0, false, '{}', false, '{}', false, '{}', '2025-06-12 18:23:53.11865', '2025-06-16 21:00:25.95575', true, 'horas', 'año');
INSERT INTO public.tipos_licencias VALUES (12, 'JRV', 'Permiso por cargo en juntas receptoras de votos', 'El tiempo que solicite el organismo electoral. Requiere certificación del Tribunal Supremo Electoral.', 0, true, false, false, true, false, false, false, 'A', false, NULL, false, NULL, NULL, false, NULL, false, NULL, false, NULL, '2025-06-12 18:23:53.11865', '2025-06-12 18:23:53.11865', true, 'días', 'ninguno');
INSERT INTO public.tipos_licencias VALUES (13, 'JURADO', 'Permiso por ser llamado a conformar jurado', 'El tiempo que dure la audiencia. Requiere citación del juzgado y constancia de permanencia.', 0, true, false, false, true, false, false, false, 'A', false, NULL, false, NULL, NULL, false, NULL, false, NULL, false, NULL, '2025-06-12 18:23:53.11865', '2025-06-12 18:23:53.11865', true, 'días', 'ninguno');
INSERT INTO public.tipos_licencias VALUES (16, 'CAMBIO-TUR', 'Cambio de turno', 'Hasta 3 cambios de turno al mes. Requiere autorización de la jefatura.', 3, true, false, false, true, false, false, false, 'A', false, 0, false, 0, 0, false, '{}', false, '{}', false, '{}', '2025-06-12 18:23:53.11865', '2025-06-15 06:28:38.335368', true, 'días', 'mes');
INSERT INTO public.tipos_licencias VALUES (17, 'MOV-PLAN-T', 'Movimiento de recurso humano en plan de trabajo mensual', 'Según necesidad del servicio. Requiere justificación y comunicación a Talento Humano.', 0, true, false, false, true, false, false, false, 'A', false, NULL, false, NULL, NULL, false, NULL, false, NULL, false, NULL, '2025-06-12 18:23:53.11865', '2025-06-12 18:23:53.11865', true, 'días', 'ninguno');


--
-- Data for Name: trabajadores; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.trabajadores VALUES (1, 'T001', 'PLATERO DIAZ ZOILA ALEXANDRA', 'zoila.platero@ejemplo.com', '796583939', 1, 1, 'OPERATIVO', '2025-03-04', true, '2025-06-11 19:00:15.365024', '2025-06-11 19:00:15.365024');
INSERT INTO public.trabajadores VALUES (2, 'T002', 'LOPEZ HUEZO YENICEL ZOBEYDA', 'yenicel.lopez@ejemplo.com', '774770909', 1, 1, 'OPERATIVO', '2025-03-04', true, '2025-06-11 19:00:15.3934', '2025-06-11 19:00:15.3934');
INSERT INTO public.trabajadores VALUES (3, 'T003', 'NAVAS DELGADO DANIEL ERNESTO', 'daniel.navas@ejemplo.com', '764238995', 2, 2, 'OPERATIVO', '2025-02-24', true, '2025-06-11 19:00:15.405109', '2025-06-11 19:00:15.405109');
INSERT INTO public.trabajadores VALUES (6, 'T005', 'RAMIREZ PEREZ ANA SOFIA', 'sofia.ramirez@ejemplo.com', '729699642', 4, 4, 'ADMINISTRATIVO', '2025-01-10', true, '2025-06-11 19:01:40.775709', '2025-06-11 19:01:40.775709');
INSERT INTO public.trabajadores VALUES (7, 'T006', 'CASTILLO MENDEZ JORGE ENRIQUE', 'enrique.castillo@ejemplo.com', '748647046', 5, 5, 'ADMINISTRATIVO', '2024-12-01', true, '2025-06-11 19:01:40.792031', '2025-06-11 19:01:40.792031');
INSERT INTO public.trabajadores VALUES (9, 'T008', 'GONZALEZ RIVERA SANDRA ELENA', 'elena.gonzalez@ejemplo.com', '716864878', 7, 7, 'OPERATIVO', '2025-02-20', true, '2025-06-11 19:01:40.815624', '2025-06-11 19:01:40.815624');
INSERT INTO public.trabajadores VALUES (4, 'T004', 'MARTINEZ GARCIA LUIS ALBERTO', '@ejemplo.com', '513348611', 3, 3, 'OPERATIVO', '2024-11-15', true, '2025-06-11 19:00:15.415606', '2025-06-14 08:07:01.214193');
INSERT INTO public.trabajadores VALUES (8, 'T007', 'MENDEZ LOPEZ MARIA JOSE', 'jose.mendez@ejemplo.es', '752284372', 6, 6, 'OPERATIVO', '2025-03-01', true, '2025-06-11 19:01:40.803917', '2025-06-14 08:17:45.092606');
INSERT INTO public.trabajadores VALUES (11, 'VB100222', 'Rodolfo VARGAS', 'rodolfovargas@gmail.com', '77889944', 2, 3, 'OPERATIVO', '2025-06-17', true, '2025-06-15 05:59:37.501875', '2025-06-18 07:37:12.60179');
INSERT INTO public.trabajadores VALUES (10, 'XXXXX', 'example', 'example@example.com', '77889944', 4, 3, 'ADMINISTRATIVO', '2025-06-18', false, '2025-06-15 05:46:20.696172', '2025-06-18 07:38:11.21827');
INSERT INTO public.trabajadores VALUES (12, 'EMP001', 'Juan Pérez', 'juan.perez@empresa.com', '123456789', 4, 3, 'ADMINISTRATIVO', '2024-01-15', true, '2025-06-19 09:41:52.068761', '2025-06-19 09:43:06.2465');
INSERT INTO public.trabajadores VALUES (13, 'EMP002', 'María García', 'maria.garcia@empresa.com', '987654321', 4, 4, 'OPERATIVO', '2024-02-01', true, '2025-06-19 09:41:52.23438', '2025-06-19 09:43:26.537497');


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: validaciones; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: auditoria_solicitudes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auditoria_solicitudes_id_seq', 1, false);


--
-- Name: control_limites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.control_limites_id_seq', 1, true);


--
-- Name: departamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departamentos_id_seq', 9, true);


--
-- Name: disponibilidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.disponibilidad_id_seq', 200, true);


--
-- Name: documentos_licencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documentos_licencia_id_seq', 1, false);


--
-- Name: historico_uso_licencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.historico_uso_licencias_id_seq', 1, false);


--
-- Name: licencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.licencias_id_seq', 71, true);


--
-- Name: limites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.limites_id_seq', 136, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, false);


--
-- Name: movimientos_plan_trabajo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.movimientos_plan_trabajo_id_seq', 1, false);


--
-- Name: puestos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.puestos_id_seq', 11, true);


--
-- Name: solicitudes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.solicitudes_id_seq', 74, true);


--
-- Name: tipos_licencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tipos_licencias_id_seq', 18, true);


--
-- Name: trabajadores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.trabajadores_id_seq', 13, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- Name: validaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.validaciones_id_seq', 34, true);


--
-- Name: documentos_licencia PK_00434a6c6be9d34478c57b41e38; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_licencia
    ADD CONSTRAINT "PK_00434a6c6be9d34478c57b41e38" PRIMARY KEY (id);


--
-- Name: tipos_licencias PK_1ef9dfdb2fb96b0135456c85355; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_licencias
    ADD CONSTRAINT "PK_1ef9dfdb2fb96b0135456c85355" PRIMARY KEY (id);


--
-- Name: historico_uso_licencias PK_39be2713f097f498d5db2c984ef; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_uso_licencias
    ADD CONSTRAINT "PK_39be2713f097f498d5db2c984ef" PRIMARY KEY (id);


--
-- Name: validaciones PK_4fee55accb57dbba833074a5676; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.validaciones
    ADD CONSTRAINT "PK_4fee55accb57dbba833074a5676" PRIMARY KEY (id);


--
-- Name: control_limites PK_52f110c8ed786b6fe52c282bce9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.control_limites
    ADD CONSTRAINT "PK_52f110c8ed786b6fe52c282bce9" PRIMARY KEY (id);


--
-- Name: trabajadores PK_572c7e550b3d755a9826d4a5daa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT "PK_572c7e550b3d755a9826d4a5daa" PRIMARY KEY (id);


--
-- Name: licencias PK_64887873ca21b742943e83c21ce; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT "PK_64887873ca21b742943e83c21ce" PRIMARY KEY (id);


--
-- Name: limites PK_6baa0587872d6c28a253f013360; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.limites
    ADD CONSTRAINT "PK_6baa0587872d6c28a253f013360" PRIMARY KEY (id);


--
-- Name: departamentos PK_6d34dc0415358a018818c683c1e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT "PK_6d34dc0415358a018818c683c1e" PRIMARY KEY (id);


--
-- Name: puestos PK_76f2abcffc72ffe8f01c46384b4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.puestos
    ADD CONSTRAINT "PK_76f2abcffc72ffe8f01c46384b4" PRIMARY KEY (id);


--
-- Name: movimientos_plan_trabajo PK_8c4c799db413f762bdc00ed6e1a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_plan_trabajo
    ADD CONSTRAINT "PK_8c4c799db413f762bdc00ed6e1a" PRIMARY KEY (id);


--
-- Name: solicitudes PK_8c7e99758c774b801853b538647; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT "PK_8c7e99758c774b801853b538647" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: auditoria_solicitudes PK_9f682e5afe4b623f77c6d23e45d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_solicitudes
    ADD CONSTRAINT "PK_9f682e5afe4b623f77c6d23e45d" PRIMARY KEY (id);


--
-- Name: disponibilidad PK_cf70782622171aeff5a7825726a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad
    ADD CONSTRAINT "PK_cf70782622171aeff5a7825726a" PRIMARY KEY (id);


--
-- Name: usuarios PK_d7281c63c176e152e4c531594a8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY (id);


--
-- Name: usuarios UQ_185ded9881a8bce38274b40faef; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_185ded9881a8bce38274b40faef" UNIQUE (codigo);


--
-- Name: usuarios UQ_446adfc18b35418aac32ae0b7b5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE (email);


--
-- Name: trabajadores UQ_6df3beb5b00bdd2582f17fd4503; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT "UQ_6df3beb5b00bdd2582f17fd4503" UNIQUE (codigo);


--
-- Name: trabajadores UQ_a8d7663819bfb5243cf880945a0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT "UQ_a8d7663819bfb5243cf880945a0" UNIQUE (email);


--
-- Name: licencias UQ_b132b85329b81a7ee93a0ae4834; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT "UQ_b132b85329b81a7ee93a0ae4834" UNIQUE (solicitud_id);


--
-- Name: tipos_licencias UQ_d53805b06bb0dfc3c3fc72da5a2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_licencias
    ADD CONSTRAINT "UQ_d53805b06bb0dfc3c3fc72da5a2" UNIQUE (codigo);


--
-- Name: tipos_licencias tipos_licencias_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tipos_licencias
    ADD CONSTRAINT tipos_licencias_codigo_key UNIQUE (codigo);


--
-- Name: limites FK_1d8a8afdcc54e513b4799feb468; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.limites
    ADD CONSTRAINT "FK_1d8a8afdcc54e513b4799feb468" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: solicitudes FK_2378c43ebba83808495d4a3df4a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT "FK_2378c43ebba83808495d4a3df4a" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: trabajadores FK_23f39237b68a78774309cb28180; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT "FK_23f39237b68a78774309cb28180" FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id);


--
-- Name: solicitudes FK_2af6edc98b389b5ed366c5278a1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT "FK_2af6edc98b389b5ed366c5278a1" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: auditoria_solicitudes FK_315f62ec784cd7551fc68b1a1b1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_solicitudes
    ADD CONSTRAINT "FK_315f62ec784cd7551fc68b1a1b1" FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id);


--
-- Name: limites FK_365de3a97cd1ca51e2f7f98b361; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.limites
    ADD CONSTRAINT "FK_365de3a97cd1ca51e2f7f98b361" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: control_limites FK_86aab94bb68f8c23c656d2d085a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.control_limites
    ADD CONSTRAINT "FK_86aab94bb68f8c23c656d2d085a" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: licencias FK_8a164118511e12b3b851d2b9c8d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT "FK_8a164118511e12b3b851d2b9c8d" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: licencias FK_94a5bd1bfdc5870e21e6b50ef35; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT "FK_94a5bd1bfdc5870e21e6b50ef35" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: validaciones FK_9982876421e5607c7c8ad021e75; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.validaciones
    ADD CONSTRAINT "FK_9982876421e5607c7c8ad021e75" FOREIGN KEY (validado_por) REFERENCES public.trabajadores(id);


--
-- Name: historico_uso_licencias FK_9c070a6ebf75cb8b50724d1e45a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_uso_licencias
    ADD CONSTRAINT "FK_9c070a6ebf75cb8b50724d1e45a" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: validaciones FK_a2161fac1f186292321f6561362; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.validaciones
    ADD CONSTRAINT "FK_a2161fac1f186292321f6561362" FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id);


--
-- Name: disponibilidad FK_ac5e84c0979ec30775433d31e5a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad
    ADD CONSTRAINT "FK_ac5e84c0979ec30775433d31e5a" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: disponibilidad FK_ad7c90166a58ef91d4b5ec60e84; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidad
    ADD CONSTRAINT "FK_ad7c90166a58ef91d4b5ec60e84" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: licencias FK_b132b85329b81a7ee93a0ae4834; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT "FK_b132b85329b81a7ee93a0ae4834" FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id);


--
-- Name: usuarios FK_b2ee5fc664e7dfbd50181dad454; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "FK_b2ee5fc664e7dfbd50181dad454" FOREIGN KEY (puesto_id) REFERENCES public.puestos(id);


--
-- Name: historico_uso_licencias FK_b568f2ca85225df52799c295fdc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_uso_licencias
    ADD CONSTRAINT "FK_b568f2ca85225df52799c295fdc" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: usuarios FK_be2e056fe966e6c0cd5347c4efc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "FK_be2e056fe966e6c0cd5347c4efc" FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id);


--
-- Name: movimientos_plan_trabajo FK_c0b77e830f20c258d327bb5219c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_plan_trabajo
    ADD CONSTRAINT "FK_c0b77e830f20c258d327bb5219c" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: auditoria_solicitudes FK_c53c2a2c6db38a5b27244863a7c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_solicitudes
    ADD CONSTRAINT "FK_c53c2a2c6db38a5b27244863a7c" FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: control_limites FK_c87650e0b4239d81808f2433da5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.control_limites
    ADD CONSTRAINT "FK_c87650e0b4239d81808f2433da5" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: trabajadores FK_d1d14644d8032318cc6fb0d81ec; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT "FK_d1d14644d8032318cc6fb0d81ec" FOREIGN KEY (puesto_id) REFERENCES public.puestos(id);


--
-- Name: documentos_licencia FK_d1fc211dc4754072165e68e6eac; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_licencia
    ADD CONSTRAINT "FK_d1fc211dc4754072165e68e6eac" FOREIGN KEY (licencia_id) REFERENCES public.licencias(id);


--
-- Name: movimientos_plan_trabajo FK_ec2e92002924698164a06bbe635; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_plan_trabajo
    ADD CONSTRAINT "FK_ec2e92002924698164a06bbe635" FOREIGN KEY (registrado_por) REFERENCES public.usuarios(id);


--
-- Name: historico_uso_licencias FK_f078c5f6b572283802b3f2265f1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_uso_licencias
    ADD CONSTRAINT "FK_f078c5f6b572283802b3f2265f1" FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id);


--
-- PostgreSQL database dump complete
--

