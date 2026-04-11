import api from './client';

export interface UserSettings {
  id: number;
  user_id: number;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export const settingsApi = {
  get: async (): Promise<UserSettings> => {
    const response = await api.get<UserSettings>('/settings');
    return response.data;
  },

  update: async (data: { theme?: string; language?: string }): Promise<UserSettings> => {
    const response = await api.patch<UserSettings>('/settings', data);
    return response.data;
  },
};
