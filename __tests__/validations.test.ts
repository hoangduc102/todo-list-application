import { createTodoSchema, updateTodoSchema, queryParamsSchema } from '../lib/validations';

describe('createTodoSchema', () => {
  it('should validate a valid todo', () => {
    const result = createTodoSchema.safeParse({
      title: 'Học TypeScript',
      description: 'Hoàn thành khóa học trên Udemy',
      priority: 'high',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Học TypeScript');
      expect(result.data.priority).toBe('high');
    }
  });

  it('should apply default values', () => {
    const result = createTodoSchema.safeParse({
      title: 'Mua sắm',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
      expect(result.data.priority).toBe('medium');
    }
  });

  it('should trim whitespace from title', () => {
    const result = createTodoSchema.safeParse({
      title: '  Học React  ',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Học React');
    }
  });

  it('should reject empty title', () => {
    const result = createTodoSchema.safeParse({
      title: '',
    });

    expect(result.success).toBe(false);
  });

  it('should reject whitespace-only title', () => {
    const result = createTodoSchema.safeParse({
      title: '   ',
    });

    expect(result.success).toBe(false);
  });

  it('should reject title exceeding 100 characters', () => {
    const result = createTodoSchema.safeParse({
      title: 'A'.repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it('should reject description exceeding 500 characters', () => {
    const result = createTodoSchema.safeParse({
      title: 'Test',
      description: 'A'.repeat(501),
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid priority', () => {
    const result = createTodoSchema.safeParse({
      title: 'Test',
      priority: 'urgent',
    });

    expect(result.success).toBe(false);
  });
});

describe('updateTodoSchema', () => {
  it('should validate partial update with only title', () => {
    const result = updateTodoSchema.safeParse({
      title: 'Updated title',
    });

    expect(result.success).toBe(true);
  });

  it('should validate toggle completed', () => {
    const result = updateTodoSchema.safeParse({
      completed: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(true);
    }
  });

  it('should validate empty object (no changes)', () => {
    const result = updateTodoSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('should reject completed as non-boolean', () => {
    const result = updateTodoSchema.safeParse({
      completed: 'yes',
    });

    expect(result.success).toBe(false);
  });
});

describe('queryParamsSchema', () => {
  it('should apply default values for empty input', () => {
    const result = queryParamsSchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe('');
      expect(result.data.status).toBe('all');
      expect(result.data.sortBy).toBe('createdAt');
      expect(result.data.sortOrder).toBe('desc');
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(6);
    }
  });

  it('should parse string page to number', () => {
    const result = queryParamsSchema.safeParse({
      page: '3',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it('should default invalid page to 1', () => {
    const result = queryParamsSchema.safeParse({
      page: 'abc',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
    }
  });

  it('should cap limit at 50', () => {
    const result = queryParamsSchema.safeParse({
      limit: '100',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
  });

  it('should accept valid status filter', () => {
    const result = queryParamsSchema.safeParse({
      status: 'completed',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('completed');
    }
  });
});
