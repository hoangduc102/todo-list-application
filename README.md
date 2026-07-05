# Todo List Application

Ứng dụng Quản lý công việc (Todo List) fullstack, sử dụng **PostgreSQL** để lưu trữ dữ liệu bền vững, giao diện responsive, xử lý dữ liệu nghiêm ngặt và tích hợp kiểm thử tự động.

## 🛠️ Công nghệ sử dụng
- **Framework:** Next.js 16, React 19, TypeScript
- **Database:** PostgreSQL 16 + Prisma 7 ORM (Driver Adapter)
- **Styling:** Tailwind CSS v4, Shadcn UI (Base UI)
- **Validation:** Zod v4 (Client-side + Server-side)
- **Testing:** Jest + ts-jest (Unit Test)
- **DevOps:** Docker + Docker Compose

## ✨ Tính năng triển khai
- **CRUD To-do:** Hiển thị, thêm mới, chỉnh sửa, xóa công việc.
- **Trạng thái:** Đánh dấu hoàn thành/chưa hoàn thành trực quan.
- **Bộ lọc & Tìm kiếm:** Tìm kiếm theo từ khóa, lọc theo trạng thái (Tất cả, Đang làm, Hoàn thành).
- **Nâng cao:** Sắp xếp theo thời gian/Độ ưu tiên, phân trang dữ liệu.
- **Responsive:** Tối ưu hiển thị trên Desktop, Tablet và Mobile.
- **Validation:** Xử lý dữ liệu không hợp lệ cả client-side và server-side bằng Zod.
- **Unit Test:** 35 test cases cho validation schemas và data store.
- **Docker:** PostgreSQL + App chạy hoàn toàn qua Docker Compose.
- **Persistent Data:** Dữ liệu lưu trong PostgreSQL, persist qua restart.
- **Triển khai Online:** Ứng dụng được triển khai trên Vercel, database trên Render.

## 🌐 Demo & Triển khai Online

- **Link Website (Vercel):** [Sẽ cập nhật sau]()
- **Link Repository (GitHub):** [https://github.com/hoangduc102/todo-list-application](https://github.com/hoangduc102/todo-list-application)
- **Database (Render):** PostgreSQL (đã cấu hình lưu trữ trực tuyến)

## 📁 Cấu trúc thư mục

```
srt-group/
├── app/                          # Next.js App Router
│   ├── api/todos/                # RESTful API endpoints
│   │   ├── route.ts              # GET (list) & POST (create)
│   │   └── [id]/
│   │       ├── route.ts          # PUT (update) & DELETE
│   │       └── toggle/route.ts   # PATCH (toggle status)
│   ├── layout.tsx                # Root layout + providers
│   ├── page.tsx                  # Trang chính
│   └── globals.css               # Shadcn CSS variables
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── todo-app.tsx              # Component chính (orchestrator)
│   ├── todo-form.tsx             # Dialog thêm/sửa todo
│   ├── todo-item.tsx             # Hiển thị một todo item
│   ├── todo-list.tsx             # Danh sách todos + loading/empty state
│   ├── search-filter-bar.tsx     # Tìm kiếm + bộ lọc + sắp xếp
│   └── pagination-bar.tsx        # Phân trang
├── hooks/
│   └── use-todos.ts              # Custom hook quản lý state + API
├── lib/
│   ├── prisma.ts                 # Prisma Client singleton (Driver Adapter)
│   ├── store.ts                  # Data access layer (Prisma queries)
│   ├── validations.ts            # Zod schemas
│   ├── types/todo.ts             # TypeScript interfaces
│   └── utils.ts                  # Utility functions
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed data script
├── __tests__/
│   ├── validations.test.ts       # Unit test cho Zod schemas
│   └── store.test.ts             # Unit test cho data store (Prisma mock)
├── prisma.config.ts              # Prisma 7 configuration
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # PostgreSQL + App services
└── jest.config.ts                # Jest configuration
```

## 📦 Hướng dẫn cài đặt và Chạy dự án

### Yêu cầu
- **Docker** & **Docker Compose** (khuyến nghị)
- Hoặc: **Node.js** >= 18.x, **pnpm** >= 8.x, **PostgreSQL** 16+

### Cách 1: Docker Compose (khuyến nghị) 🐳

1. Clone repository và chuyển vào thư mục dự án:
```bash
git clone https://github.com/hoangduc102/todo-list-application.git
cd todo-list-application
```

2. Khởi động và chạy toàn bộ stack:
```bash
docker compose up --build
``` 
> Sau khi khởi động thành công, bạn có thể truy cập ứng dụng tại: `http://localhost:3000`

Docker Compose sẽ:
1. Khởi động PostgreSQL 16 (port 5432)
2. Chờ DB healthy
3. Build & chạy Next.js app (port 3000)

### Cách 2: Chạy local (cần PostgreSQL)

1. Clone repository và chuyển vào thư mục dự án:
```bash
git clone https://github.com/hoangduc102/todo-list-application.git
cd todo-list-application
```

2. Cài đặt các dependencies:
```bash
pnpm install
```

3. Tạo file cấu hình môi trường `.env` (chỉnh sửa `DATABASE_URL` trong `.env` nếu cần):
```bash
cp .env.example .env
```

4. Khởi động cơ sở dữ liệu PostgreSQL (qua Docker hoặc local):
```bash
docker compose up db -d
```

5. Tạo database schema bằng Prisma:
```bash
pnpm db:push
```

6. Nạp dữ liệu mẫu (Seed data):
```bash
pnpm db:seed
```

7. Chạy development server:
```bash
pnpm dev
``` 
> Sau khi server khởi chạy thành công, truy cập tại: `http://localhost:3000`

### Chạy Unit Test

Chạy tất cả test (không cần DB):
```bash
pnpm test
```

Chạy test với coverage report:
```bash
pnpm test:coverage
```

### Prisma Studio (xem/sửa data trực tiếp)

Chạy Prisma Studio để quản lý dữ liệu trực quan:
```bash
pnpm db:studio
``` 
> Truy cập giao diện quản lý tại: `http://localhost:5555`

## 🔌 API Documentation

### Endpoints

| Method   | Endpoint                  | Mô tả                        |
|----------|---------------------------|-------------------------------|
| `GET`    | `/api/todos`              | Lấy danh sách (filter/search/sort/pagination) |
| `POST`   | `/api/todos`              | Tạo todo mới                  |
| `PUT`    | `/api/todos/:id`          | Cập nhật todo                 |
| `DELETE` | `/api/todos/:id`          | Xóa todo                     |
| `PATCH`  | `/api/todos/:id/toggle`   | Toggle trạng thái             |

### Query Parameters (GET /api/todos)

| Param      | Type     | Default     | Mô tả                                    |
|------------|----------|-------------|-------------------------------------------|
| `search`   | string   | `""`        | Tìm kiếm theo title/description           |
| `status`   | string   | `"all"`     | Lọc: `all`, `active`, `completed`          |
| `sortBy`   | string   | `"createdAt"` | Sắp xếp: `createdAt`, `priority`, `title` |
| `sortOrder`| string   | `"desc"`    | Thứ tự: `asc`, `desc`                     |
| `page`     | number   | `1`         | Trang hiện tại                             |
| `limit`    | number   | `6`         | Số item mỗi trang (max: 50)               |

### Xử lý dữ liệu không hợp lệ

Tất cả input đều được validate bằng **Zod** ở cả 2 tầng:

- **Server-side:** API routes validate request body và query params. Trả về `400` với chi tiết lỗi từng field.
- **Client-side:** Form validate trước khi gửi request, hiển thị lỗi inline.

Các trường hợp được xử lý:
- Tiêu đề trống hoặc chỉ chứa khoảng trắng
- Tiêu đề vượt quá 100 ký tự
- Mô tả vượt quá 500 ký tự
- Mức ưu tiên không hợp lệ
- ID không tồn tại (404)
- Body request không phải JSON (400)
