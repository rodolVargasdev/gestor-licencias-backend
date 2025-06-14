import axios from './axios';
import type { Puesto, CreatePuestoDTO, UpdatePuestoDTO } from '../types/puesto';

interface ApiResponse<T> {
  status: string;
  data: T;
}

const API_URL = '/puestos';

export const puestosService = {
  getAll: async (): Promise<Puesto[]> => {
    const response = await axios.get<ApiResponse<Puesto[]>>(API_URL);
    return response.data.data;
  },
  getById: async (id: number): Promise<Puesto> => {
    const response = await axios.get<ApiResponse<Puesto>>(`${API_URL}/${id}`);
    return response.data.data;
  },
  create: async (dto: CreatePuestoDTO): Promise<Puesto> => {
    const response = await axios.post<ApiResponse<Puesto>>(API_URL, dto);
    return response.data.data;
  },
  update: async (id: number, dto: UpdatePuestoDTO): Promise<Puesto> => {
    const response = await axios.put<ApiResponse<Puesto>>(`${API_URL}/${id}`, dto);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
}; 