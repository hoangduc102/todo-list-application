import { z } from 'zod/v4';

/**
 * Zod Validation Schemas
 */

/** Schema validate tạo Todo mới */
export const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(100, 'Tiêu đề không được vượt quá 100 ký tự')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: 'Tiêu đề không được chỉ chứa khoảng trắng',
    }),
  description: z
    .string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .transform((val) => val.trim())
    .optional()
    .default(''),
  priority: z
    .enum(['low', 'medium', 'high'], {
      message: 'Mức ưu tiên phải là: low, medium hoặc high',
    })
    .optional()
    .default('medium'),
});

/** Schema validate cập nhật Todo */
export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(100, 'Tiêu đề không được vượt quá 100 ký tự')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: 'Tiêu đề không được chỉ chứa khoảng trắng',
    })
    .optional(),
  description: z
    .string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .transform((val) => val.trim())
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'], {
      message: 'Mức ưu tiên phải là: low, medium hoặc high',
    })
    .optional(),
  completed: z.boolean().optional(),
});

/** Schema validate query params cho danh sách */
export const queryParamsSchema = z.object({
  search: z.string().optional().default(''),
  status: z
    .enum(['all', 'active', 'completed'])
    .optional()
    .default('all'),
  sortBy: z
    .enum(['createdAt', 'priority', 'title'])
    .optional()
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  limit: z
    .string()
    .optional()
    .default('6')
    .transform((val) => {
      const num = parseInt(val, 10);
      return isNaN(num) || num < 1 ? 6 : Math.min(num, 50);
    }),
});

/** Type inferred từ schemas */
export type CreateTodoData = z.infer<typeof createTodoSchema>;
export type UpdateTodoData = z.infer<typeof updateTodoSchema>;
export type QueryParamsData = z.infer<typeof queryParamsSchema>;
