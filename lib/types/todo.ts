/**
 * Todo Application Type Definitions
 * Định nghĩa tất cả các interface và type cho ứng dụng Todo
 */

/** Mức độ ưu tiên của công việc */
export type Priority = 'low' | 'medium' | 'high';

/** Trạng thái lọc */
export type FilterStatus = 'all' | 'active' | 'completed';

/** Trường sắp xếp */
export type SortBy = 'createdAt' | 'priority' | 'title';

/** Thứ tự sắp xếp */
export type SortOrder = 'asc' | 'desc';

/** Interface chính của một Todo item */
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Dữ liệu để tạo Todo mới */
export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: Priority;
}

/** Dữ liệu để cập nhật Todo */
export interface UpdateTodoInput {
  title?: string;
  description?: string;
  priority?: Priority;
  completed?: boolean;
}

/** Tham số query cho việc lọc, tìm kiếm, phân trang */
export interface TodoFilterParams {
  search?: string;
  status?: FilterStatus;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

/** Thông tin phân trang */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Response chuẩn cho API trả về danh sách */
export interface TodoListResponse {
  success: boolean;
  data: Todo[];
  pagination: PaginationInfo;
}

/** Response chuẩn cho API trả về một item */
export interface TodoResponse {
  success: boolean;
  data: Todo;
}

/** Response lỗi */
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
