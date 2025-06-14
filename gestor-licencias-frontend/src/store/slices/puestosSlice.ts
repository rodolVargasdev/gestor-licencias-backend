import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Puesto, CreatePuestoDTO, UpdatePuestoDTO } from '../../types/puesto';
import { puestosService } from '../../services/puestos.service';

interface PuestosState {
  items: Puesto[];
  loading: boolean;
  error: string | null;
}

const initialState: PuestosState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchPuestos = createAsyncThunk<Puesto[]>(
  'puestos/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await puestosService.getAll();
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al cargar puestos');
    }
  }
);

export const createPuesto = createAsyncThunk<Puesto, CreatePuestoDTO>(
  'puestos/create',
  async (dto, { rejectWithValue }) => {
    try {
      return await puestosService.create(dto);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al crear puesto');
    }
  }
);

export const updatePuesto = createAsyncThunk<Puesto, { id: number; dto: UpdatePuestoDTO }>(
  'puestos/update',
  async ({ id, dto }, { rejectWithValue }) => {
    try {
      return await puestosService.update(id, dto);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al actualizar puesto');
    }
  }
);

export const deletePuesto = createAsyncThunk<number, number>(
  'puestos/delete',
  async (id, { rejectWithValue }) => {
    try {
      await puestosService.delete(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al eliminar puesto');
    }
  }
);

const puestosSlice = createSlice({
  name: 'puestos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPuestos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPuestos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchPuestos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPuesto.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(updatePuesto.fulfilled, (state, action) => {
        const idx = state.items.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        state.error = null;
      })
      .addCase(deletePuesto.fulfilled, (state, action) => {
        state.items = state.items.filter((d) => d.id !== action.payload);
        state.error = null;
      });
  },
});

export const { clearError } = puestosSlice.actions;
export default puestosSlice.reducer; 