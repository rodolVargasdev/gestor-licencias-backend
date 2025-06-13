import axios from './axios';
import type { Departamento, CreateDepartamentoDTO, UpdateDepartamentoDTO } from '../types/departamento';

const API_URL = '/departamentos';

export const departamentosService = {
  getAll: async (): Promise<Departamento[]> => {
    const { data } = await axios.get(API_URL);
    return Array.isArray(data) ? data : data.data || [];
  },
  getById: async (id: number): Promise<Departamento> => {
    const { data } = await axios.get(`${API_URL}/${id}`);
    return data.data || data;
  },
  create: async (dto: CreateDepartamentoDTO): Promise<Departamento> => {
    const { data } = await axios.post(API_URL, dto);
    return data.data || data;
  },
  update: async (id: number, dto: UpdateDepartamentoDTO): Promise<Departamento> => {
    const { data } = await axios.put(`${API_URL}/${id}`, dto);
    return data.data || data;
  },
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
}; 