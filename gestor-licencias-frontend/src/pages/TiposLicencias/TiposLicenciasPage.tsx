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

  const renderConfiguracion = (tipo: any) => {
    const configuraciones = [];
    
    // Características principales
    if (tipo.requiere_justificacion) configuraciones.push('Requiere justificación');
    if (tipo.requiere_aprobacion_especial) configuraciones.push('Requiere aprobación especial');
    if (tipo.requiere_documentacion) configuraciones.push('Requiere documentación');
    if (tipo.pago_haberes) configuraciones.push('Pago de haberes');
    if (tipo.acumulable) configuraciones.push('Acumulable');
    if (tipo.transferible) configuraciones.push('Transferible');
    
    // Restricciones
    if (tipo.aplica_genero) configuraciones.push(`Género: ${tipo.genero_aplicable === 'M' ? 'Masculino' : tipo.genero_aplicable === 'F' ? 'Femenino' : 'Ambos'}`);
    if (tipo.aplica_antiguedad) configuraciones.push(`Antigüedad mín: ${tipo.antiguedad_minima} años`);
    if (tipo.aplica_edad) configuraciones.push(`Edad: ${tipo.edad_minima}-${tipo.edad_maxima} años`);
    
    return configuraciones;
  };

  const renderPeriodoControl = (periodo: string) => {
    switch (periodo) {
      case 'mes':
        return 'Mensual';
      case 'año':
        return 'Anual';
      case 'ninguno':
        return 'Sin período';
      default:
        return periodo;
    }
  };

  const renderUnidadControl = (unidad: string) => {
    switch (unidad) {
      case 'días':
        return 'Por días';
      case 'horas':
        return 'Por horas';
      case 'ninguno':
        return 'Solo registro';
      default:
        return unidad;
    }
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
        <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 30 }}>ID</TableCell>
                <TableCell sx={{ minWidth: 50 }}>Código</TableCell>
                <TableCell sx={{ minWidth: 75 }}>Nombre</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Descripción</TableCell>
                <TableCell sx={{ minWidth: 60 }}>Unidad de Control</TableCell>
                <TableCell sx={{ minWidth: 60 }}>Período de Control</TableCell>
                <TableCell sx={{ minWidth: 60 }}>Duración Máxima</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Configuración</TableCell>
                <TableCell sx={{ minWidth: 40 }}>Estado</TableCell>
                <TableCell sx={{ minWidth: 50 }}>Acciones</TableCell>
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
                      <Typography noWrap sx={{ maxWidth: 90 }}>
                        {tipo.descripcion}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={renderUnidadControl(tipo.unidad_control)} 
                      size="small" 
                      color={tipo.unidad_control === 'ninguno' ? 'default' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={renderPeriodoControl(tipo.periodo_control)} 
                      size="small" 
                      color={tipo.periodo_control === 'ninguno' ? 'default' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    {tipo.unidad_control !== 'ninguno' ? `${tipo.duracion_maxima} ${tipo.unidad_control}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 140 }}>
                      {renderConfiguracion(tipo).map((config, index) => (
                        <Chip key={index} label={config} size="small" color="info" />
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