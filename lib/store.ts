import { prisma } from '@/lib/prisma';
import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  TodoFilterParams,
  PaginationInfo,
} from '@/lib/types/todo';
/** Type for Prisma where input */
type TodoWhereInput = {
  completed?: boolean;
  OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; description?: { contains: string; mode: 'insensitive' } }>;
};

/** Type for Prisma orderBy input */
type TodoOrderByInput = Record<string, 'asc' | 'desc'>;

/** Type for a Todo DB record returned by Prisma */
interface TodoRecord {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Map priority sang giá trị số để sắp xếp */
const PRIORITY_ORDER: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

class TodoStore {
  /** Lấy danh sách todos với filter, search, sort, pagination */
  async getAll(params: TodoFilterParams = {}): Promise<{
    todos: Todo[];
    pagination: PaginationInfo;
  }> {
    const {
      search = '',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 6,
    } = params;

    // Build where clause
    const where: TodoWhereInput = {};

    // Filter theo trạng thái
    if (status === 'active') {
      where.completed = false;
    } else if (status === 'completed') {
      where.completed = true;
    }

    // Tìm kiếm theo title và description (case-insensitive)
    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Đếm tổng
    const total = await prisma.todo.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    let todos: TodoRecord[] = [];

    if (sortBy === 'priority') {
      // Vì Prisma không hỗ trợ custom sort cho string enum natively,
      // ta truy vấn tất cả bản ghi khớp điều kiện, sắp xếp trong JS, sau đó phân trang.
      const allTodos = await prisma.todo.findMany({
        where,
      });

      const sortedTodos = [...allTodos].sort((a: TodoRecord, b: TodoRecord) => {
        const diff = (PRIORITY_ORDER[a.priority] ?? 0) - (PRIORITY_ORDER[b.priority] ?? 0);
        if (diff === 0) {
          // Nếu cùng mức độ ưu tiên, sắp xếp theo thời gian tạo mặc định (giảm dần)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return sortOrder === 'desc' ? -diff : diff;
      });

      todos = sortedTodos.slice(skip, skip + limit);
    } else {
      const orderBy: TodoOrderByInput = sortBy === 'title'
        ? { title: sortOrder }
        : { createdAt: sortOrder };

      todos = await prisma.todo.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      });
    }

    return {
      todos: todos.map(this.toTodo),
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    };
  }

  /** Lấy một todo theo ID */
  async getById(id: string): Promise<Todo | undefined> {
    const todo = await prisma.todo.findUnique({ where: { id } });
    return todo ? this.toTodo(todo) : undefined;
  }

  /** Tạo todo mới */
  async create(input: CreateTodoInput): Promise<Todo> {
    const todo = await prisma.todo.create({
      data: {
        title: input.title,
        description: input.description ?? '',
        priority: input.priority ?? 'medium',
        completed: false,
      },
    });
    return this.toTodo(todo);
  }

  /** Cập nhật todo */
  async update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
    try {
      const todo = await prisma.todo.update({
        where: { id },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.priority !== undefined && { priority: input.priority }),
          ...(input.completed !== undefined && { completed: input.completed }),
        },
      });
      return this.toTodo(todo);
    } catch {
      // Record not found
      return null;
    }
  }

  /** Xóa todo */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.todo.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  /** Toggle trạng thái hoàn thành */
  async toggleStatus(id: string): Promise<Todo | null> {
    try {
      const existing = await prisma.todo.findUnique({ where: { id } });
      if (!existing) return null;

      const todo = await prisma.todo.update({
        where: { id },
        data: { completed: !existing.completed },
      });
      return this.toTodo(todo);
    } catch {
      return null;
    }
  }

  /** Convert Prisma model sang Todo interface */
  private toTodo(record: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: string;
    createdAt: Date;
    updatedAt: Date;
  }): Todo {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      completed: record.completed,
      priority: record.priority as Todo['priority'],
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}

export const todoStore = new TodoStore();
