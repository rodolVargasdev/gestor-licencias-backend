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
  ListItemText,
  Autocomplete,
  Alert
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

  // Función para normalizar texto (remover tildes y convertir a minúsculas)
  const normalizarTexto = (texto: string): string => {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover tildes
      .toLowerCase();
  };
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [nombreBusqueda, setNombreBusqueda] = useState('');
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<number | null>(null);
  const [disponibilidadFiltrada, setDisponibilidadFiltrada] = useState<DisponibilidadTrabajador[]>([]);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Función para buscar trabajador por código (se ejecuta con Enter)
  const buscarPorCodigo = async () => {
    if (codigoBusqueda.trim()) {
      try {
        const response = await trabajadoresService.findByCodigo(codigoBusqueda.trim());
        if (response && response.length > 0) {
          const trabajador = response[0];
          setTrabajadorSeleccionado(trabajador.id);
          dispatch(fetchDisponibilidadByTrabajador(trabajador.id));
          setError(null); // Limpiar error si se encuentra
        } else {
          setTrabajadorSeleccionado(null);
          setDisponibilidadFiltrada([]);
          setError(`No se encontró ningún trabajador con el código "${codigoBusqueda.trim()}"`);
        }
      } catch (error) {
        console.error('Error al buscar trabajador:', error);
        setTrabajadorSeleccionado(null);
        setDisponibilidadFiltrada([]);
        setError('Error al buscar trabajador. Inténtalo de nuevo.');
      }
    } else {
      setTrabajadorSeleccionado(null);
      setDisponibilidadFiltrada([]);
      setError('Por favor, ingresa un código de trabajador.');
    }
  };

  // Efecto para actualizar disponibilidad filtrada
  useEffect(() => {
    let filtrada = disponibilidad;
    
    // Si hay trabajador seleccionado, mostrar sus datos
    if (trabajadorSeleccionado) {
      filtrada = disponibilidad;
      
      // Filtrar por nombre si hay búsqueda por nombre
      if (nombreBusqueda.trim()) {
        const nombreNormalizado = normalizarTexto(nombreBusqueda);
        filtrada = filtrada.filter(item => {
          const nombreTrabajador = item.trabajador?.nombre_completo || '';
          return normalizarTexto(nombreTrabajador).includes(nombreNormalizado);
        });
      }
    } else {
      // Si no hay trabajador seleccionado, no mostrar nada
      filtrada = [];
    }
    
    setDisponibilidadFiltrada(filtrada);
  }, [disponibilidad, trabajadorSeleccionado, nombreBusqueda]);

    // Hook para actualización automática
  useDisponibilidadUpdate(trabajadorSeleccionado);

  // Función para buscar trabajador por nombre (se ejecuta con Enter)
  const buscarPorNombre = async () => {
    if (nombreBusqueda.trim() && nombreBusqueda.length >= 3) {
      try {
        // Buscar todos los trabajadores que contengan el nombre/apellido
        const response = await trabajadoresService.getAll();
        const trabajadoresEncontrados = response.filter(trabajador => 
          normalizarTexto(trabajador.nombre_completo).includes(normalizarTexto(nombreBusqueda))
        );
        
        if (trabajadoresEncontrados.length > 0) {
          // Si hay múltiples trabajadores, mostrar el primero y cargar su disponibilidad
          const primerTrabajador = trabajadoresEncontrados[0];
          setCodigoBusqueda(primerTrabajador.codigo);
          setTrabajadorSeleccionado(primerTrabajador.id);
          dispatch(fetchDisponibilidadByTrabajador(primerTrabajador.id));
          setError(null); // Limpiar error si se encuentra
          
          // Si hay más de un trabajador, mostrar mensaje informativo
          if (trabajadoresEncontrados.length > 1) {
            const nombresTrabajadores = trabajadoresEncontrados.map(t => t.nombre_completo).join(', ');
            setError(`Se encontraron ${trabajadoresEncontrados.length} trabajadores: ${nombresTrabajadores}. Mostrando el primero.`);
          }
        } else {
          setTrabajadorSeleccionado(null);
          setDisponibilidadFiltrada([]);
          setError(`No se encontró ningún trabajador con el nombre "${nombreBusqueda.trim()}"`);
        }
      } catch (error) {
        console.error('Error al buscar trabajador por nombre:', error);
        setTrabajadorSeleccionado(null);
        setDisponibilidadFiltrada([]);
        setError('Error al buscar trabajador por nombre. Inténtalo de nuevo.');
      }
    } else if (nombreBusqueda.trim() && nombreBusqueda.length < 3) {
      setError('Por favor, ingresa al menos 3 letras para buscar por nombre.');
    } else {
      setError('Por favor, ingresa un nombre de trabajador.');
    }
  };

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
      width: 240, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => (
        <span>{params.row?.trabajador?.nombre_completo || ''}</span>
      )
    },
    { 
      field: 'tipoLicencia', 
      headerName: 'Tipo de Licencia', 
      width: 250, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => (
        <span>{params.row?.tipo_licencia?.nombre || ''}</span>
      )
    },
    { 
      field: 'unidadControl', 
      headerName: 'Unidad', 
      width: 100, 
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
      headerName: 'Período', 
      width: 100, 
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
      headerName: 'Duración', 
      width: 100, 
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const duracion = params.row?.tipo_licencia?.duracion_maxima;
        const unidad = params.row?.tipo_licencia?.unidad_control;
        
        if (!duracion || unidad === 'ninguno') return <span>-</span>;
        
        return <span>{duracion} {unidad}</span>;
      }
    },
    // { 
    //   field: 'dias_disponibles', 
    //   headerName: 'Disponible', 
    //   width: 120, 
    //   type: 'number',
    //   renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
    //     const unidad = params.row?.tipo_licencia?.unidad_control;
    //     const periodo = params.row?.tipo_licencia?.periodo_control;
    //     const duracion = params.row?.tipo_licencia?.duracion_maxima;
    //     const valor = params.row.dias_disponibles;
        
    //     if (periodo === 'ninguno' && duracion === 0) {
    //       return <span style={{ color: '#666' }}>Sin límite</span>;
    //     } else if (unidad === 'horas') {
    //       return <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{valor} horas</span>;
    //     } else if (unidad === 'días') {
    //       return <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{valor} días</span>;
    //     } else {
    //       return <span style={{ color: '#666' }}>N/A</span>;
    //     }
    //   }
    // },
    { 
      field: 'dias_usados', 
      headerName: 'Registro de uso de licencias', 
      width: 140, 
      type: 'number',
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const unidad = params.row?.tipo_licencia?.unidad_control;
        const periodo = params.row?.tipo_licencia?.periodo_control;
        const valor = params.row.dias_usados;
        const cantidadRegistros = params.row.cantidad_registros;
        if (periodo === 'ninguno') {
          return <span style={{ color: '#666' }}>{valor} días{cantidadRegistros !== undefined ? ` en ${cantidadRegistros} registros` : ''}</span>;
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
      headerName: 'Disponible', 
      width: 120, 
      type: 'number',
      renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
        const unidad = params.row?.tipo_licencia?.unidad_control;
        const periodo = params.row?.tipo_licencia?.periodo_control;
        const duracion = params.row?.tipo_licencia?.duracion_maxima;
        const valor = params.row.dias_restantes;
        
        if (periodo === 'ninguno' || duracion === 0) {
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
    // { 
    //   field: 'estado', 
    //   headerName: 'Estado', 
    //   width: 100, 
    //   renderCell: (params: GridRenderCellParams<DisponibilidadTrabajador>) => {
    //     const activo = params.row.activo;
    //     return (
    //       <span style={{ 
    //         color: activo ? '#2e7d32' : '#d32f2f',
    //         fontWeight: 'bold'
    //       }}>
    //         {activo ? 'Activo' : 'Inactivo'}
    //       </span>
    //     );
    //   }
    // },
  ];



  return (
    <Box sx={{ width: '110%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, width: '100%', maxWidth: 1200, alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          Disponibilidad
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Buscar por código"
            variant="outlined"
            size="small"
            value={codigoBusqueda}
            onChange={(e) => setCodigoBusqueda(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                buscarPorCodigo();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 200 }}
          />
          <Autocomplete
            freeSolo
            options={Array.from(new Set(disponibilidad.map(item => item.trabajador?.nombre_completo || '').filter(Boolean)))}
            value={nombreBusqueda}
            onChange={(event, newValue) => {
              setNombreBusqueda(newValue || '');
            }}
            onInputChange={(event, newInputValue) => {
              setNombreBusqueda(newInputValue);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                buscarPorNombre();
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar por nombre"
                variant="outlined"
                size="small"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    buscarPorNombre();
                  }
                }}
                sx={{ width: 200 }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SearchIcon fontSize="small" />
                  {option}
                </Box>
              </li>
            )}
            filterOptions={(options, { inputValue }) => {
              // Solo mostrar sugerencias si el usuario ha escrito al menos 3 letras
              if (inputValue.length < 3) {
                return [];
              }
              
              const inputNormalizado = normalizarTexto(inputValue);
              const filtered = options.filter(option => {
                const optionNormalizado = normalizarTexto(option);
                return optionNormalizado.includes(inputNormalizado);
              });
              return filtered.slice(0, 10); // Limitar a 10 sugerencias
            }}
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

      {/* Mostrar error si existe */}
      {error && (
        <Box sx={{ mb: 2, width: '100%', maxWidth: 1200 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
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