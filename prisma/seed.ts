import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

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
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  await prisma.todo.deleteMany();

  const todos = await prisma.todo.createMany({
    data: [
      {
        title: 'Thiết kế giao diện ứng dụng',
        description: 'Tạo wireframe và mockup cho trang chủ, trang chi tiết sản phẩm và trang thanh toán.',
        completed: true,
        priority: 'high',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Xây dựng API Backend',
        description: 'Phát triển RESTful API cho hệ thống quản lý người dùng và sản phẩm.',
        completed: false,
        priority: 'high',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Viết Unit Test cho module xác thực',
        description: 'Coverage tối thiểu 80% cho các chức năng đăng nhập, đăng ký, quên mật khẩu.',
        completed: false,
        priority: 'medium',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Cập nhật tài liệu README',
        description: 'Bổ sung hướng dẫn cài đặt, cấu hình và các API endpoint.',
        completed: false,
        priority: 'low',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Tối ưu hiệu suất trang chủ',
        description: 'Giảm thời gian tải trang xuống dưới 2 giây bằng lazy loading và code splitting.',
        completed: true,
        priority: 'medium',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(`Created ${todos.count} todos`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
