import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPuestos, updatePuesto } from '../../store/slices/puestosSlice';
import type { RootState } from '../../store';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert } from '@mui/material';

const EditPuestoPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { items: puestos, loading } = useSelector((state: RootState) => state.puestos);
  const puesto = puestos.find((d) => d.id === Number(id));
  const [nombre, setNombre] = useState(puesto?.nombre || '');
  const [descripcion, setDescripcion] = useState(puesto?.descripcion || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<{ nombre?: string }>({});

  useEffect(() => {
    if (!puesto && id) {
      dispatch(fetchPuestos() as any);
    }
    // eslint-disable-next-line
  }, [puesto, id, dispatch]);

  useEffect(() => {
    if (puesto) {
      setNombre(puesto.nombre || '');
      setDescripcion(puesto.descripcion || '');
    }
  }, [puesto]);

  const validate = () => {
    const newErrors: { nombre?: string } = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;
    try {
      await dispatch(updatePuesto({ id: Number(id), dto: { nombre, descripcion } }) as any).unwrap();
      setSnackbar({ open: true, message: 'Puesto actualizado correctamente', severity: 'success' });
      setTimeout(() => navigate('/puestos'), 1000);
    } catch {
      setSnackbar({ open: true, message: 'Error al actualizar el puesto', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (loading) return <Typography>Cargando...</Typography>;
  if (!puesto) return <Typography color="error">Puesto no encontrado</Typography>;

  return (
    <Box maxWidth={500} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Editar Puesto</Typography>
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
          <Box mt={2} display="flex" gap={2}>
            <Button type="submit" variant="contained" color="primary">Guardar</Button>
            <Button variant="outlined" onClick={() => navigate('/puestos')}>Cancelar</Button>
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

export default EditPuestoPage; 