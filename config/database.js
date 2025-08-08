const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db = null;

async function connectDB() {
  try {
    if (!db) {
      await client.connect();
      console.log("✅ Kết nối MongoDB thành công");
      db = client.db("library");
      
      // Khởi tạo dữ liệu mẫu nếu collection rỗng
      await initializeSampleData();
    }
    return db;
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
    throw error;
  }
}

async function initializeSampleData() {
  try {
    // Kiểm tra và thêm dữ liệu mẫu cho nhà xuất bản
    const nxbCollection = db.collection('nhaxuatban');
    const nxbCount = await nxbCollection.countDocuments();
    if (nxbCount === 0) {
      await nxbCollection.insertMany([
        { MANXB: 'NXB001', TenNXB: 'Nhà xuất bản Giáo dục', DiaChi: 'Hà Nội' },
        { MANXB: 'NXB002', TenNXB: 'Nhà xuất bản Kim Đồng', DiaChi: 'Hà Nội' },
        { MANXB: 'NXB003', TenNXB: 'Nhà xuất bản Trẻ', DiaChi: 'TP.HCM' }
      ]);
      console.log("📚 Đã thêm dữ liệu mẫu nhà xuất bản");
    }

    // Kiểm tra và thêm dữ liệu mẫu cho sách
    const sachCollection = db.collection('sach');
    const sachCount = await sachCollection.countDocuments();
    if (sachCount === 0) {
      await sachCollection.insertMany([
        { MaSach: 'S001', TenSach: 'Toán học cơ bản', DonGia: 50000, SoQuyen: 10, NamXuatBan: 2020, MaNXB: 'NXB001', TacGia: 'Nguyễn Văn A' },
        { MaSach: 'S002', TenSach: 'Văn học Việt Nam', DonGia: 75000, SoQuyen: 5, NamXuatBan: 2021, MaNXB: 'NXB002', TacGia: 'Trần Thị B' },
        { MaSach: 'S003', TenSach: 'Lập trình Web', DonGia: 120000, SoQuyen: 8, NamXuatBan: 2022, MaNXB: 'NXB003', TacGia: 'Lê Văn C' }
      ]);
      console.log("📖 Đã thêm dữ liệu mẫu sách");
    }

    // Kiểm tra và thêm dữ liệu mẫu cho độc giả
    const docgiaCollection = db.collection('docgia');
    const docgiaCount = await docgiaCollection.countDocuments();
    if (docgiaCount === 0) {
      await docgiaCollection.insertMany([
        { MaDocGia: 'DG001', HoLot: 'Nguyễn Văn', Ten: 'An', NgaySinh: '1990-01-15', Phai: 'Nam', DiaChi: 'Hà Nội', DienThoai: '0123456789' },
        { MaDocGia: 'DG002', HoLot: 'Trần Thị', Ten: 'Bình', NgaySinh: '1995-05-20', Phai: 'Nữ', DiaChi: 'TP.HCM', DienThoai: '0987654321' }
      ]);
      console.log("👥 Đã thêm dữ liệu mẫu độc giả");
    }

    // Kiểm tra và thêm dữ liệu mẫu cho nhân viên
    const nhanvienCollection = db.collection('nhanvien');
    const nhanvienCount = await nhanvienCollection.countDocuments();
    if (nhanvienCount === 0) {
      await nhanvienCollection.insertMany([
        { MSNV: 'NV001', HoTenNV: 'Admin', Password: 'admin123', ChucVu: 'Quản lý', DiaChi: 'Hà Nội', SoDienThoai: '0123456789' },
        { MSNV: 'NV002', HoTenNV: 'Nguyễn Thị Lan', Password: 'lan123', ChucVu: 'Thủ thư', DiaChi: 'TP.HCM', SoDienThoai: '0987654321' },
        { MSNV: 'NV003', HoTenNV: 'Trần Văn Minh', Password: 'minh123', ChucVu: 'Nhân viên', DiaChi: 'Đà Nẵng', SoDienThoai: '0369852147' }
      ]);
      console.log("👨‍💼 Đã thêm dữ liệu mẫu nhân viên");
    }

    // Kiểm tra và thêm dữ liệu mẫu cho theo dõi mượn sách
    const muonsachCollection = db.collection('theodoimuonsach');
    const muonsachCount = await muonsachCollection.countDocuments();
    if (muonsachCount === 0) {
      await muonsachCollection.insertMany([
        { MaDocGia: 'DG001', MaSach: 'S001', NgayMuon: '2024-01-15', NgayTra: '2024-02-15', TrangThai: 'Đã trả' },
        { MaDocGia: 'DG002', MaSach: 'S002', NgayMuon: '2024-02-01', NgayTra: null, TrangThai: 'Đang mượn' },
        { MaDocGia: 'DG001', MaSach: 'S003', NgayMuon: '2024-01-01', NgayTra: '2024-02-20', TrangThai: 'Đã trả' },
        { MaDocGia: 'DG002', MaSach: 'S001', NgayMuon: '2024-01-10', NgayTra: null, TrangThai: 'Quá hạn' },
        // Dữ liệu test phạt quá hạn
        { MaDocGia: 'DG001', MaSach: 'S002', NgayMuon: '2023-12-01', NgayTra: '2024-02-01', TrangThai: 'Đã trả' }, // Quá hạn 32 ngày
        { MaDocGia: 'DG002', MaSach: 'S003', NgayMuon: '2023-11-15', NgayTra: null, TrangThai: 'Quá hạn' }, // Quá hạn 45+ ngày
        { MaDocGia: 'DG001', MaSach: 'S001', NgayMuon: '2024-01-20', NgayTra: null, TrangThai: 'Đang mượn' }, // Chưa quá hạn
        { MaDocGia: 'DG002', MaSach: 'S002', NgayMuon: '2024-02-15', NgayTra: null, TrangThai: 'Chờ duyệt' } // Chờ duyệt
      ]);
      console.log("📋 Đã thêm dữ liệu mẫu theo dõi mượn sách");
    }

  } catch (error) {
    console.error("❌ Lỗi khởi tạo dữ liệu mẫu:", error);
  }
}

module.exports = { connectDB }; 