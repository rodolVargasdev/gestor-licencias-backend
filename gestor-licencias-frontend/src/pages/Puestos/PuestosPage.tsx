import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { fetchPuestos, deletePuesto } from '../../store/slices/puestosSlice';
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

const PuestosPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: puestos, loading, error } = useSelector((state: RootState) => state.puestos);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPuesto, setSelectedPuesto] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    dispatch(fetchPuestos() as any);
  }, [dispatch]);

  const handleDeleteClick = (id: number) => {
    setSelectedPuesto(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPuesto !== null) {
      try {
        await dispatch(deletePuesto(selectedPuesto) as any).unwrap();
        setSnackbar({ open: true, message: 'Puesto eliminado correctamente', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Error al eliminar el puesto', severity: 'error' });
      }
      setDeleteDialogOpen(false);
      setSelectedPuesto(null);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Puestos</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/puestos/nuevo')}>
          Nuevo Puesto
        </Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {puestos.map((puesto) => (
                <TableRow key={puesto.id}>
                  <TableCell>{puesto.id}</TableCell>
                  <TableCell>{puesto.nombre}</TableCell>
                  <TableCell>{puesto.descripcion}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => navigate(`/puestos/editar/${puesto.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(puesto.id)}>
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
          <DialogContentText>¿Está seguro que desea eliminar este puesto? Esta acción no se puede deshacer.</DialogContentText>
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

export default PuestosPage; 