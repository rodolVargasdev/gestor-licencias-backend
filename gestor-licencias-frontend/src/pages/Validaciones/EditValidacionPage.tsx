import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchValidaciones, updateValidacion } from '../../store/slices/validacionesSlice';
import { fetchLicencias } from '../../store/slices/licenciasSlice';
import type { RootState } from '../../store';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import type { AppDispatch } from '../../store';

const estados = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA'];

const EditValidacionPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { items: validaciones, loading } = useSelector((state: RootState) => state.validaciones);
  const { items: tiposLicencias } = useSelector((state: RootState) => state.tiposLicencias);
  const { items: trabajadores } = useSelector((state: RootState) => state.trabajadores);
  const validacion = validaciones.find((v) => v.id === Number(id));
  const [tipoLicenciaId, setTipoLicenciaId] = useState(validacion?.tipoLicenciaId?.toString() || '');
  const [trabajadorId, setTrabajadorId] = useState(validacion?.trabajadorId?.toString() || '');
  const [fechaInicio, setFechaInicio] = useState(validacion?.fechaInicio || '');
  const [fechaFin, setFechaFin] = useState(validacion?.fechaFin || '');
  const [estado, setEstado] = useState(validacion?.estado || 'PENDIENTE');
  const [observaciones, setObservaciones] = useState(validacion?.observaciones || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<{ tipoLicenciaId?: string; trabajadorId?: string; fechaInicio?: string; fechaFin?: string; estado?: string }>({});
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalDetails, setApprovalDetails] = useState<{
    diasDisponibles: number;
    diasUsados: number;
    diasRestantes: number;
  } | null>(null);

  useEffect(() => {
    if (!validacion && id) {
      dispatch(fetchValidaciones() as any);
    }
    // eslint-disable-next-line
  }, [validacion, id, dispatch]);

  useEffect(() => {
    if (validacion) {
      setTipoLicenciaId(validacion.tipoLicenciaId?.toString() || '');
      setTrabajadorId(validacion.trabajadorId?.toString() || '');
      setFechaInicio(validacion.fechaInicio || '');
      setFechaFin(validacion.fechaFin || '');
      setEstado(validacion.estado || 'PENDIENTE');
      setObservaciones(validacion.observaciones || '');
    }
  }, [validacion]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!tipoLicenciaId) newErrors.tipoLicenciaId = 'El tipo de licencia es obligatorio';
    if (!trabajadorId) newErrors.trabajadorId = 'El trabajador es obligatorio';
    if (!fechaInicio) newErrors.fechaInicio = 'La fecha de inicio es obligatoria';
    if (!fechaFin) newErrors.fechaFin = 'La fecha de fin es obligatoria';
    if (fechaInicio && fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) newErrors.fechaFin = 'La fecha de fin debe ser posterior a la de inicio';
    if (!estado) newErrors.estado = 'El estado es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;

    // Si se está aprobando, mostrar diálogo de confirmación
    if (estado === 'APROBADA') {
      setApprovalDialog(true);
      return;
    }

    await submitChanges();
  };

  const submitChanges = async () => {
    try {
      const response = await dispatch(updateValidacion({
        id: Number(id),
        data: {
          estado,
          observaciones,
          fecha_aprobacion: estado === 'APROBADA' ? new Date().toISOString().split('T')[0] : undefined
        }
      }) as any).unwrap();

      // Si se aprobó, mostrar detalles de disponibilidad
      if (estado === 'APROBADA' && response.disponibilidad) {
        setApprovalDetails({
          diasDisponibles: response.disponibilidad.dias_disponibles,
          diasUsados: response.disponibilidad.dias_usados,
          diasRestantes: response.disponibilidad.dias_restantes
        });
      }

      setSnackbar({
        open: true,
        message: estado === 'APROBADA' 
          ? 'Solicitud aprobada y disponibilidad actualizada correctamente'
          : 'Solicitud actualizada correctamente',
        severity: 'success'
      });
      await dispatch(fetchLicencias());
      setTimeout(() => navigate('/validaciones'), 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al actualizar la solicitud',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (loading) return <Typography>Cargando...</Typography>;
  if (!validacion) return <Typography color="error">Solicitud no encontrada</Typography>;

  return (
    <Box maxWidth={600} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Editar Solicitud de Permiso</Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            select
            label="Tipo de Licencia"
            value={tipoLicenciaId}
            onChange={e => setTipoLicenciaId(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.tipoLicenciaId}
            helperText={errors.tipoLicenciaId}
          >
            <MenuItem value="">Seleccione...</MenuItem>
            {tiposLicencias.map((tipo) => (
              <MenuItem key={tipo.id} value={tipo.id}>{tipo.nombre}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Trabajador"
            value={trabajadorId}
            onChange={e => setTrabajadorId(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.trabajadorId}
            helperText={errors.trabajadorId}
          >
            <MenuItem value="">Seleccione...</MenuItem>
            {trabajadores.map((trabajador) => (
              <MenuItem key={trabajador.id} value={trabajador.id}>{trabajador.nombre} {trabajador.apellido}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Fecha Inicio"
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.fechaInicio}
            helperText={errors.fechaInicio}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Fecha Fin"
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.fechaFin}
            helperText={errors.fechaFin}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Estado"
            value={estado}
            onChange={e => setEstado(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.estado}
            helperText={errors.estado}
          >
            {estados.map((est) => (
              <MenuItem key={est} value={est}>{est}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Observaciones"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
          <Box mt={2} display="flex" gap={2}>
            <Button type="submit" variant="contained" color="primary">Guardar</Button>
            <Button variant="outlined" onClick={() => navigate('/validaciones')}>Cancelar</Button>
          </Box>
        </form>
      </Paper>

      {/* Diálogo de confirmación de aprobación */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)}>
        <DialogTitle>Confirmar Aprobación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea aprobar esta solicitud? Esta acción:
          </Typography>
          <ul>
            <li>Actualizará el estado de la solicitud a APROBADA</li>
            <li>Creará una nueva licencia</li>
            <li>Actualizará la disponibilidad del trabajador</li>
          </ul>
          <Typography color="warning.main">
            Nota: La disponibilidad puede quedar en números negativos si el trabajador excede sus días disponibles.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancelar</Button>
          <Button onClick={() => {
            setApprovalDialog(false);
            submitChanges();
          }} color="primary" variant="contained">
            Confirmar Aprobación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de detalles de disponibilidad */}
      <Dialog open={!!approvalDetails} onClose={() => setApprovalDetails(null)}>
        <DialogTitle>Detalles de Disponibilidad Actualizada</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography>
              Días Disponibles: {approvalDetails?.diasDisponibles}
            </Typography>
            <Typography>
              Días Usados: {approvalDetails?.diasUsados}
            </Typography>
            <Typography color={approvalDetails?.diasRestantes < 0 ? 'error' : 'success'}>
              Días Restantes: {approvalDetails?.diasRestantes}
            </Typography>
            {approvalDetails?.diasRestantes < 0 && (
              <Typography color="error" sx={{ mt: 2 }}>
                Advertencia: El trabajador ha excedido sus días disponibles.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDetails(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditValidacionPage; 