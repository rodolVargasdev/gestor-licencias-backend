import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { disponibilidadService } from '../../services/disponibilidad.service';
import type { DisponibilidadTrabajador } from '../../types/disponibilidad';

interface DisponibilidadState {
  items: DisponibilidadTrabajador[];
  loading: boolean;
  error: string | null;
  lastUpdate: string | null;
}

const initialState: DisponibilidadState = {
  items: [],
  loading: false,
  error: null,
  lastUpdate: null
};

export const fetchDisponibilidadByTrabajador = createAsyncThunk(
  'disponibilidad/fetchByTrabajador',
  async (trabajadorId: number) => {
    const response = await disponibilidadService.getByTrabajador(trabajadorId);
    return response.data;
  }
);

export const fetchDisponibilidadByDepartamento = createAsyncThunk(
  'disponibilidad/fetchByDepartamento',
  async (departamentoId: number) => {
    const response = await disponibilidadService.getByDepartamento(departamentoId);
    return response.data;
  }
);

export const fetchDisponibilidadByAnio = createAsyncThunk(
  'disponibilidad/fetchByAnio',
  async (anio: number) => {
    const response = await disponibilidadService.getByAnio(anio);
    return response.data;
  }
);

const disponibilidadSlice = createSlice({
  name: 'disponibilidad',
  initialState,
  reducers: {
    updateDisponibilidad: (state, action) => {
      const { trabajadorId, tipoLicenciaId, diasUsados } = action.payload;
      const index = state.items.findIndex(
        item => item.trabajador.id === trabajadorId && item.tipoLicencia.id === tipoLicenciaId
      );
      
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          diasUsados,
          diasRestantes: state.items[index].diasDisponibles - diasUsados
        };
        state.lastUpdate = new Date().toISOString();
      }
    },
    clearDisponibilidad: (state) => {
      state.items = [];
      state.lastUpdate = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch by trabajador
      .addCase(fetchDisponibilidadByTrabajador.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisponibilidadByTrabajador.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchDisponibilidadByTrabajador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar la disponibilidad';
      })
      // Fetch by departamento
      .addCase(fetchDisponibilidadByDepartamento.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisponibilidadByDepartamento.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDisponibilidadByDepartamento.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar la disponibilidad';
      })
      // Fetch by año
      .addCase(fetchDisponibilidadByAnio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisponibilidadByAnio.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDisponibilidadByAnio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar la disponibilidad';
      });
  }
});

export const { updateDisponibilidad, clearDisponibilidad } = disponibilidadSlice.actions;
export default disponibilidadSlice.reducer; 