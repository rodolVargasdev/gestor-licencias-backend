import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { createSolicitud } from '../../store/slices/solicitudesSlice';
import { fetchTrabajadores } from '../../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../../store/slices/tiposLicenciasSlice';
import { fetchDisponibilidadByTrabajador } from '../../store/slices/disponibilidadSlice';
import type { RootState, AppDispatch } from '../../store';
import type { Solicitud } from '../../types/solicitud';
import type { DisponibilidadTrabajador } from '../../types/disponibilidad';
import type { PayloadAction } from '@reduxjs/toolkit';

const CreateLicenciaPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const trabajadores = useSelector((state: RootState) => state.trabajadores.items);
  const tiposLicencias = useSelector((state: RootState) => state.tiposLicencias.items);

  const [formData, setFormData] = useState<Partial<Solicitud>>({
    trabajador_id: 0,
    tipo_licencia_id: 0,
    fecha_inicio: '',
    fecha_fin: '',
    motivo: '',
    estado: 'APROBADA',
    fecha_solicitud: new Date().toISOString().split('T')[0],
    justificacion: '',
    documento: undefined
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [disponibilidad, setDisponibilidad] = useState<number | null>(null);
  const [periodoRenovacion, setPeriodoRenovacion] = useState<string>('');

  useEffect(() => {
    dispatch(fetchTrabajadores());
    dispatch(fetchTiposLicencias());
  }, [dispatch]);

  useEffect(() => {
    if (formData.trabajador_id && formData.tipo_licencia_id) {
      dispatch(fetchDisponibilidadByTrabajador(formData.trabajador_id)).then((action) => {
        const payload = (action as PayloadAction<DisponibilidadTrabajador[]>).payload;
        if (payload) {
          const disp = payload.find((d) => d.tipo_licencia.id === Number(formData.tipo_licencia_id));
          setDisponibilidad(disp ? disp.dias_restantes : null);
        }
      });
      const tipo = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
      setPeriodoRenovacion(tipo?.periodo_renovacion || '');
    } else {
      setDisponibilidad(null);
      setPeriodoRenovacion('');
    }
  }, [formData.trabajador_id, formData.tipo_licencia_id, tiposLicencias, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name === 'estado') return;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, documento: e.target.files?.[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const action = await dispatch(createSolicitud(formData));
      const newSolicitud = action.payload as Solicitud;
      if (formData.trabajador_id) {
        await dispatch(fetchDisponibilidadByTrabajador(formData.trabajador_id));
      }
      setSnackbar({
        open: true,
        message: 'Solicitud creada correctamente',
        severity: 'success'
      });
      if (newSolicitud && newSolicitud.id) {
        navigate(`/licencias/${newSolicitud.id}`);
      } else {
        navigate('/licencias');
      }
    } catch {
      setSnackbar({
        open: true,
        message: 'Error al crear la solicitud',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Obtener el tipo de licencia seleccionado
  const selectedTipoLicencia = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
  const requiereJustificacion = selectedTipoLicencia?.requiere_justificacion;
  const requiereDocumento = selectedTipoLicencia?.requiere_documentacion;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nueva Licencia
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Trabajador</InputLabel>
              <Select
                name="trabajador_id"
                value={formData.trabajador_id?.toString() || ''}
                onChange={handleChange}
                required
              >
                {trabajadores.map((trabajador) => (
                  <MenuItem key={trabajador.id} value={trabajador.id}>
                    {trabajador.nombre_completo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tipo de Licencia</InputLabel>
              <Select
                name="tipo_licencia_id"
                value={formData.tipo_licencia_id?.toString() || ''}
                onChange={handleChange}
                required
              >
                {tiposLicencias.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Inicio"
                value={formData.fecha_inicio ? new Date(formData.fecha_inicio) : null}
                onChange={handleDateChange('fecha_inicio')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Fin"
                value={formData.fecha_fin ? new Date(formData.fecha_fin) : null}
                onChange={handleDateChange('fecha_fin')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </LocalizationProvider>

            <TextField
              label="Fecha de Solicitud"
              name="fecha_solicitud"
              type="date"
              value={formData.fecha_solicitud}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              name="motivo"
              label="Motivo"
              value={formData.motivo}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              required
            />

            {requiereJustificacion && (
              <TextField
                label="Justificación"
                name="justificacion"
                value={formData.justificacion || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            )}

            {requiereDocumento && (
              <TextField
                label="Documento Soporte"
                name="documento"
                type="file"
                onChange={handleFileChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}

            <TextField
              label="Estado"
              name="estado"
              value="APROBADA"
              fullWidth
              InputProps={{ readOnly: true }}
            />

            {formData.trabajador_id && formData.tipo_licencia_id && (
              <Box sx={{ gridColumn: '1 / span 2', mb: 2 }}>
                <Alert severity="info">
                  Disponibilidad restante: <b>{disponibilidad !== null ? disponibilidad : 'N/A'}</b> días.<br />
                  Periodo de renovación: <b>{periodoRenovacion ? (periodoRenovacion === 'ANUAL' ? 'Anual' : 'Mensual') : 'N/A'}</b>
                </Alert>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', gridColumn: '1 / -1' }}>
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
              >
                Crear Licencia
              </Button>
            </Box>
          </Box>
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

export default CreateLicenciaPage; 