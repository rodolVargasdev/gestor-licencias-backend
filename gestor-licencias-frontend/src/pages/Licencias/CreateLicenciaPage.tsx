import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useNavigate } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { differenceInDays } from 'date-fns';
import { createSolicitud } from '../../store/slices/solicitudesSlice';
import { fetchTrabajadores } from '../../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../../store/slices/tiposLicenciasSlice';
import { fetchDisponibilidadByTrabajador } from '../../store/slices/disponibilidadSlice';
import type { Solicitud } from '../../types/solicitud';
import type { DisponibilidadTrabajador } from '../../types/disponibilidad';
import type { TipoLicencia } from '../../types/tipoLicencia';
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';
import { toElSalvadorDate, combineDateAndTime, getCurrentElSalvadorDate } from '../../utils/dateUtils';

interface FormData {
  trabajador_id: number;
  tipo_licencia_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  estado: string;
  fecha_solicitud: string;
  justificacion: string;
  documento: File | undefined;
  fecha_no_asiste: string;
  fecha_si_asiste: string;
  trabajador_cambio_id: string;
  tipo_olvido_marcacion?: "ENTRADA" | "SALIDA";
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  dias_calendario?: number;
  codigo_trabajador_cambio?: string;
  nombre_trabajador_cambio?: string;
  afecta_disponibilidad: boolean;
}

const CreateLicenciaPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const trabajadores = useAppSelector(state => state.trabajadores.items);
  const tiposLicencias = useAppSelector((state) => state.tiposLicencias.items);

  const [formData, setFormData] = useState<FormData>({
    trabajador_id: 0,
    tipo_licencia_id: 0,
    fecha_inicio: getCurrentElSalvadorDate(),
    fecha_fin: getCurrentElSalvadorDate(),
    motivo: '',
    estado: 'APROBADA',
    fecha_solicitud: getCurrentElSalvadorDate(),
    justificacion: '',
    documento: undefined,
    fecha_no_asiste: '',
    fecha_si_asiste: '',
    trabajador_cambio_id: '',
    tipo_olvido_marcacion: undefined,
    afecta_disponibilidad: true,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [codigoTrabajador, setCodigoTrabajador] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<number | null>(null);

  const selectedTipoLicencia: TipoLicencia | undefined = useMemo(() => {
    const raw = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
    return raw ? JSON.parse(JSON.stringify(raw)) : undefined;
  }, [formData.tipo_licencia_id, tiposLicencias]);

  const codigoLicencia = selectedTipoLicencia?.codigo || '';
  const requiereJustificacion = selectedTipoLicencia?.requiere_justificacion;
  const requiereDocumento = selectedTipoLicencia?.requiere_documentacion;

  useEffect(() => {
    dispatch(fetchTrabajadores());
    dispatch(fetchTiposLicencias());
  }, [dispatch]);

  useEffect(() => {
    if (formData.trabajador_id && formData.tipo_licencia_id) {
      dispatch(fetchDisponibilidadByTrabajador(formData.trabajador_id)).then((action) => {
        const payload = action.payload as DisponibilidadTrabajador[];
        const disp = payload.find(d => d.tipo_licencia.id === Number(formData.tipo_licencia_id));
        setDisponibilidad(disp?.dias_restantes ?? null);
      });
    } else {
      setDisponibilidad(null);
    }
  }, [formData.trabajador_id, formData.tipo_licencia_id, dispatch]);

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
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      const esOlvido = selectedTipoLicencia?.codigo === 'OLVIDO-ENT' || selectedTipoLicencia?.codigo === 'OLVIDO-SAL';
      if (name === 'fecha_inicio' && esOlvido) {
        newData.fecha_fin = value;
      }
      return newData;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'es_retroactiva') {
      setFormData(prev => ({ ...prev, afecta_disponibilidad: !checked }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: typeof formData) => ({ ...prev, documento: e.target.files?.[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let errorMsg = '';
    
    if (selectedTipoLicencia?.unidad_control === 'días') {
      if (!formData.fecha_inicio || !formData.fecha_fin) {
        errorMsg = 'Debe ingresar fecha de inicio y fin';
      } else {
        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);
        if (!isNaN(inicio.getTime()) && !isNaN(fin.getTime())) {
          const dias = differenceInDays(fin, inicio) + 1;
          if (dias <= 0) {
            errorMsg = 'La fecha de fin debe ser posterior o igual a la de inicio';
          }
          // Validar duración máxima para licencias con periodo_control 'ninguno' y duracion_maxima > 0
          if (selectedTipoLicencia.periodo_control === 'ninguno' && selectedTipoLicencia.duracion_maxima > 0 && dias > selectedTipoLicencia.duracion_maxima) {
            errorMsg = `No puede solicitar más de ${selectedTipoLicencia.duracion_maxima} días para este permiso.`;
          }
        } else {
          errorMsg = 'Las fechas ingresadas no son válidas';
        }
      }
    }
    
    if (selectedTipoLicencia?.unidad_control === 'horas') {
      if (!formData.fecha || !formData.hora_inicio || !formData.hora_fin) {
        errorMsg = 'Debe ingresar fecha y hora de inicio y fin';
      } else {
        const inicio = new Date(`${formData.fecha}T${formData.hora_inicio}`);
        const fin = new Date(`${formData.fecha}T${formData.hora_fin}`);
        if (!isNaN(inicio.getTime()) && !isNaN(fin.getTime())) {
          const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
          if (horas <= 0) {
            errorMsg = 'La hora de fin debe ser posterior a la de inicio';
          }
          // Validar duración máxima para licencias con periodo_control 'ninguno' y duracion_maxima > 0
          if (selectedTipoLicencia.periodo_control === 'ninguno' && selectedTipoLicencia.duracion_maxima > 0 && horas > selectedTipoLicencia.duracion_maxima) {
            errorMsg = `No puede solicitar más de ${selectedTipoLicencia.duracion_maxima} horas para este permiso.`;
          }
        } else {
          errorMsg = 'Las horas ingresadas no son válidas';
        }
      }
    }
    // ... más validaciones
    
    if (errorMsg) {
      setSnackbar((prev: typeof snackbar) => ({ ...prev, open: true, message: errorMsg, severity: 'error' }));
      return;
    }

    // Calcular días del calendario SOLO si no es olvido de marcación
    let diasCalendario: number | undefined = undefined;
    if (
      selectedTipoLicencia?.periodo_control !== 'ninguno' &&
      !(selectedTipoLicencia?.codigo === 'OLVIDO-ENT' || selectedTipoLicencia?.codigo === 'OLVIDO-SAL') &&
      formData.fecha_inicio && formData.fecha_fin
    ) {
      const inicio = new Date(formData.fecha_inicio);
      const fin = new Date(formData.fecha_fin);
      if (!isNaN(inicio.getTime()) && !isNaN(fin.getTime())) {
        diasCalendario = differenceInDays(fin, inicio) + 1;
        // Validar disponibilidad antes de crear la licencia SOLO para licencias por días Y si NO es retroactiva
        if (selectedTipoLicencia?.unidad_control === 'días' && disponibilidad !== null && diasCalendario > disponibilidad && formData.afecta_disponibilidad) {
          setSnackbar((prev: typeof snackbar) => ({
            ...prev,
            open: true,
            message: `No hay suficientes días disponibles. Días restantes: ${disponibilidad}, Días solicitados: ${diasCalendario}`,
            severity: 'error'
          }));
          return;
        }
      }
    }

    try {
      // Para olvido de marcación, establecer fecha_fin igual a fecha_inicio
      if (codigoLicencia === 'OLVIDO-ENT' || codigoLicencia === 'OLVIDO-SAL') {
        formData.fecha_fin = formData.fecha_inicio;
      }

      // Preparar datos para envío, excluyendo campos vacíos
      const solicitudData = {
        ...formData,
        ...(diasCalendario !== undefined ? { dias_calendario: diasCalendario } : {})
      };

      // Convertir fechas a zona horaria de El Salvador antes de enviar
      if (solicitudData.fecha_inicio) {
        solicitudData.fecha_inicio = toElSalvadorDate(solicitudData.fecha_inicio);
      }
      if (solicitudData.fecha_fin) {
        solicitudData.fecha_fin = toElSalvadorDate(solicitudData.fecha_fin);
      }
      if (solicitudData.fecha_solicitud) {
        solicitudData.fecha_solicitud = toElSalvadorDate(solicitudData.fecha_solicitud);
      }
      if (solicitudData.fecha_no_asiste) {
        solicitudData.fecha_no_asiste = toElSalvadorDate(solicitudData.fecha_no_asiste);
      }
      if (solicitudData.fecha_si_asiste) {
        solicitudData.fecha_si_asiste = toElSalvadorDate(solicitudData.fecha_si_asiste);
      }

      // Para licencias por horas, combinar fecha y hora correctamente
      if (selectedTipoLicencia?.unidad_control === 'horas' && solicitudData.fecha && solicitudData.hora_inicio && solicitudData.hora_fin) {
        solicitudData.fecha_inicio = combineDateAndTime(solicitudData.fecha, solicitudData.hora_inicio);
        solicitudData.fecha_fin = combineDateAndTime(solicitudData.fecha, solicitudData.hora_fin);
      }

      // Remover tipo_olvido_marcacion si está vacío para evitar errores de enum
      if (solicitudData.tipo_olvido_marcacion === undefined) {
        delete solicitudData.tipo_olvido_marcacion;
      }

      const action = await dispatch(createSolicitud(solicitudData));
      if (action.payload && formData.trabajador_id) {
        await dispatch(fetchDisponibilidadByTrabajador(formData.trabajador_id));
      }
      setSnackbar((prev: typeof snackbar) => ({
        ...prev,
        open: true,
        message: 'Solicitud creada correctamente',
        severity: 'success'
      }));
      if (action.payload && (action.payload as Solicitud).id) {
        navigate(`/licencias/${(action.payload as Solicitud).id}`);
      } else {
        navigate('/licencias');
      }
    } catch (error: unknown) {
      setSnackbar((prev: typeof snackbar) => ({
        ...prev,
        open: true,
        message: error instanceof Error ? error.message : 'Error al crear la solicitud',
        severity: 'error'
      }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleBuscarTrabajadorCambio = () => {
    // Implementa la lógica para buscar el trabajador por código
    // Esto es solo un ejemplo básico y debería ser reemplazado por una implementación real
    const found = trabajadores.find(t => t.codigo.toLowerCase() === formData.codigo_trabajador_cambio?.trim().toLowerCase());
    if (found) {
      setFormData(prev => ({ ...prev, trabajador_cambio_id: found.id.toString(), nombre_trabajador_cambio: found.nombre_completo }));
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nueva Licencia
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
            <TextField
              label="Código de trabajador"
              value={codigoTrabajador}
              onChange={e => setCodigoTrabajador(e.target.value)}
              fullWidth
              autoComplete="off"
              sx={{ gridColumn: 'span 2' }}
            />
            <FormControl fullWidth>
              <InputLabel>Trabajador</InputLabel>
              <Select
                name="trabajador_id"
                value={formData.trabajador_id?.toString() || ''}
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

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Licencia</InputLabel>
                <Select
                  name="tipo_licencia_id"
                  value={formData.tipo_licencia_id || ''}
                  onChange={handleChange}
                  label="Tipo de Licencia"
                >
                  <MenuItem value=""><em>Seleccione un tipo de licencia</em></MenuItem>
                  {tiposLicencias.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>{tipo.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!formData.afecta_disponibilidad}
                    onChange={handleCheckboxChange}
                    name="es_retroactiva"
                    color="primary"
                  />
                }
                label="Es retroactiva (no afecta disponibilidad)"
              />
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
                <TextField label="Fecha Inicio" name="fecha_inicio" type="date" value={formData.fecha_inicio || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                <TextField label="Fecha Fin" name="fecha_fin" type="date" value={formData.fecha_fin || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required InputProps={{ readOnly: true }} />
              </>
            )}

            {/* SOLO REGISTRO */}
            {selectedTipoLicencia?.unidad_control === 'ninguno' && (
              <TextField label="Fecha" name="fecha_inicio" type="date" value={formData.fecha_inicio || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
            )}

            {/* POR HORAS */}
            {selectedTipoLicencia?.unidad_control === 'horas' && codigoLicencia !== 'OLVIDO-ENT' && codigoLicencia !== 'OLVIDO-SAL' && (
              <React.Fragment>
                <Grid item xs={12} md={4}>
                  <TextField label="Fecha" name="fecha" type="date" value={formData.fecha || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
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

            {/* POR DÍAS (default) */}
            {(selectedTipoLicencia?.unidad_control === 'días' || !selectedTipoLicencia || selectedTipoLicencia.unidad_control === 'ninguno') && selectedTipoLicencia?.nombre !== 'Cambio de turno' && selectedTipoLicencia?.nombre !== 'Olvido de Marcación' && codigoLicencia !== 'OLVIDO-ENT' && codigoLicencia !== 'OLVIDO-SAL' && (
              <>
                <TextField label="Fecha Inicio" name="fecha_inicio" type="date" value={formData.fecha_inicio || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                <TextField label="Fecha Fin" name="fecha_fin" type="date" value={formData.fecha_fin || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
              </>
            )}

            <TextField
              label="Fecha de Solicitud"
              name="fecha_solicitud"
              type="date"
              value={formData.fecha_solicitud}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              name="motivo"
              label="Motivo"
              value={formData.motivo}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              required
            />

            {requiereJustificacion && (
              <TextField
                label="Justificación"
                name="justificacion"
                value={formData.justificacion || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            )}

            {requiereDocumento && (
              <TextField
                label="Documento Soporte"
                name="documento"
                type="file"
                onChange={handleFileChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            )}

            <TextField
              label="Estado"
              name="estado"
              value="APROBADA"
              fullWidth
              InputProps={{ readOnly: true }}
            />

            {formData.trabajador_id && formData.tipo_licencia_id && selectedTipoLicencia && (
              <Box sx={{ gridColumn: '1 / -1', mb: 2 }}>
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
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', gridColumn: '1 / -1' }}>
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
              >
                Crear Licencia
              </Button>
            </Box>
          </Box>
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

export default CreateLicenciaPage; 