import React from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import type { EstadoValidacion } from '../../../types/validacion';

interface ValidacionesFiltersProps {
  filters: {
    tipoLicenciaId?: number;
    trabajadorId?: number;
    estado?: EstadoValidacion;
    fechaInicio?: Date | null;
    fechaFin?: Date | null;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  tiposLicencia: Array<{ id: number; nombre: string }>;
  trabajadores: Array<{ id: number; nombre: string; apellido: string }>;
}

const ValidacionesFilters: React.FC<ValidacionesFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  tiposLicencia,
  trabajadores
}) => {
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      [field]: event.target.value
    });
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    onFilterChange({
      ...filters,
      [field]: date
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Tipo de Licencia"
            value={filters.tipoLicenciaId || ''}
            onChange={handleChange('tipoLicenciaId')}
          >
            <MenuItem value="">Todos</MenuItem>
            {tiposLicencia.map((tipo) => (
              <MenuItem key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Trabajador"
            value={filters.trabajadorId || ''}
            onChange={handleChange('trabajadorId')}
          >
            <MenuItem value="">Todos</MenuItem>
            {trabajadores.map((trabajador) => (
              <MenuItem key={trabajador.id} value={trabajador.id}>
                {`${trabajador.nombre} ${trabajador.apellido}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            fullWidth
            label="Estado"
            value={filters.estado || ''}
            onChange={handleChange('estado')}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="PENDIENTE">Pendiente</MenuItem>
            <MenuItem value="APROBADA">Aprobada</MenuItem>
            <MenuItem value="RECHAZADA">Rechazada</MenuItem>
            <MenuItem value="CANCELADA">Cancelada</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha Inicio"
              value={filters.fechaInicio}
              onChange={handleDateChange('fechaInicio')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined'
                }
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha Fin"
              value={filters.fechaFin}
              onChange={handleDateChange('fechaFin')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined'
                }
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={onReset}
            >
              Limpiar Filtros
            </Button>
            <Button
              variant="contained"
              onClick={() => onFilterChange(filters)}
            >
              Aplicar Filtros
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ValidacionesFilters; 