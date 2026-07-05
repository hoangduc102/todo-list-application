'use client';

import { useState } from 'react';
import { useTodos } from '@/hooks/use-todos';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { TodoList } from '@/components/todo-list';
import { TodoForm } from '@/components/todo-form';
import { PaginationBar } from '@/components/pagination-bar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '@/lib/types/todo';

export function TodoApp() {
  const {
    todos,
    pagination,
    isLoading,
    error,
    search,
    status,
    sortBy,
    sortOrder,
    setSearch,
    setStatus,
    setSortBy,
    setSortOrder,
    setPage,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  } = useTodos();

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Delete confirm dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handler: Thêm mới
  const handleAdd = () => {
    setEditingTodo(null);
    setFormOpen(true);
  };

  // Handler: Chỉnh sửa
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormOpen(true);
  };

  // Handler: Submit form (thêm/sửa)
  const handleFormSubmit = async (data: CreateTodoInput | UpdateTodoInput): Promise<boolean> => {
    if (editingTodo) {
      const success = await updateTodo(editingTodo.id, data as UpdateTodoInput);
      if (success) {
        toast.success('Đã cập nhật công việc thành công!');
      } else {
        toast.error('Không thể cập nhật công việc');
      }
      return success;
    } else {
      const success = await addTodo(data as CreateTodoInput);
      if (success) {
        toast.success('Đã thêm công việc mới!');
      } else {
        toast.error('Không thể thêm công việc');
      }
      return success;
    }
  };

  // Handler: Toggle status
  const handleToggle = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    const success = await toggleTodo(id);
    if (success && todo) {
      toast.success(
        todo.completed
          ? `"${todo.title}" đã chuyển về đang làm`
          : `"${todo.title}" đã hoàn thành!`
      );
    }
  };

  // Handler: Confirm delete
  const handleDeleteClick = (id: string) => {
    setDeletingTodoId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTodoId) return;
    setIsDeleting(true);
    const success = await deleteTodo(deletingTodoId);
    if (success) {
      toast.success('Đã xóa công việc!');
    } else {
      toast.error('Không thể xóa công việc');
    }
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setDeletingTodoId(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý công việc
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tổ chức và theo dõi công việc hiệu quả
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Thêm mới
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-4">
        <SearchFilterBar
          search={search}
          status={status}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
        />
      </div>

      {/* Todo List */}
      <TodoList
        todos={todos}
        isLoading={isLoading}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Pagination */}
      <PaginationBar pagination={pagination} onPageChange={setPage} />

      {/* Add/Edit Form Dialog */}
      <TodoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        editingTodo={editingTodo}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
