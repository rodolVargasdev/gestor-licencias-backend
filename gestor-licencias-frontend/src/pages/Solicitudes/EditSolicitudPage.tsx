import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSolicitudById, updateSolicitud } from '../../store/slices/solicitudesSlice';
import { fetchTrabajadores } from '../../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../../store/slices/tiposLicenciasSlice';
import { fetchLicencias } from '../../store/slices/licenciasSlice';
import type { RootState, AppDispatch } from '../../store';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert, MenuItem, FormControl, InputLabel, Select, InputAdornment } from '@mui/material';
import type { Solicitud } from '../../types/solicitud';
import type { SelectChangeEvent } from '@mui/material/Select';
import SearchIcon from '@mui/icons-material/Search';

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

  useEffect(() => {
    if (id) {
      dispatch(fetchSolicitudById(Number(id)));
      dispatch(fetchTrabajadores());
      dispatch(fetchTiposLicencias());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (solicitud) {
      setFormData(solicitud);
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
    } else {
      if (!id) return;
      try {
        const result = await dispatch(updateSolicitud({ id: Number(id), ...formData })).unwrap();
        setSnackbar({ open: true, message: 'Solicitud y licencia actualizadas correctamente', severity: 'success' });
        
        // Refrescar los datos
        await dispatch(fetchSolicitudById(Number(id)));
        
        // Si hay una licencia asociada, refrescar también las licencias
        if (result.licencia) {
          await dispatch(fetchLicencias());
        }
        
        setTimeout(() => navigate('/licencias'), 1000);
      } catch (error) {
        setSnackbar({ open: true, message: 'Error al actualizar la solicitud', severity: 'error' });
      }
    }
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  if (!formData) return <Typography>Cargando...</Typography>;

  // Obtener el tipo de licencia seleccionado
  const selectedTipoLicencia = tiposLicencias.find(t => t.id === Number(formData.tipo_licencia_id));
  const codigoLicencia = selectedTipoLicencia?.codigo || '';

  return (
    <Box maxWidth={600} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Editar Solicitud</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Código del Trabajador"
            name="codigo_trabajador"
            value={codigoTrabajador}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Trabajador</InputLabel>
            <Select
              name="trabajador_id"
              value={formData.trabajador_id?.toString() || ''}
              onChange={handleChange}
              label="Trabajador"
              required
              disabled
            >
              {trabajadores.map((trabajador) => (
                <MenuItem key={trabajador.id} value={trabajador.id}>
                  {trabajador.nombre_completo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Licencia</InputLabel>
            <Select
              name="tipo_licencia_id"
              value={formData.tipo_licencia_id?.toString() || ''}
              onChange={handleChange}
              label="Tipo de Licencia"
              required
            >
              {tiposLicencias.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Motivo"
            name="motivo"
            value={formData.motivo || ''}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

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
              <TextField label="Fecha" name="fecha_inicio" type="date" value={formData.fecha_inicio || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
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
            </>
          )}

          <TextField
            label="Estado"
            name="estado"
            value={formData.estado || ''}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Observaciones"
            name="observaciones"
            value={formData.observaciones || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Días Hábiles"
            value={formData.dias_habiles || ''}
            margin="normal"
            fullWidth
            InputProps={{ readOnly: true }}
            helperText="Este valor es solo informativo y se calcula automáticamente."
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/licencias')}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Guardar Cambios</Button>
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

export default EditSolicitudPage; 