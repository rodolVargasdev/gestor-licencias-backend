import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { fetchValidaciones, deleteValidacion } from '../../store/slices/validacionesSlice';
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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ValidacionesPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: validaciones, loading, error } = useSelector((state: RootState) => state.validaciones);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedValidacion, setSelectedValidacion] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    dispatch(fetchValidaciones() as any);
  }, [dispatch]);

  const handleDeleteClick = (id: number) => {
    setSelectedValidacion(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedValidacion !== null) {
      try {
        await dispatch(deleteValidacion(selectedValidacion) as any).unwrap();
        setSnackbar({ open: true, message: 'Solicitud eliminada correctamente', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Error al eliminar la solicitud', severity: 'error' });
      }
      setDeleteDialogOpen(false);
      setSelectedValidacion(null);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Solicitudes de Permiso</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/validaciones/nueva')}>
          Nueva Solicitud
        </Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tipo de Licencia</TableCell>
                <TableCell>Trabajador</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {validaciones.map((val) => (
                <TableRow key={val.id}>
                  <TableCell>{val.id}</TableCell>
                  <TableCell>{val.tipoLicencia?.nombre || val.tipoLicenciaId}</TableCell>
                  <TableCell>{val.trabajador?.nombre ? `${val.trabajador.nombre} ${val.trabajador.apellido}` : val.trabajadorId}</TableCell>
                  <TableCell>{val.fechaInicio}</TableCell>
                  <TableCell>{val.fechaFin}</TableCell>
                  <TableCell>{val.estado}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => navigate(`/validaciones/editar/${val.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(val.id)}>
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
          <DialogContentText>¿Está seguro que desea eliminar esta solicitud? Esta acción no se puede deshacer.</DialogContentText>
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

export default ValidacionesPage; 