import api from './client';

export interface Comment {
  id: number;
  post_id: number;
  parent_id: number | null;
  nickname: string;
  email?: string;
  website?: string;
  content: string;
  created_at: string;
  replies?: Comment[];
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
}

export interface CreateCommentData {
  post_id: number;
  parent_id?: number | null;
  nickname: string;
  email: string;
  website?: string;
  content: string;
}

export const commentsApi = {
  /**
   * Get comments for a post by slug.
   * Email field is only visible to admin users.
   */
  getBySlug: async (postSlug: string): Promise<CommentListResponse> => {
    const response = await api.get<CommentListResponse>(`/comments/${postSlug}`);
    return response.data;
  },

  /**
   * Submit a new comment.
   */
  create: async (data: CreateCommentData): Promise<Comment> => {
    const response = await api.post<Comment>('/comments', data);
    return response.data;
  },

  /**
   * Delete a comment (admin only).
   */
  delete: async (commentId: number): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};
