const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function addTestData() {
  try {
    await client.connect();
    console.log("✅ Kết nối MongoDB thành công");
    
    const db = client.db("library");
    
    // Xóa dữ liệu cũ trong theodoimuonsach
    await db.collection('theodoimuonsach').deleteMany({});
    console.log("🗑️ Đã xóa dữ liệu cũ");
    
    // Thêm dữ liệu test
    const testData = [
      // Dữ liệu bình thường
      { MaDocGia: 'DG001', MaSach: 'S001', NgayMuon: '2024-01-15', NgayTra: '2024-02-15', TrangThai: 'Đã trả' },
      { MaDocGia: 'DG002', MaSach: 'S002', NgayMuon: '2024-02-01', NgayTra: null, TrangThai: 'Đang mượn' },
      { MaDocGia: 'DG001', MaSach: 'S003', NgayMuon: '2024-01-01', NgayTra: '2024-02-20', TrangThai: 'Đã trả' },
      
      // Dữ liệu test phạt quá hạn
      { MaDocGia: 'DG001', MaSach: 'S002', NgayMuon: '2023-12-01', NgayTra: '2024-02-01', TrangThai: 'Đã trả' }, // Quá hạn 32 ngày
      { MaDocGia: 'DG002', MaSach: 'S003', NgayMuon: '2023-11-15', NgayTra: null, TrangThai: 'Quá hạn' }, // Quá hạn 45+ ngày
      { MaDocGia: 'DG001', MaSach: 'S001', NgayMuon: '2024-01-20', NgayTra: null, TrangThai: 'Đang mượn' }, // Chưa quá hạn
      { MaDocGia: 'DG002', MaSach: 'S002', NgayMuon: '2024-02-15', NgayTra: null, TrangThai: 'Chờ duyệt' }, // Chờ duyệt
      
      // Thêm dữ liệu test quá hạn khác
      { MaDocGia: 'DG001', MaSach: 'S003', NgayMuon: '2023-10-01', NgayTra: '2024-01-15', TrangThai: 'Đã trả' }, // Quá hạn 75 ngày
      { MaDocGia: 'DG002', MaSach: 'S001', NgayMuon: '2023-09-15', NgayTra: null, TrangThai: 'Quá hạn' }, // Quá hạn 90+ ngày
    ];
    
    await db.collection('theodoimuonsach').insertMany(testData);
    console.log("✅ Đã thêm dữ liệu test thành công");
    
    // Hiển thị dữ liệu đã thêm
    const allBorrows = await db.collection('theodoimuonsach').find({}).toArray();
    console.log("\n📋 Dữ liệu test đã thêm:");
    allBorrows.forEach((borrow, index) => {
      const borrowDate = new Date(borrow.NgayMuon);
      const today = new Date();
      const diffDays = Math.ceil((today - borrowDate) / (1000 * 60 * 60 * 24));
      const overdueDays = Math.max(0, diffDays - 30);
      
      console.log(`${index + 1}. ${borrow.MaDocGia} - ${borrow.MaSach}: ${borrow.TrangThai}`);
      console.log(`   Ngày mượn: ${borrow.NgayMuon}, Ngày trả: ${borrow.NgayTra || 'Chưa trả'}`);
      console.log(`   Số ngày mượn: ${diffDays}, Quá hạn: ${overdueDays} ngày`);
      console.log(`   Phạt dự kiến: ${overdueDays * 5000} VNĐ\n`);
    });
    
  } catch (error) {
    console.error("❌ Lỗi:", error);
  } finally {
    await client.close();
  }
}

addTestData(); 