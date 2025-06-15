import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchTrabajadores, deleteTrabajador } from '../../store/slices/trabajadoresSlice';

const TrabajadoresPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: trabajadores, loading } = useSelector((state: RootState) => state.trabajadores);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadTrabajadores = async () => {
      try {
        await dispatch(fetchTrabajadores()).unwrap();
      } catch (error) {
        setErrorMessage('Error al cargar los trabajadores');
        console.error('Error al cargar trabajadores:', error);
      }
    };
    loadTrabajadores();
  }, [dispatch]);

  const handleEdit = (id: number) => {
    navigate(`/trabajadores/editar/${id}`);
  };

  const handleDelete = async () => {
    if (deleteId) {
    try {
        await dispatch(deleteTrabajador(deleteId)).unwrap();
      setDeleteId(null);
      } catch (error) {
        setErrorMessage('Error al eliminar trabajador');
        console.error('Error al eliminar trabajador:', error);
      }
    }
  };

  // Procesar los datos para agregar los campos planos
  const trabajadoresProcesados = (trabajadores || []).map((t) => ({
    ...t,
    departamento_nombre: t.departamento && t.departamento.nombre ? t.departamento.nombre : 'N/A',
    puesto_nombre: t.puesto && t.puesto.nombre ? t.puesto.nombre : 'N/A',
    fecha_ingreso_formateada: t.fecha_ingreso
      ? new Date(t.fecha_ingreso).toLocaleDateString('es-ES')
      : 'N/A',
  }));

  const columns: GridColDef[] = [
    { field: 'codigo', headerName: 'Código', width: 150 },
    { field: 'nombre_completo', headerName: 'Nombre Completo', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'telefono', headerName: 'Teléfono', width: 150 },
    { field: 'departamento_nombre', headerName: 'Departamento', width: 200 },
    { field: 'puesto_nombre', headerName: 'Puesto', width: 200 },
    { field: 'tipo_personal', headerName: 'Tipo', width: 150 },
    { field: 'fecha_ingreso_formateada', headerName: 'Fecha Ingreso', width: 200 },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 150,
      renderCell: (params) => {
        return (
          <Alert severity={params.row && params.row.activo ? "success" : "error"} sx={{ py: 0 }}>
            {params.row && params.row.activo ? 'Activo' : 'Inactivo'}
          </Alert>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => {
        return (
          <>
            <IconButton
              color="primary"
              onClick={() => params.row && handleEdit(params.row.id)}
              size="small"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => params.row && setDeleteId(params.row.id)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </>
        );
      }
    }
  ];

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, width: '100%', maxWidth: 1100 }}>
        <Typography variant="h5" component="h1">
          Trabajadores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/trabajadores/nuevo')}
        >
          Nuevo Trabajador
        </Button>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto' }}>
        <DataGrid
          rows={trabajadoresProcesados}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          autoHeight
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        />
      </Box>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        message={errorMessage}
      />

      <Snackbar
        open={!!deleteId}
        autoHideDuration={6000}
        onClose={() => setDeleteId(null)}
      >
        <Alert
          onClose={() => setDeleteId(null)}
          severity="warning"
          sx={{ width: '100%' }}
        >
          ¿Está seguro que desea eliminar este trabajador?
          <Button color="inherit" size="small" onClick={handleDelete}>
            Confirmar
          </Button>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TrabajadoresPage; 