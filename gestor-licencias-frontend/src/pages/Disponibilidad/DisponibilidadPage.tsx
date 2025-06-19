import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Button, 
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import type { AppDispatch, RootState } from '../../store';
import { fetchDisponibilidadByTrabajador } from '../../store/slices/disponibilidadSlice';
import { trabajadoresService } from '../../services/trabajadores.service';
import { useDisponibilidadUpdate } from '../../hooks/useDisponibilidadUpdate';
import type { DisponibilidadTrabajador } from '../../types/disponibilidad';
import { exportDisponibilidadToExcel, exportDisponibilidadToPDF } from '../../utils/exportDisponibilidad';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

const DisponibilidadPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: disponibilidad, loading, lastUpdate } = useSelector((state: RootState) => state.disponibilidad);
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<number | null>(null);
  const [disponibilidadFiltrada, setDisponibilidadFiltrada] = useState<DisponibilidadTrabajador[]>([]);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

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

  // Funciones de exportación
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportExcel = () => {
    const trabajador = disponibilidadFiltrada[0]?.trabajador;
    const title = trabajador 
      ? `Disponibilidad - ${trabajador.nombre_completo} (${trabajador.codigo})`
      : 'Reporte de Disponibilidad';
    exportDisponibilidadToExcel(disponibilidadFiltrada, title);
    handleExportMenuClose();
  };

  const handleExportPDF = () => {
    const trabajador = disponibilidadFiltrada[0]?.trabajador;
    const title = trabajador 
      ? `Disponibilidad - ${trabajador.nombre_completo} (${trabajador.codigo})`
      : 'Reporte de Disponibilidad';
    exportDisponibilidadToPDF(disponibilidadFiltrada, title);
    handleExportMenuClose();
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
      field: 'unidadControl', 
      headerName: 'Unidad de Control', 
      width: 120, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const unidad = params.row?.tipo_licencia?.unidad_control;
        if (!unidad) return <span>-</span>;
        
        switch (unidad) {
          case 'días':
            return <span style={{ color: '#1976d2' }}>Por días</span>;
          case 'horas':
            return <span style={{ color: '#2e7d32' }}>Por horas</span>;
          case 'ninguno':
            return <span style={{ color: '#666' }}>Solo registro</span>;
          default:
            return <span>{unidad}</span>;
        }
      }
    },
    { 
      field: 'periodoControl', 
      headerName: 'Período de Control', 
      width: 130, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const periodo = params.row?.tipo_licencia?.periodo_control;
        if (!periodo) return <span>-</span>;
        
        switch (periodo) {
          case 'mes':
            return <span style={{ color: '#ed6c02' }}>Mensual</span>;
          case 'año':
            return <span style={{ color: '#9c27b0' }}>Anual</span>;
          case 'ninguno':
            return <span style={{ color: '#666' }}>Sin período</span>;
          default:
            return <span>{periodo}</span>;
        }
      }
    },
    { 
      field: 'duracionMaxima', 
      headerName: 'Duración Máxima', 
      width: 120, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const duracion = params.row?.tipo_licencia?.duracion_maxima;
        const unidad = params.row?.tipo_licencia?.unidad_control;
        
        if (!duracion || unidad === 'ninguno') return <span>-</span>;
        
        return <span>{duracion} {unidad}</span>;
      }
    },
    { 
      field: 'dias_disponibles', 
      headerName: 'Disponible', 
      width: 120, 
      type: 'number',
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const unidad = params.row?.tipo_licencia?.unidad_control;
        const periodo = params.row?.tipo_licencia?.periodo_control;
        const duracion = params.row?.tipo_licencia?.duracion_maxima;
        const valor = params.row.dias_disponibles;
        
        if (periodo === 'ninguno' && duracion === 0) {
          return <span style={{ color: '#666' }}>Sin límite</span>;
        } else if (unidad === 'horas') {
          return <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{valor} horas</span>;
        } else if (unidad === 'días') {
          return <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{valor} días</span>;
        } else {
          return <span style={{ color: '#666' }}>N/A</span>;
        }
      }
    },
    { 
      field: 'dias_usados', 
      headerName: 'Usado', 
      width: 100, 
      type: 'number',
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const unidad = params.row?.tipo_licencia?.unidad_control;
        const periodo = params.row?.tipo_licencia?.periodo_control;
        const valor = params.row.dias_usados;
        const cantidadRegistros = params.row.cantidad_registros;
        if (periodo === 'ninguno') {
          return <span style={{ color: '#666' }}>Sin límite, usados: {valor} días{cantidadRegistros !== undefined ? ` en ${cantidadRegistros} registros` : ''}</span>;
        }
        if (unidad === 'horas') {
          return <span style={{ color: '#d32f2f' }}>{valor} horas</span>;
        } else if (unidad === 'días') {
          return <span style={{ color: '#d32f2f' }}>{valor} días</span>;
        } else {
          return <span style={{ color: '#666' }}>N/A</span>;
        }
      }
    },
    { 
      field: 'dias_restantes', 
      headerName: 'Restante', 
      width: 120, 
      type: 'number',
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const unidad = params.row?.tipo_licencia?.unidad_control;
        const periodo = params.row?.tipo_licencia?.periodo_control;
        const duracion = params.row?.tipo_licencia?.duracion_maxima;
        const valor = params.row.dias_restantes;
        
        if (periodo === 'ninguno' && duracion === 0) {
          return <span style={{ color: '#666' }}>Sin límite</span>;
        } else if (unidad === 'horas') {
          const color = valor > 0 ? '#2e7d32' : '#d32f2f';
          return <span style={{ color, fontWeight: 'bold' }}>{valor} horas</span>;
        } else if (unidad === 'días') {
          const color = valor > 0 ? '#2e7d32' : '#d32f2f';
          return <span style={{ color, fontWeight: 'bold' }}>{valor} días</span>;
        } else {
          return <span style={{ color: '#666' }}>N/A</span>;
        }
      }
    },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 100, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const activo = params.row.activo;
        return (
          <span style={{ 
            color: activo ? '#2e7d32' : '#d32f2f',
            fontWeight: 'bold'
          }}>
            {activo ? 'Activo' : 'Inactivo'}
          </span>
        );
      }
    },
  ];

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, width: '100%', maxWidth: 1200 }}>
        <Typography variant="h5" component="h1">
          Disponibilidad
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<TableChartIcon />}
            onClick={handleExportMenuOpen}
          >
            Exportar
          </Button>
        </Box>
      </Box>
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

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
      >
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Exportar a PDF</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DisponibilidadPage; 