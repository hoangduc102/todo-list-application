import { todoStore } from '@/lib/store';
import type { TodoResponse, ErrorResponse } from '@/lib/types/todo';

/**
 * PATCH /api/todos/[id]/toggle
 * Toggle trạng thái hoàn thành/chưa hoàn thành
 */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const toggled = await todoStore.toggleStatus(id);
    if (!toggled) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Không tìm thấy công việc',
      };
      return Response.json(errorResponse, { status: 404 });
    }

    const response: TodoResponse = {
      success: true,
      data: toggled,
    };

    return Response.json(response);
  } catch (error) {
    console.error('[API Error]:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Đã xảy ra lỗi máy chủ',
    };
    return Response.json(errorResponse, { status: 500 });
  }
}
