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
}

// Category & Tag types
export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  post_count?: number;
}

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
  status: string;
  created_at: string;
  category: Category;
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
  category_id: number;
  tag_ids?: number[];
  status: 'draft' | 'published';
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  summary?: string;
  category_id?: number;
  tag_ids?: number[];
  status?: 'draft' | 'published';
}

// API Error
export interface ApiError {
  detail: string;
}
