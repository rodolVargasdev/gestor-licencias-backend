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
import { createLicencia } from '../../store/slices/licenciasSlice';
import { fetchTrabajadores } from '../../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../../store/slices/tiposLicenciasSlice';
import { fetchDisponibilidadByTrabajador } from '../../store/slices/disponibilidadSlice';
import type { RootState, AppDispatch } from '../../store';
import type { Licencia } from '../../types/licencia';

const CreateLicenciaPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const trabajadores = useSelector((state: RootState) => state.trabajadores.items);
  const tiposLicencias = useSelector((state: RootState) => state.tiposLicencias.items);
  
  const [formData, setFormData] = useState<Partial<Licencia>>({
    trabajador_id: 0,
    tipo_licencia_id: 0,
    fecha_inicio: '',
    fecha_fin: '',
    dias_totales: 0,
    dias_habiles: 0,
    dias_calendario: 0,
    estado: 'ACTIVA',
    motivo: '',
    observaciones: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    dispatch(fetchTrabajadores());
    dispatch(fetchTiposLicencias());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
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

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calcular días hábiles (excluyendo fines de semana)
    let businessDays = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // 0 es domingo, 6 es sábado
        businessDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    setFormData(prev => ({
      ...prev,
      dias_totales: diffDays + 1,
      dias_calendario: diffDays + 1,
      dias_habiles: businessDays
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createLicencia(formData));
      if (formData.trabajador_id) {
        await dispatch(fetchDisponibilidadByTrabajador(formData.trabajador_id));
      }
      setSnackbar({
        open: true,
        message: 'Licencia creada correctamente',
        severity: 'success'
      });
      navigate('/licencias');
    } catch {
      setSnackbar({
        open: true,
        message: 'Error al crear la licencia',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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
                onChange={(date) => {
                  handleDateChange('fecha_fin')(date);
                  if (date && formData.fecha_inicio) {
                    calculateDays(formData.fecha_inicio, date.toISOString().split('T')[0]);
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </LocalizationProvider>

            <TextField
              name="dias_totales"
              label="Días Totales"
              value={formData.dias_totales}
              InputProps={{ readOnly: true }}
              fullWidth
            />

            <TextField
              name="dias_habiles"
              label="Días Hábil"
              value={formData.dias_habiles}
              InputProps={{ readOnly: true }}
              fullWidth
            />

            <TextField
              name="dias_calendario"
              label="Días Calendario"
              value={formData.dias_calendario}
              InputProps={{ readOnly: true }}
              fullWidth
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

            <TextField
              name="observaciones"
              label="Observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />

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