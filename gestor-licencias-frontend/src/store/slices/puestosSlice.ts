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

export const fetchPuestos = createAsyncThunk(
  'puestos/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await puestosService.getAll();
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al cargar puestos');
    }
  }
);

export const createPuesto = createAsyncThunk(
  'puestos/create',
  async (dto: CreatePuestoDTO, { rejectWithValue }) => {
    try {
      return await puestosService.create(dto);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al crear puesto');
    }
  }
);

export const updatePuesto = createAsyncThunk(
  'puestos/update',
  async ({ id, dto }: { id: number; dto: UpdatePuestoDTO }, { rejectWithValue }) => {
    try {
      return await puestosService.update(id, dto);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al actualizar puesto');
    }
  }
);

export const deletePuesto = createAsyncThunk(
  'puestos/delete',
  async (id: number, { rejectWithValue }) => {
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPuestos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPuestos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPuestos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPuesto.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePuesto.fulfilled, (state, action) => {
        const idx = state.items.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deletePuesto.fulfilled, (state, action) => {
        state.items = state.items.filter((d) => d.id !== action.payload);
      });
  },
});

export default puestosSlice.reducer; 