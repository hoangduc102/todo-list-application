'use client';

import { TodoItem } from '@/components/todo-item';
import { Skeleton } from '@/components/ui/skeleton';
import type { Todo } from '@/lib/types/todo';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, isLoading, onToggle, onEdit, onDelete }: TodoListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-xl border">
            <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4"></div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Không tìm thấy công việc nào
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Thử thay đổi bộ lọc hoặc thêm một công việc mới để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
