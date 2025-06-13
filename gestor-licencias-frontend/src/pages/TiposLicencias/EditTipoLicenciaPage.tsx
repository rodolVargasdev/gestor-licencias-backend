import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTiposLicencias, updateTipoLicencia } from '../../store/slices/tiposLicenciasSlice';
import type { RootState } from '../../store';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert } from '@mui/material';

const EditTipoLicenciaPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { items: tiposLicencias, loading } = useSelector((state: RootState) => state.tiposLicencias);
  const tipoLicencia = tiposLicencias.find((t) => t.id === Number(id));
  const [nombre, setNombre] = useState(tipoLicencia?.nombre || '');
  const [descripcion, setDescripcion] = useState(tipoLicencia?.descripcion || '');
  const [diasMaximos, setDiasMaximos] = useState(tipoLicencia?.diasMaximos?.toString() || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<{ nombre?: string; diasMaximos?: string }>({});

  useEffect(() => {
    if (!tipoLicencia && id) {
      dispatch(fetchTiposLicencias() as any);
    }
    // eslint-disable-next-line
  }, [tipoLicencia, id, dispatch]);

  useEffect(() => {
    if (tipoLicencia) {
      setNombre(tipoLicencia.nombre || '');
      setDescripcion(tipoLicencia.descripcion || '');
      setDiasMaximos(tipoLicencia.diasMaximos?.toString() || '');
    }
  }, [tipoLicencia]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!diasMaximos.trim() || isNaN(Number(diasMaximos)) || Number(diasMaximos) <= 0) newErrors.diasMaximos = 'Días máximos debe ser un número positivo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;
    try {
      await dispatch(updateTipoLicencia({ id: Number(id), dto: { nombre, descripcion, diasMaximos: Number(diasMaximos) } }) as any).unwrap();
      setSnackbar({ open: true, message: 'Tipo de licencia actualizado correctamente', severity: 'success' });
      setTimeout(() => navigate('/tipos-licencias'), 1000);
    } catch {
      setSnackbar({ open: true, message: 'Error al actualizar el tipo de licencia', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (loading) return <Typography>Cargando...</Typography>;
  if (!tipoLicencia) return <Typography color="error">Tipo de licencia no encontrado</Typography>;

  return (
    <Box maxWidth={500} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Editar Tipo de Licencia</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.nombre}
            helperText={errors.nombre}
          />
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
          <TextField
            label="Días Máximos"
            value={diasMaximos}
            onChange={e => setDiasMaximos(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.diasMaximos}
            helperText={errors.diasMaximos}
            type="number"
            inputProps={{ min: 1 }}
          />
          <Box mt={2} display="flex" gap={2}>
            <Button type="submit" variant="contained" color="primary">Guardar</Button>
            <Button variant="outlined" onClick={() => navigate('/tipos-licencias')}>Cancelar</Button>
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

export default EditTipoLicenciaPage; 