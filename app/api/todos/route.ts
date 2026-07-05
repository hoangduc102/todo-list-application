import { type NextRequest } from 'next/server';
import { todoStore } from '@/lib/store';
import { createTodoSchema, queryParamsSchema } from '@/lib/validations';
import type { TodoListResponse, TodoResponse, ErrorResponse } from '@/lib/types/todo';

/**
 * GET /api/todos
 * Lấy danh sách todos với hỗ trợ filter, search, sort, pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse và validate query params
    const rawParams = {
      search: searchParams.get('search') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    };

    const parseResult = queryParamsSchema.safeParse(rawParams);

    if (!parseResult.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Tham số truy vấn không hợp lệ',
        errors: formatZodErrors(parseResult.error),
      };
      return Response.json(errorResponse, { status: 400 });
    }

    const { search, status, sortBy, sortOrder, page, limit } = parseResult.data;

    const result = await todoStore.getAll({
      search,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    const response: TodoListResponse = {
      success: true,
      data: result.todos,
      pagination: result.pagination,
    };

    return Response.json(response);
  } catch (error) {
    return handleServerError(error);
  }
}

/**
 * POST /api/todos
 * Tạo todo mới
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Body request không hợp lệ hoặc không phải JSON',
      };
      return Response.json(errorResponse, { status: 400 });
    }

    const parseResult = createTodoSchema.safeParse(body);

    if (!parseResult.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: formatZodErrors(parseResult.error),
      };
      return Response.json(errorResponse, { status: 400 });
    }

    const todo = await todoStore.create(parseResult.data);

    const response: TodoResponse = {
      success: true,
      data: todo,
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    return handleServerError(error);
  }
}

/** Helper: Format Zod errors thành object key-value */
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
