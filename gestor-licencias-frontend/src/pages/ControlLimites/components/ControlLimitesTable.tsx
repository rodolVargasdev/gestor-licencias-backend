import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import type { ControlLimite } from '../../../types/controlLimite';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { deleteControlLimite } from '../../../store/slices/controlLimitesSlice';

interface ControlLimitesTableProps {
  controlLimites: ControlLimite[];
  onDelete: (id: number) => void;
}

const ControlLimitesTable: React.FC<ControlLimitesTableProps> = ({
  controlLimites,
  onDelete
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredControlLimites = controlLimites.filter((control) =>
    control.tipo_licencia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    control.anio.toString().includes(searchTerm)
  );

  const paginatedControlLimites = filteredControlLimites.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este control de límites?')) {
      await dispatch(deleteControlLimite(id));
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por tipo de licencia o año..."
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
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo de Licencia</TableCell>
              <TableCell>Año</TableCell>
              <TableCell>Límite Mensual</TableCell>
              <TableCell>Límite Anual</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedControlLimites.map((control) => (
              <TableRow key={control.id}>
                <TableCell>{control.tipo_licencia.nombre}</TableCell>
                <TableCell>{control.anio}</TableCell>
                <TableCell>{control.limite_mensual}</TableCell>
                <TableCell>{control.limite_anual}</TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => navigate(`/control-limites/editar/${control.id}`)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      onClick={() => onDelete(control.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredControlLimites.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
        />
      </TableContainer>
    </Box>
  );
};

export default ControlLimitesTable; 