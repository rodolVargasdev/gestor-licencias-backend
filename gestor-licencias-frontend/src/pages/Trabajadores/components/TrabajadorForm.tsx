import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import type { CreateTrabajadorDTO } from '../../../types/trabajador';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { createTrabajador, updateTrabajador } from '../../../store/slices/trabajadoresSlice';

interface TrabajadorFormProps {
  initialValues?: CreateTrabajadorDTO;
  isEditing?: boolean;
  id?: number;
}

const validationSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: Yup.string()
    .required('El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  telefono: Yup.string()
    .required('El teléfono es requerido')
    .matches(/^[0-9]+$/, 'El teléfono solo debe contener números'),
  departamento: Yup.string()
    .required('El departamento es requerido'),
  cargo: Yup.string()
    .required('El cargo es requerido'),
  fecha_ingreso: Yup.date()
    .required('La fecha de ingreso es requerida')
    .max(new Date(), 'La fecha de ingreso no puede ser futura')
});

const departamentos = [
  'Recursos Humanos',
  'Desarrollo',
  'Marketing',
  'Ventas',
  'Finanzas',
  'Operaciones',
  'Soporte',
  'Administración'
];

const cargos = [
  'Gerente',
  'Supervisor',
  'Analista',
  'Desarrollador',
  'Diseñador',
  'Especialista',
  'Asistente',
  'Coordinador'
];

const TrabajadorForm: React.FC<TrabajadorFormProps> = ({
  initialValues,
  isEditing = false,
  id
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: initialValues || {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      departamento: '',
      cargo: '',
      fecha_ingreso: new Date().toISOString().split('T')[0]
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing && id) {
          await dispatch(updateTrabajador({ id, data: values })).unwrap();
        } else {
          await dispatch(createTrabajador(values)).unwrap();
        }
        navigate('/trabajadores');
      } catch (error) {
        console.error('Error al guardar:', error);
      }
    }
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {isEditing ? 'Editar Trabajador' : 'Nuevo Trabajador'}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="nombre"
              name="nombre"
              label="Nombre"
              value={formik.values.nombre}
              onChange={formik.handleChange}
              error={formik.touched.nombre && Boolean(formik.errors.nombre)}
              helperText={formik.touched.nombre && formik.errors.nombre}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="apellido"
              name="apellido"
              label="Apellido"
              value={formik.values.apellido}
              onChange={formik.handleChange}
              error={formik.touched.apellido && Boolean(formik.errors.apellido)}
              helperText={formik.touched.apellido && formik.errors.apellido}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="telefono"
              name="telefono"
              label="Teléfono"
              value={formik.values.telefono}
              onChange={formik.handleChange}
              error={formik.touched.telefono && Boolean(formik.errors.telefono)}
              helperText={formik.touched.telefono && formik.errors.telefono}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={formik.touched.departamento && Boolean(formik.errors.departamento)}>
              <InputLabel>Departamento</InputLabel>
              <Select
                id="departamento"
                name="departamento"
                value={formik.values.departamento}
                onChange={formik.handleChange}
                label="Departamento"
              >
                {departamentos.map((departamento) => (
                  <MenuItem key={departamento} value={departamento}>
                    {departamento}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={formik.touched.cargo && Boolean(formik.errors.cargo)}>
              <InputLabel>Cargo</InputLabel>
              <Select
                id="cargo"
                name="cargo"
                value={formik.values.cargo}
                onChange={formik.handleChange}
                label="Cargo"
              >
                {cargos.map((cargo) => (
                  <MenuItem key={cargo} value={cargo}>
                    {cargo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="fecha_ingreso"
              name="fecha_ingreso"
              label="Fecha de Ingreso"
              type="date"
              value={formik.values.fecha_ingreso}
              onChange={formik.handleChange}
              error={formik.touched.fecha_ingreso && Boolean(formik.errors.fecha_ingreso)}
              helperText={formik.touched.fecha_ingreso && formik.errors.fecha_ingreso}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/trabajadores')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default TrabajadorForm; 