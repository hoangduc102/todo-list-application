'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Todo, CreateTodoInput, UpdateTodoInput, Priority } from '@/lib/types/todo';

interface TodoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTodoInput | UpdateTodoInput) => Promise<boolean>;
  editingTodo?: Todo | null;
}

export function TodoForm({ open, onOpenChange, onSubmit, editingTodo }: TodoFormProps) {
  const [title, setTitle] = useState(editingTodo?.title ?? '');
  const [description, setDescription] = useState(editingTodo?.description ?? '');
  const [priority, setPriority] = useState<Priority>(editingTodo?.priority ?? 'medium');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editingTodo;

  // Reset form khi mở dialog
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(editingTodo?.title ?? '');
      setDescription(editingTodo?.description ?? '');
      setPriority(editingTodo?.priority ?? 'medium');
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  // Client-side validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Tiêu đề không được để trống';
    } else if (trimmedTitle.length > 100) {
      newErrors.title = 'Tiêu đề không được vượt quá 100 ký tự';
    }

    if (description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        priority,
      };

      const success = await onSubmit(data);
      if (success) {
        onOpenChange(false);
        // Reset form
        setTitle('');
        setDescription('');
        setPriority('medium');
        setErrors({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin công việc bên dưới.'
              : 'Điền thông tin để tạo công việc mới.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Tiêu đề <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề công việc..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.title;
                    return next;
                  });
                }
              }}
              className={errors.title ? 'border-destructive' : ''}
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả chi tiết (không bắt buộc)..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.description;
                    return next;
                  });
                }
              }}
              className={`min-h-[100px] resize-none ${errors.description ? 'border-destructive' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Mức ưu tiên</Label>
            <Select value={priority} onValueChange={(val) => { if (val) setPriority(val as Priority); }}>
              <SelectTrigger id="priority">
                <SelectValue>
                  {priority === 'low' ? 'Thấp' : priority === 'medium' ? 'Trung bình' : 'Cao'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Thấp</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Đang xử lý...'
                : isEditing
                  ? 'Cập nhật'
                  : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
