import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { validacionesService } from '../../services/validaciones.service';
import type { Validacion, CreateValidacionDTO, UpdateValidacionDTO } from '../../types/validacion';

interface ValidacionesState {
  items: Validacion[];
  loading: boolean;
  error: string | null;
}

const initialState: ValidacionesState = {
  items: [],
  loading: false,
  error: null
};

export const fetchValidaciones = createAsyncThunk(
  'validaciones/fetchAll',
  async () => {
    const response = await validacionesService.getAll();
    return response.data;
  }
);

export const createValidacion = createAsyncThunk(
  'validaciones/create',
  async (data: CreateValidacionDTO) => {
    const response = await validacionesService.create(data);
    return response.data;
  }
);

export const updateValidacion = createAsyncThunk(
  'validaciones/update',
  async ({ id, data }: { id: number; data: UpdateValidacionDTO }) => {
    const response = await validacionesService.update(id, data);
    return response.data;
  }
);

export const deleteValidacion = createAsyncThunk(
  'validaciones/delete',
  async (id: number) => {
    await validacionesService.delete(id);
    return id;
  }
);

const validacionesSlice = createSlice({
  name: 'validaciones',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchValidaciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchValidaciones.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchValidaciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar las validaciones';
      })
      // Create
      .addCase(createValidacion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createValidacion.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createValidacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear la validación';
      })
      // Update
      .addCase(updateValidacion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateValidacion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateValidacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar la validación';
      })
      // Delete
      .addCase(deleteValidacion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteValidacion.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteValidacion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar la validación';
      });
  }
});

export default validacionesSlice.reducer; 