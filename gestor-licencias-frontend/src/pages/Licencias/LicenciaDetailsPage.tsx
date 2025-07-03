import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import { fetchLicenciaById } from '../../store/slices/licenciasSlice';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import type { ChipProps } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TipoLicencia } from '../../types/tipoLicencia';
import { fromElSalvadorDate } from '../../utils/dateUtils';

const LicenciaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedItem: licencia, loading, error } = useSelector((state: RootState) => state.licencias);

  useEffect(() => {
    if (id) {
      dispatch(fetchLicenciaById(parseInt(id)) as unknown as AnyAction);
    }
  }, [dispatch, id]);

  const getEstadoColor = (estado: string): ChipProps['color'] => {
    switch (estado) {
      case 'ACTIVA':
        return 'success';
      case 'CANCELADA':
        return 'error';
      case 'FINALIZADA':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return '-';
    const localDate = fromElSalvadorDate(date.split('T')[0]);
    return format(new Date(localDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: es });
  };
  
  const formatDateTime = (date: string | null | undefined): string => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!licencia) {
    return <Typography>No se encontró la licencia</Typography>;
  }

  const tipoLicencia = licencia.tipo_licencia as TipoLicencia;
  const esPorHoras = tipoLicencia?.unidad_control === 'horas';
  const esOlvido = tipoLicencia?.codigo === 'OLVIDO-ENT' || tipoLicencia?.codigo === 'OLVIDO-SAL';
  const esCambioTurno = tipoLicencia?.codigo === 'CAMBIO-TUR';

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/licencias')}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/solicitudes/${licencia.solicitud_id}/editar`)}
          disabled={!licencia.solicitud_id}
        >
          Editar Solicitud
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Detalles de la Licencia
        </Typography>

        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Trabajador
            </Typography>
            <Typography variant="body1">
              {licencia.trabajador?.nombre_completo || 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Tipo de Licencia
            </Typography>
            <Typography variant="body1">
              {tipoLicencia?.nombre || 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha de Inicio
            </Typography>
            <Typography variant="body1">
              {esPorHoras ? formatDateTime(licencia.fecha_inicio) : formatDate(licencia.fecha_inicio)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha de Fin
            </Typography>
            <Typography variant="body1">
              {esPorHoras ? formatDateTime(licencia.fecha_fin) : formatDate(licencia.fecha_fin)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={licencia.estado}
              color={getEstadoColor(licencia.estado)}
              size="small"
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Detalles Específicos
        </Typography>
        <Grid container spacing={3}>
          {esOlvido && (
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Tipo de Olvido
              </Typography>
              <Typography variant="body1">
                {licencia.tipo_olvido_marcacion || 'No especificado'}
              </Typography>
            </Grid>
          )}

          {esPorHoras && !esOlvido && (
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Horas Totales
              </Typography>
              <Typography variant="body1">
                {licencia.horas_totales !== undefined ? Number(licencia.horas_totales).toFixed(2) : '-'}
              </Typography>
            </Grid>
          )}

          {esCambioTurno && (
            <React.Fragment>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha que no asiste
                </Typography>
                <Typography variant="body1">
                  {formatDate(licencia.fecha_no_asiste)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha que sí asiste
                </Typography>
                <Typography variant="body1">
                  {formatDate(licencia.fecha_si_asiste)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Cambio con
                </Typography>
                <Typography variant="body1">
                  {licencia.trabajador_cambio?.nombre_completo || 'No especificado'}
                </Typography>
              </Grid>
            </React.Fragment>
          )}

          {!esPorHoras && !esOlvido && !esCambioTurno && (
            <React.Fragment>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Días Totales
                </Typography>
                <Typography variant="body1">
                  {licencia.dias_totales}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Días Hábiles
                </Typography>
                <Typography variant="body1">
                  {licencia.dias_habiles}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Días Calendario
                </Typography>
                <Typography variant="body1">
                  {licencia.dias_calendario}
                </Typography>
              </Grid>
            </React.Fragment>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Motivo
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {licencia.motivo_cancelacion || 'Sin motivo'}
            </Typography>
          </Grid>

          {licencia.observaciones && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Observaciones
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {licencia.observaciones}
              </Typography>
            </Grid>
          )}
        </Grid>
        
        {licencia.estado === 'CANCELADA' && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Motivo de Cancelación
              </Typography>
              <Typography variant="body1">
                {licencia.motivo_cancelacion}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Fecha de Cancelación
              </Typography>
              <Typography variant="body1">
                {licencia.fecha_cancelacion ? formatDate(licencia.fecha_cancelacion) : '-'}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default LicenciaDetailsPage; 