import axios from './axios';
import type { Puesto, CreatePuestoDTO, UpdatePuestoDTO } from '../types/puesto';

const API_URL = '/puestos';

export const puestosService = {
  getAll: async (): Promise<Puesto[]> => (await axios.get(API_URL)).data,
  getById: async (id: number): Promise<Puesto> => (await axios.get(`${API_URL}/${id}`)).data,
  create: async (dto: CreatePuestoDTO): Promise<Puesto> => (await axios.post(API_URL, dto)).data,
  update: async (id: number, dto: UpdatePuestoDTO): Promise<Puesto> => (await axios.put(`${API_URL}/${id}`, dto)).data,
  delete: async (id: number): Promise<void> => { await axios.delete(`${API_URL}/${id}`); },
}; 