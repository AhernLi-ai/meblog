import api from './client';
import type { Category } from '../types';

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  create: async (data: { name: string }): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  update: async (id: number, data: { name: string }): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
