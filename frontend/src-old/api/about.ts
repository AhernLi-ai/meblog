import api from './client';

export interface AboutData {
  username: string;
  avatar_url: string | null;
  bio: string | null;
  tech_stack: string[];
  github_url: string | null;
  zhihu_url: string | null;
  twitter_url: string | null;
  wechat_id: string | null;
  wechat_qr_url: string | null;
  wechat_guide_text: string;
}

export const aboutApi = {
  getAbout: async (): Promise<AboutData> => {
    const response = await api.get<AboutData>('/about');
    return response.data;
  },

  updateAbout: async (data: Partial<AboutData>): Promise<AboutData> => {
    const response = await api.put<AboutData>('/about', data);
    return response.data;
  },
};
