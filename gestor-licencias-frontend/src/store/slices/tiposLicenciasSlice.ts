import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { tiposLicenciasService } from '../../services/tiposLicencias.service';

export interface TipoLicencia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_duracion: 'DIAS' | 'HORAS' | 'CANTIDAD';
  duracion_maxima: number;
  requiere_justificacion: boolean;
  requiere_aprobacion_especial: boolean;
  requiere_documentacion: boolean;
  pago_haberes: boolean;
  acumulable: boolean;
  transferible: boolean;
  aplica_genero: boolean;
  genero_aplicable: 'M' | 'F' | 'A';
  aplica_antiguedad: boolean;
  antiguedad_minima: number | null;
  aplica_edad: boolean;
  edad_minima: number | null;
  edad_maxima: number | null;
  aplica_departamento: boolean;
  departamentos_aplicables: string | null;
  aplica_cargo: boolean;
  cargos_aplicables: string | null;
  aplica_tipo_personal: boolean;
  tipos_personal_aplicables: string | null;
  created_at: string;
  updated_at: string;
}

interface TiposLicenciasState {
  items: TipoLicencia[];
  selectedTipoLicencia: TipoLicencia | null;
  loading: boolean;
  error: string | null;
}

const initialState: TiposLicenciasState = {
  items: [],
  selectedTipoLicencia: null,
  loading: false,
  error: null
};

export const fetchTiposLicencias = createAsyncThunk(
  'tiposLicencias/fetchAll',
  async () => {
    const response = await tiposLicenciasService.getAll();
    return response.data;
  }
);

export const fetchTipoLicenciaById = createAsyncThunk(
  'tiposLicencias/fetchById',
  async (id: number) => {
    const response = await tiposLicenciasService.getById(id);
    return response.data;
  }
);

export const createTipoLicencia = createAsyncThunk(
  'tiposLicencias/create',
  async (tipoLicencia: Omit<TipoLicencia, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await tiposLicenciasService.create(tipoLicencia);
    return response.data;
  }
);

export const updateTipoLicencia = createAsyncThunk(
  'tiposLicencias/update',
  async ({ id, tipoLicencia }: { id: number; tipoLicencia: Partial<TipoLicencia> }) => {
    const response = await tiposLicenciasService.update(id, tipoLicencia);
    return response.data;
  }
);

export const deleteTipoLicencia = createAsyncThunk(
  'tiposLicencias/delete',
  async (id: number) => {
    await tiposLicenciasService.delete(id);
    return id;
  }
);

const tiposLicenciasSlice = createSlice({
  name: 'tiposLicencias',
  initialState,
  reducers: {
    clearSelectedTipoLicencia: (state) => {
      state.selectedTipoLicencia = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchTiposLicencias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTiposLicencias.fulfilled, (state, action: PayloadAction<TipoLicencia[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTiposLicencias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar los tipos de licencia';
      })
      // Fetch by id
      .addCase(fetchTipoLicenciaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTipoLicenciaById.fulfilled, (state, action: PayloadAction<TipoLicencia>) => {
        state.loading = false;
        state.selectedTipoLicencia = action.payload;
      })
      .addCase(fetchTipoLicenciaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar el tipo de licencia';
      })
      // Create
      .addCase(createTipoLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTipoLicencia.fulfilled, (state, action: PayloadAction<TipoLicencia>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTipoLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear el tipo de licencia';
      })
      // Update
      .addCase(updateTipoLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTipoLicencia.fulfilled, (state, action: PayloadAction<TipoLicencia>) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedTipoLicencia?.id === action.payload.id) {
          state.selectedTipoLicencia = action.payload;
        }
      })
      .addCase(updateTipoLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar el tipo de licencia';
      })
      // Delete
      .addCase(deleteTipoLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTipoLicencia.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedTipoLicencia?.id === action.payload) {
          state.selectedTipoLicencia = null;
        }
      })
      .addCase(deleteTipoLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar el tipo de licencia';
      });
  }
});

export const { clearSelectedTipoLicencia, clearError } = tiposLicenciasSlice.actions;
export default tiposLicenciasSlice.reducer; 