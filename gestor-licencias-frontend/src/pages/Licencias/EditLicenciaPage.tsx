import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Grid,
  InputAdornment
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { GridProps } from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { differenceInDays } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { fetchLicenciaById, updateLicencia } from '../../store/slices/licenciasSlice';
import { fetchTrabajadores } from '../../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../../store/slices/tiposLicenciasSlice';
import { fetchDisponibilidadByTrabajador } from '../../store/slices/disponibilidadSlice';
import type { RootState, AppDispatch } from '../../store';
import type { Licencia } from '../../types/licencia';
import type { DisponibilidadTrabajador } from '../../types/disponibilidad';
import type { PayloadAction } from '@reduxjs/toolkit';

const EditLicenciaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { selectedItem: licencia, loading, error } = useSelector((state: RootState) => state.licencias);
  const trabajadores = useSelector((state: RootState) => state.trabajadores.items);
  const tiposLicencias = useSelector((state: RootState) => state.tiposLicencias.items);

  const [formData, setFormData] = useState<any>({
    trabajador_id: 0,
    tipo_licencia_id: 0,
    fecha_inicio: '',
    fecha_fin: '',
    motivo: '',
    estado: 'ACTIVA',
    dias_habiles: 0,
    dias_calendario: 0,
    dias_totales: 0,
    fecha_no_asiste: '',
    fecha_si_asiste: '',
    trabajador_cambio_id: '',
    tipo_olvido_marcacion: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [disponibilidad, setDisponibilidad] = useState<number | null>(null);
  const [periodoRenovacion, setPeriodoRenovacion] = useState<string>('');
  const [codigoTrabajador, setCodigoTrabajador] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchLicenciaById(parseInt(id)));
    }
    dispatch(fetchTrabajadores());
    dispatch(fetchTiposLicencias());
  }, [dispatch, id]);

  useEffect(() => {
    if (licencia) {
      setFormData({
        trabajador_id: licencia.trabajador_id,
        tipo_licencia_id: licencia.tipo_licencia_id,
        fecha_inicio: licencia.fecha_inicio,
        fecha_fin: licencia.fecha_fin,
        motivo: licencia.motivo,
        estado: licencia.estado,
        dias_habiles: licencia.dias_habiles,
        dias_calendario: licencia.dias_calendario,
        dias_totales: licencia.dias_totales,
        fecha_no_asiste: licencia.fecha_no_asiste,
        fecha_si_asiste: licencia.fecha_si_asiste,
        trabajador_cambio_id: licencia.trabajador_cambio_id,
        tipo_olvido_marcacion: licencia.tipo_olvido_marcacion,
        fecha: licencia.fecha,
        hora_inicio: licencia.hora_inicio,
        hora_fin: licencia.hora_fin,
      });
      setCodigoTrabajador(licencia.trabajador?.codigo || '');
    }
  }, [licencia]);

  useEffect(() => {
    if (formData.trabajador_id && formData.tipo_licencia_id) {
      dispatch(fetchDisponibilidadByTrabajador(formData.trabajador_id)).then((action) => {
        const payload = (action as PayloadAction<DisponibilidadTrabajador[]>).payload;
        if (payload) {
          const disp = payload.find((d) => d.tipo_licencia.id === Number(formData.tipo_licencia_id));
          setDisponibilidad(disp ? disp.dias_restantes : null);
        }
      });
      const tipo = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
      setPeriodoRenovacion(tipo?.periodo_renovacion || '');
    } else {
      setDisponibilidad(null);
      setPeriodoRenovacion('');
    }
  }, [formData.trabajador_id, formData.tipo_licencia_id, tiposLicencias, dispatch]);

  useEffect(() => {
    if (codigoTrabajador.trim() !== '') {
      const found = trabajadores.find(t => t.codigo.toLowerCase() === codigoTrabajador.trim().toLowerCase());
      if (found) {
        setFormData(prev => ({ ...prev, trabajador_id: found.id }));
      }
    }
  }, [codigoTrabajador, trabajadores]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBuscarTrabajadorCambio = () => {
    const found = trabajadores.find(t => t.codigo.toLowerCase() === formData.codigo_trabajador_cambio?.trim().toLowerCase());
    if (found) {
      setFormData(prev => ({ 
        ...prev, 
        trabajador_cambio_id: found.id.toString(), 
        nombre_trabajador_cambio: found.nombre_completo 
      }));
    }
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    if (date) {
      // Ajustar la fecha para evitar problemas de zona horaria
      const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      setFormData(prev => {
        const newData = {
          ...prev,
          [field]: adjustedDate.toISOString().split('T')[0]
        };

        // Calcular días del calendario si ambas fechas están presentes
        if (newData.fecha_inicio && newData.fecha_fin) {
          const inicio = new Date(newData.fecha_inicio);
          const fin = new Date(newData.fecha_fin);
          const diasCalendario = differenceInDays(fin, inicio) + 1; // +1 para incluir el día inicial
          newData.dias_calendario = diasCalendario;
          newData.dias_habiles = diasCalendario; // Todos los días son hábiles
          newData.dias_totales = diasCalendario;
        }

        return newData;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let errorMsg = '';
    // Validaciones por tipo
    if (formData.tipo_licencia_id) {
      const selectedTipoLicencia = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
      const codigoLicencia = selectedTipoLicencia?.codigo || '';

      if (selectedTipoLicencia?.unidad_control === 'horas') {
        // Combinar fecha y horas para formar fecha_inicio y fecha_fin
        const fecha_inicio = formData.fecha && formData.hora_inicio ? `${formData.fecha}T${formData.hora_inicio}` : '';
        const fecha_fin = formData.fecha && formData.hora_fin ? `${formData.fecha}T${formData.hora_fin}` : '';
        if (!fecha_inicio || !fecha_fin) errorMsg = 'Debe ingresar fecha y hora de inicio y fin';
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);
        const horas = (fin - inicio) / (1000 * 60 * 60);
        if (horas <= 0) errorMsg = 'La hora de fin debe ser posterior a la de inicio';
        if (selectedTipoLicencia.duracion_maxima && horas > selectedTipoLicencia.duracion_maxima) errorMsg = `No puede solicitar más de ${selectedTipoLicencia.duracion_maxima} horas para este permiso.`;
        // Guardar en formData para el envío
        formData.fecha_inicio = fecha_inicio;
        formData.fecha_fin = fecha_fin;
      } else if (selectedTipoLicencia?.unidad_control === 'días') {
        if (!formData.fecha_inicio || !formData.fecha_fin) errorMsg = 'Debe ingresar fecha de inicio y fin';
        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);
        const dias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
        if (dias <= 0) errorMsg = 'La fecha de fin debe ser posterior o igual a la de inicio';
        if ([
          'ENFERMEDAD', 'DUELO', 'PATERNIDAD', 'MATRIMONIO', 'OLVIDO-ENT', 'OLVIDO-SAL', 'CAMBIO-TUR'
        ].includes(codigoLicencia) && dias > selectedTipoLicencia.duracion_maxima) errorMsg = `No puede solicitar más de ${selectedTipoLicencia.duracion_maxima} días para este permiso.`;
        if (codigoLicencia === 'MATERNIDAD' && dias > selectedTipoLicencia.duracion_maxima) errorMsg = 'No puede solicitar más de 112 días para este permiso.';
        // Lactancia materna: autocompletar fecha fin
        if (codigoLicencia === 'LACTANCIA' && formData.fecha_inicio) {
          const inicio = new Date(formData.fecha_inicio);
          const fin = new Date(inicio);
          fin.setMonth(fin.getMonth() + 6);
          formData.fecha_fin = fin.toISOString().slice(0, 10);
        }
      }
      // Olvido de marcación: debe diferenciar entrada/salida
      if ((codigoLicencia === 'OLVIDO-ENT' || codigoLicencia === 'OLVIDO-SAL') && !formData.tipo_olvido_marcacion) {
        errorMsg = 'Debe especificar si el olvido fue de ENTRADA o SALIDA';
      }
      // Cambio de turno: requiere trabajador de cambio
      if (codigoLicencia === 'CAMBIO-TUR' && !formData.trabajador_cambio_id) {
        errorMsg = 'Debe especificar el trabajador que hará el cambio de turno';
      }
    }
    if (errorMsg) {
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      return;
    }
    if (!id) return;

    // Calcular días del calendario
    const inicio = new Date(formData.fecha_inicio);
    const fin = new Date(formData.fecha_fin);
    const diasCalendario = differenceInDays(fin, inicio) + 1; // +1 para incluir el día inicial

    // Validar disponibilidad antes de actualizar la licencia
    if (disponibilidad !== null && diasCalendario > disponibilidad) {
      setSnackbar({
        open: true,
        message: `No hay suficientes días disponibles. Días restantes: ${disponibilidad}, Días solicitados: ${diasCalendario}`,
        severity: 'error'
      });
      return;
    }

    try {
      const licenciaData = {
        ...formData,
        dias_calendario: diasCalendario,
        dias_habiles: diasCalendario,
        dias_totales: diasCalendario
      };

      await dispatch(updateLicencia({
        id: parseInt(id),
        ...licenciaData,
        trabajador_id: Number(licenciaData.trabajador_id),
        tipo_licencia_id: Number(licenciaData.tipo_licencia_id)
      }));

      if (formData.trabajador_id) {
        await dispatch(fetchDisponibilidadByTrabajador(formData.trabajador_id));
      }

      setSnackbar({
        open: true,
        message: 'Licencia actualizada correctamente',
        severity: 'success'
      });
      setTimeout(() => navigate('/licencias'), 1000);
    } catch (error: unknown) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al actualizar la licencia',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!licencia) {
    return <Typography>No se encontró la licencia</Typography>;
  }

  const selectedTipoLicencia = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
  const codigoLicencia = selectedTipoLicencia?.codigo || '';

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/licencias')}
        >
          Volver
        </Button>
        <Typography variant="h4">Editar Licencia</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Código de trabajador"
                value={codigoTrabajador}
                onChange={e => setCodigoTrabajador(e.target.value)}
                fullWidth
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Trabajador"
                name="trabajador_id"
                value={formData.trabajador_id}
                onChange={handleChange}
                required
              >
                {trabajadores.map((trabajador) => (
                  <MenuItem key={trabajador.id} value={trabajador.id}>
                    {trabajador.nombre_completo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tipo de Licencia"
                name="tipo_licencia_id"
                value={formData.tipo_licencia_id}
                onChange={handleChange}
                required
              >
                {tiposLicencias.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* CAMBIO DE TURNO */}
            {selectedTipoLicencia?.nombre === 'Cambio de turno' && (
              <>
                <TextField label="Fecha en que NO asiste" name="fecha_no_asiste" type="date" value={formData.fecha_no_asiste || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                <TextField label="Fecha en que SÍ asiste" name="fecha_si_asiste" type="date" value={formData.fecha_si_asiste || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                <TextField 
                  label="Código del trabajador que hará el cambio" 
                  name="codigo_trabajador_cambio" 
                  value={formData.codigo_trabajador_cambio || ''} 
                  onChange={handleChange}
                  onBlur={handleBuscarTrabajadorCambio}
                  fullWidth 
                  margin="normal" 
                  required 
                  helperText="Ingrese el código del trabajador y presione Tab para buscar"
                />
                <TextField 
                  label="Nombre del trabajador que hará el cambio" 
                  name="nombre_trabajador_cambio" 
                  value={formData.nombre_trabajador_cambio || ''} 
                  fullWidth 
                  margin="normal" 
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <input 
                  type="hidden" 
                  name="trabajador_cambio_id" 
                  value={formData.trabajador_cambio_id || ''} 
                />
              </>
            )}

            {/* OLVIDO DE MARCACIÓN */}
            {(codigoLicencia === 'OLVIDO-ENT' || codigoLicencia === 'OLVIDO-SAL') && (
              <>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Tipo de Olvido</InputLabel>
                  <Select
                    name="tipo_olvido_marcacion"
                    value={formData.tipo_olvido_marcacion || ''}
                    onChange={handleChange}
                    label="Tipo de Olvido"
                  >
                    <MenuItem value="ENTRADA">Entrada</MenuItem>
                    <MenuItem value="SALIDA">Salida</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Fecha" name="fecha" type="date" value={formData.fecha || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
              </>
            )}

            {/* POR HORAS */}
            {selectedTipoLicencia?.unidad_control === 'horas' && (
              <>
                <TextField label="Fecha" name="fecha" type="date" value={formData.fecha || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                <TextField label="Hora de inicio" name="hora_inicio" type="time" value={formData.hora_inicio || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                <TextField label="Hora de fin" name="hora_fin" type="time" value={formData.hora_fin || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                <input type="hidden" name="fecha_inicio" value={formData.fecha_inicio || ''} />
                <input type="hidden" name="fecha_fin" value={formData.fecha_fin || ''} />
              </>
            )}

            {/* POR DÍAS (default) */}
            {(!selectedTipoLicencia || selectedTipoLicencia.unidad_control === 'días') && selectedTipoLicencia?.nombre !== 'Cambio de turno' && selectedTipoLicencia?.nombre !== 'Olvido de Marcación' && selectedTipoLicencia?.unidad_control !== 'ninguno' && (
              <>
                <TextField label="Fecha Inicio" name="fecha_inicio" type="date" value={formData.fecha_inicio || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                <TextField label="Fecha Fin" name="fecha_fin" type="date" value={formData.fecha_fin || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                required
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
              >
                <MenuItem value="ACTIVA">Activa</MenuItem>
                <MenuItem value="CANCELADA">Cancelada</MenuItem>
                <MenuItem value="FINALIZADA">Finalizada</MenuItem>
              </TextField>
            </Grid>

            {formData.estado === 'CANCELADA' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Motivo de Cancelación"
                  name="motivo_cancelacion"
                  value={formData.motivo_cancelacion}
                  onChange={handleChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
            )}

            {formData.trabajador_id && formData.tipo_licencia_id && (
              <Grid item xs={12}>
                <Alert severity={disponibilidad !== null && formData.dias_calendario && disponibilidad < formData.dias_calendario ? "error" : "info"}>
                  Disponibilidad restante: <b>{disponibilidad !== null ? disponibilidad : 'N/A'}</b> días.<br />
                  {formData.dias_calendario && disponibilidad !== null && (
                    <>
                      Días solicitados: <b>{formData.dias_calendario}</b><br />
                      {disponibilidad < formData.dias_calendario && (
                        <Typography color="error">
                          No hay suficientes días disponibles para esta solicitud
                        </Typography>
                      )}
                    </>
                  )}
                  Periodo de renovación: <b>{periodoRenovacion ? (periodoRenovacion === 'ANUAL' ? 'Anual' : 'Mensual') : 'N/A'}</b>
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/licencias')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Guardar Cambios
                </Button>
              </Box>
            </Grid>
          </Grid>
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

export default EditLicenciaPage; 