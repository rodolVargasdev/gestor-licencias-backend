import React, { useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import type { CreateControlLimiteDTO } from '../../../types/controlLimite';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppDispatch';
import { createControlLimite, updateControlLimite } from '../../../store/slices/controlLimitesSlice';
import { fetchTiposLicencias } from '../../../store/slices/tiposLicenciasSlice';

interface ControlLimiteFormProps {
  initialValues?: CreateControlLimiteDTO;
  isEditing?: boolean;
  id?: number;
}

const validationSchema = Yup.object({
  tipo_licencia_id: Yup.number()
    .required('El tipo de licencia es requerido'),
  anio: Yup.number()
    .required('El año es requerido')
    .min(2000, 'El año debe ser mayor a 2000')
    .max(2100, 'El año debe ser menor a 2100'),
  limite_mensual: Yup.number()
    .required('El límite mensual es requerido')
    .min(0, 'El límite mensual debe ser mayor o igual a 0'),
  limite_anual: Yup.number()
    .required('El límite anual es requerido')
    .min(0, 'El límite anual debe ser mayor o igual a 0')
    .test('max', 'El límite anual debe ser mayor o igual al límite mensual', function(value) {
      return value >= this.parent.limite_mensual;
    })
});

const ControlLimiteForm: React.FC<ControlLimiteFormProps> = ({
  initialValues,
  isEditing = false,
  id
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: tiposLicencias } = useAppSelector((state) => state.tiposLicencias);

  useEffect(() => {
    dispatch(fetchTiposLicencias());
  }, [dispatch]);

  const formik = useFormik<CreateControlLimiteDTO>({
    initialValues: initialValues || {
      tipo_licencia_id: 0,
      anio: new Date().getFullYear(),
      limite_mensual: 0,
      limite_anual: 0
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing && id) {
          await dispatch(updateControlLimite({ id, data: values })).unwrap();
        } else {
          await dispatch(createControlLimite(values)).unwrap();
        }
        navigate('/control-limites');
      } catch (error) {
        console.error('Error al guardar:', error);
      }
    }
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {isEditing ? 'Editar Control de Límites' : 'Nuevo Control de Límites'}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={formik.touched.tipo_licencia_id && Boolean(formik.errors.tipo_licencia_id)}>
              <InputLabel>Tipo de Licencia</InputLabel>
              <Select
                id="tipo_licencia_id"
                name="tipo_licencia_id"
                value={formik.values.tipo_licencia_id}
                onChange={formik.handleChange}
                label="Tipo de Licencia"
              >
                {tiposLicencias.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="anio"
              name="anio"
              label="Año"
              type="number"
              value={formik.values.anio}
              onChange={formik.handleChange}
              error={formik.touched.anio && Boolean(formik.errors.anio)}
              helperText={formik.touched.anio && formik.errors.anio}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="limite_mensual"
              name="limite_mensual"
              label="Límite Mensual"
              type="number"
              value={formik.values.limite_mensual}
              onChange={formik.handleChange}
              error={formik.touched.limite_mensual && Boolean(formik.errors.limite_mensual)}
              helperText={formik.touched.limite_mensual && formik.errors.limite_mensual}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="limite_anual"
              name="limite_anual"
              label="Límite Anual"
              type="number"
              value={formik.values.limite_anual}
              onChange={formik.handleChange}
              error={formik.touched.limite_anual && Boolean(formik.errors.limite_anual)}
              helperText={formik.touched.limite_anual && formik.errors.limite_anual}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/control-limites')}
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

export default ControlLimiteForm; 