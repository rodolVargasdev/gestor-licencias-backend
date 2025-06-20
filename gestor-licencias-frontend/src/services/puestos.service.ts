import api from './api';
import type { Puesto, CreatePuestoDTO, UpdatePuestoDTO } from '../types/puesto';

interface ApiResponse<T> {
  status: string;
  data: T;
}

const API_URL = '/puestos';

export const puestosService = {
  getAll: async (): Promise<Puesto[]> => {
    const response = await api.get<ApiResponse<Puesto[]>>(API_URL);
    return response.data.data;
  },
  getById: async (id: number): Promise<Puesto> => {
    const response = await api.get<ApiResponse<Puesto>>(`${API_URL}/${id}`);
    return response.data.data;
  },
  create: async (dto: CreatePuestoDTO): Promise<Puesto> => {
    const response = await api.post<ApiResponse<Puesto>>(API_URL, dto);
    return response.data.data;
  },
  update: async (id: number, dto: UpdatePuestoDTO): Promise<Puesto> => {
    const response = await api.put<ApiResponse<Puesto>>(`${API_URL}/${id}`, dto);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
  },
}; 