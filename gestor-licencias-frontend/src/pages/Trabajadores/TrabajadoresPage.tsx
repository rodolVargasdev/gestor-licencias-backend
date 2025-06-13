import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { fetchTrabajadores, deleteTrabajador } from '../../store/slices/trabajadoresSlice';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TrabajadoresPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: trabajadores, loading, error } = useSelector((state: RootState) => state.trabajadores);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrabajador, setSelectedTrabajador] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [filters, setFilters] = useState({
    tipo_personal: '',
    departamento_id: '',
    activo: ''
  });

  useEffect(() => {
    dispatch(fetchTrabajadores() as any);
  }, [dispatch]);

  const handleDeleteClick = (id: number) => {
    setSelectedTrabajador(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTrabajador !== null) {
      try {
        await dispatch(deleteTrabajador(selectedTrabajador) as any).unwrap();
        setSnackbar({ open: true, message: 'Trabajador eliminado correctamente', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Error al eliminar el trabajador', severity: 'error' });
      }
      setDeleteDialogOpen(false);
      setSelectedTrabajador(null);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const filteredTrabajadores = trabajadores.filter(trabajador => {
    if (filters.tipo_personal && trabajador.tipo_personal !== filters.tipo_personal) return false;
    if (filters.departamento_id && trabajador.departamento_id !== filters.departamento_id) return false;
    if (filters.activo !== '' && trabajador.activo !== (filters.activo === 'true')) return false;
    return true;
  });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Trabajadores</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/trabajadores/nuevo')}>
          Nuevo Trabajador
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Personal</InputLabel>
              <Select
                name="tipo_personal"
                value={filters.tipo_personal}
                onChange={handleFilterChange}
                label="Tipo de Personal"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="OPERATIVO">Operativo</MenuItem>
                <MenuItem value="ADMINISTRATIVO">Administrativo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                name="activo"
                value={filters.activo}
                onChange={handleFilterChange}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre Completo</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha Ingreso</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrabajadores.map((trabajador) => (
                <TableRow key={trabajador.id}>
                  <TableCell>{trabajador.codigo}</TableCell>
                  <TableCell>{trabajador.nombre_completo}</TableCell>
                  <TableCell>{trabajador.email}</TableCell>
                  <TableCell>{trabajador.telefono}</TableCell>
                  <TableCell>{trabajador.departamento?.nombre}</TableCell>
                  <TableCell>{trabajador.tipo_personal}</TableCell>
                  <TableCell>
                    {trabajador.fecha_ingreso && format(new Date(trabajador.fecha_ingreso), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={trabajador.activo ? 'Activo' : 'Inactivo'}
                      color={trabajador.activo ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => navigate(`/trabajadores/editar/${trabajador.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(trabajador.id)}>
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
          <DialogContentText>¿Está seguro que desea eliminar este trabajador? Esta acción no se puede deshacer.</DialogContentText>
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

export default TrabajadoresPage; 