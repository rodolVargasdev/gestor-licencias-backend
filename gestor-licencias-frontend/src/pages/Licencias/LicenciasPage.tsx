import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchSolicitudes, deleteSolicitud } from '../../store/slices/solicitudesSlice';
import { fetchTrabajadores } from '../../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../../store/slices/tiposLicenciasSlice';
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
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Solicitud } from '../../types/solicitud';

const LicenciasPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items: solicitudes, loading, error } = useSelector((state: RootState) => state.solicitudes);
  const { items: trabajadores } = useSelector((state: RootState) => state.trabajadores);
  const { items: tiposLicencias } = useSelector((state: RootState) => state.tiposLicencias);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    dispatch(fetchSolicitudes());
    dispatch(fetchTrabajadores());
    dispatch(fetchTiposLicencias());
  }, [dispatch]);

  const handleDeleteClick = (id: number) => {
    setSelectedSolicitud(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSolicitud !== null) {
      try {
        await dispatch(deleteSolicitud(selectedSolicitud));
        setSnackbar({ open: true, message: 'Solicitud eliminada correctamente', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Error al eliminar la solicitud', severity: 'error' });
      }
      setDeleteDialogOpen(false);
      setSelectedSolicitud(null);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADA':
        return 'success';
      case 'RECHAZADA':
        return 'error';
      case 'PENDIENTE':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  const getTrabajadorNombre = (id: number) => {
    const trabajador = trabajadores.find(t => t.id === id);
    return trabajador ? trabajador.nombre_completo : id;
  };

  const getTipoLicenciaNombre = (id: number) => {
    const tipo = tiposLicencias.find(t => t.id === id);
    return tipo ? tipo.nombre : id;
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
              <TableCell>Motivo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha de Solicitud</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {solicitudes.map((solicitud: Solicitud) => (
              <TableRow key={solicitud.id}>
                <TableCell>{solicitud.id}</TableCell>
                <TableCell>{getTrabajadorNombre(solicitud.trabajador_id)}</TableCell>
                <TableCell>{getTipoLicenciaNombre(solicitud.tipo_licencia_id)}</TableCell>
                <TableCell>{solicitud.fecha_inicio ? formatDate(solicitud.fecha_inicio) : '-'}</TableCell>
                <TableCell>{solicitud.fecha_fin ? formatDate(solicitud.fecha_fin) : '-'}</TableCell>
                <TableCell>{solicitud.motivo}</TableCell>
                <TableCell>
                  <Chip
                    label={solicitud.estado}
                    color={getEstadoColor(solicitud.estado) as 'success' | 'error' | 'info' | 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{solicitud.fecha_solicitud ? formatDate(solicitud.fecha_solicitud) : '-'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/licencias/${solicitud.id}`)}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/licencias/${solicitud.id}/editar`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(solicitud.id!)}
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
            ¿Está seguro que desea eliminar esta solicitud? Esta acción no se puede deshacer.
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