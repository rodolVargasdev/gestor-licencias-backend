import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { solicitudesService } from '../../services/solicitudes.service';
import type { Solicitud } from '../../types/solicitud';

interface SolicitudesState {
  items: Solicitud[];
  selectedItem: Solicitud | null;
  loading: boolean;
  error: string | null;
}

const initialState: SolicitudesState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null
};

export const createSolicitud = createAsyncThunk(
  'solicitudes/create',
  async (solicitud: Partial<Solicitud>) => {
    const response = await solicitudesService.create(solicitud);
    return response.data;
  }
);

export const fetchSolicitudes = createAsyncThunk(
  'solicitudes/fetchAll',
  async () => {
    const response = await solicitudesService.getAll();
    return response.data;
  }
);

export const fetchSolicitudById = createAsyncThunk(
  'solicitudes/fetchById',
  async (id: number) => {
    const response = await solicitudesService.getById(id);
    return response.data;
  }
);

export const updateSolicitud = createAsyncThunk(
  'solicitudes/update',
  async ({ id, ...solicitud }: Partial<Solicitud> & { id: number }) => {
    const response = await solicitudesService.update(id, solicitud);
    return response.data;
  }
);

export const deleteSolicitud = createAsyncThunk(
  'solicitudes/delete',
  async (id: number) => {
    await solicitudesService.delete(id);
    return id;
  }
);

const solicitudesSlice = createSlice({
  name: 'solicitudes',
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createSolicitud.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSolicitud.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createSolicitud.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al crear la solicitud';
      })
      // Fetch all
      .addCase(fetchSolicitudes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSolicitudes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSolicitudes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar las solicitudes';
      })
      // Fetch by id
      .addCase(fetchSolicitudById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSolicitudById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchSolicitudById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar la solicitud';
      })
      // Update
      .addCase(updateSolicitud.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSolicitud.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedItem?.id === action.payload.id) {
          state.selectedItem = action.payload;
        }
      })
      .addCase(updateSolicitud.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al actualizar la solicitud';
      })
      // Delete
      .addCase(deleteSolicitud.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSolicitud.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.selectedItem?.id === action.payload) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteSolicitud.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al eliminar la solicitud';
      });
  }
});

export const { clearSelectedItem } = solicitudesSlice.actions;
export default solicitudesSlice.reducer; 