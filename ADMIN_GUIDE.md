# MOCO Smart Luggage - Admin Authorization System

## Tổng quan

Hệ thống phân quyền người dùng đã được triển khai với hai vai trò chính:
- **Admin**: Quản lý sản phẩm, đơn hàng, và người dùng
- **Customer**: Người dùng bình thường (mặc định)

---

## Các tính năng

### 1. **Phân biệt Vai trò**
- Mỗi người dùng có một trường `role` trong MongoDB: `"admin"` hoặc `"customer"`
- Khi đăng ký, người dùng mặc định có vai trò `"customer"`
- Chỉ admin mới có thể truy cập các trang quản lý

### 2. **Admin Dashboard** (`/admin`)
Trang chính của admin hiển thị:
- Tổng số người dùng
- Tổng số đơn hàng
- Tổng số sản phẩm
- Tổng doanh thu

### 3. **Quản lý Sản phẩm** (`/admin/products`)
- Xem danh sách tất cả sản phẩm
- Thêm sản phẩm mới
- Chỉnh sửa thông tin sản phẩm
- Xóa sản phẩm

### 4. **Quản lý Đơn hàng** (`/admin/orders`)
- Xem danh sách tất cả đơn hàng
- Xem chi tiết từng đơn hàng
- Cập nhật trạng thái đơn hàng

### 5. **Quản lý Người dùng** (`/admin/users`)
- Xem danh sách tất cả người dùng
- Xem vai trò của mỗi người dùng
- Xem thông tin liên hệ của người dùng

---

## Cách sử dụng

### A. Tạo Admin User - Cách 1: Sử dụng API

#### 1. Thiết lập Environment Variable
Thêm vào file `.env.local`:
```
ADMIN_SECRET_KEY=your-secret-key-here
```

#### 2. Gọi API để Phân quyền
```bash
curl -X POST http://localhost:3000/api/admin/set-admin \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your-secret-key-here" \
  -d '{
    "email": "admin@example.com",
    "makeAdmin": true
  }'
```

#### 3. Phản hồi
```json
{
  "success": true,
  "message": "User role updated to admin"
}
```

### B. Kiểm tra vai trò người dùng

```bash
curl http://localhost:3000/api/admin/check-admin?email=user@example.com
```

Phản hồi:
```json
{
  "success": true,
  "isAdmin": true,
  "user": {
    "email": "user@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### C. Đăng nhập vào Admin Dashboard

1. **Đăng ký tài khoản** (hoặc đăng nhập nếu đã có)
2. **Chuyển vai trò thành Admin** (sử dụng API trên)
3. **Truy cập `/admin`** - Dashboard sẽ tự động hiển thị nếu bạn là admin
4. **Admin Panel link** sẽ xuất hiện trong menu Account

---

## Cấu trúc Thư mục

```
app/
├── admin/
│   ├── AdminLayout.tsx          # Layout chung cho admin
│   ├── page.tsx                 # Dashboard
│   ├── products/
│   │   └── page.tsx             # Quản lý sản phẩm
│   ├── orders/
│   │   └── page.tsx             # Quản lý đơn hàng
│   └── users/
│       └── page.tsx             # Quản lý người dùng
├── api/
│   └── admin/
│       ├── users/route.ts       # API lấy danh sách người dùng
│       ├── orders/route.ts      # API lấy danh sách đơn hàng
│       ├── products/route.ts    # API lấy/tạo sản phẩm
│       └── set-admin/route.ts   # API phân quyền admin
├── auth-storage.ts              # Auth utilities + UserRole type
└── components/
    └── Header.tsx               # Cập nhật admin link

lib/
├── auth-middleware.ts           # Auth utilities
└── mongodb.ts                   # MongoDB connection
```

---

## API Endpoints

### Quản lý Người dùng
- `GET /api/admin/users` - Lấy danh sách tất cả người dùng
- `POST /api/admin/set-admin` - Phân quyền admin (cần `x-admin-secret` header)

### Quản lý Đơn hàng
- `GET /api/admin/orders` - Lấy danh sách tất cả đơn hàng

### Quản lý Sản phẩm
- `GET /api/admin/products` - Lấy danh sách tất cả sản phẩm
- `POST /api/admin/products` - Tạo sản phẩm mới

---

## Bảo mật

### Hiện tại:
- Admin check được thực hiện phía client bằng cách kiểm tra `localStorage`
- Cần thêm middleware phía server để bảo vệ API admin

### Cần thêm (trong tương lai):
1. **Server-side Role Verification**: Kiểm tra vai trò ở phía backend trước khi cho phép thao tác
2. **JWT Tokens**: Sử dụng JWT để xác thực người dùng
3. **API Middleware**: Middleware để bảo vệ admin routes
4. **Audit Logging**: Ghi lại tất cả hành động của admin

---

## Cập nhật User Model

User document trong MongoDB giờ có cấu trúc:
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  name: "User Name",
  password: "hashed_password",
  phone: "+84123456789",
  city: "Hanoi",
  address: "123 Main St",
  role: "customer", // hoặc "admin"
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## Testing

### 1. Tạo tài khoản admin
```bash
# Đăng ký người dùng thông thường
POST /api/auth/signup
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123"
}

# Phân quyền admin
POST /api/admin/set-admin
-H "x-admin-secret: your-secret-key"
{
  "email": "admin@example.com",
  "makeAdmin": true
}
```

### 2. Đăng nhập và truy cập admin
```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

# Sau đó truy cập: http://localhost:3000/admin
```

### 3. Kiểm tra API
```bash
GET /api/admin/users
GET /api/admin/orders
GET /api/admin/products
```

---

## Lưu ý Quan trọng

1. **ADMIN_SECRET_KEY**: Đảm bảo giữ bí mật khóa này. Nên lưu trong biến môi trường server.
2. **First Admin Setup**: Sau khi deployment, bạn cần:
   - Tạo tài khoản người dùng
   - Sử dụng API để phân quyền admin (có `ADMIN_SECRET_KEY`)
3. **Non-admin Redirect**: Nếu người dùng không phải admin cố gắng truy cập `/admin`, họ sẽ được redirect về trang chủ

---

## Tương lai (Roadmap)

- [ ] Edit/Delete sản phẩm
- [ ] Cập nhật trạng thái đơn hàng
- [ ] Phân quyền vai trò cho người dùng từ admin panel
- [ ] Audit logs
- [ ] Pagination cho danh sách
- [ ] Search/Filter cho danh sách
- [ ] Export dữ liệu (CSV, Excel)
- [ ] Analytics & Reports
- [ ] Role-based permissions (chi tiết hơn)
