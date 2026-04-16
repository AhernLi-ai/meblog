// User types
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user?: User;
}

// Project types
export interface Project {
  id: number;
  name: string;
  slug: string;
  cover?: string;
  description?: string;
  created_at: string;
  post_count?: number;
}

// Alias for backwards compatibility
export type Category = Project;

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  post_count?: number;
}

// Post types
export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  view_count: number;
  like_count: number;
  status: string;
  created_at: string;
  project: Project | null;
  tags: Tag[];
}

export interface PostDetail extends PostListItem {
  content: string;
  updated_at: string;
  author: {
    id: number;
    username: string;
  };
}

export interface PostListResponse {
  items: PostListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  summary?: string;
  project_id?: number;
  tag_ids?: number[];
  status: 'draft' | 'published';
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  summary?: string;
  project_id?: number;
  tag_ids?: number[];
  status?: 'draft' | 'published';
}

// API Error
export interface ApiError {
  detail: string;
}
