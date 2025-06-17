import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { fetchLicenciaById, updateLicencia, fetchLicencias } from '../../store/slices/licenciasSlice';
import { fetchSolicitudes, updateSolicitud } from '../../store/slices/solicitudesSlice';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

function calcularDiasHabiles(fechaInicio: Date | null, fechaFin: Date | null): number {
  if (!fechaInicio || !fechaFin) return 0;
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  let count = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++; // 0: domingo, 6: sábado
  }
  return count;
}

const EditLicenciaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedItem: licencia, loading, error } = useSelector((state: RootState) => state.licencias);
  const { items: trabajadores } = useSelector((state: RootState) => state.trabajadores);
  const { items: tiposLicencias } = useSelector((state: RootState) => state.tiposLicencias);

  const [formData, setFormData] = useState({
    trabajador_id: '',
    tipo_licencia_id: '',
    fecha_inicio: null as Date | null,
    fecha_fin: null as Date | null,
    motivo: '',
    observaciones: '',
    estado: '',
    motivo_cancelacion: '',
    dias_habiles: 0
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [codigoTrabajador, setCodigoTrabajador] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchLicenciaById(parseInt(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (licencia) {
      setFormData({
        trabajador_id: licencia.trabajador_id.toString(),
        tipo_licencia_id: licencia.tipo_licencia_id.toString(),
        fecha_inicio: new Date(licencia.fecha_inicio),
        fecha_fin: new Date(licencia.fecha_fin),
        motivo: licencia.motivo,
        observaciones: licencia.observaciones || '',
        estado: licencia.estado,
        motivo_cancelacion: licencia.motivo_cancelacion || '',
        dias_habiles: calcularDiasHabiles(new Date(licencia.fecha_inicio), new Date(licencia.fecha_fin))
      });
    }
  }, [licencia]);

  useEffect(() => {
    if (codigoTrabajador.trim() !== '') {
      const found = trabajadores.find(t => t.codigo.toLowerCase() === codigoTrabajador.trim().toLowerCase());
      if (found) {
        setFormData(prev => ({ ...prev, trabajador_id: found.id.toString() }));
      }
    }
  }, [codigoTrabajador, trabajadores]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name: string) => (date: Date | null) => {
    const newFormData = {
      ...formData,
      [name]: date
    };
    // Si cambia fecha_inicio o fecha_fin, recalcula días hábiles
    const fechaInicio = name === 'fecha_inicio' ? date : newFormData.fecha_inicio;
    const fechaFin = name === 'fecha_fin' ? date : newFormData.fecha_fin;
    newFormData.dias_habiles = calcularDiasHabiles(fechaInicio, fechaFin);
    setFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await dispatch(updateLicencia({
        id: parseInt(id),
        ...formData,
        trabajador_id: Number(formData.trabajador_id),
        tipo_licencia_id: Number(formData.tipo_licencia_id),
        fecha_inicio: formData.fecha_inicio ? (formData.fecha_inicio as Date).toISOString().split('T')[0] : '',
        fecha_fin: formData.fecha_fin ? (formData.fecha_fin as Date).toISOString().split('T')[0] : '',
        estado: formData.estado as 'ACTIVA' | 'CANCELADA' | 'FINALIZADA' | 'APROBADA',
      }));
      if (licencia?.solicitud_id) {
        await dispatch(updateSolicitud({
          id: licencia.solicitud_id,
          trabajador_id: Number(formData.trabajador_id),
          tipo_licencia_id: Number(formData.tipo_licencia_id),
          fecha_inicio: formData.fecha_inicio ? (formData.fecha_inicio as Date).toISOString().split('T')[0] : '',
          fecha_fin: formData.fecha_fin ? (formData.fecha_fin as Date).toISOString().split('T')[0] : '',
          motivo: formData.motivo,
          observaciones: formData.observaciones,
          estado: formData.estado,
          motivo_cancelacion: formData.motivo_cancelacion,
        }));
      }
      await dispatch(fetchSolicitudes());
      await dispatch(fetchLicencias());
      setSnackbar({
        open: true,
        message: 'Licencia y solicitud actualizadas correctamente',
        severity: 'success'
      });
      setTimeout(() => navigate('/licencias'), 300);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al actualizar la licencia',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/licencias')}
        >
          Volver
        </Button>
        <Typography variant="h4">Editar Licencia</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Código de trabajador"
                value={codigoTrabajador}
                onChange={e => setCodigoTrabajador(e.target.value)}
                fullWidth
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Trabajador"
                name="trabajador_id"
                value={formData.trabajador_id}
                onChange={handleChange}
                required
              >
                {trabajadores.map((trabajador) => (
                  <MenuItem key={trabajador.id} value={trabajador.id}>
                    {trabajador.nombre_completo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tipo de Licencia"
                name="tipo_licencia_id"
                value={formData.tipo_licencia_id}
                onChange={handleChange}
                required
              >
                {tiposLicencias.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de Inicio"
                  value={formData.fecha_inicio}
                  onChange={handleDateChange('fecha_inicio')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de Fin"
                  value={formData.fecha_fin}
                  onChange={handleDateChange('fecha_fin')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Días Hábiles"
                name="dias_habiles"
                value={formData.dias_habiles || ''}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                required
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
              >
                <MenuItem value="ACTIVA">Activa</MenuItem>
                <MenuItem value="CANCELADA">Cancelada</MenuItem>
                <MenuItem value="FINALIZADA">Finalizada</MenuItem>
              </TextField>
            </Grid>

            {formData.estado === 'CANCELADA' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Motivo de Cancelación"
                  name="motivo_cancelacion"
                  value={formData.motivo_cancelacion}
                  onChange={handleChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/licencias')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Guardar Cambios
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditLicenciaPage; 