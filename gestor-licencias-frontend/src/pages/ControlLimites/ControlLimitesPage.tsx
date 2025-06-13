import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { fetchControlLimites, deleteControlLimite } from '../../store/slices/controlLimitesSlice';
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

const ControlLimitesPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: controlLimites, loading, error } = useSelector((state: RootState) => state.controlLimites);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedControlLimite, setSelectedControlLimite] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    dispatch(fetchControlLimites() as any);
  }, [dispatch]);

  const handleDeleteClick = (id: number) => {
    setSelectedControlLimite(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedControlLimite !== null) {
      try {
        await dispatch(deleteControlLimite(selectedControlLimite) as any).unwrap();
        setSnackbar({ open: true, message: 'Control de límite eliminado correctamente', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Error al eliminar el control de límite', severity: 'error' });
      }
      setDeleteDialogOpen(false);
      setSelectedControlLimite(null);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Control de Límites</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/control-limites/nuevo')}>
          Nuevo Control de Límite
        </Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tipo de Licencia</TableCell>
                <TableCell>Días Permitidos</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {controlLimites.map((cl) => (
                <TableRow key={cl.id}>
                  <TableCell>{cl.id}</TableCell>
                  <TableCell>{cl.tipoLicencia?.nombre || cl.tipoLicenciaId}</TableCell>
                  <TableCell>{cl.diasPermitidos}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => navigate(`/control-limites/editar/${cl.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(cl.id)}>
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
          <DialogContentText>¿Está seguro que desea eliminar este control de límite? Esta acción no se puede deshacer.</DialogContentText>
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

export default ControlLimitesPage; 