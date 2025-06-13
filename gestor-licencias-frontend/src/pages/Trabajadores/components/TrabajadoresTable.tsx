import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Trabajador } from '../../../types/trabajador';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { deleteTrabajador } from '../../../store/slices/trabajadoresSlice';

interface TrabajadoresTableProps {
  trabajadores: Trabajador[];
}

const TrabajadoresTable: React.FC<TrabajadoresTableProps> = ({ trabajadores }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleEdit = (id: number) => {
    navigate(`/trabajadores/editar/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este trabajador?')) {
      await dispatch(deleteTrabajador(id));
    }
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellido</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Departamento</TableCell>
            <TableCell>Cargo</TableCell>
            <TableCell>Fecha de Ingreso</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trabajadores.map((trabajador) => (
            <TableRow key={trabajador.id}>
              <TableCell>{trabajador.id}</TableCell>
              <TableCell>{trabajador.nombre}</TableCell>
              <TableCell>{trabajador.apellido}</TableCell>
              <TableCell>{trabajador.email}</TableCell>
              <TableCell>{trabajador.telefono}</TableCell>
              <TableCell>
                <Chip
                  label={trabajador.departamento}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{trabajador.cargo}</TableCell>
              <TableCell>
                {new Date(trabajador.fecha_ingreso).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(trabajador.id)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(trabajador.id)}
                    color="error"
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
  );
};

export default TrabajadoresTable; 