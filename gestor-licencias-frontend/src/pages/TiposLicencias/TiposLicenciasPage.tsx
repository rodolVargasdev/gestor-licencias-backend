import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { fetchTiposLicencias, deleteTipoLicencia } from '../../store/slices/tiposLicenciasSlice';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

const TiposLicenciasPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: tiposLicencias, loading, error } = useSelector((state: RootState) => state.tiposLicencias);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTipoLicencia, setSelectedTipoLicencia] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    dispatch(fetchTiposLicencias() as any);
  }, [dispatch]);

  const handleDeleteClick = (id: number) => {
    setSelectedTipoLicencia(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTipoLicencia !== null) {
      try {
        await dispatch(deleteTipoLicencia(selectedTipoLicencia) as any).unwrap();
        setSnackbar({ open: true, message: 'Tipo de licencia eliminado correctamente', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Error al eliminar el tipo de licencia', severity: 'error' });
      }
      setDeleteDialogOpen(false);
      setSelectedTipoLicencia(null);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const renderChip = (label: string, color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning') => (
    <Chip label={label} size="small" color={color} sx={{ mr: 0.5 }} />
  );

  const renderRestricciones = (tipo: any) => {
    const restricciones = [];
    if (tipo.aplica_genero) restricciones.push(`Género: ${tipo.genero_aplicable === 'M' ? 'Masculino' : 'Femenino'}`);
    if (tipo.aplica_antiguedad) restricciones.push(`Antigüedad mínima: ${tipo.antiguedad_minima} años`);
    if (tipo.aplica_edad) restricciones.push(`Edad: ${tipo.edad_minima}-${tipo.edad_maxima} años`);
    return restricciones.join(', ');
  };

  const renderCaracteristicas = (tipo: any) => {
    const caracteristicas = [];
    if (tipo.requiere_justificacion) caracteristicas.push('Requiere justificación');
    if (tipo.requiere_aprobacion_especial) caracteristicas.push('Requiere aprobación especial');
    if (tipo.requiere_documentacion) caracteristicas.push('Requiere documentación');
    if (tipo.pago_haberes) caracteristicas.push('Pago de haberes');
    if (tipo.acumulable) caracteristicas.push('Acumulable');
    if (tipo.transferible) caracteristicas.push('Transferible');
    return caracteristicas;
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Tipos de Licencias</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/tipos-licencias/nuevo')}>
          Nuevo Tipo de Licencia
        </Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Restricciones</TableCell>
                <TableCell>Características</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tiposLicencias.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell>{tipo.id}</TableCell>
                  <TableCell>{tipo.codigo}</TableCell>
                  <TableCell>{tipo.nombre}</TableCell>
                  <TableCell>
                    <Tooltip title={tipo.descripcion}>
                      <Typography noWrap sx={{ maxWidth: 200 }}>
                        {tipo.descripcion}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {tipo.duracion_maxima} {tipo.tipo_duracion.toLowerCase()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={renderRestricciones(tipo)}>
                      <Typography noWrap sx={{ maxWidth: 200 }}>
                        {renderRestricciones(tipo)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {renderCaracteristicas(tipo).map((caracteristica, index) => (
                        <Chip key={index} label={caracteristica} size="small" color="primary" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {renderChip(tipo.activo ? 'Activo' : 'Inactivo', tipo.activo ? 'success' : 'error')}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => navigate(`/tipos-licencias/editar/${tipo.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(tipo.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Está seguro que desea eliminar este tipo de licencia? Esta acción no se puede deshacer.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>Eliminar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {loading && <Typography>Cargando...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default TiposLicenciasPage; 