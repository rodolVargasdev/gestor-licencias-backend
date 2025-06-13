import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTrabajador } from '../../store/slices/trabajadoresSlice';
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
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';

const CreateTrabajadorPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    codigo: '',
    nombre_completo: '',
    email: '',
    telefono: '',
    departamento_id: '',
    puesto_id: '',
    tipo_personal: '',
    fecha_ingreso: null as Date | null,
    activo: true
  });
  const [departamentos, setDepartamentos] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch departamentos and puestos
    const fetchData = async () => {
      try {
        const [departamentosRes, puestosRes] = await Promise.all([
          fetch('http://localhost:3000/api/departamentos'),
          fetch('http://localhost:3000/api/puestos')
        ]);
        const [departamentosData, puestosData] = await Promise.all([
          departamentosRes.json(),
          puestosRes.json()
        ]);
        setDepartamentos(departamentosData);
        setPuestos(puestosData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.codigo.trim()) newErrors.codigo = 'El código es obligatorio';
    if (!formData.nombre_completo.trim()) newErrors.nombre_completo = 'El nombre completo es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';
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
    if (!validate()) return;
    try {
      await dispatch(createTrabajador(formData) as any).unwrap();
      setSnackbar({ open: true, message: 'Trabajador creado correctamente', severity: 'success' });
      setTimeout(() => navigate('/trabajadores'), 1000);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al crear el trabajador', severity: 'error' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      fecha_ingreso: date
    }));
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box maxWidth={800} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Crear Trabajador</Typography>
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
              {departamentos.map((depto: any) => (
                <MenuItem key={depto.id} value={depto.id}>
                  {depto.nombre}
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
              {puestos.map((puesto: any) => (
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
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
            <DatePicker
              label="Fecha de Ingreso"
              value={formData.fecha_ingreso}
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
            <Button type="submit" variant="contained" color="primary">Crear</Button>
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

export default CreateTrabajadorPage; 