'use client';

import React, { useState, useCallback, useRef } from 'react';
import type {
  Todo,
  TodoListResponse,
  TodoResponse,
  ErrorResponse,
  CreateTodoInput,
  UpdateTodoInput,
  FilterStatus,
  SortBy,
  SortOrder,
  PaginationInfo,
} from '@/lib/types/todo';

/** State trả về từ hook */
interface UseTodosReturn {
  // Data
  todos: Todo[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;

  // Filter state
  search: string;
  status: FilterStatus;
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;

  // Actions
  setSearch: (search: string) => void;
  setStatus: (status: FilterStatus) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setPage: (page: number) => void;
  addTodo: (input: CreateTodoInput) => Promise<boolean>;
  updateTodo: (id: string, input: UpdateTodoInput) => Promise<boolean>;
  deleteTodo: (id: string) => Promise<boolean>;
  toggleTodo: (id: string) => Promise<boolean>;
  refreshTodos: () => Promise<void>;
}

const API_BASE = '/api/todos';

export function useTodos(): UseTodosReturn {
  // Data state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearchState] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortByFilter, setSortByFilter] = useState<SortBy>('createdAt');
  const [sortOrderFilter, setSortOrderFilter] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1); // Reset về trang 1 khi tìm kiếm
    }, 300);
  }, []);

  // Wrapper setters: reset page khi filter thay đổi
  const setStatus = useCallback((value: FilterStatus) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const setSortBy = useCallback((value: SortBy) => {
    setSortByFilter(value);
    setPage(1);
  }, []);

  const setSortOrder = useCallback((value: SortOrder) => {
    setSortOrderFilter(value);
    setPage(1);
  }, []);

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('sortBy', sortByFilter);
      params.set('sortOrder', sortOrderFilter);
      params.set('page', String(page));
      params.set('limit', '6');

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const data: TodoListResponse | ErrorResponse = await res.json();

      if (!res.ok || !data.success) {
        setError((data as ErrorResponse).message || 'Lỗi khi tải danh sách');
        return;
      }

      const listData = data as TodoListResponse;
      setTodos(listData.data);
      setPagination(listData.pagination);
    } catch {
      setError('Không thể kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, sortByFilter, sortOrderFilter, page]);

  // Auto-fetch khi filter thay đổi
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetching external data and syncing to state is a valid effect pattern
  React.useEffect(() => { fetchTodos(); }, [fetchTodos]);

  // Add todo
  const addTodo = useCallback(
    async (input: CreateTodoInput): Promise<boolean> => {
      try {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        const data: TodoResponse | ErrorResponse = await res.json();

        if (!res.ok || !data.success) {
          setError((data as ErrorResponse).message || 'Lỗi khi thêm công việc');
          return false;
        }

        await fetchTodos();
        return true;
      } catch {
        setError('Không thể kết nối đến server');
        return false;
      }
    },
    [fetchTodos]
  );

  // Update todo (optimistic update — no re-fetch)
  const updateTodo = useCallback(
    async (id: string, input: UpdateTodoInput): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        const data: TodoResponse | ErrorResponse = await res.json();

        if (!res.ok || !data.success) {
          setError(
            (data as ErrorResponse).message || 'Lỗi khi cập nhật công việc'
          );
          return false;
        }

        // Cập nhật trực tiếp todo trong state thay vì gọi lại fetchTodos()
        const updatedTodo = (data as TodoResponse).data;
        setTodos((prev) =>
          prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
        );
        return true;
      } catch {
        setError('Không thể kết nối đến server');
        return false;
      }
    },
    []
  );

  // Delete todo
  const deleteTodo = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          if (res.status !== 204) {
            const data: ErrorResponse = await res.json();
            setError(data.message || 'Lỗi khi xóa công việc');
          }
          if (res.status === 204) {
            await fetchTodos();
            return true;
          }
          return false;
        }

        await fetchTodos();
        return true;
      } catch {
        setError('Không thể kết nối đến server');
        return false;
      }
    },
    [fetchTodos]
  );

  // Toggle todo status (optimistic update — no re-fetch)
  const toggleTodo = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/${id}/toggle`, {
          method: 'PATCH',
        });

        const data: TodoResponse | ErrorResponse = await res.json();

        if (!res.ok || !data.success) {
          setError(
            (data as ErrorResponse).message ||
              'Lỗi khi thay đổi trạng thái'
          );
          return false;
        }

        // Cập nhật trực tiếp todo trong state thay vì gọi lại fetchTodos()
        const updatedTodo = (data as TodoResponse).data;
        setTodos((prev) =>
          prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
        );
        return true;
      } catch {
        setError('Không thể kết nối đến server');
        return false;
      }
    },
    []
  );

  return {
    todos,
    pagination,
    isLoading,
    error,
    search,
    status: statusFilter,
    sortBy: sortByFilter,
    sortOrder: sortOrderFilter,
    page,
    setSearch,
    setStatus,
    setSortBy,
    setSortOrder,
    setPage,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refreshTodos: fetchTodos,
  };
}
