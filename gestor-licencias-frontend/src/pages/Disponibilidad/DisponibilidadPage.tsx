import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, TextField, InputAdornment, Button, Tooltip } from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import type { AppDispatch, RootState } from '../../store';
import { fetchDisponibilidadByTrabajador } from '../../store/slices/disponibilidadSlice';
import { trabajadoresService } from '../../services/trabajadores.service';
import { useDisponibilidadUpdate } from '../../hooks/useDisponibilidadUpdate';
import type { DisponibilidadTrabajador } from '../../types/disponibilidad';

const DisponibilidadPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: disponibilidad, loading, lastUpdate } = useSelector((state: RootState) => state.disponibilidad);
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<number | null>(null);
  const [disponibilidadFiltrada, setDisponibilidadFiltrada] = useState<DisponibilidadTrabajador[]>([]);

  // Efecto para buscar trabajador por código
  useEffect(() => {
    const buscarTrabajador = async () => {
      if (codigoBusqueda.trim()) {
        try {
          const response = await trabajadoresService.findByCodigo(codigoBusqueda.trim());
          if (response && response.length > 0) {
            const trabajador = response[0];
            setTrabajadorSeleccionado(trabajador.id);
            dispatch(fetchDisponibilidadByTrabajador(trabajador.id));
          } else {
            setTrabajadorSeleccionado(null);
            setDisponibilidadFiltrada([]);
          }
        } catch (error) {
          console.error('Error al buscar trabajador:', error);
          setTrabajadorSeleccionado(null);
          setDisponibilidadFiltrada([]);
        }
      } else {
        setTrabajadorSeleccionado(null);
        setDisponibilidadFiltrada([]);
      }
    };

    const timeoutId = setTimeout(buscarTrabajador, 500);
    return () => clearTimeout(timeoutId);
  }, [codigoBusqueda, dispatch]);

  // Efecto para actualizar disponibilidad filtrada
  useEffect(() => {
    if (trabajadorSeleccionado) {
      setDisponibilidadFiltrada(disponibilidad);
    } else {
      setDisponibilidadFiltrada([]);
    }
  }, [disponibilidad, trabajadorSeleccionado]);

  // Hook para actualización automática
  useDisponibilidadUpdate(trabajadorSeleccionado);

  const handleRefresh = () => {
    if (trabajadorSeleccionado) {
      dispatch(fetchDisponibilidadByTrabajador(trabajadorSeleccionado));
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'codigo', 
      headerName: 'Código', 
      width: 100, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => (
        <span>{params.row?.trabajador?.codigo || ''}</span>
      )
    },
    { 
      field: 'trabajador', 
      headerName: 'Trabajador', 
      width: 200, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => (
        <span>{params.row?.trabajador?.nombre_completo || ''}</span>
      )
    },
    { 
      field: 'tipoLicencia', 
      headerName: 'Tipo de Licencia', 
      width: 150, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => (
        <span>{params.row?.tipo_licencia?.nombre || ''}</span>
      )
    },
    { 
      field: 'periodoRenovacion', 
      headerName: 'Período', 
      width: 100, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => (
        <span>{params.row?.tipo_licencia?.periodo_renovacion === 'MENSUAL' ? 'Mensual' : 'Anual'}</span>
      )
    },
    { 
      field: 'dias_disponibles', 
      headerName: 'Días Disponibles', 
      width: 180, 
      type: 'number',
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const horas = params.row.dias_disponibles * 8;
        return (
          <span>
            {params.row.dias_disponibles} días ({horas} horas)
          </span>
        );
      }
    },
    { 
      field: 'dias_usados', 
      headerName: 'Días Usados', 
      width: 180, 
      type: 'number',
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const horas = params.row.dias_usados * 8;
        return (
          <span>
            {params.row.dias_usados} días ({horas} horas)
          </span>
        );
      }
    },
    { 
      field: 'dias_restantes', 
      headerName: 'Días Restantes', 
      width: 180, 
      type: 'number',
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const horas = params.row.dias_restantes * 8;
        return (
          <span>
            {params.row.dias_restantes} días ({horas} horas)
          </span>
        );
      }
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Disponibilidad de Licencias
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Buscar por código"
          variant="outlined"
          size="small"
          value={codigoBusqueda}
          onChange={(e) => setCodigoBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 200 }}
        />

        <Tooltip title={lastUpdate ? `Última actualización: ${new Date(lastUpdate).toLocaleString()}` : ''}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={!trabajadorSeleccionado || loading}
          >
            Actualizar
          </Button>
        </Tooltip>
      </Box>

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={disponibilidadFiltrada}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: 'No hay disponibilidad para mostrar',
          }}
        />
      </Box>
    </Box>
  );
};

export default DisponibilidadPage; 