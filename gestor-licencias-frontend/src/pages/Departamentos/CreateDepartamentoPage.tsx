import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createDepartamento } from '../../store/slices/departamentosSlice';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert } from '@mui/material';
import type { AppDispatch } from '../../store';

const CreateDepartamentoPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<{ nombre?: string }>({});

  const validate = () => {
    const newErrors: { nombre?: string } = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await dispatch(createDepartamento({ nombre, descripcion, activo: true })).unwrap();
      setSnackbar({ open: true, message: 'Departamento creado correctamente', severity: 'success' });
      setTimeout(() => navigate('/departamentos'), 1000);
    } catch (error) {
      console.error('Error al crear departamento:', error);
      setSnackbar({ open: true, message: 'Error al crear el departamento', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box maxWidth={500} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Crear Departamento</Typography>
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
            <Button type="submit" variant="contained" color="primary">Crear</Button>
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

export default CreateDepartamentoPage; 