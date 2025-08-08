# Hệ thống Quản lý Thư viện

Một hệ thống quản lý thư viện hoàn chỉnh được xây dựng với Vue.js, Node.js và Bootstrap.

## Tính năng chính

### Cho Độc giả:
- ✅ Xem danh sách sách có sẵn
- ✅ Mượn sách (chờ duyệt)
- ✅ Xem lịch sử mượn sách chi tiết
- ✅ Theo dõi trạng thái yêu cầu mượn sách
- ✅ Xem thông tin phạt quá hạn và thanh toán
- ✅ Xem sách đang mượn (liên hệ nhân viên để trả sách)

### **Chức năng cho Nhân viên:**
- ✅ **Quản lý sách:** Thêm, sửa, xóa sách
- ✅ **Quản lý mượn trả:** Xem trạng thái mượn trả sách và xử lý trả sách
- ✅ **Duyệt yêu cầu:** Duyệt/từ chối yêu cầu mượn sách
- ✅ **Quản lý độc giả:** Thêm, sửa, xóa thông tin độc giả
- ✅ **Xử lý phạt quá hạn:** Tính toán và xử lý phạt sách quá hạn

### **Chức năng cho Admin (Quản lý):**
- ✅ **Tất cả chức năng nhân viên** + Quản lý nhân viên
- ✅ **Quản lý nhân viên:** Thêm, sửa, xóa thông tin nhân viên

## Cấu trúc Database

Hệ thống sử dụng 5 bảng chính:
- **NHAXUATBAN**: Quản lý nhà xuất bản
- **SACH**: Quản lý thông tin sách
- **DOCGIA**: Quản lý thông tin độc giả
- **NhanVien**: Quản lý nhân viên thư viện
- **THEODOIMUONSACH**: Theo dõi việc mượn trả sách

## Yêu cầu hệ thống:
- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn
- MongoDB (phiên bản 4.4 trở lên)

## Cài đặt và Chạy

### Bước 1: Cài đặt MongoDB
Xem file `MONGODB_SETUP.md` để biết hướng dẫn chi tiết cài đặt MongoDB.

### Bước 2: Cài đặt dependencies
```bash
# Cài đặt dependencies cho server
npm install

# Cài đặt dependencies cho client
cd client
npm install
cd ..
```

### Bước 2: Chạy ứng dụng

#### Chạy trong môi trường development:
```bash
# Terminal 1: Chạy server
npm run dev

# Terminal 2: Chạy client
npm run client
```

#### Chạy trong môi trường production:
```bash
# Build client
npm run build

# Chạy server
npm start
```

### Bước 3: Truy cập ứng dụng
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000

## Tài khoản mẫu

### Độc giả:
- **Mã độc giả:** DG001, **Tên:** Nguyễn Văn A
- **Mã độc giả:** DG002, **Tên:** Trần Thị B

### Nhân viên:
- **Mã nhân viên:** NV001, **Mật khẩu:** admin123, **Chức vụ:** Quản lý
- **Mã nhân viên:** NV002, **Mật khẩu:** lan123, **Chức vụ:** Thủ thư
- **Mã nhân viên:** NV003, **Mật khẩu:** minh123, **Chức vụ:** Nhân viên

## API Endpoints

### Authentication
- `POST /api/login` - Đăng nhập

### Quản lý Sách
- `GET /api/sach` - Lấy danh sách sách
- `POST /api/sach` - Thêm sách mới
- `PUT /api/sach/:maSach` - Cập nhật sách
- `DELETE /api/sach/:maSach` - Xóa sách

### Quản lý Độc giả
- `GET /api/docgia` - Lấy danh sách độc giả
- `POST /api/docgia` - Thêm độc giả mới
- `PUT /api/docgia/:maDocGia` - Cập nhật thông tin độc giả
- `DELETE /api/docgia/:maDocGia` - Xóa độc giả

### Quản lý Nhân viên
- `GET /api/nhanvien` - Lấy danh sách nhân viên
- `POST /api/nhanvien` - Thêm nhân viên mới
- `PUT /api/nhanvien/:msnv` - Cập nhật thông tin nhân viên
- `DELETE /api/nhanvien/:msnv` - Xóa nhân viên

### Quản lý Mượn Trả
- `POST /api/muonsach` - Mượn sách (chờ duyệt)
- `POST /api/duyet-muonsach` - Duyệt yêu cầu mượn sách
- `GET /api/yeucau-choduyet` - Lấy danh sách yêu cầu chờ duyệt
- `POST /api/trasach` - Trả sách (chỉ nhân viên)
- `GET /api/muonsach/:maDocGia` - Lịch sử mượn sách của độc giả
- `GET /api/muonsach` - Tất cả lịch sử mượn trả