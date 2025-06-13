import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createControlLimite } from '../../store/slices/controlLimitesSlice';
import type { RootState } from '../../store';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Snackbar, 
  Alert, 
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  FormHelperText,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const CreateControlLimitePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: tiposLicencias } = useSelector((state: RootState) => state.tiposLicencias);
  const { items: trabajadores } = useSelector((state: RootState) => state.trabajadores);

  const [formData, setFormData] = useState({
    trabajador_id: '',
    tipo_licencia_id: '',
    anio: new Date().getFullYear(),
    dias_totales: '',
    dias_utilizados: '0',
    horas_utilizadas: '0',
    cantidad_utilizada: '0',
    activo: true,
    // Nuevos campos específicos
    aplica_genero: false,
    genero_aplicable: '',
    aplica_antiguedad: false,
    antiguedad_minima: '',
    aplica_edad: false,
    edad_minima: '',
    edad_maxima: '',
    aplica_departamento: false,
    departamento_id: '',
    aplica_puesto: false,
    puesto_id: '',
    aplica_tipo_personal: false,
    tipo_personal: '',
    // Campos de restricciones
    requiere_justificacion: false,
    requiere_aprobacion_especial: false,
    dias_minimos_por_vez: '',
    dias_maximos_por_vez: '',
    dias_entre_solicitudes: '',
    // Campos de notificaciones
    notificar_supervisor: false,
    notificar_rrhh: false,
    notificar_trabajador: false
  });

  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTipoLicencia, setSelectedTipoLicencia] = useState<any>(null);

  useEffect(() => {
    if (formData.tipo_licencia_id) {
      const tipo = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
      setSelectedTipoLicencia(tipo);
    }
  }, [formData.tipo_licencia_id, tiposLicencias]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.tipo_licencia_id) {
      newErrors.tipo_licencia_id = 'El tipo de licencia es obligatorio';
    }
    if (!formData.anio) {
      newErrors.anio = 'El año es obligatorio';
    }
    if (!formData.dias_totales || isNaN(Number(formData.dias_totales)) || Number(formData.dias_totales) <= 0) {
      newErrors.dias_totales = 'Los días totales deben ser un número positivo';
    }
    if (formData.dias_utilizados && (isNaN(Number(formData.dias_utilizados)) || Number(formData.dias_utilizados) < 0)) {
      newErrors.dias_utilizados = 'Los días utilizados deben ser un número no negativo';
    }
    if (formData.horas_utilizadas && (isNaN(Number(formData.horas_utilizadas)) || Number(formData.horas_utilizadas) < 0)) {
      newErrors.horas_utilizadas = 'Las horas utilizadas deben ser un número no negativo';
    }
    if (formData.cantidad_utilizada && (isNaN(Number(formData.cantidad_utilizada)) || Number(formData.cantidad_utilizada) < 0)) {
      newErrors.cantidad_utilizada = 'La cantidad utilizada debe ser un número no negativo';
    }

    // Validaciones específicas
    if (formData.aplica_antiguedad && (!formData.antiguedad_minima || Number(formData.antiguedad_minima) <= 0)) {
      newErrors.antiguedad_minima = 'La antigüedad mínima debe ser un número positivo';
    }
    if (formData.aplica_edad) {
      if (!formData.edad_minima || Number(formData.edad_minima) < 0) {
        newErrors.edad_minima = 'La edad mínima debe ser un número no negativo';
      }
      if (!formData.edad_maxima || Number(formData.edad_maxima) <= Number(formData.edad_minima)) {
        newErrors.edad_maxima = 'La edad máxima debe ser mayor que la mínima';
      }
    }
    if (formData.dias_minimos_por_vez && (isNaN(Number(formData.dias_minimos_por_vez)) || Number(formData.dias_minimos_por_vez) < 0)) {
      newErrors.dias_minimos_por_vez = 'Los días mínimos por vez deben ser un número no negativo';
    }
    if (formData.dias_maximos_por_vez && (isNaN(Number(formData.dias_maximos_por_vez)) || Number(formData.dias_maximos_por_vez) <= Number(formData.dias_minimos_por_vez))) {
      newErrors.dias_maximos_por_vez = 'Los días máximos por vez deben ser mayores que los mínimos';
    }
    if (formData.dias_entre_solicitudes && (isNaN(Number(formData.dias_entre_solicitudes)) || Number(formData.dias_entre_solicitudes) < 0)) {
      newErrors.dias_entre_solicitudes = 'Los días entre solicitudes deben ser un número no negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name as string]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = {
        ...formData,
        tipo_licencia_id: Number(formData.tipo_licencia_id),
        anio: Number(formData.anio),
        dias_totales: Number(formData.dias_totales),
        dias_utilizados: Number(formData.dias_utilizados),
        horas_utilizadas: Number(formData.horas_utilizadas),
        cantidad_utilizada: Number(formData.cantidad_utilizada),
        antiguedad_minima: formData.aplica_antiguedad ? Number(formData.antiguedad_minima) : null,
        edad_minima: formData.aplica_edad ? Number(formData.edad_minima) : null,
        edad_maxima: formData.aplica_edad ? Number(formData.edad_maxima) : null,
        dias_minimos_por_vez: formData.dias_minimos_por_vez ? Number(formData.dias_minimos_por_vez) : null,
        dias_maximos_por_vez: formData.dias_maximos_por_vez ? Number(formData.dias_maximos_por_vez) : null,
        dias_entre_solicitudes: formData.dias_entre_solicitudes ? Number(formData.dias_entre_solicitudes) : null
      };

      await dispatch(createControlLimite(data) as any).unwrap();
      setSnackbar({ 
        open: true, 
        message: 'Control de límite creado correctamente', 
        severity: 'success' 
      });
      setTimeout(() => navigate('/control-limites'), 1000);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Error al crear el control de límite', 
        severity: 'error' 
      });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box maxWidth={1000} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={3}>Crear Control de Límite</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Sección de Información Básica */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Información Básica</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.tipo_licencia_id}>
                <InputLabel>Tipo de Licencia</InputLabel>
                <Select
                  name="tipo_licencia_id"
                  value={formData.tipo_licencia_id}
                  onChange={handleChange}
                  label="Tipo de Licencia"
                >
                  <MenuItem value="">Seleccione...</MenuItem>
                  {tiposLicencias.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tipo_licencia_id && (
                  <FormHelperText>{errors.tipo_licencia_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="anio"
                label="Año"
                type="number"
                value={formData.anio}
                onChange={handleChange}
                fullWidth
                error={!!errors.anio}
                helperText={errors.anio}
                inputProps={{ min: 2000, max: 2100 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                name="dias_totales"
                label="Días Totales Permitidos"
                type="number"
                value={formData.dias_totales}
                onChange={handleChange}
                fullWidth
                error={!!errors.dias_totales}
                helperText={errors.dias_totales}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                name="dias_utilizados"
                label="Días Utilizados"
                type="number"
                value={formData.dias_utilizados}
                onChange={handleChange}
                fullWidth
                error={!!errors.dias_utilizados}
                helperText={errors.dias_utilizados}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                name="horas_utilizadas"
                label="Horas Utilizadas"
                type="number"
                value={formData.horas_utilizadas}
                onChange={handleChange}
                fullWidth
                error={!!errors.horas_utilizadas}
                helperText={errors.horas_utilizadas}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Sección de Restricciones */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Restricciones</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="aplica_genero"
                    checked={formData.aplica_genero}
                    onChange={handleChange}
                  />
                }
                label="Aplicar por Género"
              />
              {formData.aplica_genero && (
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel>Género Aplicable</InputLabel>
                  <Select
                    name="genero_aplicable"
                    value={formData.genero_aplicable}
                    onChange={handleChange}
                    label="Género Aplicable"
                  >
                    <MenuItem value="M">Masculino</MenuItem>
                    <MenuItem value="F">Femenino</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="aplica_antiguedad"
                    checked={formData.aplica_antiguedad}
                    onChange={handleChange}
                  />
                }
                label="Aplicar por Antigüedad"
              />
              {formData.aplica_antiguedad && (
                <TextField
                  name="antiguedad_minima"
                  label="Antigüedad Mínima (años)"
                  type="number"
                  value={formData.antiguedad_minima}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mt: 1 }}
                  error={!!errors.antiguedad_minima}
                  helperText={errors.antiguedad_minima}
                  inputProps={{ min: 0 }}
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="aplica_edad"
                    checked={formData.aplica_edad}
                    onChange={handleChange}
                  />
                }
                label="Aplicar por Edad"
              />
              {formData.aplica_edad && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      name="edad_minima"
                      label="Edad Mínima"
                      type="number"
                      value={formData.edad_minima}
                      onChange={handleChange}
                      fullWidth
                      error={!!errors.edad_minima}
                      helperText={errors.edad_minima}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="edad_maxima"
                      label="Edad Máxima"
                      type="number"
                      value={formData.edad_maxima}
                      onChange={handleChange}
                      fullWidth
                      error={!!errors.edad_maxima}
                      helperText={errors.edad_maxima}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>

            {/* Sección de Límites de Uso */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Límites de Uso</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                name="dias_minimos_por_vez"
                label="Días Mínimos por Vez"
                type="number"
                value={formData.dias_minimos_por_vez}
                onChange={handleChange}
                fullWidth
                error={!!errors.dias_minimos_por_vez}
                helperText={errors.dias_minimos_por_vez}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                name="dias_maximos_por_vez"
                label="Días Máximos por Vez"
                type="number"
                value={formData.dias_maximos_por_vez}
                onChange={handleChange}
                fullWidth
                error={!!errors.dias_maximos_por_vez}
                helperText={errors.dias_maximos_por_vez}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                name="dias_entre_solicitudes"
                label="Días entre Solicitudes"
                type="number"
                value={formData.dias_entre_solicitudes}
                onChange={handleChange}
                fullWidth
                error={!!errors.dias_entre_solicitudes}
                helperText={errors.dias_entre_solicitudes}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Sección de Notificaciones */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Notificaciones</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="notificar_supervisor"
                    checked={formData.notificar_supervisor}
                    onChange={handleChange}
                  />
                }
                label="Notificar al Supervisor"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="notificar_rrhh"
                    checked={formData.notificar_rrhh}
                    onChange={handleChange}
                  />
                }
                label="Notificar a RRHH"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="notificar_trabajador"
                    checked={formData.notificar_trabajador}
                    onChange={handleChange}
                  />
                }
                label="Notificar al Trabajador"
              />
            </Grid>

            {/* Botones de Acción */}
            <Grid item xs={12}>
              <Box mt={3} display="flex" gap={2}>
                <Button type="submit" variant="contained" color="primary">
                  Crear Control de Límite
                </Button>
                <Button variant="outlined" onClick={() => navigate('/control-limites')}>
                  Cancelar
                </Button>
              </Box>
            </Grid>
          </Grid>
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

export default CreateControlLimitePage; 