'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Todo, Priority } from '@/lib/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

/** Map priority sang config hiển thị */
const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: {
    label: 'Cao',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  },
  medium: {
    label: 'Trung Bình',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  },
  low: {
    label: 'Thấp',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  },
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const priority = priorityConfig[todo.priority];

  return (
    <div
      className={`group flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
        todo.completed
          ? 'bg-muted/50 border-muted'
          : 'bg-card border-border hover:border-primary/30'
      }`}
    >
      {/* Checkbox */}
      <div className="pt-0.5">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="h-5 w-5 rounded-full transition-all duration-200"
          aria-label={`Đánh dấu "${todo.title}" ${todo.completed ? 'chưa hoàn thành' : 'hoàn thành'}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={`font-medium text-sm leading-tight transition-all duration-200 ${
              todo.completed
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
            }`}
          >
            {todo.title}
          </h3>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-medium border ${priority.className}`}>
            {priority.label}
          </Badge>
        </div>

        {todo.description && (
          <p
            className={`mt-1 text-xs leading-relaxed line-clamp-2 transition-all duration-200 ${
              todo.completed
                ? 'text-muted-foreground/60 line-through'
                : 'text-muted-foreground'
            }`}
          >
            {todo.description}
          </p>
        )}

        <p className="mt-1.5 text-[11px] text-muted-foreground/60">
          {formatRelativeTime(todo.createdAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Tooltip>
          <TooltipTrigger
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors cursor-pointer"
            onClick={() => onEdit(todo)}
            aria-label="Chỉnh sửa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </TooltipTrigger>
          <TooltipContent>Chỉnh sửa</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors cursor-pointer"
            onClick={() => onDelete(todo.id)}
            aria-label="Xóa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </TooltipTrigger>
          <TooltipContent>Xóa</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
