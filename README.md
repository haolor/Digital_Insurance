# Digital Insurance

Hệ thống quản lý bảo hiểm số gồm:
- `backend`: API NestJS + TypeORM + PostgreSQL
- `frontend`: React + Vite (UI cho Store, Orders, Contracts, CRM)

Ứng dụng hỗ trợ các luồng chính:
- Quản lý users, products, leads
- Tạo order bảo hiểm
- Thanh toán qua callback `POST /payments/callback`
- Tạo và ký hợp đồng bằng OTP
- Theo dõi orders theo từng user (đặc biệt role `CUSTOMER`)

## 1) Yêu cầu hệ thống

- Node.js `>= 18`
- npm `>= 9`
- PostgreSQL `>= 14`

## 2) Cấu trúc dự án

```text
Digital_Insurance/
  backend/    # NestJS API (port 3000)
  frontend/   # React app (port 5173 khi chạy dev)
```

## 3) Cài đặt nhanh

### Bước 1: Clone và cài dependencies

```bash
git clone <repo-url>
cd Digital_Insurance

cd backend && npm install
cd ../frontend && npm install
```

### Bước 2: Tạo database PostgreSQL

Tạo DB, ví dụ:
- Database name: `insurance_db`
- User/password: theo cấu hình local của bạn

### Bước 3: Tạo file môi trường cho backend

Tạo file `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=insurance_db
```

> Ghi chú: backend đang dùng `synchronize: true` nên schema được tạo/cập nhật tự động khi chạy app.

## 4) Chạy dự án ở môi trường development

Mở 2 terminal:

### Terminal 1 - Backend

```bash
cd backend
npm run start:dev
```

Backend chạy tại: `http://localhost:3000`

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

## 5) Build production

### Build backend

```bash
cd backend
npm run build
npm run start:prod
```

### Build frontend

```bash
cd frontend
npm run build
npm run preview
```

## 6) Scripts hữu ích

### Backend (`backend/package.json`)

- `npm run start:dev`: chạy dev có watch
- `npm run build`: build NestJS
- `npm run start:prod`: chạy bản build
- `npm run test`: unit test
- `npm run test:e2e`: e2e test

### Frontend (`frontend/package.json`)

- `npm run dev`: chạy Vite dev server
- `npm run build`: build frontend
- `npm run preview`: preview bản build
- `npm run lint`: chạy ESLint

## 7) Hướng dẫn sử dụng (workflow)

### 7.1 Chuẩn bị dữ liệu ban đầu

Bạn cần có:
- Ít nhất 1 user (role `CUSTOMER`) để mua bảo hiểm
- Ít nhất 1 product để hiển thị ở Store

API chính:
- `POST /users`
- `POST /products`

### 7.2 Đăng nhập

Frontend đang dùng mock login qua danh sách users.  
Đăng nhập bằng email/password đã có trong DB từ màn hình `Login`.

### 7.3 Mua bảo hiểm từ Store

Tại trang `Store`:
1. Click vào một sản phẩm để mở popup chi tiết.
2. Có 2 hành động:
   - `Add to Orders`: tạo order với trạng thái `PENDING` (flow cũ).
   - `Pay Now`: tạo order, sau đó gọi callback thanh toán để cập nhật `PAID`.

Callback thanh toán:

```http
POST http://localhost:3000/payments/callback
Content-Type: application/json

{
  "orderId": 1,
  "status": "PAID"
}
```

### 7.4 Theo dõi Orders theo role CUSTOMER

- Role `CUSTOMER` có menu `Orders`.
- Trang `Orders` chỉ hiển thị đơn hàng thuộc user đang đăng nhập.

### 7.5 Ký hợp đồng bảo hiểm

Sau khi thanh toán thành công (order `PAID`), hệ thống tạo contract.
Luồng ký:
1. `POST /contracts/:id/send-otp`
2. `POST /contracts/:id/verify` với OTP nhận được
3. (Tuỳ luồng tích hợp) `POST /contracts/callback` để hoàn tất trạng thái ký

### 7.6 CRM / Leads (ADMIN, SALE)

- Role `ADMIN` hoặc `SALE` có menu `CRM`.
- Có thể xem danh sách lead, lịch sử tương tác, và cập nhật trạng thái lead.

## 8) API chính

- Users: `/users`
- Products: `/products`
- Orders: `/orders`
- Payments: `/payments/callback`
- Contracts: `/contracts`
- Leads: `/leads`
- Lead History: `/lead-history/:leadId`

## 9) Một số lưu ý kỹ thuật

- Frontend gọi backend qua `http://localhost:3000` (xem `frontend/src/services/api.js`).
- CORS đã bật ở backend.
- ValidationPipe global đang bật `whitelist`, `forbidNonWhitelisted`, `transform`.

## 10) Troubleshooting nhanh

- Lỗi không kết nối DB:
  - kiểm tra PostgreSQL đã chạy
  - kiểm tra lại `backend/.env`
- Frontend không gọi được API:
  - chắc chắn backend đang chạy cổng `3000`
- Đăng nhập thất bại:
  - kiểm tra user đã tồn tại trong DB
  - kiểm tra đúng email/password