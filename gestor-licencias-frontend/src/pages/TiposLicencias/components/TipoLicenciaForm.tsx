import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import type { CreateTipoLicenciaDTO } from '../../../types/tipoLicencia';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { createTipoLicencia, updateTipoLicencia } from '../../../store/slices/tiposLicenciasSlice';

interface TipoLicenciaFormProps {
  initialValues?: CreateTipoLicenciaDTO;
  isEditing?: boolean;
  id?: number;
}

const validationSchema = Yup.object({
  codigo: Yup.string()
    .required('El código es requerido')
    .min(3, 'El código debe tener al menos 3 caracteres'),
  nombre: Yup.string()
    .required('El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: Yup.string()
    .required('La descripción es requerida')
    .min(10, 'La descripción debe tener al menos 10 caracteres'),
  dias_maximos: Yup.number()
    .required('Los días máximos son requeridos')
    .min(1, 'Los días máximos deben ser mayores a 0'),
  personal_operativo: Yup.boolean(),
  personal_administrativo: Yup.boolean(),
  goce_salario: Yup.boolean()
});

const TipoLicenciaForm: React.FC<TipoLicenciaFormProps> = ({
  initialValues,
  isEditing = false,
  id
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: initialValues || {
      codigo: '',
      nombre: '',
      descripcion: '',
      dias_maximos: 0,
      personal_operativo: false,
      personal_administrativo: false,
      goce_salario: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing && id) {
          await dispatch(updateTipoLicencia({ id, data: values })).unwrap();
        } else {
          await dispatch(createTipoLicencia(values)).unwrap();
        }
        navigate('/tipos-licencias');
      } catch (error) {
        console.error('Error al guardar:', error);
      }
    }
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {isEditing ? 'Editar Tipo de Licencia' : 'Nuevo Tipo de Licencia'}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="codigo"
              name="codigo"
              label="Código"
              value={formik.values.codigo}
              onChange={formik.handleChange}
              error={formik.touched.codigo && Boolean(formik.errors.codigo)}
              helperText={formik.touched.codigo && formik.errors.codigo}
            />
          </Grid>

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

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="descripcion"
              name="descripcion"
              label="Descripción"
              multiline
              rows={4}
              value={formik.values.descripcion}
              onChange={formik.handleChange}
              error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
              helperText={formik.touched.descripcion && formik.errors.descripcion}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="dias_maximos"
              name="dias_maximos"
              label="Días Máximos"
              type="number"
              value={formik.values.dias_maximos}
              onChange={formik.handleChange}
              error={formik.touched.dias_maximos && Boolean(formik.errors.dias_maximos)}
              helperText={formik.touched.dias_maximos && formik.errors.dias_maximos}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.personal_operativo}
                  onChange={formik.handleChange}
                  name="personal_operativo"
                />
              }
              label="Personal Operativo"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.personal_administrativo}
                  onChange={formik.handleChange}
                  name="personal_administrativo"
                />
              }
              label="Personal Administrativo"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.goce_salario}
                  onChange={formik.handleChange}
                  name="goce_salario"
                />
              }
              label="Goce Salario"
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/tipos-licencias')}
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

export default TipoLicenciaForm; 