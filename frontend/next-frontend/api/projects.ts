import api from './client';
import type { Project } from '../types';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${slug}`);
    return response.data;
  },

  create: async (data: { name: string }): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  update: async (id: number, data: { name: string }): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
