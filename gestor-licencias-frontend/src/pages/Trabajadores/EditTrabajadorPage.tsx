import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateTrabajador, fetchTrabajadorById } from '../../store/slices/trabajadoresSlice';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Snackbar, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import type { RootState } from '../../store';
import type { UpdateTrabajadorDTO } from '../../types/trabajador';
import { fetchDepartamentos } from '../../store/slices/departamentosSlice';
import { fetchPuestos } from '../../store/slices/puestosSlice';

const EditTrabajadorPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedTrabajador: trabajador, loading, error } = useSelector((state: RootState) => state.trabajadores);
  const [formData, setFormData] = useState<UpdateTrabajadorDTO>({
    codigo: '',
    nombre_completo: '',
    email: '',
    telefono: '',
    departamento_id: 0,
    puesto_id: 0,
    tipo_personal: 'OPERATIVO',
    fecha_ingreso: '',
    activo: true
  });
  const departamentos = useSelector((state: RootState) => state.departamentos.items);
  const puestos = useSelector((state: RootState) => state.puestos.items);
  const loadingDepartamentos = useSelector((state: RootState) => state.departamentos.loading);
  const loadingPuestos = useSelector((state: RootState) => state.puestos.loading);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchDepartamentos());
    dispatch(fetchPuestos());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchTrabajadorById(parseInt(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (trabajador) {
      setFormData({
        codigo: trabajador.codigo,
        nombre_completo: trabajador.nombre_completo,
        email: trabajador.email,
        telefono: trabajador.telefono || '',
        departamento_id: trabajador.departamento_id || 0,
        puesto_id: trabajador.puesto_id || 0,
        tipo_personal: trabajador.tipo_personal,
        fecha_ingreso: trabajador.fecha_ingreso,
        activo: trabajador.activo
      });
    }
  }, [trabajador]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.codigo?.trim()) newErrors.codigo = 'El código es obligatorio';
    if (!formData.nombre_completo?.trim()) newErrors.nombre_completo = 'El nombre completo es obligatorio';
    if (!formData.email?.trim()) newErrors.email = 'El email es obligatorio';
    if (!formData.departamento_id) newErrors.departamento_id = 'El departamento es obligatorio';
    if (!formData.puesto_id) newErrors.puesto_id = 'El puesto es obligatorio';
    if (!formData.tipo_personal) newErrors.tipo_personal = 'El tipo de personal es obligatorio';
    if (!formData.fecha_ingreso) newErrors.fecha_ingreso = 'La fecha de ingreso es obligatoria';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;
    try {
      await dispatch(updateTrabajador({ 
        id: parseInt(id), 
        data: formData 
      })).unwrap();
      setSnackbar({ open: true, message: 'Trabajador actualizado correctamente', severity: 'success' });
      setTimeout(() => navigate('/trabajadores'), 1000);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al actualizar el trabajador', severity: 'error' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      fecha_ingreso: date ? date.toISOString().split('T')[0] : ''
    }));
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (
    loading ||
    loadingDepartamentos ||
    loadingPuestos ||
    !Array.isArray(departamentos) || departamentos.length === 0 ||
    !Array.isArray(puestos) || puestos.length === 0
  ) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!trabajador) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Trabajador no encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth={800} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Editar Trabajador</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            name="codigo"
            label="Código"
            value={formData.codigo}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.codigo}
            helperText={errors.codigo}
          />
          <TextField
            name="nombre_completo"
            label="Nombre Completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.nombre_completo}
            helperText={errors.nombre_completo}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            name="telefono"
            label="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal" error={!!errors.departamento_id}>
            <InputLabel>Departamento</InputLabel>
            <Select
              name="departamento_id"
              value={formData.departamento_id}
              onChange={handleChange}
              label="Departamento"
            >
              {(Array.isArray(departamentos) ? departamentos : []).map((dep) => (
                <MenuItem key={dep.id} value={dep.id}>
                  {dep.nombre}
                </MenuItem>
              ))}
            </Select>
            {errors.departamento_id && <FormHelperText>{errors.departamento_id}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth margin="normal" error={!!errors.puesto_id}>
            <InputLabel>Puesto</InputLabel>
            <Select
              name="puesto_id"
              value={formData.puesto_id}
              onChange={handleChange}
              label="Puesto"
            >
              {(Array.isArray(puestos) ? puestos : []).map((puesto) => (
                <MenuItem key={puesto.id} value={puesto.id}>
                  {puesto.nombre}
                </MenuItem>
              ))}
            </Select>
            {errors.puesto_id && <FormHelperText>{errors.puesto_id}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth margin="normal" error={!!errors.tipo_personal}>
            <InputLabel>Tipo de Personal</InputLabel>
            <Select
              name="tipo_personal"
              value={formData.tipo_personal}
              onChange={handleChange}
              label="Tipo de Personal"
            >
              <MenuItem value="OPERATIVO">Operativo</MenuItem>
              <MenuItem value="ADMINISTRATIVO">Administrativo</MenuItem>
            </Select>
            {errors.tipo_personal && <FormHelperText>{errors.tipo_personal}</FormHelperText>}
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de Ingreso"
              value={formData.fecha_ingreso ? new Date(formData.fecha_ingreso) : null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  error: !!errors.fecha_ingreso,
                  helperText: errors.fecha_ingreso
                }
              }}
            />
          </LocalizationProvider>
          <Box mt={2} display="flex" gap={2}>
            <Button type="submit" variant="contained" color="primary">Guardar</Button>
            <Button variant="outlined" onClick={() => navigate('/trabajadores')}>Cancelar</Button>
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

export default EditTrabajadorPage; 