import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSolicitudById, updateSolicitud } from '../../store/slices/solicitudesSlice';
import { fetchTrabajadores } from '../../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../../store/slices/tiposLicenciasSlice';
import { fetchLicencias } from '../../store/slices/licenciasSlice';
import { fetchDisponibilidadByTrabajador } from '../../store/slices/disponibilidadSlice';
import { licenciasService } from '../../services/licencias.service';
import type { RootState, AppDispatch } from '../../store';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert, MenuItem, FormControl, InputLabel, Select, InputAdornment, Grid, List, ListItem, ListItemText, ListItemIcon, FormControlLabel, Checkbox } from '@mui/material';
import type { Solicitud } from '../../types/solicitud';
import type { SelectChangeEvent } from '@mui/material/Select';
import SearchIcon from '@mui/icons-material/Search';
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';
import { toElSalvadorDate, combineDateAndTime, fromElSalvadorDate } from '../../utils/dateUtils';
import type { DisponibilidadTrabajador } from '../../types/disponibilidad';
import type { PayloadAction } from '@reduxjs/toolkit';

function calcularDiasHabiles(fechaInicio: string, fechaFin: string): number {
  if (!fechaInicio || !fechaFin) return 0;
  const start = new Date(fechaInicio + 'T00:00:00');
  const end = new Date(fechaFin + 'T00:00:00');
  const diff = end.getTime() - start.getTime();
  return diff >= 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) + 1 : 0;
}

const EditSolicitudPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const solicitud = useSelector((state: RootState) => state.solicitudes.selectedItem);
  const trabajadores = useSelector((state: RootState) => state.trabajadores.items);
  const tiposLicencias = useSelector((state: RootState) => state.tiposLicencias.items);
  const [formData, setFormData] = useState<Partial<Solicitud>>({});
  const [codigoTrabajador, setCodigoTrabajador] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [disponibilidad, setDisponibilidad] = useState<number | null>(null);
  const [afectaDisponibilidad, setAfectaDisponibilidad] = useState(true);
  const [disponibilidadBase, setDisponibilidadBase] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchSolicitudById(Number(id)));
      dispatch(fetchTrabajadores());
      dispatch(fetchTiposLicencias());
      
      licenciasService.findBySolicitud(Number(id)).then(response => {
        if (response.data) {
          setAfectaDisponibilidad(response.data.afecta_disponibilidad ?? true);
        }
      }).catch(() => {
        // Si no se encuentra licencia o hay error, asumir el valor por defecto
        setAfectaDisponibilidad(true);
      });
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (solicitud) {
      // Convertir fechas desde la zona horaria de El Salvador para mostrar correctamente
      const convertedSolicitud = {
        ...solicitud,
        fecha_inicio: solicitud.fecha_inicio ? fromElSalvadorDate(solicitud.fecha_inicio) : '',
        fecha_fin: solicitud.fecha_fin ? fromElSalvadorDate(solicitud.fecha_fin) : '',
        fecha_solicitud: solicitud.fecha_solicitud ? fromElSalvadorDate(solicitud.fecha_solicitud) : '',
        fecha_no_asiste: solicitud.fecha_no_asiste ? fromElSalvadorDate(solicitud.fecha_no_asiste) : '',
        fecha_si_asiste: solicitud.fecha_si_asiste ? fromElSalvadorDate(solicitud.fecha_si_asiste) : '',
        // Para licencias por horas, extraer fecha y hora
        fecha: solicitud.fecha_inicio ? solicitud.fecha_inicio.split('T')[0] : '',
        hora_inicio: solicitud.fecha_inicio ? solicitud.fecha_inicio.split('T')[1]?.substring(0, 5) : '',
        hora_fin: solicitud.fecha_fin ? solicitud.fecha_fin.split('T')[1]?.substring(0, 5) : '',
      };
      
      setFormData(convertedSolicitud);
      // Establecer el código del trabajador si existe
      const trabajador = trabajadores.find(t => t.id === solicitud.trabajador_id);
      if (trabajador) {
        setCodigoTrabajador(trabajador.codigo);
      }
    }
  }, [solicitud, trabajadores]);

  useEffect(() => {
    if (codigoTrabajador.trim() !== '') {
      const found = trabajadores.find(t => t.codigo.toLowerCase() === codigoTrabajador.trim().toLowerCase());
      if (found) {
        setFormData(prev => ({ ...prev, trabajador_id: found.id }));
      }
    }
  }, [codigoTrabajador, trabajadores]);

  // Función para recalcular disponibilidad considerando si es retroactiva
  const recalcularDisponibilidad = (esRetroactiva: boolean) => {
    if (!formData.trabajador_id || !formData.tipo_licencia_id || disponibilidadBase === null) {
      return;
    }

    const selectedTipoLicencia = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
    if (!selectedTipoLicencia) return;

    // Si es retroactiva, no afecta la disponibilidad mostrada
    if (esRetroactiva) {
      setDisponibilidad(disponibilidadBase);
    } else {
      // Si no es retroactiva, calcular cuántos días/horas usa esta licencia
      let diasUsados = 0;
      
      if (selectedTipoLicencia.unidad_control === 'días' && formData.fecha_inicio && formData.fecha_fin) {
        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);
        diasUsados = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      } else if (selectedTipoLicencia.unidad_control === 'horas' && formData.fecha && formData.hora_inicio && formData.hora_fin) {
        const inicio = new Date(`${formData.fecha}T${formData.hora_inicio}`);
        const fin = new Date(`${formData.fecha}T${formData.hora_fin}`);
        const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        diasUsados = horas; // Para licencias por horas, usar las horas como "días"
      }

      // Restar los días/horas de la disponibilidad base
      setDisponibilidad(Math.max(0, disponibilidadBase - diasUsados));
    }
  };

  useEffect(() => {
    if (formData.trabajador_id && formData.tipo_licencia_id) {
      dispatch(fetchDisponibilidadByTrabajador(formData.trabajador_id)).then((action) => {
        const payload = (action as any).payload;
        if (payload) {
          const disp = payload.find((d: any) => d.tipo_licencia.id === Number(formData.tipo_licencia_id));
          const disponibilidadInicial = disp ? disp.dias_restantes : null;
          setDisponibilidadBase(disponibilidadInicial);
          setDisponibilidad(disponibilidadInicial);
        }
      });
    } else {
      setDisponibilidadBase(null);
      setDisponibilidad(null);
    }
  }, [formData.trabajador_id, formData.tipo_licencia_id, dispatch]);

  // Recalcular disponibilidad cuando cambie el checkbox o las fechas
  useEffect(() => {
    recalcularDisponibilidad(!afectaDisponibilidad);
  }, [afectaDisponibilidad, formData.fecha_inicio, formData.fecha_fin, formData.fecha, formData.hora_inicio, formData.hora_fin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name === 'codigo_trabajador') {
      setCodigoTrabajador(value);
      return;
    }
    let newValue = value;
    if (name === 'fecha_inicio' || name === 'fecha_fin') {
      newValue = value.slice(0, 10);
    }
    const newFormData = { ...formData, [name]: newValue };
    if (name === 'fecha_inicio' || name === 'fecha_fin') {
      const fechaInicio = name === 'fecha_inicio' ? newValue : newFormData.fecha_inicio;
      const fechaFin = name === 'fecha_fin' ? newValue : newFormData.fecha_fin;
      newFormData.dias_habiles = calcularDiasHabiles(fechaInicio || '', fechaFin || '');
    }
    setFormData(newFormData);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const esRetroactiva = !event.target.checked;
    setAfectaDisponibilidad(event.target.checked);
    // La recalcularDisponibilidad se ejecutará automáticamente por el useEffect
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
        // Validar duración máxima para licencias con periodo_control 'ninguno' y duracion_maxima > 0
        if (selectedTipoLicencia.periodo_control === 'ninguno' && selectedTipoLicencia.duracion_maxima > 0 && horas > selectedTipoLicencia.duracion_maxima) {
          errorMsg = `No puede solicitar más de ${selectedTipoLicencia.duracion_maxima} horas para este permiso.`;
        }
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
        // Validar duración máxima para licencias con periodo_control 'ninguno' y duracion_maxima > 0
        if (selectedTipoLicencia.periodo_control === 'ninguno' && selectedTipoLicencia.duracion_maxima > 0 && dias > selectedTipoLicencia.duracion_maxima) {
          errorMsg = `No puede solicitar más de ${selectedTipoLicencia.duracion_maxima} días para este permiso.`;
        }
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

    // Validar disponibilidad solo si NO es retroactiva
    if (!errorMsg && afectaDisponibilidad && disponibilidad !== null) {
      let diasSolicitados = 0;
      const selectedTipoLicencia = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
      
      if (selectedTipoLicencia?.unidad_control === 'días' && formData.fecha_inicio && formData.fecha_fin) {
        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);
        diasSolicitados = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      } else if (selectedTipoLicencia?.unidad_control === 'horas' && formData.fecha && formData.hora_inicio && formData.hora_fin) {
        const inicio = new Date(`${formData.fecha}T${formData.hora_inicio}`);
        const fin = new Date(`${formData.fecha}T${formData.hora_fin}`);
        const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        diasSolicitados = horas; // Para licencias por horas, usar las horas como "días"
      }

      if (diasSolicitados > disponibilidad) {
        errorMsg = `No hay suficientes días disponibles. Días restantes: ${disponibilidad}, Días solicitados: ${diasSolicitados}`;
      }
    }

    if (errorMsg) {
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } else {
      if (!id) return;
      try {
        // Convertir fechas a zona horaria de El Salvador antes de enviar
        const normalizedFormData = {
          ...formData,
          fecha_inicio: formData.fecha_inicio ? toElSalvadorDate(formData.fecha_inicio) : undefined,
          fecha_fin: formData.fecha_fin ? toElSalvadorDate(formData.fecha_fin) : undefined,
          fecha_solicitud: formData.fecha_solicitud ? toElSalvadorDate(formData.fecha_solicitud) : undefined,
          fecha_no_asiste: formData.fecha_no_asiste ? toElSalvadorDate(formData.fecha_no_asiste) : undefined,
          fecha_si_asiste: formData.fecha_si_asiste ? toElSalvadorDate(formData.fecha_si_asiste) : undefined,
          afecta_disponibilidad: afectaDisponibilidad,
        };

        // Para licencias por horas, combinar fecha y hora correctamente
        if (selectedTipoLicencia?.unidad_control === 'horas' && formData.fecha && formData.hora_inicio && formData.hora_fin) {
          normalizedFormData.fecha_inicio = combineDateAndTime(formData.fecha, formData.hora_inicio);
          normalizedFormData.fecha_fin = combineDateAndTime(formData.fecha, formData.hora_fin);
        }

        const result = await dispatch(updateSolicitud({ id: Number(id), ...normalizedFormData })).unwrap();
        setSnackbar({ open: true, message: 'Solicitud y licencia actualizadas correctamente', severity: 'success' });
        
        // Refrescar los datos
        await dispatch(fetchSolicitudById(Number(id)));
        
        // Si hay una licencia asociada, refrescar también las licencias
        if (result.licencia) {
          await dispatch(fetchLicencias());
        }
        
        setTimeout(() => navigate('/licencias'), 1000);
      } catch (error) {
        console.error('Error al actualizar la solicitud:', error);
        setSnackbar({ open: true, message: 'Error al actualizar la solicitud', severity: 'error' });
      }
    }
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  if (!solicitud) {
    return <Typography>Cargando...</Typography>;
  }

  // Obtener el tipo de licencia seleccionado
  const selectedTipoLicencia = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
  const codigoLicencia = selectedTipoLicencia?.codigo || '';

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Trabajador"
                value={trabajadores.find(t => t.id === formData.trabajador_id)?.nombre_completo || ''}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Licencia</InputLabel>
                <Select
                  name="tipo_licencia_id"
                  value={formData.tipo_licencia_id || ''}
                  onChange={handleChange}
                  required
                >
                  {tiposLicencias.map(tipo => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!afectaDisponibilidad}
                    onChange={(e) => setAfectaDisponibilidad(!e.target.checked)}
                    name="es_retroactiva"
                  />
                }
                label="Es retroactiva (no afecta disponibilidad)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Motivo"
                name="motivo"
                value={formData.motivo || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* CAMBIO DE TURNO */}
            {selectedTipoLicencia?.nombre === 'Cambio de turno' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField label="Fecha en que NO asiste" name="fecha_no_asiste" type="date" value={formData.fecha_no_asiste || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Fecha en que SÍ asiste" name="fecha_si_asiste" type="date" value={formData.fecha_si_asiste || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label="Nombre del trabajador que hará el cambio" 
                    name="nombre_trabajador_cambio" 
                    value={formData.nombre_trabajador_cambio || ''} 
                    fullWidth 
                    margin="normal" 
                    InputProps={{ readOnly: true }}
                    disabled
                  />
                </Grid>
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
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Fecha" name="fecha_inicio" type="date" value={formData.fecha_inicio || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                </Grid>
              </>
            )}

            {/* POR HORAS */}
            {selectedTipoLicencia?.unidad_control === 'horas' && (
              <React.Fragment>
                <Grid item xs={12}>
                  <TextField label="Fecha" name="fecha" type="date" value={formData.fecha || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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

            {/* POR DÍAS (default) */}
            {(!selectedTipoLicencia || selectedTipoLicencia.unidad_control === 'días') && selectedTipoLicencia?.nombre !== 'Cambio de turno' && selectedTipoLicencia?.nombre !== 'Olvido de Marcación' && selectedTipoLicencia?.unidad_control !== 'ninguno' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="Fecha Inicio"
                    name="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio || ''}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Fecha Fin"
                    name="fecha_fin"
                    type="date"
                    value={formData.fecha_fin || ''}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                label="Estado"
                name="estado"
                value={formData.estado || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones || ''}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Días Hábiles"
                value={formData.dias_habiles || ''}
                margin="normal"
                fullWidth
                InputProps={{ readOnly: true }}
                helperText="Este valor es solo informativo y se calcula automáticamente."
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate('/licencias')}>Cancelar</Button>
                <Button type="submit" variant="contained" color="primary">Guardar Cambios</Button>
              </Box>
            </Grid>

            {formData.tipo_licencia_id && selectedTipoLicencia && (
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

export default EditSolicitudPage; 