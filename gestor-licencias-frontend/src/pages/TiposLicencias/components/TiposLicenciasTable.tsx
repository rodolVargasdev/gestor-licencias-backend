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
  Chip,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TipoLicencia } from '../../../types/tipoLicencia';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { deleteTipoLicencia } from '../../../store/slices/tiposLicenciasSlice';

interface TiposLicenciasTableProps {
  tiposLicencias: TipoLicencia[];
}

const TiposLicenciasTable: React.FC<TiposLicenciasTableProps> = ({ tiposLicencias }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleEdit = (id: number) => {
    navigate(`/tipos-licencias/editar/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este tipo de licencia?')) {
      await dispatch(deleteTipoLicencia(id));
    }
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Días Máximos</TableCell>
            <TableCell>Personal Operativo</TableCell>
            <TableCell>Personal Administrativo</TableCell>
            <TableCell>Goce Salario</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tiposLicencias.map((tipoLicencia) => (
            <TableRow key={tipoLicencia.id}>
              <TableCell>{tipoLicencia.codigo}</TableCell>
              <TableCell>{tipoLicencia.nombre}</TableCell>
              <TableCell>{tipoLicencia.descripcion}</TableCell>
              <TableCell>{tipoLicencia.dias_maximos}</TableCell>
              <TableCell>
                <Chip
                  label={tipoLicencia.personal_operativo ? 'Sí' : 'No'}
                  color={tipoLicencia.personal_operativo ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={tipoLicencia.personal_administrativo ? 'Sí' : 'No'}
                  color={tipoLicencia.personal_administrativo ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={tipoLicencia.goce_salario ? 'Sí' : 'No'}
                  color={tipoLicencia.goce_salario ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(tipoLicencia.id)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(tipoLicencia.id)}
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

export default TiposLicenciasTable; 