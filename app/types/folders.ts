export interface Folder {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  parent?: number | null;
  quizzes_count: number;
  children_count: number;
  created_at: string;
  updated_at: string;
}

export interface FolderListItem {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  parent?: number | null;
  quizzes_count: number;
  created_at: string;
}

export interface CreateFolderRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parent?: number | null;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parent?: number | null;
}
