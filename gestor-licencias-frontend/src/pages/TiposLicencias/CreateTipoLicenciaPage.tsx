import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTipoLicencia } from '../../store/slices/tiposLicenciasSlice';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Snackbar, 
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  FormHelperText
} from '@mui/material';

interface TipoLicenciaFormData {
  codigo: string;
  nombre: string;
  descripcion: string;
  duracion_maxima: number;
  requiere_justificacion: boolean;
  requiere_aprobacion_especial: boolean;
  requiere_documentacion: boolean;
  pago_haberes: boolean;
  acumulable: boolean;
  transferible: boolean;
  aplica_genero: boolean;
  genero_aplicable: 'M' | 'F' | 'A';
  aplica_antiguedad: boolean;
  antiguedad_minima: number;
  aplica_edad: boolean;
  edad_minima: number;
  edad_maxima: number;
  aplica_departamento: boolean;
  departamentos_aplicables: string[];
  aplica_cargo: boolean;
  cargos_aplicables: string[];
  aplica_tipo_personal: boolean;
  tipos_personal_aplicables: string[];
  activo: boolean;
  unidad_control?: string;
  periodo_control?: string;
}

const CreateTipoLicenciaPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<TipoLicenciaFormData>({
    codigo: '',
    nombre: '',
    descripcion: '',
    duracion_maxima: 0,
    requiere_justificacion: false,
    requiere_aprobacion_especial: false,
    requiere_documentacion: false,
    pago_haberes: false,
    acumulable: false,
    transferible: false,
    aplica_genero: false,
    genero_aplicable: 'A',
    aplica_antiguedad: false,
    antiguedad_minima: 0,
    aplica_edad: false,
    edad_minima: 0,
    edad_maxima: 0,
    aplica_departamento: false,
    departamentos_aplicables: [],
    aplica_cargo: false,
    cargos_aplicables: [],
    aplica_tipo_personal: false,
    tipos_personal_aplicables: [],
    activo: true
  });

  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es obligatorio';
    }
    if (!formData.duracion_maxima || isNaN(Number(formData.duracion_maxima))) {
      newErrors.duracion_maxima = 'La duración máxima debe ser un número válido';
    } else if (Number(formData.duracion_maxima) < 0) {
      newErrors.duracion_maxima = 'La duración máxima no puede ser negativa';
    } else if (Number(formData.duracion_maxima) === 0 && formData.periodo_control !== 'ninguno') {
      newErrors.duracion_maxima = 'La duración máxima debe ser mayor a 0 cuando hay período de control';
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
      await dispatch(createTipoLicencia(formData) as any).unwrap();
      setSnackbar({ 
        open: true, 
        message: 'Tipo de licencia creado correctamente', 
        severity: 'success' 
      });
      setTimeout(() => navigate('/tipos-licencias'), 1000);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Error al crear el tipo de licencia', 
        severity: 'error' 
      });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box maxWidth={1000} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={3}>Crear Tipo de Licencia</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Información Básica */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Información Básica</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="nombre"
                label="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="codigo"
                label="Código"
                value={formData.codigo}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.codigo}
                helperText={errors.codigo}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="descripcion"
                label="Descripción"
                value={formData.descripcion}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="duracion_maxima"
                label="Duración Máxima"
                value={formData.duracion_maxima}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.duracion_maxima}
                helperText={errors.duracion_maxima || (formData.periodo_control === 'ninguno' ? 'Puede ser 0 para tiempo indefinido' : '')}
                type="number"
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Características */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Características</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="requiere_justificacion"
                    checked={formData.requiere_justificacion}
                    onChange={handleChange}
                  />
                }
                label="Requiere Justificación"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="requiere_aprobacion_especial"
                    checked={formData.requiere_aprobacion_especial}
                    onChange={handleChange}
                  />
                }
                label="Requiere Aprobación Especial"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="requiere_documentacion"
                    checked={formData.requiere_documentacion}
                    onChange={handleChange}
                  />
                }
                label="Requiere Documentación"
              />
            </Grid>

            {formData.requiere_documentacion && (
              <Grid item xs={12}>
                <TextField
                  name="documentacion_requerida"
                  label="Documentación Requerida"
                  value={formData.documentacion_requerida}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                  helperText="Especifique los documentos requeridos, separados por comas"
                />
              </Grid>
            )}

            {/* Restricciones */}
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
                    <MenuItem value="A">Ambos</MenuItem>
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
            </Grid>

            {/* Límites de Uso */}
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

            {/* Características Adicionales */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Características Adicionales</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="pago_haberes"
                    checked={formData.pago_haberes}
                    onChange={handleChange}
                  />
                }
                label="Pago de Haberes"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="acumulable"
                    checked={formData.acumulable}
                    onChange={handleChange}
                  />
                }
                label="Acumulable"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="transferible"
                    checked={formData.transferible}
                    onChange={handleChange}
                  />
                }
                label="Transferible"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    name="requiere_planificacion"
                    checked={formData.requiere_planificacion}
                    onChange={handleChange}
                  />
                }
                label="Requiere Planificación"
              />
            </Grid>

            {/* Notificaciones */}
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

            {/* Estado */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                  />
                }
                label="Activo"
              />
            </Grid>

            {/* Unidad de Control */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Unidad de Control</InputLabel>
                <Select
                  name="unidad_control"
                  value={formData.unidad_control || ''}
                  onChange={handleChange}
                  label="Unidad de Control"
                >
                  <MenuItem value="días">Días</MenuItem>
                  <MenuItem value="horas">Horas</MenuItem>
                  <MenuItem value="ninguno">Ninguno (solo registro)</MenuItem>
                </Select>
                <FormHelperText>
                  Indica si la disponibilidad se controla por días, horas o solo registro (sin control).
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* Período de Control */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Período de Control</InputLabel>
                <Select
                  name="periodo_control"
                  value={formData.periodo_control || ''}
                  onChange={handleChange}
                  label="Período de Control"
                >
                  <MenuItem value="mes">Mensual</MenuItem>
                  <MenuItem value="año">Anual</MenuItem>
                  <MenuItem value="ninguno">Ninguno</MenuItem>
                </Select>
                <FormHelperText>
                  Indica cada cuánto se renueva la disponibilidad del permiso/licencia para el trabajador.
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* Botones de Acción */}
            <Grid item xs={12}>
              <Box mt={3} display="flex" gap={2}>
                <Button type="submit" variant="contained" color="primary">
                  Crear Tipo de Licencia
                </Button>
                <Button variant="outlined" onClick={() => navigate('/tipos-licencias')}>
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

export default CreateTipoLicenciaPage; 