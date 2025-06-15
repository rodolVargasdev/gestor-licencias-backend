import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { trabajadoresService } from '../../services/trabajadores.service';
import type { Trabajador, CreateTrabajadorDTO, UpdateTrabajadorDTO } from '../../types/trabajador';

interface TrabajadoresState {
  items: Trabajador[];
  selectedTrabajador: Trabajador | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrabajadoresState = {
  items: [],
  selectedTrabajador: null,
  loading: false,
  error: null
};

export const fetchTrabajadores = createAsyncThunk<Trabajador[]>(
  'trabajadores/fetchAll',
  async () => {
    return await trabajadoresService.getAll();
  }
);

export const fetchTrabajadorById = createAsyncThunk(
  'trabajadores/fetchById',
  async (id: number) => {
    return await trabajadoresService.getById(id);
  }
);

export const createTrabajador = createAsyncThunk<Trabajador, CreateTrabajadorDTO>(
  'trabajadores/create',
  async (data) => {
    return await trabajadoresService.create(data);
  }
);

export const updateTrabajador = createAsyncThunk<Trabajador, { id: number; data: UpdateTrabajadorDTO }>(
  'trabajadores/update',
  async ({ id, data }) => {
    return await trabajadoresService.update(id, data);
  }
);

export const deleteTrabajador = createAsyncThunk<number, number>(
  'trabajadores/delete',
  async (id) => {
    await trabajadoresService.delete(id);
    return id;
  }
);

const trabajadoresSlice = createSlice({
  name: 'trabajadores',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchTrabajadores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrabajadores.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTrabajadores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar los trabajadores';
      })
      // Fetch by ID
      .addCase(fetchTrabajadorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrabajadorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTrabajador = action.payload;
      })
      .addCase(fetchTrabajadorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar el trabajador';
      })
      // Create
      .addCase(createTrabajador.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrabajador.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTrabajador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear el trabajador';
      })
      // Update
      .addCase(updateTrabajador.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrabajador.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTrabajador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar el trabajador';
      })
      // Delete
      .addCase(deleteTrabajador.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrabajador.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedTrabajador?.id === action.payload) {
          state.selectedTrabajador = null;
        }
      })
      .addCase(deleteTrabajador.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar el trabajador';
      });
  }
});

export const { clearError } = trabajadoresSlice.actions;
export default trabajadoresSlice.reducer; 