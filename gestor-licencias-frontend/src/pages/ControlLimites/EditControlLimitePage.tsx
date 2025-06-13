import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchControlLimites, updateControlLimite } from '../../store/slices/controlLimitesSlice';
import type { RootState } from '../../store';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert, MenuItem } from '@mui/material';

const EditControlLimitePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { items: controlLimites, loading } = useSelector((state: RootState) => state.controlLimites);
  const { items: tiposLicencias } = useSelector((state: RootState) => state.tiposLicencias);
  const controlLimite = controlLimites.find((c) => c.id === Number(id));
  const [tipoLicenciaId, setTipoLicenciaId] = useState(controlLimite?.tipoLicenciaId?.toString() || '');
  const [diasPermitidos, setDiasPermitidos] = useState(controlLimite?.diasPermitidos?.toString() || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<{ tipoLicenciaId?: string; diasPermitidos?: string }>({});

  useEffect(() => {
    if (!controlLimite && id) {
      dispatch(fetchControlLimites() as any);
    }
    // eslint-disable-next-line
  }, [controlLimite, id, dispatch]);

  useEffect(() => {
    if (controlLimite) {
      setTipoLicenciaId(controlLimite.tipoLicenciaId?.toString() || '');
      setDiasPermitidos(controlLimite.diasPermitidos?.toString() || '');
    }
  }, [controlLimite]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!tipoLicenciaId) newErrors.tipoLicenciaId = 'El tipo de licencia es obligatorio';
    if (!diasPermitidos.trim() || isNaN(Number(diasPermitidos)) || Number(diasPermitidos) <= 0) newErrors.diasPermitidos = 'Días permitidos debe ser un número positivo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;
    try {
      await dispatch(updateControlLimite({ id: Number(id), dto: { tipoLicenciaId: Number(tipoLicenciaId), diasPermitidos: Number(diasPermitidos) } }) as any).unwrap();
      setSnackbar({ open: true, message: 'Control de límite actualizado correctamente', severity: 'success' });
      setTimeout(() => navigate('/control-limites'), 1000);
    } catch {
      setSnackbar({ open: true, message: 'Error al actualizar el control de límite', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (loading) return <Typography>Cargando...</Typography>;
  if (!controlLimite) return <Typography color="error">Control de límite no encontrado</Typography>;

  return (
    <Box maxWidth={500} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Editar Control de Límite</Typography>
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
            label="Días Permitidos"
            value={diasPermitidos}
            onChange={e => setDiasPermitidos(e.target.value)}
            fullWidth
            required
            margin="normal"
            error={!!errors.diasPermitidos}
            helperText={errors.diasPermitidos}
            type="number"
            inputProps={{ min: 1 }}
          />
          <Box mt={2} display="flex" gap={2}>
            <Button type="submit" variant="contained" color="primary">Guardar</Button>
            <Button variant="outlined" onClick={() => navigate('/control-limites')}>Cancelar</Button>
          </Box>
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

export default EditControlLimitePage; 