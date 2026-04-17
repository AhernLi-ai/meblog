import api from './client';
import type {
  PostListResponse,
  PostDetail,
  CreatePostData,
  UpdatePostData,
} from '../types';

export interface GetPostsParams {
  page?: number;
  size?: number;
  category?: string;
  tag?: string;
  q?: string;
}

export interface LikeStatus {
  liked: boolean;
  like_count: number;
}

export const postsApi = {
  getAll: async (params?: GetPostsParams): Promise<PostListResponse> => {
    const response = await api.get<PostListResponse>('/posts', { params });
    return response.data;
  },

  getById: async (idOrSlug: string): Promise<PostDetail> => {
    const response = await api.get<PostDetail>(`/posts/${idOrSlug}`);
    return response.data;
  },

  create: async (data: CreatePostData): Promise<PostDetail> => {
    const response = await api.post<PostDetail>('/posts', data);
    return response.data;
  },

  update: async (id: number, data: UpdatePostData): Promise<PostDetail> => {
    const response = await api.put<PostDetail>(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  getLikeStatus: async (slug: string): Promise<LikeStatus> => {
    const response = await api.get<LikeStatus>(`/posts/${slug}/like`);
    return response.data;
  },

  toggleLike: async (slug: string): Promise<LikeStatus> => {
    const response = await api.post<LikeStatus>(`/posts/${slug}/like`);
    return response.data;
  },
};
