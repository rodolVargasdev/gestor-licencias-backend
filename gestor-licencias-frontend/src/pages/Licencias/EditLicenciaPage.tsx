import React, { useState, useEffect, useMemo } from 'react';
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
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
import {
  updateLicencia,
  fetchLicencias,
} from '../../store/slices/licenciasSlice';
import { fetchTrabajadores } from '../../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../../store/slices/tiposLicenciasSlice';
import { fetchDisponibilidadByTrabajador } from '../../store/slices/disponibilidadSlice';
import type { RootState, AppDispatch } from '../../store';
import type { Licencia } from '../../types/licencia';
import type { TipoLicencia } from '../../types/tipoLicencia';
import type { DisponibilidadTrabajador } from '../../types/disponibilidad';
import type { PayloadAction } from '@reduxjs/toolkit';
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';
import { toElSalvadorDate, combineDateAndTime, fromElSalvadorDate } from '../../utils/dateUtils';

interface FormData extends Omit<Licencia, 'id' | 'trabajador' | 'tipo_licencia' | 'created_at' | 'updated_at' | 'solicitud'> {
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  fecha_no_asiste?: string;
  fecha_si_asiste?: string;
  trabajador_cambio_id?: number;
  codigo_trabajador_cambio?: string;
  nombre_trabajador_cambio?: string;
}

const EditLicenciaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const licencias = useSelector((state: RootState) => state.licencias.items);
  const trabajadores = useSelector((state: RootState) => state.trabajadores.items);
  const tiposLicencias = useSelector((state: RootState) => state.tiposLicencias.items);

  const [formData, setFormData] = useState<FormData>({
    solicitud_id: null,
    trabajador_id: 0,
    tipo_licencia_id: 0,
    fecha_inicio: '',
    fecha_fin: '',
    dias_totales: 0,
    dias_habiles: 0,
    dias_calendario: 0,
    motivo: '',
    estado: 'APROBADA',
    fecha_solicitud: new Date().toISOString().slice(0, 10),
    justificacion: '',
    tipo_olvido_marcacion: undefined,
    observaciones: '',
    activo: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [disponibilidad, setDisponibilidad] = useState<number | null>(null);
  const [periodoRenovacion, setPeriodoRenovacion] = useState<string>('');
  const [codigoTrabajador, setCodigoTrabajador] = useState('');
  const [isFetched, setIsFetched] = useState(false);

  const selectedTipoLicencia = useMemo(() => {
    return tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
  }, [tiposLicencias, formData.tipo_licencia_id]);

  useEffect(() => {
    dispatch(fetchTrabajadores());
    dispatch(fetchTiposLicencias());
    dispatch(fetchLicencias());
  }, [dispatch]);

  useEffect(() => {
    if (!id || licencias.length === 0 || trabajadores.length === 0 || tiposLicencias.length === 0) {
      return;
    }
    const licencia = licencias.find((p) => p.id === parseInt(id));
    if (licencia) {
      setFormData({
        ...licencia,
        trabajador_id: licencia.trabajador?.id || 0,
        tipo_licencia_id: licencia.tipo_licencia?.id || 0,
        // Convertir fechas desde la zona horaria de El Salvador para mostrar correctamente
        fecha_inicio: licencia.fecha_inicio ? fromElSalvadorDate(licencia.fecha_inicio) : '',
        fecha_fin: licencia.fecha_fin ? fromElSalvadorDate(licencia.fecha_fin) : '',
        fecha_no_asiste: licencia.fecha_no_asiste ? fromElSalvadorDate(licencia.fecha_no_asiste) : '',
        fecha_si_asiste: licencia.fecha_si_asiste ? fromElSalvadorDate(licencia.fecha_si_asiste) : '',
        // Para licencias por horas, extraer fecha y hora
        fecha: licencia.fecha_inicio ? licencia.fecha_inicio.split('T')[0] : '',
        hora_inicio: licencia.fecha_inicio ? licencia.fecha_inicio.split('T')[1]?.substring(0, 5) : '',
        hora_fin: licencia.fecha_fin ? licencia.fecha_fin.split('T')[1]?.substring(0, 5) : '',
      });
      setIsFetched(true);
    }
  }, [id, licencias, trabajadores, tiposLicencias]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any>) => {
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
        trabajador_cambio_id: found.id, 
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
    
    const currentTipoLicencia = selectedTipoLicencia ? { ...selectedTipoLicencia } : null;

    if (formData.tipo_licencia_id && currentTipoLicencia) {
      const codigoLicencia = currentTipoLicencia.codigo || '';

      if (currentTipoLicencia.unidad_control === 'horas') {
        // Combinar fecha y horas para formar fecha_inicio y fecha_fin
        const fecha_inicio = formData.fecha && formData.hora_inicio ? `${formData.fecha}T${formData.hora_inicio}` : '';
        const fecha_fin = formData.fecha && formData.hora_fin ? `${formData.fecha}T${formData.hora_fin}` : '';
        if (!fecha_inicio || !fecha_fin) errorMsg = 'Debe ingresar fecha y hora de inicio y fin';
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);
        const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        if (horas <= 0) errorMsg = 'La hora de fin debe ser posterior a la de inicio';
        if (currentTipoLicencia.duracion_maxima && horas > currentTipoLicencia.duracion_maxima) errorMsg = `No puede solicitar más de ${currentTipoLicencia.duracion_maxima} horas para este permiso.`;
        // Validar duración máxima para licencias con periodo_control 'ninguno' y duracion_maxima > 0
        if (currentTipoLicencia.periodo_control === 'ninguno' && currentTipoLicencia.duracion_maxima > 0 && horas > currentTipoLicencia.duracion_maxima) {
          errorMsg = `No puede solicitar más de ${currentTipoLicencia.duracion_maxima} horas para este permiso.`;
        }
        // Guardar en formData para el envío
        setFormData(prev => ({...prev, fecha_inicio, fecha_fin}));
      } else if (currentTipoLicencia.unidad_control === 'días') {
        if (!formData.fecha_inicio || !formData.fecha_fin) errorMsg = 'Debe ingresar fecha de inicio y fin';
        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);
        const dias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (dias <= 0) errorMsg = 'La fecha de fin debe ser posterior o igual a la de inicio';
        if ([
          'ENFERMEDAD', 'DUELO', 'PATERNIDAD', 'MATRIMONIO', 'OLVIDO-ENT', 'OLVIDO-SAL', 'CAMBIO-TUR'
        ].includes(codigoLicencia) && dias > currentTipoLicencia.duracion_maxima) errorMsg = `No puede solicitar más de ${currentTipoLicencia.duracion_maxima} días para este permiso.`;
        if (codigoLicencia === 'MATERNIDAD' && dias > currentTipoLicencia.duracion_maxima) errorMsg = 'No puede solicitar más de 112 días para este permiso.';
        // Validar duración máxima para licencias con periodo_control 'ninguno' y duracion_maxima > 0
        if (currentTipoLicencia.periodo_control === 'ninguno' && currentTipoLicencia.duracion_maxima > 0 && dias > currentTipoLicencia.duracion_maxima) {
          errorMsg = `No puede solicitar más de ${currentTipoLicencia.duracion_maxima} días para este permiso.`;
        }
        // Lactancia materna: autocompletar fecha fin
        if (codigoLicencia === 'LACTANCIA' && formData.fecha_inicio) {
          const inicio = new Date(formData.fecha_inicio);
          const fin = new Date(inicio);
          fin.setMonth(fin.getMonth() + 6);
          setFormData(prev => ({...prev, fecha_fin: fin.toISOString().slice(0, 10)}));
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
    let diasCalendario: number | undefined;
    if (!isNaN(inicio.getTime()) && !isNaN(fin.getTime())) {
      diasCalendario = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    const dataToUpdate: Partial<Licencia> = { ...formData, dias_calendario: diasCalendario };
    
    // Convertir fechas a zona horaria de El Salvador antes de enviar
    const normalizedData = {
      ...dataToUpdate,
      fecha_inicio: dataToUpdate.fecha_inicio ? toElSalvadorDate(dataToUpdate.fecha_inicio) : undefined,
      fecha_fin: dataToUpdate.fecha_fin ? toElSalvadorDate(dataToUpdate.fecha_fin) : undefined,
      fecha_no_asiste: dataToUpdate.fecha_no_asiste ? toElSalvadorDate(dataToUpdate.fecha_no_asiste) : undefined,
      fecha_si_asiste: dataToUpdate.fecha_si_asiste ? toElSalvadorDate(dataToUpdate.fecha_si_asiste) : undefined,
    };

    // Para licencias por horas, combinar fecha y hora correctamente
    if (selectedTipoLicencia?.unidad_control === 'horas' && formData.fecha && formData.hora_inicio && formData.hora_fin) {
      normalizedData.fecha_inicio = combineDateAndTime(formData.fecha, formData.hora_inicio);
      normalizedData.fecha_fin = combineDateAndTime(formData.fecha, formData.hora_fin);
    }
    
    dispatch(updateLicencia({ id: parseInt(id), licencia: normalizedData })).then(() => {
      setSnackbar({ open: true, message: 'Licencia actualizada correctamente', severity: 'success' });
      if(formData.trabajador_id) {
        dispatch(fetchDisponibilidadByTrabajador(formData.trabajador_id));
      }
      navigate('/licencias');
    }).catch(error => {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (!isFetched) {
    return <Typography>Cargando...</Typography>;
  }

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
              <FormControl fullWidth>
                <InputLabel>Trabajador</InputLabel>
                <Select
                  name="trabajador_id"
                  value={formData.trabajador_id?.toString()}
                  onChange={handleChange}
                  required
                >
                  {trabajadores.map((trabajador) => (
                    <MenuItem key={trabajador.id} value={trabajador.id}>
                      {trabajador.nombre_completo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Licencia</InputLabel>
                <Select
                  name="tipo_licencia_id"
                  value={formData.tipo_licencia_id?.toString()}
                  onChange={handleChange}
                  required
                >
                  {tiposLicencias.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* CAMPOS DINÁMICOS */}
            {selectedTipoLicencia?.codigo === 'CAMBIO-TUR' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Fecha en que NO asiste" 
                    name="fecha_no_asiste" 
                    type="date" 
                    value={formData.fecha_no_asiste || ''} 
                    onChange={handleChange} 
                    fullWidth 
                    InputLabelProps={{ shrink: true }} 
                    required 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Fecha en que SÍ asiste" 
                    name="fecha_si_asiste" 
                    type="date" 
                    value={formData.fecha_si_asiste || ''} 
                    onChange={handleChange} 
                    fullWidth 
                    InputLabelProps={{ shrink: true }} 
                    required 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Código del trabajador que hará el cambio" 
                    name="codigo_trabajador_cambio" 
                    value={formData.codigo_trabajador_cambio || ''} 
                    onChange={handleChange}
                    onBlur={handleBuscarTrabajadorCambio}
                    fullWidth 
                    helperText="Ingrese el código y presione Tab/Enter"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    label="Nombre del trabajador que hará el cambio" 
                    name="nombre_trabajador_cambio" 
                    value={formData.nombre_trabajador_cambio || ''} 
                    fullWidth 
                    InputProps={{ readOnly: true }}
                    disabled
                  />
                </Grid>
              </>
            )}

            {(selectedTipoLicencia?.codigo === 'OLVIDO-ENT' || selectedTipoLicencia?.codigo === 'OLVIDO-SAL') && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Olvido</InputLabel>
                  <Select
                    name="tipo_olvido_marcacion"
                    value={formData.tipo_olvido_marcacion || ''}
                    onChange={handleChange}
                  >
                    <MenuItem value="ENTRADA">Entrada</MenuItem>
                    <MenuItem value="SALIDA">Salida</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {selectedTipoLicencia?.unidad_control === 'horas' && (
              <React.Fragment>
                <Grid item xs={12} md={4}>
                  <TextField label="Fecha" name="fecha" type="date" value={formData.fecha || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Hora de inicio"
                    name="hora_inicio"
                    type="time"
                    value={formData.hora_inicio || ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 60 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Hora de fin"
                    name="hora_fin"
                    type="time"
                    value={formData.hora_fin || ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 60 }}
                  />
                </Grid>
              </React.Fragment>
            )}

            {selectedTipoLicencia?.unidad_control === 'días' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField label="Fecha Inicio" name="fecha_inicio" type="date" value={formData.fecha_inicio || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Fecha Fin" name="fecha_fin" type="date" value={formData.fecha_fin || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
                </Grid>
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

            <Grid item xs={12}>
              <TextField
                name="justificacion"
                label="Justificación"
                value={formData.justificacion || ''}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="observaciones"
                label="Observaciones"
                value={formData.observaciones || ''}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
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
                InputProps={{ readOnly: true }}
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

            {formData.trabajador_id && formData.tipo_licencia_id && selectedTipoLicencia && (
              <Grid item xs={12}>
                <Alert severity="info" icon={<InfoIcon fontSize="inherit" />} sx={{ width: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Reglas de la Licencia: {selectedTipoLicencia.nombre}
                  </Typography>
                  <List dense sx={{ p: 0 }}>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary="Período de Control" 
                        secondary={
                          selectedTipoLicencia.periodo_control === 'ninguno' 
                            ? 'Sin período (se pueden realizar múltiples solicitudes)' 
                            : `Control por ${selectedTipoLicencia.periodo_control}`
                        }
                      />
                    </ListItem>
                    
                    {selectedTipoLicencia.periodo_control !== 'ninguno' ? (
                      <>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={`Límite Total por ${selectedTipoLicencia.periodo_control}`} 
                            secondary={`${selectedTipoLicencia.duracion_maxima} ${selectedTipoLicencia.unidad_control}`}
                          />
                        </ListItem>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary="Disponibilidad Restante" 
                            secondary={`${disponibilidad !== null ? disponibilidad : 'Calculando...'} ${selectedTipoLicencia.unidad_control}`} 
                          />
                        </ListItem>
                      </>
                    ) : (
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary="Límite por Solicitud" 
                          secondary={
                            selectedTipoLicencia.duracion_maxima > 0 
                              ? `${selectedTipoLicencia.duracion_maxima} ${selectedTipoLicencia.unidad_control}` 
                              : 'Duración variable según necesidad'
                          } 
                        />
                      </ListItem>
                    )}

                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {selectedTipoLicencia.pago_haberes ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                      </ListItemIcon>
                      <ListItemText primary="Cubre goce de salario" />
                    </ListItem>
                    
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {selectedTipoLicencia.requiere_documentacion ? <WarningIcon color="warning" /> : <InfoIcon color="disabled" />}
                      </ListItemIcon>
                      <ListItemText primary={selectedTipoLicencia.requiere_documentacion ? 'Requiere documento de soporte' : 'No requiere documento de soporte'} />
                    </ListItem>
                  </List>
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