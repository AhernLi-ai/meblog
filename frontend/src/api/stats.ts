import { apiClient } from './client';

export interface UniqueVisitors {
  post_id: number;
  unique_visitors: number;
  days: number;
}

export interface TrendData {
  date: string;
  visitors: number;
  views: number;
}

export interface Trends {
  days: number;
  total_visitors: number;
  total_views: number;
  daily: TrendData[];
}

export interface PopularPost {
  id: number;
  title: string;
  slug: string;
  visitors: number;
  views: number;
}

export interface PopularPosts {
  days: number;
  posts: PopularPost[];
}

export interface Summary {
  total_posts: number;
  total_views: number;
  month_visitors: number;
  month_views: number;
}

export const statsApi = {
  // Log access when viewing a post
  logAccess: async (postId: number): Promise<void> => {
    await apiClient.post(`/stats/log/${postId}`);
  },

  // Get unique visitors for a post
  getUniqueVisitors: async (postId: number, days = 7): Promise<UniqueVisitors> => {
    const response = await apiClient.get(`/stats/post/${postId}/unique-visitors`, {
      params: { days },
    });
    return response.data;
  },

  // Get access trends
  getTrends: async (days = 30): Promise<Trends> => {
    const response = await apiClient.get('/stats/trends', {
      params: { days },
    });
    return response.data;
  },

  // Get popular posts
  getPopularPosts: async (days = 30, limit = 10): Promise<PopularPosts> => {
    const response = await apiClient.get('/stats/popular-posts', {
      params: { days, limit },
    });
    return response.data;
  },

  // Get summary (requires auth)
  getSummary: async (): Promise<Summary> => {
    const response = await apiClient.get('/stats/summary');
    return response.data;
  },
};
