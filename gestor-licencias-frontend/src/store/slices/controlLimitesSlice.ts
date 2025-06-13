import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { controlLimitesService } from '../../services/controlLimites.service';
import type { ControlLimite, CreateControlLimiteDTO, UpdateControlLimiteDTO } from '../../types/controlLimite';

interface ControlLimitesState {
  items: ControlLimite[];
  loading: boolean;
  error: string | null;
}

const initialState: ControlLimitesState = {
  items: [],
  loading: false,
  error: null
};

export const fetchControlLimites = createAsyncThunk(
  'controlLimites/fetchAll',
  async () => {
    const response = await controlLimitesService.getAll();
    return response.data;
  }
);

export const createControlLimite = createAsyncThunk(
  'controlLimites/create',
  async (data: CreateControlLimiteDTO) => {
    const response = await controlLimitesService.create(data);
    return response.data;
  }
);

export const updateControlLimite = createAsyncThunk(
  'controlLimites/update',
  async ({ id, data }: { id: number; data: UpdateControlLimiteDTO }) => {
    const response = await controlLimitesService.update(id, data);
    return response.data;
  }
);

export const deleteControlLimite = createAsyncThunk(
  'controlLimites/delete',
  async (id: number) => {
    await controlLimitesService.delete(id);
    return id;
  }
);

const controlLimitesSlice = createSlice({
  name: 'controlLimites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchControlLimites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchControlLimites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchControlLimites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar los controles de límites';
      })
      // Create
      .addCase(createControlLimite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createControlLimite.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createControlLimite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear el control de límites';
      })
      // Update
      .addCase(updateControlLimite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateControlLimite.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateControlLimite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar el control de límites';
      })
      // Delete
      .addCase(deleteControlLimite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteControlLimite.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteControlLimite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar el control de límites';
      });
  }
});

export default controlLimitesSlice.reducer; 