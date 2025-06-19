import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { fetchLicenciaById } from '../../store/slices/licenciasSlice';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const LicenciaDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedItem: licencia, loading, error } = useSelector((state: RootState) => state.licencias);

  useEffect(() => {
    if (id) {
      dispatch(fetchLicenciaById(parseInt(id)));
    }
  }, [dispatch, id]);

  const getEstadoColor = (estado: string) => {
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

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
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

  const esPorHoras = (licencia.tipo_licencia && (licencia.tipo_licencia as import('../../types/tipoLicencia').TipoLicencia).unidad_control === 'horas');

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
          onClick={() => navigate(`/licencias/${id}/editar`)}
        >
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Detalles de la Licencia
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Trabajador
            </Typography>
            <Typography variant="body1">
              {licencia.trabajador?.nombre_completo}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Tipo de Licencia
            </Typography>
            <Typography variant="body1">
              {licencia.tipo_licencia?.nombre}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha de Inicio
            </Typography>
            <Typography variant="body1">
              {formatDate(licencia.fecha_inicio)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Fecha de Fin
            </Typography>
            <Typography variant="body1">
              {formatDate(licencia.fecha_fin)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={licencia.estado}
              color={getEstadoColor(licencia.estado) as any}
              size="small"
            />
          </Grid>

          {esPorHoras ? (
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Horas Totales
              </Typography>
              <Typography variant="body1">
                {licencia.horas_totales !== undefined ? Number(licencia.horas_totales).toFixed(2) : '-'}
              </Typography>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Días Totales
                </Typography>
                <Typography variant="body1">
                  {esPorHoras ? (licencia.horas_totales !== undefined ? Number(licencia.horas_totales).toFixed(2) : '-') : licencia.dias_totales}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Días Hábil
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
            </>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Motivo
            </Typography>
            <Typography variant="body1">
              {licencia.motivo}
            </Typography>
          </Grid>

          {licencia.observaciones && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Observaciones
              </Typography>
              <Typography variant="body1">
                {licencia.observaciones}
              </Typography>
            </Grid>
          )}

          {licencia.estado === 'CANCELADA' && (
            <>
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
            </>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default LicenciaDetailsPage; 