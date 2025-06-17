import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createValidacion } from '../../store/slices/validacionesSlice';
import { fetchLicencias } from '../../store/slices/licenciasSlice';
import type { RootState } from '../../store';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert, MenuItem } from '@mui/material';
import type { AppDispatch } from '../../store';

const estados = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA'];

const CreateValidacionPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items: tiposLicencias } = useSelector((state: RootState) => state.tiposLicencias);
  const { items: trabajadores } = useSelector((state: RootState) => state.trabajadores);
  const [tipoLicenciaId, setTipoLicenciaId] = useState('');
  const [trabajadorId, setTrabajadorId] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estado, setEstado] = useState('PENDIENTE');
  const [observaciones, setObservaciones] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<{ tipoLicenciaId?: string; trabajadorId?: string; fechaInicio?: string; fechaFin?: string; estado?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!tipoLicenciaId) newErrors.tipoLicenciaId = 'El tipo de licencia es obligatorio';
    if (!trabajadorId) newErrors.trabajadorId = 'El trabajador es obligatorio';
    if (!fechaInicio) newErrors.fechaInicio = 'La fecha de inicio es obligatoria';
    if (!fechaFin) newErrors.fechaFin = 'La fecha de fin es obligatoria';
    if (fechaInicio && fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) newErrors.fechaFin = 'La fecha de fin debe ser posterior a la de inicio';
    if (!estado) newErrors.estado = 'El estado es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await dispatch(createValidacion({ tipoLicenciaId: Number(tipoLicenciaId), trabajadorId: Number(trabajadorId), fechaInicio, fechaFin, estado, observaciones }) as any).unwrap();
      await dispatch(fetchLicencias());
      setSnackbar({ open: true, message: 'Solicitud creada correctamente', severity: 'success' });
      setTimeout(() => navigate('/validaciones'), 1000);
    } catch {
      setSnackbar({ open: true, message: 'Error al crear la solicitud', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box maxWidth={600} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Nueva Solicitud de Permiso</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            select
            label="Tipo de Licencia"
            value={tipoLicenciaId}
            onChange={e => setTipoLicenciaId(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.tipoLicenciaId}
            helperText={errors.tipoLicenciaId}
          >
            <MenuItem value="">Seleccione...</MenuItem>
            {tiposLicencias.map((tipo) => (
              <MenuItem key={tipo.id} value={tipo.id}>{tipo.nombre}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Trabajador"
            value={trabajadorId}
            onChange={e => setTrabajadorId(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.trabajadorId}
            helperText={errors.trabajadorId}
          >
            <MenuItem value="">Seleccione...</MenuItem>
            {trabajadores.map((trabajador) => (
              <MenuItem key={trabajador.id} value={trabajador.id}>{trabajador.nombre} {trabajador.apellido}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Fecha Inicio"
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.fechaInicio}
            helperText={errors.fechaInicio}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Fecha Fin"
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.fechaFin}
            helperText={errors.fechaFin}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Estado"
            value={estado}
            onChange={e => setEstado(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.estado}
            helperText={errors.estado}
          >
            {estados.map((est) => (
              <MenuItem key={est} value={est}>{est}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Observaciones"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
          <Box mt={2} display="flex" gap={2}>
            <Button type="submit" variant="contained" color="primary">Crear</Button>
            <Button variant="outlined" onClick={() => navigate('/validaciones')}>Cancelar</Button>
          </Box>
        </form>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateValidacionPage; 