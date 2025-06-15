import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchTiposLicencias, updateTipoLicencia } from '../../store/slices/tiposLicenciasSlice';
import type { RootState } from '../../store';
import type { SelectChangeEvent } from '@mui/material/Select';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Snackbar, 
  Alert,
  Stack,
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
  tipo_duracion: 'DIAS' | 'HORAS' | 'CANTIDAD';
  periodo_renovacion: 'MENSUAL' | 'ANUAL';
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
}

const EditTipoLicenciaPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { items: tiposLicencias, loading } = useSelector((state: RootState) => state.tiposLicencias);
  const tipoLicencia = tiposLicencias.find((t) => t.id === Number(id));

  const [formData, setFormData] = useState<TipoLicenciaFormData>({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo_duracion: 'DIAS',
    periodo_renovacion: 'ANUAL',
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

  useEffect(() => {
    if (!tipoLicencia && id) {
      dispatch(fetchTiposLicencias() as any);
    }
  }, [tipoLicencia, id, dispatch]);

  useEffect(() => {
    if (tipoLicencia) {
      setFormData({
        codigo: tipoLicencia.codigo || '',
        nombre: tipoLicencia.nombre || '',
        descripcion: tipoLicencia.descripcion || '',
        tipo_duracion: tipoLicencia.tipo_duracion || 'DIAS',
        periodo_renovacion: tipoLicencia.periodo_renovacion || 'ANUAL',
        duracion_maxima: tipoLicencia.duracion_maxima || 0,
        requiere_justificacion: tipoLicencia.requiere_justificacion || false,
        requiere_aprobacion_especial: tipoLicencia.requiere_aprobacion_especial || false,
        requiere_documentacion: tipoLicencia.requiere_documentacion || false,
        pago_haberes: tipoLicencia.pago_haberes || false,
        acumulable: tipoLicencia.acumulable || false,
        transferible: tipoLicencia.transferible || false,
        aplica_genero: tipoLicencia.aplica_genero || false,
        genero_aplicable: tipoLicencia.genero_aplicable || 'A',
        aplica_antiguedad: tipoLicencia.aplica_antiguedad || false,
        antiguedad_minima: tipoLicencia.antiguedad_minima || 0,
        aplica_edad: tipoLicencia.aplica_edad || false,
        edad_minima: tipoLicencia.edad_minima || 0,
        edad_maxima: tipoLicencia.edad_maxima || 0,
        aplica_departamento: tipoLicencia.aplica_departamento || false,
        departamentos_aplicables: Array.isArray(tipoLicencia.departamentos_aplicables) ? tipoLicencia.departamentos_aplicables : [],
        aplica_cargo: tipoLicencia.aplica_cargo || false,
        cargos_aplicables: Array.isArray(tipoLicencia.cargos_aplicables) ? tipoLicencia.cargos_aplicables : [],
        aplica_tipo_personal: tipoLicencia.aplica_tipo_personal || false,
        tipos_personal_aplicables: Array.isArray(tipoLicencia.tipos_personal_aplicables) ? tipoLicencia.tipos_personal_aplicables : [],
        activo: tipoLicencia.activo ?? true
      });
    }
  }, [tipoLicencia]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name as string]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.codigo.trim()) newErrors.codigo = 'El código es requerido';
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (formData.duracion_maxima <= 0) newErrors.duracion_maxima = 'La duración máxima debe ser mayor a 0';
    if (formData.aplica_edad) {
      if (formData.edad_minima < 0) newErrors.edad_minima = 'La edad mínima no puede ser negativa';
      if (formData.edad_maxima < formData.edad_minima) newErrors.edad_maxima = 'La edad máxima debe ser mayor a la mínima';
    }
    if (formData.aplica_antiguedad && formData.antiguedad_minima < 0) {
      newErrors.antiguedad_minima = 'La antigüedad mínima no puede ser negativa';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;
    try {
      await dispatch(updateTipoLicencia({ id: Number(id), tipoLicencia: formData }) as any).unwrap();
      setSnackbar({ open: true, message: 'Tipo de licencia actualizado correctamente', severity: 'success' });
      setTimeout(() => navigate('/tipos-licencias'), 1000);
    } catch {
      setSnackbar({ open: true, message: 'Error al actualizar el tipo de licencia', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (loading) return <Typography>Cargando...</Typography>;
  if (!tipoLicencia) return <Typography color="error">Tipo de licencia no encontrado</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Editar Tipo de Licencia
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Información Básica */}
            <Box>
              <Typography variant="h6" gutterBottom>Información Básica</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  name="codigo"
                  label="Código"
                  value={formData.codigo}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.codigo}
                  helperText={errors.codigo}
                  sx={{ flex: 1 }}
                />
          <TextField
                  name="nombre"
            label="Nombre"
                  value={formData.nombre}
                  onChange={handleChange}
            fullWidth
            required
            error={!!errors.nombre}
            helperText={errors.nombre}
                  sx={{ flex: 2 }}
          />
              </Stack>
          <TextField
                name="descripcion"
            label="Descripción"
                value={formData.descripcion}
                onChange={handleChange}
            fullWidth
                required
            multiline
                rows={3}
                error={!!errors.descripcion}
                helperText={errors.descripcion}
                sx={{ mt: 2 }}
              />
            </Box>

            {/* Configuración de Duración */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Configuración de Duración</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Duración</InputLabel>
                  <Select
                    name="tipo_duracion"
                    value={formData.tipo_duracion}
                    onChange={handleChange}
                    label="Tipo de Duración"
                  >
                    <MenuItem value="DIAS">Días</MenuItem>
                    <MenuItem value="HORAS">Horas</MenuItem>
                    <MenuItem value="CANTIDAD">Cantidad</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Período de Renovación</InputLabel>
                  <Select
                    name="periodo_renovacion"
                    value={formData.periodo_renovacion}
                    onChange={handleChange}
                    label="Período de Renovación"
                  >
                    <MenuItem value="MENSUAL">Mensual</MenuItem>
                    <MenuItem value="ANUAL">Anual</MenuItem>
                  </Select>
                </FormControl>
          <TextField
                  name="duracion_maxima"
                  label={`Duración Máxima (${formData.tipo_duracion.toLowerCase()})`}
                  type="number"
                  value={formData.duracion_maxima}
                  onChange={handleChange}
            fullWidth
            required
                  error={!!errors.duracion_maxima}
                  helperText={errors.duracion_maxima}
            inputProps={{ min: 1 }}
          />
              </Stack>
            </Box>

            {/* Requisitos */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Requisitos</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
              </Stack>
            </Box>

            {/* Beneficios */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Beneficios</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
              </Stack>
            </Box>

            {/* Restricciones */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Restricciones</Typography>
              <Stack spacing={2}>
                <Box>
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
                </Box>

                <Box>
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
                </Box>

                <Box>
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
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
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
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Box>

            {/* Estado */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Estado</Typography>
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
            </Box>

            {/* Botones de Acción */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
                Guardar Cambios
              </Button>
          </Box>
          </Stack>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditTipoLicenciaPage; 