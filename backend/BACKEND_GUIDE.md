# Digital Insurance Backend - Hướng Dẫn Kỹ Thuật

Dự án này là hệ thống lõi cho Bảo Hiểm Số, được xây dựng trên NestJS và PostgreSQL. Tài liệu này cung cấp cái nhìn tổng quan về cách vận hành, các luồng nghiệp vụ (workflow) và hướng dẫn sử dụng API.

---

## 1. Nguyên Lý Hoạt Động & Kiến Trúc

Hệ thống được thiết kế theo kiến trúc **Modular Monolith** của NestJS:
- **NestJS**: Framework hướng đối tượng, sử dụng Dependency Injection để quản lý code.
- **TypeORM**: Object-Relational Mapper giúp tương tác với PostgreSQL thông qua các Entity (Class).
- **Global Cache**: Sử dụng in-memory cache cho các dữ liệu tạm thời như mã OTP.
- **Task Scheduling**: Sử dụng Cronjob để tự động hóa các tác vụ nền (như gán Lead).

### Sơ đồ luồng dữ liệu chính:
1. **Lead Generation**: Khách hàng để lại thông tin -> Lead được tạo.
2. **CRM Flow**: Cronjob tự động gán Lead cho nhân viên -> Nhân viên chăm sóc (Lead History).
3. **Sale Flow**: Nhân viên tạo Order cho khách hàng dựa trên Sản phẩm (Product).
4. **Payment Flow**: Khách hàng thanh toán -> Callback từ cổng thanh toán cập nhật trạng thái Order thành `PAID`.
5. **Contract Flow**: Sau khi thanh toán, hệ thống tự động tạo Hợp đồng (Contract) -> Gửi OTP -> Xác thực -> Ký số (Mock EFY Callback).

---

## 2. Hướng Dẫn Cài Đặt (Setup)

### Yêu cầu hệ thống:
- Node.js (v18+)
- PostgreSQL (v14+)

### Các bước cài đặt:
1. **Cấu hình môi trường**:
   Tạo file `.env` tại thư mục `backend/` với nội dung:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=insurance_db
   ```
2. **Cài đặt thư viện**:
   ```bash
   npm install
   ```
3. **Khởi chạy ứng dụng**:
   ```bash
   # Chế độ phát triển (Watch mode)
   npm run start:dev
   ```

---

## 3. Các Workflow Nghiệp Vụ Chính

### Workflow 1: Quản lý Lead & Tự động gán (SPRINT 6)
- **Tạo Lead**: `POST /leads`
- **Tự động gán**: Mỗi 1 phút, hệ thống quét các Lead chưa có người phụ trách và gán ngẫu nhiên cho các User có role `ADMIN`.
- **Xem lịch sử**: `GET /lead-history/:leadId` để xem quá trình chăm sóc Lead.

### Workflow 2: Đơn hàng & Thanh toán (SPRINT 3 & 4)
- **Tạo Đơn hàng**: `POST /orders` (Liên kết User + Product).
- **Thanh toán (Callback)**: `POST /payments/callback`
  - Body: `{ "orderId": 1, "status": "PAID" }`
  - Kết quả: Order đổi trạng thái sang `PAID`, đồng thời kích hoạt tạo Hợp đồng.

### Workflow 3: Ký hợp đồng điện tử (SPRINT 5)
1. **Gửi OTP**: `POST /contracts/:id/send-otp` (Mã OTP 6 số sẽ log ra console).
2. **Xác thực OTP**: `POST /contracts/:id/verify` (Sử dụng mã OTP vừa nhận).
3. **Ký số (Mock EFY)**: `POST /contracts/callback` (Giả lập callback từ nhà cung cấp EFY để hoàn tất ký số).

---

## 4. Tài Liệu API (Tóm tắt)

### Người dùng (Users)
- `POST /users`: Tạo người dùng mới.
  ```bash
  curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyen Van A",
    "email": "vana@example.com",
    "password": "password123",
    "role": "ADMIN"
  }'
  ```
- `GET /users`: Liệt kê tất cả người dùng.

### Sản phẩm (Products)
- `POST /products`: Tạo sản phẩm bảo hiểm mới.
  ```bash
  curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "HEALTH_001",
    "name": "Bảo hiểm sức khỏe VBI",
    "price": 500000,
    "type": "HEALTH",
    "description": "Gói bảo hiểm toàn diện"
  }'
  ```
- `GET /products`: Lấy danh sách sản phẩm.

### Lead & CRM
- `POST /leads`: Tiếp nhận lead mới.
  ```bash
  curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Khách hàng Tiềm Năng",
    "phone": "0912345678",
    "email": "khachhang@example.com",
    "source": "Facebook"
  }'
  ```
- `PATCH /leads/:id`: Cập nhật trạng thái hoặc người phụ trách.
- `POST /leads/:id/convert`: Chuyển đổi Lead thành User (khi chốt đơn thành công).
- `GET /lead-history/:leadId`: Xem lịch sử thay đổi của lead.

### Đơn hàng & Hợp đồng
- `POST /orders`: Tạo đơn hàng.
  ```bash
  curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-cua-user",
    "productId": 1
  }'
  ```
- `POST /payments/callback`: Giả lập callback thanh toán.
  ```bash
  curl -X POST http://localhost:3000/payments/callback \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "status": "PAID"
  }'
  ```
- `POST /contracts/:id/send-otp`: Gửi OTP ký hợp đồng.
  ```bash
  curl -X POST http://localhost:3000/contracts/1/send-otp
  ```
- `POST /contracts/:id/verify`: Xác thực mã OTP.
  ```bash
  curl -X POST http://localhost:3000/contracts/1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456"
  }'
  ```
- `POST /contracts/callback`: Giả lập callback EFY (Ký xong).
  ```bash
  curl -X POST http://localhost:3000/contracts/callback \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": 1,
    "status": "SIGNED"
  }'
  ```

---

## 5. Các Tính Năng Nâng Cao Đã Cài Đặt
- **Bcrypt**: Băm mật khẩu người dùng để bảo mật.
- **Validation**: Sử dụng `class-validator` để kiểm tra dữ liệu đầu vào.
- **Global Cache**: Lưu trữ OTP an toàn với thời gian hết hạn (TTL).
- **Cronjob**: Tự động xử lý logic kinh doanh theo thời gian thực.
