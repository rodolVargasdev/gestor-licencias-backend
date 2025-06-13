import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDepartamentos, updateDepartamento } from '../../store/slices/departamentosSlice';
import type { RootState } from '../../store';
import type { AppDispatch } from '../../store';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert, FormControlLabel, Switch } from '@mui/material';

const EditDepartamentoPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { items: departamentos, loading } = useSelector((state: RootState) => state.departamentos);
  const departamento = departamentos.find((d) => d.id === Number(id));
  const [nombre, setNombre] = useState(departamento?.nombre || '');
  const [descripcion, setDescripcion] = useState(departamento?.descripcion || '');
  const [activo, setActivo] = useState(departamento?.activo ?? true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<{ nombre?: string }>({});

  useEffect(() => {
    if (!departamento && id) {
      dispatch(fetchDepartamentos());
    }
  }, [departamento, id, dispatch]);

  useEffect(() => {
    if (departamento) {
      setNombre(departamento.nombre || '');
      setDescripcion(departamento.descripcion || '');
      setActivo(departamento.activo ?? true);
    }
  }, [departamento]);

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
      await dispatch(updateDepartamento({ 
        id: Number(id), 
        dto: { nombre, descripcion, activo } 
      })).unwrap();
      setSnackbar({ open: true, message: 'Departamento actualizado correctamente', severity: 'success' });
      setTimeout(() => navigate('/departamentos'), 1000);
    } catch (error) {
      console.error('Error al actualizar departamento:', error);
      setSnackbar({ open: true, message: 'Error al actualizar el departamento', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (loading) return <Typography>Cargando...</Typography>;
  if (!departamento) return <Typography color="error">Departamento no encontrado</Typography>;

  return (
    <Box maxWidth={500} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Editar Departamento</Typography>
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
          <FormControlLabel
            control={
              <Switch
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                color="primary"
              />
            }
            label="Activo"
            sx={{ mt: 2 }}
          />
          <Box mt={2} display="flex" gap={2}>
            <Button type="submit" variant="contained" color="primary">Guardar</Button>
            <Button variant="outlined" onClick={() => navigate('/departamentos')}>Cancelar</Button>
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

export default EditDepartamentoPage; 