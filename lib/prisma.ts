import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * Prisma Client Singleton with PostgreSQL Driver Adapter (Prisma 7)
 * Sử dụng globalThis để tránh tạo nhiều instance khi hot-reload trong dev
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

  let ssl: boolean | { rejectUnauthorized: boolean } = false;
  try {
    const url = new URL(connectionString);
    const isLocal = url.hostname === 'localhost' || 
                    url.hostname === '127.0.0.1' || 
                    url.hostname === 'db';
    ssl = isLocal ? false : { rejectUnauthorized: false };
  } catch (e) {
    ssl = connectionString.includes('localhost') || 
          connectionString.includes('127.0.0.1') || 
          connectionString.includes('@db:') ? false : { rejectUnauthorized: false };
  }

  const pool = new Pool({ 
    connectionString,
    ssl
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
