import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchSolicitudes, deleteSolicitud } from '../../store/slices/solicitudesSlice';
import { fetchTrabajadores } from '../../store/slices/trabajadoresSlice';
import { fetchTiposLicencias } from '../../store/slices/tiposLicenciasSlice';
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
  Paper,
  TextField,
  InputAdornment,
  TablePagination,
  Tooltip,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Solicitud } from '../../types/solicitud';
import type { TipoLicencia } from '../../types/tipoLicencia';
import { exportToPDF, exportToExcel, formatLicenciasForExport } from '../../utils/exportLicencias';
import { fromElSalvadorDate } from '../../utils/dateUtils';

const LicenciasPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items: solicitudes, loading, error } = useSelector((state: RootState) => state.solicitudes);
  const { items: trabajadores } = useSelector((state: RootState) => state.trabajadores);
  const { items: tiposLicencias } = useSelector((state: RootState) => state.tiposLicencias);
  const { items: licencias } = useSelector((state: RootState) => state.licencias);
  
  // Estados para búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errorLicencia, setErrorLicencia] = useState<string | null>(null);
  
  // Estados para el menú de exportación
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    dispatch(fetchSolicitudes());
    dispatch(fetchTrabajadores());
    dispatch(fetchTiposLicencias());
    if (licencias.length === 0) {
      dispatch(fetchLicencias());
    }
  }, [dispatch, licencias.length]);

  // Filtrar solicitudes basado en el término de búsqueda
  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    const trabajador = trabajadores.find(t => t.id === solicitud.trabajador_id);
    const tipoLicencia = tiposLicencias.find(t => t.id === solicitud.tipo_licencia_id);
    
    const searchLower = searchTerm.toLowerCase();
    return (
      solicitud.id?.toString().includes(searchLower) ||
      trabajador?.nombre_completo.toLowerCase().includes(searchLower) ||
      trabajador?.codigo.toLowerCase().includes(searchLower) ||
      tipoLicencia?.nombre.toLowerCase().includes(searchLower) ||
      tipoLicencia?.codigo.toLowerCase().includes(searchLower) ||
      solicitud.estado.toLowerCase().includes(searchLower) ||
      solicitud.motivo?.toLowerCase().includes(searchLower)
    );
  });

  // Obtener solicitudes paginadas
  const paginatedSolicitudes = filteredSolicitudes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDeleteClick = (id: number) => {
    setSelectedSolicitud(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedSolicitud !== null) {
      try {
        // Buscar la licencia asociada a la solicitud
        const licencia = licencias.find(l => l.solicitud_id === selectedSolicitud);
        if (licencia) {
          await dispatch(deleteLicencia(licencia.id));
        }
        await dispatch(deleteSolicitud(selectedSolicitud));
        setSnackbar({ open: true, message: 'Solicitud y licencia eliminadas correctamente', severity: 'success' });
        await dispatch(fetchLicencias());
      } catch {
        setSnackbar({ open: true, message: 'Error al eliminar la solicitud o licencia', severity: 'error' });
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
        return 'warning';
      case 'CANCELADA':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return '-';
    const localDate = fromElSalvadorDate(date);
    return format(new Date(localDate + 'T00:00:00'), 'dd/MM/yyyy', { locale: es });
  };

  const getTrabajadorNombre = (id: number) => {
    const trabajador = trabajadores.find(t => t.id === id);
    return trabajador ? trabajador.nombre_completo : 'N/A';
  };

  const getTrabajadorCodigo = (id: number) => {
    const trabajador = trabajadores.find(t => t.id === id);
    return trabajador ? trabajador.codigo : 'N/A';
  };

  const getTipoLicencia = (id: number): TipoLicencia | undefined => {
    const tipo = tiposLicencias.find(t => t.id === id);
    return tipo as TipoLicencia | undefined;
  };

  const handleEdit = (solicitudId: number) => {
    navigate(`/solicitudes/${solicitudId}/editar`);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Funciones de exportación
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportToPDF = () => {
    try {
      const formattedLicencias = formatLicenciasForExport(
        filteredSolicitudes,
        trabajadores,
        tiposLicencias as unknown as TipoLicencia[],
        licencias
      );
      const title = searchTerm 
        ? `Reporte de Licencias - Filtrado: "${searchTerm}"`
        : 'Reporte de Licencias';
      exportToPDF(formattedLicencias, title);
      setSnackbar({ open: true, message: 'Licencias exportadas a PDF correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al exportar licencias a PDF', severity: 'error' });
    }
    handleExportMenuClose();
  };

  const handleExportToExcel = () => {
    try {
      const formattedLicencias = formatLicenciasForExport(
        filteredSolicitudes,
        trabajadores,
        tiposLicencias as unknown as TipoLicencia[],
        licencias
      );
      const title = searchTerm 
        ? `Reporte de Licencias - Filtrado: "${searchTerm}"`
        : 'Reporte de Licencias';
      exportToExcel(formattedLicencias, title);
      setSnackbar({ open: true, message: 'Licencias exportadas a Excel correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al exportar licencias a Excel', severity: 'error' });
    }
    handleExportMenuClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Cargando licencias...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', gap: 2, width: '100%', alignItems: 'center' }}>
        
      <Typography variant="h4" sx={{ mb: 3 }}>Gestión de Licencias</Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', width: '70%' }}>
          <TextField
            sx={{ flexGrow: 1, minWidth: 300 }}
            variant="outlined"
            placeholder="Buscar por ID, trabajador, tipo de licencia, estado o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleExportMenuOpen}
          >
            Exportar
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/licencias/nueva')}
          >
            Nueva Licencia
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Trabajador</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Tipo de Licencia</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Período</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Duración</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Motivo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSolicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="textSecondary">
                      {searchTerm ? 'No se encontraron licencias que coincidan con la búsqueda' : 'No hay licencias registradas'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSolicitudes.map((solicitud: Solicitud) => (
                  <TableRow key={solicitud.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        #{solicitud.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {getTrabajadorNombre(solicitud.trabajador_id).charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {getTrabajadorNombre(solicitud.trabajador_id)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {getTrabajadorCodigo(solicitud.trabajador_id)}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const tipo = getTipoLicencia(solicitud.tipo_licencia_id);
                        if (!tipo) return 'N/A';

                        const esOlvido = tipo.codigo === 'OLVIDO-ENT' || tipo.codigo === 'OLVIDO-SAL';
                        
                        if (esOlvido && solicitud.tipo_olvido_marcacion) {
                          const tipoMarcacion = solicitud.tipo_olvido_marcacion.charAt(0).toUpperCase() + solicitud.tipo_olvido_marcacion.slice(1).toLowerCase();
                          return `${tipo.nombre} - ${tipoMarcacion}`;
                        }
                        
                        return tipo.nombre;
                      })()}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <strong>Inicio:</strong> {solicitud.fecha_inicio ? formatDate(solicitud.fecha_inicio) : '-'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Fin:</strong> {solicitud.fecha_fin ? formatDate(solicitud.fecha_fin) : '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const licencia = licencias.find(l => l.solicitud_id === solicitud.id);
                        const tipoLicencia = getTipoLicencia(solicitud.tipo_licencia_id);
                        if (licencia && tipoLicencia?.unidad_control === 'horas') {
                          return (
                            <Chip 
                              label={licencia.horas_totales !== undefined ? `${Number(licencia.horas_totales)} horas` : '-'}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          );
                        } else if (solicitud.fecha_inicio && solicitud.fecha_fin) {
                          const inicio = new Date(solicitud.fecha_inicio).getTime();
                          const fin = new Date(solicitud.fecha_fin).getTime();
                          const dias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
                          return (
                            <Chip 
                              label={`${dias} días`}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          );
                        } else {
                          return <Typography variant="body2" color="textSecondary">-</Typography>;
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={solicitud.estado}
                        color={getEstadoColor(solicitud.estado) as 'success' | 'error' | 'warning' | 'default'}
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}
                      >
                        {solicitud.motivo || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {/* <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              const licencia = licencias.find(l => l.solicitud_id === solicitud.id);
                              if (licencia) {
                                navigate(`/licencias/${licencia.id}`);
                              } else {
                                setSnackbar({ 
                                  open: true, 
                                  message: 'No se encontró la licencia asociada a esta solicitud', 
                                  severity: 'error' 
                                });
                              }
                            }}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip> */}
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleEdit(solicitud.id!)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(solicitud.id!)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredSolicitudes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

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

      <Snackbar
        open={!!errorLicencia}
        autoHideDuration={6000}
        onClose={() => setErrorLicencia(null)}
      >
        <Alert
          onClose={() => setErrorLicencia(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorLicencia}
        </Alert>
      </Snackbar>

      {/* Menú de exportación */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
      >
        <MenuItem onClick={handleExportToPDF}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportToExcel}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a Excel</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LicenciasPage; 