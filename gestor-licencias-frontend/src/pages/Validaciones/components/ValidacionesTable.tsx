import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Validacion } from '../../../types/validacion';

interface ValidacionesTableProps {
  validaciones: Validacion[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

const ValidacionesTable: React.FC<ValidacionesTableProps> = ({
  validaciones,
  onEdit,
  onDelete,
  onView
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedValidacion, setSelectedValidacion] = useState<Validacion | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (validacion: Validacion) => {
    setSelectedValidacion(validacion);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedValidacion) {
      onDelete(selectedValidacion.id);
      setDeleteDialogOpen(false);
      setSelectedValidacion(null);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'warning';
      case 'APROBADA':
        return 'success';
      case 'RECHAZADA':
        return 'error';
      case 'CANCELADA':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo de Licencia</TableCell>
              <TableCell>Trabajador</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {validaciones
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((validacion) => (
                <TableRow key={validacion.id}>
                  <TableCell>{validacion.tipoLicencia?.nombre}</TableCell>
                  <TableCell>
                    {`${validacion.trabajador?.nombre} ${validacion.trabajador?.apellido}`}
                  </TableCell>
                  <TableCell>{formatDate(validacion.fechaInicio)}</TableCell>
                  <TableCell>{formatDate(validacion.fechaFin)}</TableCell>
                  <TableCell>
                    <Chip
                      label={validacion.estado}
                      color={getEstadoColor(validacion.estado) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => onView(validacion.id)}
                        title="Ver detalles"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(validacion.id)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(validacion)}
                        title="Eliminar"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={validaciones.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count}`
        }
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar esta validación? Esta acción no se puede deshacer.
          </DialogContentText>
          {selectedValidacion && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Detalles de la validación:</Typography>
              <Typography>
                Tipo de Licencia: {selectedValidacion.tipoLicencia?.nombre}
              </Typography>
              <Typography>
                Trabajador: {`${selectedValidacion.trabajador?.nombre} ${selectedValidacion.trabajador?.apellido}`}
              </Typography>
              <Typography>
                Estado: {selectedValidacion.estado}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ValidacionesTable; 