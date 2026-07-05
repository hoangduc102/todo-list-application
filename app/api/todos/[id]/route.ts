import { todoStore } from '@/lib/store';
import { updateTodoSchema } from '@/lib/validations';
import type { TodoResponse, ErrorResponse } from '@/lib/types/todo';

/**
 * PUT /api/todos/[id]
 * Cập nhật todo
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kiểm tra todo tồn tại
    const existing = await todoStore.getById(id);
    if (!existing) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Không tìm thấy công việc',
      };
      return Response.json(errorResponse, { status: 404 });
    }

    // Parse body
    const body = await request.json().catch(() => null);
    if (!body) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Body request không hợp lệ hoặc không phải JSON',
      };
      return Response.json(errorResponse, { status: 400 });
    }

    // Validate
    const parseResult = updateTodoSchema.safeParse(body);
    if (!parseResult.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: formatZodErrors(parseResult.error),
      };
      return Response.json(errorResponse, { status: 400 });
    }

    const updated = await todoStore.update(id, parseResult.data);
    if (!updated) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Không tìm thấy công việc',
      };
      return Response.json(errorResponse, { status: 404 });
    }

    const response: TodoResponse = {
      success: true,
      data: updated,
    };

    return Response.json(response);
  } catch (error) {
    return handleServerError(error);
  }
}

/**
 * DELETE /api/todos/[id]
 * Xóa todo
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await todoStore.delete(id);
    if (!deleted) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Không tìm thấy công việc',
      };
      return Response.json(errorResponse, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleServerError(error);
  }
}

/** Helper: Format Zod errors */
function formatZodErrors(error: { issues: Array<{ path: PropertyKey[]; message: string }> }): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_root';
    if (!formatted[key]) {
      formatted[key] = [];
    }
    formatted[key].push(issue.message);
  }
  return formatted;
}

/** Helper: Xử lý server error */
function handleServerError(error: unknown): Response {
  console.error('[API Error]:', error);
  const errorResponse: ErrorResponse = {
    success: false,
    message: 'Đã xảy ra lỗi máy chủ',
  };
  return Response.json(errorResponse, { status: 500 });
}
