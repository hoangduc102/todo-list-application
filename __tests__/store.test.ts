/**
 * Unit Tests cho TodoStore (with Prisma mock)
 * Test CRUD operations, filter, search, sort, pagination
 */

// Mock Prisma client
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockCount = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    todo: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}));

import { todoStore } from '@/lib/store';

// Helper: tạo mock Todo record từ DB (có Date objects)
function createMockDbRecord(overrides: Partial<{
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}> = {}) {
  const now = new Date();
  return {
    id: 'test-id-1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('TodoStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('trả về danh sách todos với pagination mặc định', async () => {
      const mockRecords = [createMockDbRecord()];
      mockCount.mockResolvedValue(1);
      mockFindMany.mockResolvedValue(mockRecords);

      const result = await todoStore.getAll();

      expect(mockCount).toHaveBeenCalled();
      expect(mockFindMany).toHaveBeenCalled();
      expect(result.todos).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(6);
      expect(result.pagination.total).toBe(1);
    });

    it('filter theo status active', async () => {
      mockCount.mockResolvedValue(0);
      mockFindMany.mockResolvedValue([]);

      await todoStore.getAll({ status: 'active' });

      const countCall = mockCount.mock.calls[0][0];
      expect(countCall.where.completed).toBe(false);
    });

    it('filter theo status completed', async () => {
      mockCount.mockResolvedValue(0);
      mockFindMany.mockResolvedValue([]);

      await todoStore.getAll({ status: 'completed' });

      const countCall = mockCount.mock.calls[0][0];
      expect(countCall.where.completed).toBe(true);
    });

    it('tìm kiếm theo search term', async () => {
      mockCount.mockResolvedValue(0);
      mockFindMany.mockResolvedValue([]);

      await todoStore.getAll({ search: 'test' });

      const countCall = mockCount.mock.calls[0][0];
      expect(countCall.where.OR).toBeDefined();
      expect(countCall.where.OR).toHaveLength(2);
    });

    it('phân trang đúng với skip và take', async () => {
      mockCount.mockResolvedValue(12);
      mockFindMany.mockResolvedValue([]);

      await todoStore.getAll({ page: 2, limit: 5 });

      const findCall = mockFindMany.mock.calls[0][0];
      expect(findCall.skip).toBe(5);
      expect(findCall.take).toBe(5);
    });

    it('sort theo priority trong JS', async () => {
      const records = [
        createMockDbRecord({ id: '1', priority: 'low' }),
        createMockDbRecord({ id: '2', priority: 'high' }),
        createMockDbRecord({ id: '3', priority: 'medium' }),
      ];
      mockCount.mockResolvedValue(3);
      mockFindMany.mockResolvedValue(records);

      const result = await todoStore.getAll({ sortBy: 'priority', sortOrder: 'desc' });

      expect(result.todos[0].priority).toBe('high');
      expect(result.todos[1].priority).toBe('medium');
      expect(result.todos[2].priority).toBe('low');
    });

    it('convert Date thành ISO string', async () => {
      const now = new Date('2024-01-01T00:00:00Z');
      mockCount.mockResolvedValue(1);
      mockFindMany.mockResolvedValue([createMockDbRecord({ createdAt: now, updatedAt: now })]);

      const result = await todoStore.getAll();

      expect(result.todos[0].createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(result.todos[0].updatedAt).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('getById', () => {
    it('trả về todo khi tìm thấy', async () => {
      mockFindUnique.mockResolvedValue(createMockDbRecord());

      const result = await todoStore.getById('test-id-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('test-id-1');
      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'test-id-1' } });
    });

    it('trả về undefined khi không tìm thấy', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await todoStore.getById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('tạo todo với dữ liệu đầy đủ', async () => {
      const input = { title: 'New Todo', description: 'Desc', priority: 'high' as const };
      mockCreate.mockResolvedValue(createMockDbRecord({ ...input, id: 'new-id' }));

      const result = await todoStore.create(input);

      expect(result.title).toBe('New Todo');
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          title: 'New Todo',
          description: 'Desc',
          priority: 'high',
          completed: false,
        },
      });
    });

    it('tạo todo với default values', async () => {
      mockCreate.mockResolvedValue(createMockDbRecord({ title: 'Simple' }));

      await todoStore.create({ title: 'Simple' });

      const createCall = mockCreate.mock.calls[0][0];
      expect(createCall.data.description).toBe('');
      expect(createCall.data.priority).toBe('medium');
      expect(createCall.data.completed).toBe(false);
    });
  });

  describe('update', () => {
    it('cập nhật todo thành công', async () => {
      mockUpdate.mockResolvedValue(createMockDbRecord({ title: 'Updated' }));

      const result = await todoStore.update('test-id-1', { title: 'Updated' });

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Updated');
    });

    it('trả về null khi todo không tồn tại', async () => {
      mockUpdate.mockRejectedValue(new Error('Record not found'));

      const result = await todoStore.update('nonexistent', { title: 'X' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('xóa thành công trả về true', async () => {
      mockDelete.mockResolvedValue(createMockDbRecord());

      const result = await todoStore.delete('test-id-1');

      expect(result).toBe(true);
    });

    it('xóa không thành công trả về false', async () => {
      mockDelete.mockRejectedValue(new Error('Not found'));

      const result = await todoStore.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('toggleStatus', () => {
    it('toggle từ false sang true', async () => {
      mockFindUnique.mockResolvedValue(createMockDbRecord({ completed: false }));
      mockUpdate.mockResolvedValue(createMockDbRecord({ completed: true }));

      const result = await todoStore.toggleStatus('test-id-1');

      expect(result).not.toBeNull();
      expect(result!.completed).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'test-id-1' },
        data: { completed: true },
      });
    });

    it('toggle từ true sang false', async () => {
      mockFindUnique.mockResolvedValue(createMockDbRecord({ completed: true }));
      mockUpdate.mockResolvedValue(createMockDbRecord({ completed: false }));

      const result = await todoStore.toggleStatus('test-id-1');

      expect(result).not.toBeNull();
      expect(result!.completed).toBe(false);
    });

    it('trả về null khi todo không tồn tại', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await todoStore.toggleStatus('nonexistent');

      expect(result).toBeNull();
    });
  });
});
