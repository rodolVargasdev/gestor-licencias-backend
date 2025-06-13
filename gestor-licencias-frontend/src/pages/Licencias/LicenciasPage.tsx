import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { fetchLicencias, deleteLicencia } from '../../store/slices/licenciasSlice';
import {
  Box,
  Button,
  Typography,
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
  Tooltip,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const LicenciasPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: licencias, loading, error } = useSelector((state: RootState) => state.licencias);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLicencia, setSelectedLicencia] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    dispatch(fetchLicencias());
  }, [dispatch]);

  const handleDeleteClick = (id: number) => {
    setSelectedLicencia(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedLicencia !== null) {
      try {
        await dispatch(deleteLicencia(selectedLicencia));
        setSnackbar({ open: true, message: 'Licencia eliminada correctamente', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Error al eliminar la licencia', severity: 'error' });
      }
      setDeleteDialogOpen(false);
      setSelectedLicencia(null);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':
        return 'success';
      case 'CANCELADA':
        return 'error';
      case 'FINALIZADA':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Licencias</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/licencias/nueva')}
        >
          Nueva Licencia
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Trabajador</TableCell>
              <TableCell>Tipo de Licencia</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Días</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {licencias.map((licencia) => (
              <TableRow key={licencia.id}>
                <TableCell>{licencia.id}</TableCell>
                <TableCell>{licencia.trabajador?.nombre_completo}</TableCell>
                <TableCell>{licencia.tipo_licencia?.nombre}</TableCell>
                <TableCell>{formatDate(licencia.fecha_inicio)}</TableCell>
                <TableCell>{formatDate(licencia.fecha_fin)}</TableCell>
                <TableCell>
                  <Tooltip title={`${licencia.dias_habiles} días hábiles / ${licencia.dias_calendario} días calendario`}>
                    <span>{licencia.dias_totales}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={licencia.estado}
                    color={getEstadoColor(licencia.estado) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/licencias/${licencia.id}`)}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/licencias/${licencia.id}/editar`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(licencia.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar esta licencia? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

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

export default LicenciasPage; 