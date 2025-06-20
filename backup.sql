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
-- Name: auditoria_solicitudes_estado_anterior_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.auditoria_solicitudes_estado_anterior_enum AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA',
    'CANCELADA'
);


ALTER TYPE public.auditoria_solicitudes_estado_anterior_enum OWNER TO postgres;

--
-- Name: auditoria_solicitudes_estado_nuevo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.auditoria_solicitudes_estado_nuevo_enum AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA',
    'CANCELADA'
);


ALTER TYPE public.auditoria_solicitudes_estado_nuevo_enum OWNER TO postgres;

--
-- Name: historico_uso_licencias_unidad_disponibilidad_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.historico_uso_licencias_unidad_disponibilidad_enum AS ENUM (
    'HORAS',
    'DIAS',
    'VECES',
    'CAMBIOS'
);


ALTER TYPE public.historico_uso_licencias_unidad_disponibilidad_enum OWNER TO postgres;

--
-- Name: licencias_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.licencias_estado_enum AS ENUM (
    'ACTIVA',
    'FINALIZADA',
    'CANCELADA'
);


ALTER TYPE public.licencias_estado_enum OWNER TO postgres;

--
-- Name: licencias_tipo_olvido_marcacion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.licencias_tipo_olvido_marcacion_enum AS ENUM (
    'ENTRADA',
    'SALIDA'
);


ALTER TYPE public.licencias_tipo_olvido_marcacion_enum OWNER TO postgres;

--
-- Name: solicitudes_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.solicitudes_estado_enum AS ENUM (
    'PENDIENTE',
    'APROBADA',
    'RECHAZADA',
    'CANCELADA'
);


ALTER TYPE public.solicitudes_estado_enum OWNER TO postgres;

--
-- Name: solicitudes_tipo_olvido_marcacion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.solicitudes_tipo_olvido_marcacion_enum AS ENUM (
    'ENTRADA',
    'SALIDA'
);


ALTER TYPE public.solicitudes_tipo_olvido_marcacion_enum OWNER TO postgres;

--
-- Name: tipos_licencias_genero_aplicable_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipos_licencias_genero_aplicable_enum AS ENUM (
    'M',
    'F',
    'A'
);


ALTER TYPE public.tipos_licencias_genero_aplicable_enum OWNER TO postgres;

--
-- Name: tipos_licencias_periodo_control_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipos_licencias_periodo_control_enum AS ENUM (
    'mes',
    'año',
    'ninguno'
);


ALTER TYPE public.tipos_licencias_periodo_control_enum OWNER TO postgres;

--
-- Name: tipos_licencias_unidad_control_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipos_licencias_unidad_control_enum AS ENUM (
    'horas',
    'días',
    'ninguno'
);


ALTER TYPE public.tipos_licencias_unidad_control_enum OWNER TO postgres;

--
-- Name: trabajadores_tipo_personal_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.trabajadores_tipo_personal_enum AS ENUM (
    'OPERATIVO',
    'ADMINISTRATIVO'
);


ALTER TYPE public.trabajadores_tipo_personal_enum OWNER TO postgres;

--
-- Name: validaciones_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.validaciones_estado_enum AS ENUM (
    'PENDIENTE',
    'APROBADO',
    'RECHAZADO'
);


ALTER TYPE public.validaciones_estado_enum OWNER TO postgres;

--
-- Name: actualizar_control_limites(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.actualizar_control_limites() OWNER TO postgres;

--
-- Name: actualizar_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_updated_at() OWNER TO postgres;

--
-- Name: estadisticas_tiempo_respuesta(date, date); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.estadisticas_tiempo_respuesta(p_fecha_inicio date, p_fecha_fin date) OWNER TO postgres;

--
-- Name: trigger_auditoria_solicitudes(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.trigger_auditoria_solicitudes() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: validar_anticipacion_licencia(integer, timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.validar_anticipacion_licencia(p_tipo_licencia_id integer, p_fecha_solicitud timestamp without time zone, p_fecha_inicio_permiso timestamp without time zone) OWNER TO postgres;

--
-- Name: validar_limites_licencia(integer, integer, timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.validar_limites_licencia(p_trabajador_id integer, p_tipo_licencia_id integer, p_fecha_inicio timestamp without time zone, p_fecha_fin timestamp without time zone) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auditoria_solicitudes; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.auditoria_solicitudes OWNER TO postgres;

--
-- Name: auditoria_solicitudes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_solicitudes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_solicitudes_id_seq OWNER TO postgres;

--
-- Name: auditoria_solicitudes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_solicitudes_id_seq OWNED BY public.auditoria_solicitudes.id;


--
-- Name: control_limites; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.control_limites OWNER TO postgres;

--
-- Name: control_limites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.control_limites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.control_limites_id_seq OWNER TO postgres;

--
-- Name: control_limites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.control_limites_id_seq OWNED BY public.control_limites.id;


--
-- Name: departamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departamentos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.departamentos OWNER TO postgres;

--
-- Name: departamentos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departamentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departamentos_id_seq OWNER TO postgres;

--
-- Name: departamentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departamentos_id_seq OWNED BY public.departamentos.id;


--
-- Name: disponibilidad; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.disponibilidad OWNER TO postgres;

--
-- Name: disponibilidad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.disponibilidad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.disponibilidad_id_seq OWNER TO postgres;

--
-- Name: disponibilidad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.disponibilidad_id_seq OWNED BY public.disponibilidad.id;


--
-- Name: documentos_licencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documentos_licencia (
    id integer NOT NULL,
    licencia_id integer NOT NULL,
    tipo_documento character varying(100) NOT NULL,
    url_archivo text NOT NULL,
    descripcion text,
    fecha_subida timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documentos_licencia OWNER TO postgres;

--
-- Name: documentos_licencia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.documentos_licencia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documentos_licencia_id_seq OWNER TO postgres;

--
-- Name: documentos_licencia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.documentos_licencia_id_seq OWNED BY public.documentos_licencia.id;


--
-- Name: historico_uso_licencias; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.historico_uso_licencias OWNER TO postgres;

--
-- Name: historico_uso_licencias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historico_uso_licencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historico_uso_licencias_id_seq OWNER TO postgres;

--
-- Name: historico_uso_licencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historico_uso_licencias_id_seq OWNED BY public.historico_uso_licencias.id;


--
-- Name: licencias; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.licencias OWNER TO postgres;

--
-- Name: licencias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.licencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.licencias_id_seq OWNER TO postgres;

--
-- Name: licencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.licencias_id_seq OWNED BY public.licencias.id;


--
-- Name: limites; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.limites OWNER TO postgres;

--
-- Name: limites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.limites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.limites_id_seq OWNER TO postgres;

--
-- Name: limites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.limites_id_seq OWNED BY public.limites.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: movimientos_plan_trabajo; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.movimientos_plan_trabajo OWNER TO postgres;

--
-- Name: movimientos_plan_trabajo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_plan_trabajo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimientos_plan_trabajo_id_seq OWNER TO postgres;

--
-- Name: movimientos_plan_trabajo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_plan_trabajo_id_seq OWNED BY public.movimientos_plan_trabajo.id;


--
-- Name: puestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puestos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.puestos OWNER TO postgres;

--
-- Name: puestos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.puestos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.puestos_id_seq OWNER TO postgres;

--
-- Name: puestos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.puestos_id_seq OWNED BY public.puestos.id;


--
-- Name: solicitudes; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.solicitudes OWNER TO postgres;

--
-- Name: solicitudes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitudes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitudes_id_seq OWNER TO postgres;

--
-- Name: solicitudes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitudes_id_seq OWNED BY public.solicitudes.id;


--
-- Name: tipos_licencias; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.tipos_licencias OWNER TO postgres;

--
-- Name: tipos_licencias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipos_licencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_licencias_id_seq OWNER TO postgres;

--
-- Name: tipos_licencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_licencias_id_seq OWNED BY public.tipos_licencias.id;


--
-- Name: trabajadores; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.trabajadores OWNER TO postgres;

--
-- Name: trabajadores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trabajadores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trabajadores_id_seq OWNER TO postgres;

--
-- Name: trabajadores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trabajadores_id_seq OWNED BY public.trabajadores.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: validaciones; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.validaciones OWNER TO postgres;

--
-- Name: validaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.validaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.validaciones_id_seq OWNER TO postgres;

--
-- Name: validaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.validaciones_id_seq OWNED BY public.validaciones.id;


--
-- Name: auditoria_solicitudes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_solicitudes ALTER COLUMN id SET DEFAULT nextval('public.auditoria_solicitudes_id_seq'::regclass);


--
-- Name: control_limites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.control_limites ALTER COLUMN id SET DEFAULT nextval('public.control_limites_id_seq'::regclass);


--
-- Name: departamentos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos ALTER COLUMN id SET DEFAULT nextval('public.departamentos_id_seq'::regclass);


--
-- Name: disponibilidad id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disponibilidad ALTER COLUMN id SET DEFAULT nextval('public.disponibilidad_id_seq'::regclass);


--
-- Name: documentos_licencia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_licencia ALTER COLUMN id SET DEFAULT nextval('public.documentos_licencia_id_seq'::regclass);


--
-- Name: historico_uso_licencias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_uso_licencias ALTER COLUMN id SET DEFAULT nextval('public.historico_uso_licencias_id_seq'::regclass);


--
-- Name: licencias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licencias ALTER COLUMN id SET DEFAULT nextval('public.licencias_id_seq'::regclass);


--
-- Name: limites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.limites ALTER COLUMN id SET DEFAULT nextval('public.limites_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: movimientos_plan_trabajo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_plan_trabajo ALTER COLUMN id SET DEFAULT nextval('public.movimientos_plan_trabajo_id_seq'::regclass);


--
-- Name: puestos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puestos ALTER COLUMN id SET DEFAULT nextval('public.puestos_id_seq'::regclass);


--
-- Name: solicitudes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_id_seq'::regclass);


--
-- Name: tipos_licencias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_licencias ALTER COLUMN id SET DEFAULT nextval('public.tipos_licencias_id_seq'::regclass);


--
-- Name: trabajadores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trabajadores ALTER COLUMN id SET DEFAULT nextval('public.trabajadores_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: validaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.validaciones ALTER COLUMN id SET DEFAULT nextval('public.validaciones_id_seq'::regclass);


--
-- Data for Name: auditoria_solicitudes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria_solicitudes (id, solicitud_id, estado_anterior, estado_nuevo, motivo_cambio, usuario_id, fecha_cambio, detalles_cambio) FROM stdin;
\.


--
-- Data for Name: control_limites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.control_limites (id, trabajador_id, tipo_licencia_id, anio, dias_totales, dias_utilizados, dias_disponibles, activo, fecha_creacion, fecha_actualizacion, mes, horas_utilizadas, cantidad_utilizada) FROM stdin;
\.


--
-- Data for Name: departamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departamentos (id, nombre, descripcion, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	MEDICOS	Departamento de médicos	t	2025-06-11 18:57:54.557774	2025-06-11 18:57:54.557774
2	CALL CENTER	Departamento de atención telefónica	t	2025-06-11 18:57:54.588755	2025-06-11 18:57:54.588755
3	ENFERMERÍA	Departamento de enfermería	t	2025-06-11 18:57:54.607441	2025-06-11 18:57:54.607441
4	ADMINISTRACIÓN	Departamento administrativo	t	2025-06-11 18:57:54.630259	2025-06-11 18:57:54.630259
5	RECURSOS HUMANOS	Departamento de RRHH	t	2025-06-11 18:57:54.651852	2025-06-11 18:57:54.651852
6	LABORATORIO	Departamento de laboratorio clínico	t	2025-06-11 18:57:54.669086	2025-06-11 18:57:54.669086
7	FARMACIA	Departamento de farmacia	t	2025-06-11 18:57:54.682542	2025-06-11 18:57:54.682542
8	DEPARTAMENTO IT	Departamento de Soporte Técnico	t	2025-06-13 20:29:01.596728	2025-06-13 20:32:20.847558
9	ddd	dddd123	f	2025-06-15 06:44:30.808901	2025-06-15 06:44:40.97445
\.


--
-- Data for Name: disponibilidad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disponibilidad (id, trabajador_id, fecha_creacion, fecha_actualizacion, tipo_licencia_id, dias_disponibles, dias_usados, dias_restantes, activo) FROM stdin;
4	1	2025-06-13 23:12:34.407546	2025-06-19 06:45:42.441346	14	2	0	2	t
3	1	2025-06-13 23:12:34.406028	2025-06-14 04:54:28.570692	5	17	0	17	t
19	2	2025-06-14 04:46:33.797702	2025-06-18 07:11:41.664349	17	0	0	0	t
5	1	2025-06-13 23:12:34.409121	2025-06-18 05:02:40.235203	15	2	0	2	t
11	1	2025-06-13 23:12:34.453299	2025-06-18 07:20:08.139861	6	3	0	3	t
9	1	2025-06-13 23:12:34.447933	2025-06-14 04:54:28.612849	7	112	0	112	t
7	1	2025-06-13 23:12:34.417147	2025-06-13 23:12:34.519075	17	0	0	0	t
8	1	2025-06-13 23:12:34.424863	2025-06-13 23:12:34.520393	12	0	0	0	t
39	3	2025-06-14 04:46:33.909761	2025-06-14 07:56:53.54001	5	17	59	-42	t
6	1	2025-06-13 23:12:34.411546	2025-06-18 20:04:39.124805	16	3	0	3	t
12	1	2025-06-13 23:12:34.455927	2025-06-14 04:54:28.641586	4	3	0	3	t
16	1	2025-06-13 23:12:34.46017	2025-06-19 08:29:40.767896	13	0	8	0	t
14	1	2025-06-13 23:12:34.458305	2025-06-14 04:54:28.660761	9	3	0	3	t
15	1	2025-06-13 23:12:34.459541	2025-06-14 04:54:28.668864	11	15	0	15	t
21	2	2025-06-14 04:46:33.809005	2025-06-18 07:20:16.320759	6	3	0	3	t
30	2	2025-06-14 04:46:33.855349	2025-06-19 03:03:09.640853	2	40	0	40	t
17	2	2025-06-14 04:46:33.775313	2025-06-14 04:46:33.775313	12	0	0	0	t
18	2	2025-06-14 04:46:33.792113	2025-06-14 04:46:33.792113	13	0	0	0	t
20	2	2025-06-14 04:46:33.803586	2025-06-14 04:46:33.803586	16	3	0	3	t
22	2	2025-06-14 04:46:33.813896	2025-06-14 04:46:33.813896	4	3	0	3	t
23	2	2025-06-14 04:46:33.818689	2025-06-14 04:46:33.818689	5	17	0	17	t
27	2	2025-06-14 04:46:33.84016	2025-06-14 04:46:33.84016	11	15	0	15	t
28	2	2025-06-14 04:46:33.845042	2025-06-14 04:46:33.845042	14	2	0	2	t
29	2	2025-06-14 04:46:33.850269	2025-06-14 04:46:33.850269	15	2	0	2	t
33	3	2025-06-14 04:46:33.872794	2025-06-14 04:46:33.872794	12	0	0	0	t
34	3	2025-06-14 04:46:33.8782	2025-06-14 04:46:33.8782	13	0	0	0	t
35	3	2025-06-14 04:46:33.883739	2025-06-14 04:46:33.883739	17	0	0	0	t
36	3	2025-06-14 04:46:33.890475	2025-06-14 04:46:33.890475	16	3	0	3	t
37	3	2025-06-14 04:46:33.89607	2025-06-14 04:46:33.89607	6	3	0	3	t
41	3	2025-06-14 04:46:33.921193	2025-06-14 04:46:33.921193	7	112	0	112	t
42	3	2025-06-14 04:46:33.926236	2025-06-14 04:46:33.926236	9	3	0	3	t
43	3	2025-06-14 04:46:33.931032	2025-06-14 04:46:33.931032	11	15	0	15	t
44	3	2025-06-14 04:46:33.935805	2025-06-14 04:46:33.935805	14	2	0	2	t
45	3	2025-06-14 04:46:33.940793	2025-06-14 04:46:33.940793	15	2	0	2	t
48	3	2025-06-14 04:46:33.955369	2025-06-14 04:46:33.955369	10	3	0	3	t
49	4	2025-06-14 04:46:33.960596	2025-06-14 04:46:33.960596	12	0	0	0	t
50	4	2025-06-14 04:46:33.965393	2025-06-14 04:46:33.965393	13	0	0	0	t
51	4	2025-06-14 04:46:33.970634	2025-06-14 04:46:33.970634	17	0	0	0	t
52	4	2025-06-14 04:46:33.975495	2025-06-14 04:46:33.975495	16	3	0	3	t
53	4	2025-06-14 04:46:33.980511	2025-06-14 04:46:33.980511	6	3	0	3	t
54	4	2025-06-14 04:46:33.98553	2025-06-14 04:46:33.98553	4	3	0	3	t
55	4	2025-06-14 04:46:33.991093	2025-06-14 04:46:33.991093	5	17	0	17	t
56	4	2025-06-14 04:46:33.996545	2025-06-14 04:46:33.996545	8	180	0	180	t
57	4	2025-06-14 04:46:34.001807	2025-06-14 04:46:34.001807	7	112	0	112	t
58	4	2025-06-14 04:46:34.006966	2025-06-14 04:46:34.006966	9	3	0	3	t
59	4	2025-06-14 04:46:34.011843	2025-06-14 04:46:34.011843	11	15	0	15	t
60	4	2025-06-14 04:46:34.016926	2025-06-14 04:46:34.016926	14	2	0	2	t
61	4	2025-06-14 04:46:34.02318	2025-06-14 04:46:34.02318	15	2	0	2	t
64	4	2025-06-14 04:46:34.039143	2025-06-14 04:46:34.039143	10	3	0	3	t
65	6	2025-06-14 04:46:34.044147	2025-06-14 04:46:34.044147	12	0	0	0	t
66	6	2025-06-14 04:46:34.048972	2025-06-14 04:46:34.048972	13	0	0	0	t
67	6	2025-06-14 04:46:34.054105	2025-06-14 04:46:34.054105	17	0	0	0	t
69	6	2025-06-14 04:46:34.063395	2025-06-14 04:46:34.063395	6	3	0	3	t
70	6	2025-06-14 04:46:34.068183	2025-06-14 04:46:34.068183	4	3	0	3	t
71	6	2025-06-14 04:46:34.07441	2025-06-14 04:46:34.07441	5	17	0	17	t
72	6	2025-06-14 04:46:34.07903	2025-06-14 04:46:34.07903	8	180	0	180	t
74	6	2025-06-14 04:46:34.089661	2025-06-14 04:46:34.089661	9	3	0	3	t
75	6	2025-06-14 04:46:34.094842	2025-06-14 04:46:34.094842	11	15	0	15	t
76	6	2025-06-14 04:46:34.099442	2025-06-14 04:46:34.099442	14	2	0	2	t
77	6	2025-06-14 04:46:34.105788	2025-06-14 04:46:34.105788	15	2	0	2	t
81	7	2025-06-14 04:46:34.129709	2025-06-14 04:46:34.129709	12	0	0	0	t
82	7	2025-06-14 04:46:34.136493	2025-06-14 04:46:34.136493	13	0	0	0	t
83	7	2025-06-14 04:46:34.144762	2025-06-14 04:46:34.144762	17	0	0	0	t
84	7	2025-06-14 04:46:34.150463	2025-06-14 04:46:34.150463	16	3	0	3	t
85	7	2025-06-14 04:46:34.156491	2025-06-14 04:46:34.156491	6	3	0	3	t
86	7	2025-06-14 04:46:34.163371	2025-06-14 04:46:34.163371	4	3	0	3	t
87	7	2025-06-14 04:46:34.170887	2025-06-14 04:46:34.170887	5	17	0	17	t
88	7	2025-06-14 04:46:34.177765	2025-06-14 04:46:34.177765	8	180	0	180	t
89	7	2025-06-14 04:46:34.183273	2025-06-14 04:46:34.183273	7	112	0	112	t
90	7	2025-06-14 04:46:34.189523	2025-06-14 04:46:34.189523	9	3	0	3	t
91	7	2025-06-14 04:46:34.195312	2025-06-14 04:46:34.195312	11	15	0	15	t
92	7	2025-06-14 04:46:34.200071	2025-06-14 04:46:34.200071	14	2	0	2	t
93	7	2025-06-14 04:46:34.207008	2025-06-14 04:46:34.207008	15	2	0	2	t
96	7	2025-06-14 04:46:34.229866	2025-06-14 04:46:34.229866	10	3	0	3	t
31	2	2025-06-14 04:46:33.861073	2025-06-19 03:03:09.647712	3	480	0	480	t
10	1	2025-06-13 23:12:34.448631	2025-06-14 07:53:05.097	10	3	0	3	t
32	2	2025-06-14 04:46:33.866502	2025-06-19 00:02:43.893956	10	3	0	3	t
40	3	2025-06-14 04:46:33.915423	2025-06-14 07:56:53.562614	8	180	50	130	t
79	6	2025-06-14 04:46:34.117686	2025-06-19 03:03:09.698647	3	480	456	24	t
2	1	2025-06-13 23:12:34.40463	2025-06-19 06:45:34.46476	3	480	0	480	t
80	6	2025-06-14 04:46:34.12446	2025-06-14 08:18:06.098	10	3	59	-56	t
38	3	2025-06-14 04:46:33.903284	2025-06-18 06:24:39.252611	4	3	0	3	t
73	6	2025-06-14 04:46:34.083965	2025-06-14 08:18:06.105451	7	112	58	54	t
68	6	2025-06-14 04:46:34.058898	2025-06-14 04:46:34.058	16	3	22	-19	t
13	1	2025-06-13 23:12:34.457635	2025-06-19 08:32:25.069498	8	180	275	-95	t
46	3	2025-06-14 04:46:33.945565	2025-06-19 03:03:09.653905	2	40	0	40	t
62	4	2025-06-14 04:46:34.028723	2025-06-19 03:03:09.659227	2	40	0	40	t
63	4	2025-06-14 04:46:34.033591	2025-06-19 03:03:09.665163	3	480	0	480	t
78	6	2025-06-14 04:46:34.111871	2025-06-19 03:03:09.671622	2	40	0	40	t
94	7	2025-06-14 04:46:34.214084	2025-06-19 03:03:09.678692	2	40	0	40	t
95	7	2025-06-14 04:46:34.221816	2025-06-19 03:03:09.685048	3	480	0	480	t
47	3	2025-06-14 04:46:33.950249	2025-06-19 03:03:09.691816	3	480	624	-144	t
97	8	2025-06-14 04:46:34.237055	2025-06-14 04:46:34.237055	12	0	0	0	t
98	8	2025-06-14 04:46:34.247952	2025-06-14 04:46:34.247952	13	0	0	0	t
99	8	2025-06-14 04:46:34.253263	2025-06-14 04:46:34.253263	17	0	0	0	t
100	8	2025-06-14 04:46:34.259642	2025-06-14 04:46:34.259642	16	3	0	3	t
101	8	2025-06-14 04:46:34.265015	2025-06-14 04:46:34.265015	6	3	0	3	t
102	8	2025-06-14 04:46:34.270464	2025-06-14 04:46:34.270464	4	3	0	3	t
103	8	2025-06-14 04:46:34.276414	2025-06-14 04:46:34.276414	5	17	0	17	t
104	8	2025-06-14 04:46:34.282396	2025-06-14 04:46:34.282396	8	180	0	180	t
105	8	2025-06-14 04:46:34.287414	2025-06-14 04:46:34.287414	7	112	0	112	t
106	8	2025-06-14 04:46:34.29276	2025-06-14 04:46:34.29276	9	3	0	3	t
107	8	2025-06-14 04:46:34.297508	2025-06-14 04:46:34.297508	11	15	0	15	t
108	8	2025-06-14 04:46:34.302629	2025-06-14 04:46:34.302629	14	2	0	2	t
109	8	2025-06-14 04:46:34.307997	2025-06-14 04:46:34.307997	15	2	0	2	t
112	8	2025-06-14 04:46:34.32278	2025-06-14 04:46:34.32278	10	3	0	3	t
113	9	2025-06-14 04:46:34.327855	2025-06-14 04:46:34.327855	12	0	0	0	t
115	9	2025-06-14 04:46:34.337149	2025-06-14 04:46:34.337149	17	0	0	0	t
116	9	2025-06-14 04:46:34.341973	2025-06-14 04:46:34.341973	16	3	0	3	t
117	9	2025-06-14 04:46:34.347263	2025-06-14 04:46:34.347263	6	3	0	3	t
118	9	2025-06-14 04:46:34.352502	2025-06-14 04:46:34.352502	4	3	0	3	t
119	9	2025-06-14 04:46:34.359708	2025-06-14 04:46:34.359708	5	17	0	17	t
120	9	2025-06-14 04:46:34.365612	2025-06-14 04:46:34.365612	8	180	0	180	t
121	9	2025-06-14 04:46:34.372092	2025-06-14 04:46:34.372092	7	112	0	112	t
122	9	2025-06-14 04:46:34.377694	2025-06-14 04:46:34.377694	9	3	0	3	t
124	9	2025-06-14 04:46:34.387848	2025-06-14 04:46:34.387848	14	2	0	2	t
125	9	2025-06-14 04:46:34.392824	2025-06-14 04:46:34.392824	15	2	0	2	t
128	9	2025-06-14 04:46:34.40793	2025-06-14 04:46:34.40793	10	3	0	3	t
166	9	2025-06-19 08:18:04.887498	2025-06-19 08:18:04.887498	18	0	0	0	t
167	4	2025-06-19 08:18:04.892372	2025-06-19 08:18:04.892372	18	0	0	0	t
129	10	2025-06-15 05:46:20.718132	2025-06-15 05:46:20.718132	12	0	0	0	t
130	10	2025-06-15 05:46:20.728212	2025-06-15 05:46:20.728212	13	0	0	0	t
131	10	2025-06-15 05:46:20.738889	2025-06-15 05:46:20.738889	17	0	0	0	t
132	10	2025-06-15 05:46:20.752195	2025-06-15 05:46:20.752195	16	3	0	3	t
133	10	2025-06-15 05:46:20.758474	2025-06-15 05:46:20.758474	6	3	0	3	t
134	10	2025-06-15 05:46:20.767759	2025-06-15 05:46:20.767759	4	3	0	3	t
135	10	2025-06-15 05:46:20.774265	2025-06-15 05:46:20.774265	5	17	0	17	t
136	10	2025-06-15 05:46:20.783853	2025-06-15 05:46:20.783853	8	180	0	180	t
137	10	2025-06-15 05:46:20.791077	2025-06-15 05:46:20.791077	7	112	0	112	t
138	10	2025-06-15 05:46:20.800889	2025-06-15 05:46:20.800889	9	3	0	3	t
139	10	2025-06-15 05:46:20.807707	2025-06-15 05:46:20.807707	11	15	0	15	t
140	10	2025-06-15 05:46:20.817252	2025-06-15 05:46:20.817252	14	2	0	2	t
141	10	2025-06-15 05:46:20.823871	2025-06-15 05:46:20.823871	15	2	0	2	t
144	10	2025-06-15 05:46:20.854411	2025-06-15 05:46:20.854411	10	3	0	3	t
145	11	2025-06-15 05:59:37.537082	2025-06-15 05:59:37.537082	12	0	0	0	t
146	11	2025-06-15 05:59:37.553325	2025-06-15 05:59:37.553325	13	0	0	0	t
147	11	2025-06-15 05:59:37.565708	2025-06-15 05:59:37.565708	17	0	0	0	t
149	11	2025-06-15 05:59:37.586367	2025-06-15 05:59:37.586367	6	3	0	3	t
150	11	2025-06-15 05:59:37.596065	2025-06-15 05:59:37.596065	4	3	0	3	t
151	11	2025-06-15 05:59:37.60519	2025-06-15 05:59:37.60519	5	17	0	17	t
152	11	2025-06-15 05:59:37.613739	2025-06-15 05:59:37.613739	8	180	0	180	t
153	11	2025-06-15 05:59:37.621458	2025-06-15 05:59:37.621458	7	112	0	112	t
154	11	2025-06-15 05:59:37.630844	2025-06-15 05:59:37.630844	9	3	0	3	t
155	11	2025-06-15 05:59:37.639758	2025-06-15 05:59:37.639758	11	15	0	15	t
156	11	2025-06-15 05:59:37.648354	2025-06-15 05:59:37.648354	14	2	0	2	t
157	11	2025-06-15 05:59:37.658241	2025-06-15 05:59:37.658241	15	2	0	2	t
160	11	2025-06-15 05:59:37.684635	2025-06-15 05:59:37.684635	10	3	0	3	t
168	8	2025-06-19 08:18:04.899056	2025-06-19 08:18:04.899056	18	0	0	0	t
169	11	2025-06-19 08:18:04.90616	2025-06-19 08:18:04.90616	18	0	0	0	t
123	9	2025-06-14 04:46:34.382187	2025-06-18 06:29:35.013678	11	15	-3	18	t
114	9	2025-06-14 04:46:34.332329	2025-06-18 06:29:42.976958	13	0	-98	98	t
170	10	2025-06-19 08:18:04.911825	2025-06-19 08:18:04.911825	18	0	0	0	t
26	2	2025-06-14 04:46:33.834476	2025-06-18 07:11:41.653818	9	3	0	3	t
24	2	2025-06-14 04:46:33.824524	2025-06-18 07:11:41.668972	8	180	0	180	t
171	12	2025-06-19 09:41:52.095696	2025-06-19 09:41:52.095696	4	3	0	3	t
148	11	2025-06-15 05:59:37.575501	2025-06-18 07:20:22.797935	16	3	0	3	t
25	2	2025-06-14 04:46:33.829287	2025-06-19 00:02:43.380857	7	112	0	112	t
110	8	2025-06-14 04:46:34.313067	2025-06-19 03:03:09.704963	2	40	0	40	t
111	8	2025-06-14 04:46:34.31773	2025-06-19 03:03:09.712257	3	480	0	480	t
126	9	2025-06-14 04:46:34.397295	2025-06-19 03:03:09.718436	2	40	0	40	t
127	9	2025-06-14 04:46:34.402218	2025-06-19 03:03:09.724668	3	480	0	480	t
142	10	2025-06-15 05:46:20.835974	2025-06-19 03:03:09.730238	2	40	0	40	t
143	10	2025-06-15 05:46:20.845009	2025-06-19 03:03:09.736256	3	480	0	480	t
158	11	2025-06-15 05:59:37.666876	2025-06-19 03:03:09.742388	2	40	0	40	t
159	11	2025-06-15 05:59:37.676843	2025-06-19 03:03:09.748482	3	480	0	480	t
172	12	2025-06-19 09:41:52.106476	2025-06-19 09:41:52.106476	14	2	0	2	t
173	12	2025-06-19 09:41:52.113379	2025-06-19 09:41:52.113379	3	480	0	480	t
174	12	2025-06-19 09:41:52.122681	2025-06-19 09:41:52.122681	5	17	0	17	t
175	12	2025-06-19 09:41:52.129639	2025-06-19 09:41:52.129639	6	3	0	3	t
176	12	2025-06-19 09:41:52.139128	2025-06-19 09:41:52.139128	7	112	0	112	t
177	12	2025-06-19 09:41:52.145966	2025-06-19 09:41:52.145966	8	180	0	180	t
178	12	2025-06-19 09:41:52.156415	2025-06-19 09:41:52.156415	9	3	0	3	t
179	12	2025-06-19 09:41:52.165251	2025-06-19 09:41:52.165251	10	3	0	3	t
1	1	2025-06-13 23:12:34.399184	2025-06-19 06:45:37.078799	2	40	0	40	t
161	1	2025-06-19 08:18:04.849169	2025-06-19 08:18:04.849169	18	0	0	0	t
162	2	2025-06-19 08:18:04.859845	2025-06-19 08:18:04.859845	18	0	0	0	t
163	3	2025-06-19 08:18:04.867409	2025-06-19 08:18:04.867409	18	0	0	0	t
164	6	2025-06-19 08:18:04.874216	2025-06-19 08:18:04.874216	18	0	0	0	t
165	7	2025-06-19 08:18:04.881309	2025-06-19 08:18:04.881309	18	0	0	0	t
180	12	2025-06-19 09:41:52.173248	2025-06-19 09:41:52.173248	11	15	0	15	t
181	12	2025-06-19 09:41:52.180968	2025-06-19 09:41:52.180968	2	40	0	40	t
182	12	2025-06-19 09:41:52.189357	2025-06-19 09:41:52.189357	12	0	0	0	t
183	12	2025-06-19 09:41:52.196474	2025-06-19 09:41:52.196474	13	0	0	0	t
184	12	2025-06-19 09:41:52.204166	2025-06-19 09:41:52.204166	16	3	0	3	t
185	12	2025-06-19 09:41:52.210922	2025-06-19 09:41:52.210922	17	0	0	0	t
186	13	2025-06-19 09:41:52.252979	2025-06-19 09:41:52.252979	4	3	0	3	t
187	13	2025-06-19 09:41:52.264393	2025-06-19 09:41:52.264393	14	2	0	2	t
188	13	2025-06-19 09:41:52.273085	2025-06-19 09:41:52.273085	3	480	0	480	t
189	13	2025-06-19 09:41:52.281519	2025-06-19 09:41:52.281519	5	17	0	17	t
190	13	2025-06-19 09:41:52.291725	2025-06-19 09:41:52.291725	6	3	0	3	t
191	13	2025-06-19 09:41:52.300416	2025-06-19 09:41:52.300416	7	112	0	112	t
192	13	2025-06-19 09:41:52.307579	2025-06-19 09:41:52.307579	8	180	0	180	t
193	13	2025-06-19 09:41:52.315693	2025-06-19 09:41:52.315693	9	3	0	3	t
194	13	2025-06-19 09:41:52.325151	2025-06-19 09:41:52.325151	10	3	0	3	t
195	13	2025-06-19 09:41:52.33406	2025-06-19 09:41:52.33406	11	15	0	15	t
196	13	2025-06-19 09:41:52.340562	2025-06-19 09:41:52.340562	2	40	0	40	t
197	13	2025-06-19 09:41:52.350018	2025-06-19 09:41:52.350018	12	0	0	0	t
198	13	2025-06-19 09:41:52.357772	2025-06-19 09:41:52.357772	13	0	0	0	t
199	13	2025-06-19 09:41:52.363996	2025-06-19 09:41:52.363996	16	3	0	3	t
200	13	2025-06-19 09:41:52.370789	2025-06-19 09:41:52.370789	17	0	0	0	t
\.


--
-- Data for Name: documentos_licencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documentos_licencia (id, licencia_id, tipo_documento, url_archivo, descripcion, fecha_subida) FROM stdin;
\.


--
-- Data for Name: historico_uso_licencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historico_uso_licencias (id, trabajador_id, tipo_licencia_id, departamento_id, anio, mes, total_veces, total_horas, total_dias, unidad_disponibilidad, fecha_generado) FROM stdin;
\.


--
-- Data for Name: licencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.licencias (id, solicitud_id, trabajador_id, tipo_licencia_id, fecha_inicio, fecha_fin, dias_totales, dias_habiles, dias_calendario, estado, motivo_cancelacion, fecha_cancelacion, activo, fecha_creacion, fecha_actualizacion, fecha_no_asiste, fecha_si_asiste, trabajador_cambio_id, tipo_olvido_marcacion, horas_totales) FROM stdin;
70	73	1	13	2025-06-19	2025-06-26	8	6	8	ACTIVA	\N	\N	t	2025-06-19 08:29:40.652	2025-06-19 08:29:40.652	\N	\N	\N	\N	0.00
71	74	1	8	2025-06-19	2026-03-20	275	197	275	ACTIVA	\N	\N	t	2025-06-19 08:32:24.936158	2025-06-19 08:32:24.936158	\N	\N	\N	\N	0.00
\.


--
-- Data for Name: limites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.limites (id, trabajador_id, tipo_licencia_id, anio, dias_disponibles, dias_utilizados, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	1	1	2025	5	0	t	2025-06-11 19:05:07.489442	2025-06-11 19:05:07.489442
3	1	3	2025	60	0	t	2025-06-11 19:05:07.515579	2025-06-11 19:05:07.515579
4	1	4	2025	365	0	t	2025-06-11 19:05:07.52462	2025-06-11 19:05:07.52462
5	1	5	2025	17	0	t	2025-06-11 19:05:07.534898	2025-06-11 19:05:07.534898
6	1	6	2025	3	0	t	2025-06-11 19:05:07.547867	2025-06-11 19:05:07.547867
7	1	7	2025	112	0	t	2025-06-11 19:05:07.560177	2025-06-11 19:05:07.560177
9	1	9	2025	3	0	t	2025-06-11 19:05:07.584853	2025-06-11 19:05:07.584853
10	1	10	2025	3	0	t	2025-06-11 19:05:07.59732	2025-06-11 19:05:07.59732
11	1	11	2025	15	0	t	2025-06-11 19:05:07.610157	2025-06-11 19:05:07.610157
12	1	12	2025	30	0	t	2025-06-11 19:05:07.623727	2025-06-11 19:05:07.623727
14	1	14	2025	2	0	t	2025-06-11 19:05:07.653807	2025-06-11 19:05:07.653807
15	1	15	2025	2	0	t	2025-06-11 19:05:07.665875	2025-06-11 19:05:07.665875
17	1	17	2025	30	0	t	2025-06-11 19:05:07.690557	2025-06-11 19:05:07.690557
18	2	1	2025	5	0	t	2025-06-11 19:05:07.703152	2025-06-11 19:05:07.703152
19	2	2	2025	5	0	t	2025-06-11 19:05:07.716444	2025-06-11 19:05:07.716444
20	2	3	2025	60	0	t	2025-06-11 19:05:07.728249	2025-06-11 19:05:07.728249
21	2	4	2025	365	0	t	2025-06-11 19:05:07.73961	2025-06-11 19:05:07.73961
22	2	5	2025	17	0	t	2025-06-11 19:05:07.751038	2025-06-11 19:05:07.751038
23	2	6	2025	3	0	t	2025-06-11 19:05:07.760786	2025-06-11 19:05:07.760786
27	2	10	2025	3	0	t	2025-06-11 19:05:07.801804	2025-06-11 19:05:07.801804
28	2	11	2025	15	0	t	2025-06-11 19:05:07.812133	2025-06-11 19:05:07.812133
29	2	12	2025	30	0	t	2025-06-11 19:05:07.822685	2025-06-11 19:05:07.822685
30	2	13	2025	10	0	t	2025-06-11 19:05:07.833893	2025-06-11 19:05:07.833893
31	2	14	2025	2	0	t	2025-06-11 19:05:07.843835	2025-06-11 19:05:07.843835
32	2	15	2025	2	0	t	2025-06-11 19:05:07.860372	2025-06-11 19:05:07.860372
33	2	16	2025	3	0	t	2025-06-11 19:05:07.87193	2025-06-11 19:05:07.87193
35	3	1	2025	5	0	t	2025-06-11 19:05:07.889976	2025-06-11 19:05:07.889976
36	3	2	2025	5	0	t	2025-06-11 19:05:07.898738	2025-06-11 19:05:07.898738
40	3	6	2025	3	0	t	2025-06-11 19:05:07.942875	2025-06-11 19:05:07.942875
41	3	7	2025	112	0	t	2025-06-11 19:05:07.953283	2025-06-11 19:05:07.953283
43	3	9	2025	3	0	t	2025-06-11 19:05:07.973286	2025-06-11 19:05:07.973286
44	3	10	2025	3	0	t	2025-06-11 19:05:07.985358	2025-06-11 19:05:07.985358
45	3	11	2025	15	0	t	2025-06-11 19:05:07.997415	2025-06-11 19:05:07.997415
46	3	12	2025	30	0	t	2025-06-11 19:05:08.008354	2025-06-11 19:05:08.008354
47	3	13	2025	10	0	t	2025-06-11 19:05:08.017126	2025-06-11 19:05:08.017126
48	3	14	2025	2	0	t	2025-06-11 19:05:08.027291	2025-06-11 19:05:08.027291
49	3	15	2025	2	0	t	2025-06-11 19:05:08.037092	2025-06-11 19:05:08.037092
50	3	16	2025	3	0	t	2025-06-11 19:05:08.047313	2025-06-11 19:05:08.047313
51	3	17	2025	30	0	t	2025-06-11 19:05:08.056415	2025-06-11 19:05:08.056415
52	4	1	2025	5	0	t	2025-06-11 19:05:08.068385	2025-06-11 19:05:08.068385
53	4	2	2025	5	0	t	2025-06-11 19:05:08.082393	2025-06-11 19:05:08.082393
54	4	3	2025	60	0	t	2025-06-11 19:05:08.093045	2025-06-11 19:05:08.093045
55	4	4	2025	365	0	t	2025-06-11 19:05:08.102779	2025-06-11 19:05:08.102779
56	4	5	2025	17	0	t	2025-06-11 19:05:08.113101	2025-06-11 19:05:08.113101
57	4	6	2025	3	0	t	2025-06-11 19:05:08.123293	2025-06-11 19:05:08.123293
58	4	7	2025	112	0	t	2025-06-11 19:05:08.133354	2025-06-11 19:05:08.133354
60	4	9	2025	3	0	t	2025-06-11 19:05:08.14979	2025-06-11 19:05:08.14979
61	4	10	2025	3	0	t	2025-06-11 19:05:08.157272	2025-06-11 19:05:08.157272
63	4	12	2025	30	0	t	2025-06-11 19:05:08.177007	2025-06-11 19:05:08.177007
64	4	13	2025	10	0	t	2025-06-11 19:05:08.189756	2025-06-11 19:05:08.189756
67	4	16	2025	3	0	t	2025-06-11 19:05:08.223989	2025-06-11 19:05:08.223989
68	4	17	2025	30	0	t	2025-06-11 19:05:08.233222	2025-06-11 19:05:08.233222
69	6	1	2025	5	0	t	2025-06-11 19:05:08.241776	2025-06-11 19:05:08.241776
70	6	2	2025	5	0	t	2025-06-11 19:05:08.25195	2025-06-11 19:05:08.25195
72	6	4	2025	365	0	t	2025-06-11 19:05:08.279687	2025-06-11 19:05:08.279687
73	6	5	2025	17	0	t	2025-06-11 19:05:08.301166	2025-06-11 19:05:08.301166
74	6	6	2025	3	0	t	2025-06-11 19:05:08.317299	2025-06-11 19:05:08.317299
76	6	8	2025	180	0	t	2025-06-11 19:05:08.33896	2025-06-11 19:05:08.33896
77	6	9	2025	3	0	t	2025-06-11 19:05:08.350003	2025-06-11 19:05:08.350003
79	6	11	2025	15	0	t	2025-06-11 19:05:08.366851	2025-06-11 19:05:08.366851
80	6	12	2025	30	0	t	2025-06-11 19:05:08.374005	2025-06-11 19:05:08.374005
81	6	13	2025	10	0	t	2025-06-11 19:05:08.384147	2025-06-11 19:05:08.384147
82	6	14	2025	2	0	t	2025-06-11 19:05:08.393287	2025-06-11 19:05:08.393287
83	6	15	2025	2	0	t	2025-06-11 19:05:08.403337	2025-06-11 19:05:08.403337
85	6	17	2025	30	0	t	2025-06-11 19:05:08.421249	2025-06-11 19:05:08.421249
87	7	2	2025	5	0	t	2025-06-11 19:05:08.437732	2025-06-11 19:05:08.437732
88	7	3	2025	60	0	t	2025-06-11 19:05:08.445446	2025-06-11 19:05:08.445446
89	7	4	2025	365	0	t	2025-06-11 19:05:08.457849	2025-06-11 19:05:08.457849
90	7	5	2025	17	0	t	2025-06-11 19:05:08.466483	2025-06-11 19:05:08.466483
92	7	7	2025	112	0	t	2025-06-11 19:05:08.482656	2025-06-11 19:05:08.482656
93	7	8	2025	180	0	t	2025-06-11 19:05:08.491628	2025-06-11 19:05:08.491628
94	7	9	2025	3	0	t	2025-06-11 19:05:08.499881	2025-06-11 19:05:08.499881
95	7	10	2025	3	0	t	2025-06-11 19:05:08.507968	2025-06-11 19:05:08.507968
96	7	11	2025	15	0	t	2025-06-11 19:05:08.521881	2025-06-11 19:05:08.521881
97	7	12	2025	30	0	t	2025-06-11 19:05:08.532347	2025-06-11 19:05:08.532347
99	7	14	2025	2	0	t	2025-06-11 19:05:08.54895	2025-06-11 19:05:08.54895
100	7	15	2025	2	0	t	2025-06-11 19:05:08.562843	2025-06-11 19:05:08.562843
101	7	16	2025	3	0	t	2025-06-11 19:05:08.571228	2025-06-11 19:05:08.571228
103	8	1	2025	5	0	t	2025-06-11 19:05:08.588718	2025-06-11 19:05:08.588718
104	8	2	2025	5	0	t	2025-06-11 19:05:08.597556	2025-06-11 19:05:08.597556
105	8	3	2025	60	0	t	2025-06-11 19:05:08.609257	2025-06-11 19:05:08.609257
106	8	4	2025	365	0	t	2025-06-11 19:05:08.622587	2025-06-11 19:05:08.622587
13	1	13	2025	10	39	t	2025-06-11 19:05:07.639731	2025-06-11 19:05:09.01698
24	2	7	2025	112	37	t	2025-06-11 19:05:07.771211	2025-06-11 19:05:09.064128
34	2	17	2025	30	74	t	2025-06-11 19:05:07.882224	2025-06-11 19:05:09.102075
38	3	4	2025	365	10	t	2025-06-11 19:05:07.923996	2025-06-11 19:05:09.14746
37	3	3	2025	60	78	t	2025-06-11 19:05:07.913487	2025-06-11 19:05:09.187892
66	4	15	2025	2	6	t	2025-06-11 19:05:08.212777	2025-06-11 19:05:09.231197
62	4	11	2025	15	150	t	2025-06-11 19:05:08.16752	2025-06-11 19:05:09.277434
71	6	3	2025	60	57	t	2025-06-11 19:05:08.264997	2025-06-11 19:05:09.309288
84	6	16	2025	3	22	t	2025-06-11 19:05:08.411463	2025-06-11 19:05:09.336644
98	7	13	2025	10	20	t	2025-06-11 19:05:08.538965	2025-06-11 19:05:09.394793
8	1	8	2025	180	112	t	2025-06-11 19:05:07.57204	2025-06-11 19:07:27.08563
16	1	16	2025	3	97	t	2025-06-11 19:05:07.677937	2025-06-11 19:07:27.117797
26	2	9	2025	3	105	t	2025-06-11 19:05:07.79033	2025-06-11 19:07:27.147605
25	2	8	2025	180	104	t	2025-06-11 19:05:07.780076	2025-06-11 19:07:27.170995
39	3	5	2025	17	59	t	2025-06-11 19:05:07.933935	2025-06-11 19:07:27.194089
42	3	8	2025	180	50	t	2025-06-11 19:05:07.963822	2025-06-11 19:07:27.216842
59	4	8	2025	180	123	t	2025-06-11 19:05:08.141747	2025-06-11 19:07:27.238933
65	4	14	2025	2	47	t	2025-06-11 19:05:08.20042	2025-06-11 19:07:27.263219
78	6	10	2025	3	59	t	2025-06-11 19:05:08.358741	2025-06-11 19:07:27.284969
75	6	7	2025	112	58	t	2025-06-11 19:05:08.32855	2025-06-11 19:07:27.306791
86	7	1	2025	5	4	t	2025-06-11 19:05:08.429453	2025-06-11 19:07:27.329608
102	7	17	2025	30	35	t	2025-06-11 19:05:08.579085	2025-06-11 19:07:27.351055
107	8	5	2025	17	131	t	2025-06-11 19:05:08.636274	2025-06-11 19:07:27.372692
108	8	6	2025	3	0	t	2025-06-11 19:05:08.644869	2025-06-11 19:05:08.644869
109	8	7	2025	112	0	t	2025-06-11 19:05:08.653838	2025-06-11 19:05:08.653838
110	8	8	2025	180	0	t	2025-06-11 19:05:08.66217	2025-06-11 19:05:08.66217
112	8	10	2025	3	0	t	2025-06-11 19:05:08.674636	2025-06-11 19:05:08.674636
113	8	11	2025	15	0	t	2025-06-11 19:05:08.681568	2025-06-11 19:05:08.681568
114	8	12	2025	30	0	t	2025-06-11 19:05:08.688469	2025-06-11 19:05:08.688469
116	8	14	2025	2	0	t	2025-06-11 19:05:08.70055	2025-06-11 19:05:08.70055
117	8	15	2025	2	0	t	2025-06-11 19:05:08.708399	2025-06-11 19:05:08.708399
119	8	17	2025	30	0	t	2025-06-11 19:05:08.721678	2025-06-11 19:05:08.721678
120	9	1	2025	5	0	t	2025-06-11 19:05:08.727926	2025-06-11 19:05:08.727926
121	9	2	2025	5	0	t	2025-06-11 19:05:08.73538	2025-06-11 19:05:08.73538
122	9	3	2025	60	0	t	2025-06-11 19:05:08.741725	2025-06-11 19:05:08.741725
123	9	4	2025	365	0	t	2025-06-11 19:05:08.749011	2025-06-11 19:05:08.749011
124	9	5	2025	17	0	t	2025-06-11 19:05:08.757468	2025-06-11 19:05:08.757468
126	9	7	2025	112	0	t	2025-06-11 19:05:08.781387	2025-06-11 19:05:08.781387
127	9	8	2025	180	0	t	2025-06-11 19:05:08.788181	2025-06-11 19:05:08.788181
128	9	9	2025	3	0	t	2025-06-11 19:05:08.796126	2025-06-11 19:05:08.796126
129	9	10	2025	3	0	t	2025-06-11 19:05:08.804212	2025-06-11 19:05:08.804212
131	9	12	2025	30	0	t	2025-06-11 19:05:08.82646	2025-06-11 19:05:08.82646
133	9	14	2025	2	0	t	2025-06-11 19:05:08.844621	2025-06-11 19:05:08.844621
134	9	15	2025	2	0	t	2025-06-11 19:05:08.857474	2025-06-11 19:05:08.857474
135	9	16	2025	3	0	t	2025-06-11 19:05:08.879875	2025-06-11 19:05:08.879875
136	9	17	2025	30	0	t	2025-06-11 19:05:08.894316	2025-06-11 19:05:08.894316
2	1	2	2025	5	83	t	2025-06-11 19:05:07.506027	2025-06-11 19:05:08.950516
91	7	6	2025	3	6	t	2025-06-11 19:05:08.473011	2025-06-11 19:05:09.364028
118	8	16	2025	3	63	t	2025-06-11 19:05:08.716233	2025-06-11 19:05:09.423742
115	8	13	2025	10	4	t	2025-06-11 19:05:08.694668	2025-06-11 19:05:09.447313
125	9	6	2025	3	99	t	2025-06-11 19:05:08.770064	2025-06-11 19:05:09.503381
111	8	9	2025	3	75	t	2025-06-11 19:05:08.668713	2025-06-11 19:07:27.395735
132	9	13	2025	10	154	t	2025-06-11 19:05:08.834714	2025-06-11 19:07:27.443536
130	9	11	2025	15	3	t	2025-06-11 19:05:08.813444	2025-06-11 19:07:27.489484
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
\.


--
-- Data for Name: movimientos_plan_trabajo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos_plan_trabajo (id, trabajador_id, fecha_inicio, fecha_fin, descripcion, justificacion, registrado_por, fecha_registro) FROM stdin;
\.


--
-- Data for Name: puestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.puestos (id, nombre, descripcion, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	MEDICO DE MEDICINA GENERAL	Atención médica general	t	2025-06-11 18:57:54.692706	2025-06-11 18:57:54.692706
2	AGENTE ATENCION AL USUARIO	Atención a usuarios en call center	t	2025-06-11 18:57:54.703125	2025-06-11 18:57:54.703125
3	ENFERMERO/A	Atención de enfermería	t	2025-06-11 18:57:54.715204	2025-06-11 18:57:54.715204
4	AUXILIAR ADMINISTRATIVO	Apoyo administrativo	t	2025-06-11 18:57:54.724355	2025-06-11 18:57:54.724355
5	JEFE DE RECURSOS HUMANOS	Jefatura de RRHH	t	2025-06-11 18:57:54.734746	2025-06-11 18:57:54.734746
6	QUIMICO DE LABORATORIO	Procesos de laboratorio clínico	t	2025-06-11 18:57:54.744061	2025-06-11 18:57:54.744061
7	FARMACEUTICO	Gestión de farmacia	t	2025-06-11 18:57:54.755695	2025-06-11 18:57:54.755695
10	Soporte Técnico ITcd	XDs	f	2025-06-13 21:43:20.694418	2025-06-13 21:44:31.511045
9	Soporte Técnico IT	XDs	f	2025-06-13 21:43:17.18426	2025-06-13 21:44:37.069986
8	Soporte Técnico IT	Soporte Técnico en todas las áreas	t	2025-06-13 21:43:15.183393	2025-06-13 21:45:39.394561
11	jljlkjk	123123121111	f	2025-06-15 06:46:43.273136	2025-06-15 06:47:09.169529
\.


--
-- Data for Name: solicitudes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitudes (id, trabajador_id, tipo_licencia_id, fecha_inicio, fecha_fin, motivo, estado, dias_solicitados, dias_habiles, dias_calendario, activo, fecha_creacion, fecha_actualizacion, fecha_decision, tipo_olvido_marcacion) FROM stdin;
74	1	8	2025-06-19	2026-03-20	123	APROBADA	275	197	275	t	2025-06-19 08:32:24.929043	2025-06-19 08:32:24.929043	\N	\N
73	1	13	2025-06-19	2025-06-26	123	APROBADA	8	6	8	t	2025-06-19 08:29:40.639363	2025-06-19 08:29:40.639363	\N	\N
\.


--
-- Data for Name: tipos_licencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_licencias (id, codigo, nombre, descripcion, duracion_maxima, requiere_justificacion, requiere_aprobacion_especial, requiere_documentacion, pago_haberes, acumulable, transferible, aplica_genero, genero_aplicable, aplica_antiguedad, antiguedad_minima, aplica_edad, edad_minima, edad_maxima, aplica_departamento, departamentos_aplicables, aplica_cargo, cargos_aplicables, aplica_tipo_personal, tipos_personal_aplicables, created_at, updated_at, activo, unidad_control, periodo_control) FROM stdin;
1	vb100	permiso personal	permiso personal	0	f	f	f	t	f	f	f	A	f	\N	f	\N	\N	f	\N	f	\N	f	\N	2025-06-12 18:23:53.11865	2025-06-13 20:23:47.897248	f	días	año
15	OLVIDO-SAL	Olvido de marcación de salida	Hasta 2 olvidos al mes. Registrar fecha del suceso, fecha de solicitud y fecha de aprobación.	2	t	f	f	t	f	f	f	A	f	\N	f	\N	\N	f	\N	f	\N	f	\N	2025-06-12 18:23:53.11865	2025-06-18 23:56:22.657685	f	días	mes
4	ENFERMEDAD	Licencia por enfermedad (certificación médica)	De 1 a 3 días con goce, del 4to en adelante sin goce. Requiere certificación médica del ISSS.	3	t	f	f	t	f	f	f	A	f	\N	f	\N	\N	f	\N	f	\N	f	\N	2025-06-12 18:23:53.11865	2025-06-14 02:57:48.120902	t	días	ninguno
14	OLVIDO-ENT	Olvido de marcación	Hasta 2 olvidos al mes. Registrar fecha del suceso, fecha de solicitud y fecha de aprobación.	2	t	f	f	t	f	f	f	A	f	0	f	0	0	f	{}	f	{}	f	{}	2025-06-12 18:23:53.11865	2025-06-19 02:23:42.672633	t	días	mes
3	PER-SIN-GO	Permiso personal sin goce de salario	Hasta 60 días anuales. A discreción de la jefatura, siempre que el servicio no quede descubierto. Solicitar con anticipación.	480	t	f	f	f	f	f	f	A	f	0	f	0	0	f	{}	f	{}	f	{}	2025-06-12 18:23:53.11865	2025-06-19 02:54:15.628281	t	horas	año
5	ENF-GRAVE-	Licencia por enfermedad gravísima de pariente	Hasta 17 días anuales. Solo para parientes en primer grado de afinidad. Requiere certificación médica y documento de parentesco.	17	t	f	f	t	f	f	f	A	f	\N	f	\N	\N	f	\N	f	\N	f	\N	2025-06-12 18:23:53.11865	2025-06-14 02:58:51.559722	t	días	año
6	DUELO	Licencia por duelo	3 días por fallecimiento de pariente en primer grado de afinidad. Requiere partida de defunción y documento de parentesco.	3	t	t	f	t	f	f	f	A	f	0	f	0	0	f	{}	f	{}	f	{}	2025-06-12 18:23:53.11865	2025-06-15 06:42:19.988048	t	días	ninguno
7	MATERNIDAD	Licencia por maternidad	112 días por parto. Puede ser 30 días antes y 82 después, o 112 días desde el parto. Requiere certificación médica.	112	t	f	t	t	f	f	t	F	f	0	f	0	0	f	{}	f	{}	f	{}	2025-06-12 18:23:53.11865	2025-06-15 06:36:57.446783	t	días	ninguno
18	TIEMPO-IND	Licencia de Tiempo Indefinido	Licencia sin límite de tiempo para casos especiales	0	t	f	f	t	f	f	f	A	f	\N	f	\N	\N	f	\N	f	\N	f	\N	2025-06-19 08:18:04.818503	2025-06-19 08:58:18.177847	f	días	ninguno
8	LACTANCIA	Licencia por lactancia materna	6 meses a partir del nacimiento. 1 hora diaria (puede fraccionarse). Requiere carta solicitud y partida de nacimiento.	180	t	f	f	t	f	f	t	F	f	0	f	0	0	f	{}	f	{}	f	{}	2025-06-12 18:23:53.11865	2025-06-15 06:28:51.661476	t	días	ninguno
9	PATERNIDAD	Licencia por paternidad, nacimiento o adopción	3 días por nacimiento o adopción. Requiere partida de nacimiento o sentencia de adopción.	3	t	f	t	t	f	f	t	M	f	0	f	0	0	f	{}	f	{}	f	{}	2025-06-12 18:23:53.11865	2025-06-15 06:41:08.467142	t	días	ninguno
10	MATRIMONIO	Permiso por matrimonio	3 días. Requiere certificación de matrimonio o partida de nacimiento con marginación.	3	t	f	f	t	f	f	f	A	f	\N	f	\N	\N	f	\N	f	\N	f	\N	2025-06-12 18:23:53.11865	2025-06-16 21:06:18.659974	t	días	ninguno
11	VACACIONES	Licencia por vacaciones anuales	15 días para personal operativo. Personal administrativo en dos periodos. Requiere control de licencia.	15	t	f	f	t	f	f	f	A	f	\N	f	\N	\N	f	\N	f	\N	f	\N	2025-06-12 18:23:53.11865	2025-06-14 02:59:57.284337	t	días	año
2	PER-GOCE	Permiso personal con goce de salario	Hasta 5 días anuales. A discreción de la jefatura, siempre que el servicio no quede descubierto. Puede ser media jornada o jornada completa.	40	t	f	f	t	f	f	f	A	f	0	f	0	0	f	{}	f	{}	f	{}	2025-06-12 18:23:53.11865	2025-06-16 21:00:25.95575	t	horas	año
12	JRV	Permiso por cargo en juntas receptoras de votos	El tiempo que solicite el organismo electoral. Requiere certificación del Tribunal Supremo Electoral.	0	t	f	f	t	f	f	f	A	f	\N	f	\N	\N	f	\N	f	\N	f	\N	2025-06-12 18:23:53.11865	2025-06-12 18:23:53.11865	t	días	ninguno
13	JURADO	Permiso por ser llamado a conformar jurado	El tiempo que dure la audiencia. Requiere citación del juzgado y constancia de permanencia.	0	t	f	f	t	f	f	f	A	f	\N	f	\N	\N	f	\N	f	\N	f	\N	2025-06-12 18:23:53.11865	2025-06-12 18:23:53.11865	t	días	ninguno
16	CAMBIO-TUR	Cambio de turno	Hasta 3 cambios de turno al mes. Requiere autorización de la jefatura.	3	t	f	f	t	f	f	f	A	f	0	f	0	0	f	{}	f	{}	f	{}	2025-06-12 18:23:53.11865	2025-06-15 06:28:38.335368	t	días	mes
17	MOV-PLAN-T	Movimiento de recurso humano en plan de trabajo mensual	Según necesidad del servicio. Requiere justificación y comunicación a Talento Humano.	0	t	f	f	t	f	f	f	A	f	\N	f	\N	\N	f	\N	f	\N	f	\N	2025-06-12 18:23:53.11865	2025-06-12 18:23:53.11865	t	días	ninguno
\.


--
-- Data for Name: trabajadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trabajadores (id, codigo, nombre_completo, email, telefono, departamento_id, puesto_id, tipo_personal, fecha_ingreso, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
1	T001	PLATERO DIAZ ZOILA ALEXANDRA	zoila.platero@ejemplo.com	796583939	1	1	OPERATIVO	2025-03-04	t	2025-06-11 19:00:15.365024	2025-06-11 19:00:15.365024
2	T002	LOPEZ HUEZO YENICEL ZOBEYDA	yenicel.lopez@ejemplo.com	774770909	1	1	OPERATIVO	2025-03-04	t	2025-06-11 19:00:15.3934	2025-06-11 19:00:15.3934
3	T003	NAVAS DELGADO DANIEL ERNESTO	daniel.navas@ejemplo.com	764238995	2	2	OPERATIVO	2025-02-24	t	2025-06-11 19:00:15.405109	2025-06-11 19:00:15.405109
6	T005	RAMIREZ PEREZ ANA SOFIA	sofia.ramirez@ejemplo.com	729699642	4	4	ADMINISTRATIVO	2025-01-10	t	2025-06-11 19:01:40.775709	2025-06-11 19:01:40.775709
7	T006	CASTILLO MENDEZ JORGE ENRIQUE	enrique.castillo@ejemplo.com	748647046	5	5	ADMINISTRATIVO	2024-12-01	t	2025-06-11 19:01:40.792031	2025-06-11 19:01:40.792031
9	T008	GONZALEZ RIVERA SANDRA ELENA	elena.gonzalez@ejemplo.com	716864878	7	7	OPERATIVO	2025-02-20	t	2025-06-11 19:01:40.815624	2025-06-11 19:01:40.815624
4	T004	MARTINEZ GARCIA LUIS ALBERTO	@ejemplo.com	513348611	3	3	OPERATIVO	2024-11-15	t	2025-06-11 19:00:15.415606	2025-06-14 08:07:01.214193
8	T007	MENDEZ LOPEZ MARIA JOSE	jose.mendez@ejemplo.es	752284372	6	6	OPERATIVO	2025-03-01	t	2025-06-11 19:01:40.803917	2025-06-14 08:17:45.092606
11	VB100222	Rodolfo VARGAS	rodolfovargas@gmail.com	77889944	2	3	OPERATIVO	2025-06-17	t	2025-06-15 05:59:37.501875	2025-06-18 07:37:12.60179
10	XXXXX	example	example@example.com	77889944	4	3	ADMINISTRATIVO	2025-06-18	f	2025-06-15 05:46:20.696172	2025-06-18 07:38:11.21827
12	EMP001	Juan Pérez	juan.perez@empresa.com	123456789	4	3	ADMINISTRATIVO	2024-01-15	t	2025-06-19 09:41:52.068761	2025-06-19 09:43:06.2465
13	EMP002	María García	maria.garcia@empresa.com	987654321	4	4	OPERATIVO	2024-02-01	t	2025-06-19 09:41:52.23438	2025-06-19 09:43:26.537497
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, codigo, nombre, apellido, email, password, departamento_id, puesto_id, rol, activo, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Data for Name: validaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.validaciones (id, solicitud_id, validado_por, estado, observaciones, fecha_validacion, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- Name: auditoria_solicitudes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_solicitudes_id_seq', 1, false);


--
-- Name: control_limites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.control_limites_id_seq', 1, true);


--
-- Name: departamentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departamentos_id_seq', 9, true);


--
-- Name: disponibilidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.disponibilidad_id_seq', 200, true);


--
-- Name: documentos_licencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documentos_licencia_id_seq', 1, false);


--
-- Name: historico_uso_licencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historico_uso_licencias_id_seq', 1, false);


--
-- Name: licencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.licencias_id_seq', 71, true);


--
-- Name: limites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.limites_id_seq', 136, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, false);


--
-- Name: movimientos_plan_trabajo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_plan_trabajo_id_seq', 1, false);


--
-- Name: puestos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.puestos_id_seq', 11, true);


--
-- Name: solicitudes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitudes_id_seq', 74, true);


--
-- Name: tipos_licencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_licencias_id_seq', 18, true);


--
-- Name: trabajadores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trabajadores_id_seq', 13, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- Name: validaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.validaciones_id_seq', 34, true);


--
-- Name: documentos_licencia PK_00434a6c6be9d34478c57b41e38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_licencia
    ADD CONSTRAINT "PK_00434a6c6be9d34478c57b41e38" PRIMARY KEY (id);


--
-- Name: tipos_licencias PK_1ef9dfdb2fb96b0135456c85355; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_licencias
    ADD CONSTRAINT "PK_1ef9dfdb2fb96b0135456c85355" PRIMARY KEY (id);


--
-- Name: historico_uso_licencias PK_39be2713f097f498d5db2c984ef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_uso_licencias
    ADD CONSTRAINT "PK_39be2713f097f498d5db2c984ef" PRIMARY KEY (id);


--
-- Name: validaciones PK_4fee55accb57dbba833074a5676; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.validaciones
    ADD CONSTRAINT "PK_4fee55accb57dbba833074a5676" PRIMARY KEY (id);


--
-- Name: control_limites PK_52f110c8ed786b6fe52c282bce9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.control_limites
    ADD CONSTRAINT "PK_52f110c8ed786b6fe52c282bce9" PRIMARY KEY (id);


--
-- Name: trabajadores PK_572c7e550b3d755a9826d4a5daa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT "PK_572c7e550b3d755a9826d4a5daa" PRIMARY KEY (id);


--
-- Name: licencias PK_64887873ca21b742943e83c21ce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT "PK_64887873ca21b742943e83c21ce" PRIMARY KEY (id);


--
-- Name: limites PK_6baa0587872d6c28a253f013360; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.limites
    ADD CONSTRAINT "PK_6baa0587872d6c28a253f013360" PRIMARY KEY (id);


--
-- Name: departamentos PK_6d34dc0415358a018818c683c1e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT "PK_6d34dc0415358a018818c683c1e" PRIMARY KEY (id);


--
-- Name: puestos PK_76f2abcffc72ffe8f01c46384b4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puestos
    ADD CONSTRAINT "PK_76f2abcffc72ffe8f01c46384b4" PRIMARY KEY (id);


--
-- Name: movimientos_plan_trabajo PK_8c4c799db413f762bdc00ed6e1a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_plan_trabajo
    ADD CONSTRAINT "PK_8c4c799db413f762bdc00ed6e1a" PRIMARY KEY (id);


--
-- Name: solicitudes PK_8c7e99758c774b801853b538647; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT "PK_8c7e99758c774b801853b538647" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: auditoria_solicitudes PK_9f682e5afe4b623f77c6d23e45d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_solicitudes
    ADD CONSTRAINT "PK_9f682e5afe4b623f77c6d23e45d" PRIMARY KEY (id);


--
-- Name: disponibilidad PK_cf70782622171aeff5a7825726a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disponibilidad
    ADD CONSTRAINT "PK_cf70782622171aeff5a7825726a" PRIMARY KEY (id);


--
-- Name: usuarios PK_d7281c63c176e152e4c531594a8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY (id);


--
-- Name: usuarios UQ_185ded9881a8bce38274b40faef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_185ded9881a8bce38274b40faef" UNIQUE (codigo);


--
-- Name: usuarios UQ_446adfc18b35418aac32ae0b7b5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE (email);


--
-- Name: trabajadores UQ_6df3beb5b00bdd2582f17fd4503; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT "UQ_6df3beb5b00bdd2582f17fd4503" UNIQUE (codigo);


--
-- Name: trabajadores UQ_a8d7663819bfb5243cf880945a0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT "UQ_a8d7663819bfb5243cf880945a0" UNIQUE (email);


--
-- Name: licencias UQ_b132b85329b81a7ee93a0ae4834; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT "UQ_b132b85329b81a7ee93a0ae4834" UNIQUE (solicitud_id);


--
-- Name: tipos_licencias UQ_d53805b06bb0dfc3c3fc72da5a2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_licencias
    ADD CONSTRAINT "UQ_d53805b06bb0dfc3c3fc72da5a2" UNIQUE (codigo);


--
-- Name: tipos_licencias tipos_licencias_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_licencias
    ADD CONSTRAINT tipos_licencias_codigo_key UNIQUE (codigo);


--
-- Name: limites FK_1d8a8afdcc54e513b4799feb468; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.limites
    ADD CONSTRAINT "FK_1d8a8afdcc54e513b4799feb468" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: solicitudes FK_2378c43ebba83808495d4a3df4a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT "FK_2378c43ebba83808495d4a3df4a" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: trabajadores FK_23f39237b68a78774309cb28180; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT "FK_23f39237b68a78774309cb28180" FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id);


--
-- Name: solicitudes FK_2af6edc98b389b5ed366c5278a1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT "FK_2af6edc98b389b5ed366c5278a1" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: auditoria_solicitudes FK_315f62ec784cd7551fc68b1a1b1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_solicitudes
    ADD CONSTRAINT "FK_315f62ec784cd7551fc68b1a1b1" FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id);


--
-- Name: limites FK_365de3a97cd1ca51e2f7f98b361; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.limites
    ADD CONSTRAINT "FK_365de3a97cd1ca51e2f7f98b361" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: control_limites FK_86aab94bb68f8c23c656d2d085a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.control_limites
    ADD CONSTRAINT "FK_86aab94bb68f8c23c656d2d085a" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: licencias FK_8a164118511e12b3b851d2b9c8d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT "FK_8a164118511e12b3b851d2b9c8d" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: licencias FK_94a5bd1bfdc5870e21e6b50ef35; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT "FK_94a5bd1bfdc5870e21e6b50ef35" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: validaciones FK_9982876421e5607c7c8ad021e75; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.validaciones
    ADD CONSTRAINT "FK_9982876421e5607c7c8ad021e75" FOREIGN KEY (validado_por) REFERENCES public.trabajadores(id);


--
-- Name: historico_uso_licencias FK_9c070a6ebf75cb8b50724d1e45a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_uso_licencias
    ADD CONSTRAINT "FK_9c070a6ebf75cb8b50724d1e45a" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: validaciones FK_a2161fac1f186292321f6561362; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.validaciones
    ADD CONSTRAINT "FK_a2161fac1f186292321f6561362" FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id);


--
-- Name: disponibilidad FK_ac5e84c0979ec30775433d31e5a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disponibilidad
    ADD CONSTRAINT "FK_ac5e84c0979ec30775433d31e5a" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: disponibilidad FK_ad7c90166a58ef91d4b5ec60e84; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disponibilidad
    ADD CONSTRAINT "FK_ad7c90166a58ef91d4b5ec60e84" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: licencias FK_b132b85329b81a7ee93a0ae4834; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licencias
    ADD CONSTRAINT "FK_b132b85329b81a7ee93a0ae4834" FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id);


--
-- Name: usuarios FK_b2ee5fc664e7dfbd50181dad454; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "FK_b2ee5fc664e7dfbd50181dad454" FOREIGN KEY (puesto_id) REFERENCES public.puestos(id);


--
-- Name: historico_uso_licencias FK_b568f2ca85225df52799c295fdc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_uso_licencias
    ADD CONSTRAINT "FK_b568f2ca85225df52799c295fdc" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: usuarios FK_be2e056fe966e6c0cd5347c4efc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT "FK_be2e056fe966e6c0cd5347c4efc" FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id);


--
-- Name: movimientos_plan_trabajo FK_c0b77e830f20c258d327bb5219c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_plan_trabajo
    ADD CONSTRAINT "FK_c0b77e830f20c258d327bb5219c" FOREIGN KEY (trabajador_id) REFERENCES public.trabajadores(id);


--
-- Name: auditoria_solicitudes FK_c53c2a2c6db38a5b27244863a7c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_solicitudes
    ADD CONSTRAINT "FK_c53c2a2c6db38a5b27244863a7c" FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: control_limites FK_c87650e0b4239d81808f2433da5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.control_limites
    ADD CONSTRAINT "FK_c87650e0b4239d81808f2433da5" FOREIGN KEY (tipo_licencia_id) REFERENCES public.tipos_licencias(id);


--
-- Name: trabajadores FK_d1d14644d8032318cc6fb0d81ec; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT "FK_d1d14644d8032318cc6fb0d81ec" FOREIGN KEY (puesto_id) REFERENCES public.puestos(id);


--
-- Name: documentos_licencia FK_d1fc211dc4754072165e68e6eac; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documentos_licencia
    ADD CONSTRAINT "FK_d1fc211dc4754072165e68e6eac" FOREIGN KEY (licencia_id) REFERENCES public.licencias(id);


--
-- Name: movimientos_plan_trabajo FK_ec2e92002924698164a06bbe635; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_plan_trabajo
    ADD CONSTRAINT "FK_ec2e92002924698164a06bbe635" FOREIGN KEY (registrado_por) REFERENCES public.usuarios(id);


--
-- Name: historico_uso_licencias FK_f078c5f6b572283802b3f2265f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historico_uso_licencias
    ADD CONSTRAINT "FK_f078c5f6b572283802b3f2265f1" FOREIGN KEY (departamento_id) REFERENCES public.departamentos(id);


--
-- PostgreSQL database dump complete
--

