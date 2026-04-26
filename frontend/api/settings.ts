import api from './client';

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  wechat_qr_url: string | null;
  wechat_guide_text: string;
  wechat_show_on_article: boolean;
  wechat_show_in_sidebar: boolean;
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

export const siteSettingsApi = {
  getSiteSettings: async (): Promise<SiteSettings> => {
    const response = await api.get<SiteSettings>('/settings/site');
    return response.data;
  },

  updateSiteSettings: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const response = await api.put<SiteSettings>('/settings/site', data);
    return response.data;
  },
};
