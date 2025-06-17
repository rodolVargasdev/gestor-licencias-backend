import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSolicitudById, updateSolicitud } from '../../store/slices/solicitudesSlice';
import type { RootState, AppDispatch } from '../../store';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert } from '@mui/material';
import type { Solicitud } from '../../types/solicitud';

function calcularDiasHabiles(fechaInicio: string, fechaFin: string): number {
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

const EditSolicitudPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const solicitud = useSelector((state: RootState) => state.solicitudes.selectedItem);
  const [formData, setFormData] = useState<Partial<Solicitud>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (id) {
      dispatch(fetchSolicitudById(Number(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (solicitud) {
      setFormData(solicitud);
    }
  }, [solicitud]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    // Si cambia fecha_inicio o fecha_fin, recalcula días hábiles
    if (name === 'fecha_inicio' || name === 'fecha_fin') {
      const fechaInicio = name === 'fecha_inicio' ? value : newFormData.fecha_inicio;
      const fechaFin = name === 'fecha_fin' ? value : newFormData.fecha_fin;
      newFormData.dias_habiles = calcularDiasHabiles(fechaInicio || '', fechaFin || '');
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await dispatch(updateSolicitud({ id: Number(id), ...formData }));
      setSnackbar({ open: true, message: 'Solicitud actualizada correctamente', severity: 'success' });
      setTimeout(() => navigate('/licencias'), 1000);
    } catch {
      setSnackbar({ open: true, message: 'Error al actualizar la solicitud', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  if (!formData) return <Typography>Cargando...</Typography>;

  return (
    <Box maxWidth={600} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Editar Solicitud</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Motivo"
            name="motivo"
            value={formData.motivo || ''}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Fecha Inicio"
            name="fecha_inicio"
            type="date"
            value={formData.fecha_inicio || ''}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Fecha Fin"
            name="fecha_fin"
            type="date"
            value={formData.fecha_fin || ''}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Estado"
            name="estado"
            value={formData.estado || ''}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Observaciones"
            name="observaciones"
            value={formData.observaciones || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Días Hábiles"
            name="dias_habiles"
            value={formData.dias_habiles || ''}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/licencias')}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Guardar Cambios</Button>
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

export default EditSolicitudPage; 