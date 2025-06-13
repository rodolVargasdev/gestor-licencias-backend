import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Departamento, CreateDepartamentoDTO, UpdateDepartamentoDTO } from '../../types/departamento';
import { departamentosService } from '../../services/departamentos.service';

interface DepartamentosState {
  items: Departamento[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartamentosState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchDepartamentos = createAsyncThunk(
  'departamentos/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await departamentosService.getAll();
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al cargar departamentos');
    }
  }
);

export const createDepartamento = createAsyncThunk(
  'departamentos/create',
  async (dto: CreateDepartamentoDTO, { rejectWithValue }) => {
    try {
      return await departamentosService.create(dto);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al crear departamento');
    }
  }
);

export const updateDepartamento = createAsyncThunk(
  'departamentos/update',
  async ({ id, dto }: { id: number; dto: UpdateDepartamentoDTO }, { rejectWithValue }) => {
    try {
      return await departamentosService.update(id, dto);
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al actualizar departamento');
    }
  }
);

export const deleteDepartamento = createAsyncThunk(
  'departamentos/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await departamentosService.delete(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Error al eliminar departamento');
    }
  }
);

const departamentosSlice = createSlice({
  name: 'departamentos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartamentos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartamentos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDepartamentos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createDepartamento.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateDepartamento.fulfilled, (state, action) => {
        const idx = state.items.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteDepartamento.fulfilled, (state, action) => {
        state.items = state.items.filter((d) => d.id !== action.payload);
      });
  },
});

export default departamentosSlice.reducer; 