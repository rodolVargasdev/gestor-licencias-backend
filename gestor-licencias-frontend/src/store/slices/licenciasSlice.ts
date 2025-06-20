import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { licenciasService } from '../../services/licencias.service';
import type { Licencia, CreateLicenciaDTO } from '../../types/licencia';

interface LicenciasState {
  items: Licencia[];
  selectedItem: Licencia | null;
  loading: boolean;
  error: string | null;
}

const initialState: LicenciasState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null
};

export const fetchLicencias = createAsyncThunk(
  'licencias/fetchLicencias',
  async () => {
    const response = await licenciasService.getAll();
    return response.data;
  }
);

export const fetchLicenciaById = createAsyncThunk(
  'licencias/fetchLicenciaById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await licenciasService.getById(id);
      return response.data;
    } catch {
      // Si no se encuentra por ID, intentar buscar por solicitud
      try {
        const responseBySolicitud = await licenciasService.findBySolicitud(id);
        if (responseBySolicitud.data) {
          return responseBySolicitud.data;
        }
        return rejectWithValue('Licencia no encontrada');
      } catch {
        return rejectWithValue('Licencia no encontrada');
      }
    }
  }
);

export const createLicencia = createAsyncThunk(
  'licencias/createLicencia',
  async (licencia: CreateLicenciaDTO) => {
    const response = await licenciasService.create(licencia);
    return response.data;
  }
);

export const updateLicencia = createAsyncThunk(
  'licencias/updateLicencia',
  async ({ id, ...licencia }: Partial<Licencia> & { id: number }) => {
    const response = await licenciasService.update(id, licencia);
    return response.data;
  }
);

export const deleteLicencia = createAsyncThunk(
  'licencias/deleteLicencia',
  async (id: number) => {
    await licenciasService.delete(id);
    return id;
  }
);

const licenciasSlice = createSlice({
  name: 'licencias',
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all licencias
      .addCase(fetchLicencias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLicencias.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLicencias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar las licencias';
      })
      // Fetch licencia by id
      .addCase(fetchLicenciaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLicenciaById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchLicenciaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar la licencia';
      })
      // Create licencia
      .addCase(createLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLicencia.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear la licencia';
      })
      // Update licencia
      .addCase(updateLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLicencia.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar la licencia';
      })
      // Delete licencia
      .addCase(deleteLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLicencia.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar la licencia';
      });
  }
});

export const { clearSelectedItem } = licenciasSlice.actions;

export default licenciasSlice.reducer; 