const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// Kết nối MongoDB
let db = null;

async function initializeDatabase() {
  try {
    db = await connectDB();
    console.log("🚀 Server sẵn sàng với MongoDB");
  } catch (error) {
    console.error("❌ Lỗi khởi tạo database:", error);
    process.exit(1);
  }
}

// Cập nhật trạng thái quá hạn cho sách đang mượn
async function updateOverdueStatus() {
  try {
    const muonsachCollection = db.collection('theodoimuonsach');
    const today = new Date();
    
    const overdueBooks = await muonsachCollection.find({
      TrangThai: 'Đang mượn',
      NgayMuon: { $exists: true }
    }).toArray();

    for (const borrow of overdueBooks) {
      const borrowDate = new Date(borrow.NgayMuon);
      const dueDate = new Date(borrowDate);
      dueDate.setDate(dueDate.getDate() + 30); // Thời hạn mượn 30 ngày
      
      if (today > dueDate) {
        await muonsachCollection.updateOne(
          { _id: borrow._id },
          { $set: { TrangThai: 'Quá hạn' } }
        );
      }
    }
  } catch (error) {
    console.error("❌ Lỗi cập nhật trạng thái quá hạn:", error);
  }
}

// Cập nhật trạng thái quá hạn mỗi khi có request
app.use(async (req, res, next) => {
  if (db) {
    await updateOverdueStatus();
  }
  next();
});

// Middleware kiểm tra database connection
app.use((req, res, next) => {
  if (!db) {
    return res.status(500).json({ success: false, message: 'Database chưa sẵn sàng' });
  }
  next();
});

// API Routes

// Đăng nhập
app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;
  
  try {
    if (role === 'docgia') {
      const docgiaCollection = db.collection('docgia');
      const reader = await docgiaCollection.findOne({ MaDocGia: username });
      if (reader) {
        res.json({ success: true, user: reader, role: 'docgia' });
      } else {
        res.json({ success: false, message: 'Mã độc giả không tồn tại' });
      }
    } else if (role === 'nhanvien') {
      const nhanvienCollection = db.collection('nhanvien');
      const employee = await nhanvienCollection.findOne({ 
        MSNV: username, 
        Password: password 
      });
      if (employee) {
        res.json({ success: true, user: employee, role: 'nhanvien' });
      } else {
        res.json({ success: false, message: 'Thông tin đăng nhập không đúng' });
      }
    } else {
      res.json({ success: false, message: 'Vai trò không hợp lệ' });
    }
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Lấy danh sách sách
app.get('/api/sach', async (req, res) => {
  try {
    const sachCollection = db.collection('sach');
    const nhaxuatbanCollection = db.collection('nhaxuatban');
    const muonsachCollection = db.collection('theodoimuonsach');
    
    const sach = await sachCollection.find({}).toArray();
    const nhaxuatban = await nhaxuatbanCollection.find({}).toArray();
    
    // Lấy thông tin user từ query parameter (nếu có)
    const { user } = req.query;
    let userBorrowHistory = [];
    
    if (user) {
      userBorrowHistory = await muonsachCollection
        .find({ MaDocGia: user })
        .sort({ NgayMuon: 1 }) // Sắp xếp theo thứ tự thời gian
        .toArray();
    }
    
    const sachWithNXB = sach.map(book => {
      const nxb = nhaxuatban.find(n => n.MANXB === book.MaNXB);
      
      // Tìm lịch sử mượn sách của user cho sách này
      const bookHistory = userBorrowHistory.filter(borrow => borrow.MaSach === book.MaSach);
      const latestBorrow = bookHistory.length > 0 ? bookHistory[bookHistory.length - 1] : null;
      
      return { 
        ...book, 
        TenNXB: nxb ? nxb.TenNXB : 'Không xác định',
        UserStatus: latestBorrow ? latestBorrow.TrangThai : null,
        UserBorrowDate: latestBorrow ? latestBorrow.NgayMuon : null
      };
    });
    
    res.json(sachWithNXB);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách sách:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Thêm sách mới
app.post('/api/sach', async (req, res) => {
  try {
    const sachCollection = db.collection('sach');
    const count = await sachCollection.countDocuments();
    const newBook = {
      ...req.body,
      MaSach: `S${String(count + 1).padStart(3, '0')}`
    };
    
    await sachCollection.insertOne(newBook);
    res.json({ success: true, book: newBook });
  } catch (error) {
    console.error('❌ Lỗi thêm sách:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Cập nhật sách
app.put('/api/sach/:maSach', async (req, res) => {
  try {
    const { maSach } = req.params;
    const sachCollection = db.collection('sach');
    
    // Loại bỏ _id khỏi dữ liệu cập nhật
    const { _id, ...updateData } = req.body;
    
    const result = await sachCollection.updateOne(
      { MaSach: maSach },
      { $set: updateData }
    );
    
    if (result.matchedCount > 0) {
      const updatedBook = await sachCollection.findOne({ MaSach: maSach });
      res.json({ success: true, book: updatedBook });
    } else {
      res.json({ success: false, message: 'Không tìm thấy sách' });
    }
  } catch (error) {
    console.error('❌ Lỗi cập nhật sách:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Xóa sách
app.delete('/api/sach/:maSach', async (req, res) => {
  try {
    const { maSach } = req.params;
    const sachCollection = db.collection('sach');
    
    const result = await sachCollection.deleteOne({ MaSach: maSach });
    
    if (result.deletedCount > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Không tìm thấy sách' });
    }
  } catch (error) {
    console.error('❌ Lỗi xóa sách:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Mượn sách
app.post('/api/muonsach', async (req, res) => {
  const { MaDocGia, MaSach } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  console.log('🔍 Mượn sách request:', { MaDocGia, MaSach, today });
  
  try {
    // Kiểm tra sách có sẵn không
    const sachCollection = db.collection('sach');
    const book = await sachCollection.findOne({ MaSach: MaSach });
    console.log('📖 Sách tìm thấy:', book);
    
    if (!book || book.SoQuyen <= 0) {
      console.log('❌ Sách không có sẵn');
      return res.json({ success: false, message: 'Sách không có sẵn' });
    }
    
    // Kiểm tra độc giả có sách quá hạn không
    const muonsachCollection = db.collection('theodoimuonsach');
    const overdueBooks = await muonsachCollection.find({ 
      MaDocGia: MaDocGia, 
      TrangThai: 'Quá hạn'
    }).toArray();
    
    if (overdueBooks.length > 0) {
      console.log('❌ Độc giả có sách quá hạn:', overdueBooks.length, 'cuốn');
      return res.json({ 
        success: false, 
        message: `Bạn có ${overdueBooks.length} sách quá hạn. Vui lòng trả sách hoặc liên hệ nhân viên để xử lý phạt trước khi mượn sách mới.` 
      });
    }
    
    // Kiểm tra độc giả đã mượn sách này chưa (bao gồm cả quá hạn)
    const existingBorrow = await muonsachCollection.findOne({ 
      MaDocGia: MaDocGia, 
      MaSach: MaSach, 
      TrangThai: { $in: ['Đang mượn', 'Quá hạn'] }
    });
    
    console.log('🔍 Kiểm tra mượn sách hiện tại:', existingBorrow);
    
    if (existingBorrow) {
      console.log('❌ Đã mượn sách này rồi');
      return res.json({ success: false, message: 'Bạn đã mượn sách này rồi' });
    }
    
    // Thêm vào danh sách mượn với trạng thái chờ duyệt
    const newBorrow = {
      MaDocGia,
      MaSach,
      NgayMuon: today,
      NgayTra: null,
      TrangThai: 'Chờ duyệt'
    };
    
    console.log('➕ Thêm mượn sách mới:', newBorrow);
    
    const result = await muonsachCollection.insertOne(newBorrow);
    console.log('✅ Đã thêm mượn sách:', result);
    
    res.json({ success: true, message: 'Yêu cầu mượn sách đã được gửi, chờ nhân viên duyệt' });
  } catch (error) {
    console.error('❌ Lỗi mượn sách:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Duyệt yêu cầu mượn sách
app.post('/api/duyet-muonsach', async (req, res) => {
  const { MaDocGia, MaSach, action } = req.body; // action: 'approve' hoặc 'reject'
  
  try {
    const muonsachCollection = db.collection('theodoimuonsach');
    const borrow = await muonsachCollection.findOne({ 
      MaDocGia: MaDocGia, 
      MaSach: MaSach, 
      TrangThai: 'Chờ duyệt'
    });
    
    if (!borrow) {
      return res.json({ success: false, message: 'Không tìm thấy yêu cầu mượn sách' });
    }
    
    if (action === 'approve') {
      // Kiểm tra sách có sẵn không
      const sachCollection = db.collection('sach');
      const book = await sachCollection.findOne({ MaSach: MaSach });
      if (!book || book.SoQuyen <= 0) {
        return res.json({ success: false, message: 'Sách không có sẵn để duyệt' });
      }
      
      // Duyệt yêu cầu
      await muonsachCollection.updateOne(
        { _id: borrow._id },
        { $set: { TrangThai: 'Đang mượn' } }
      );
      await sachCollection.updateOne(
        { MaSach: MaSach },
        { $inc: { SoQuyen: -1 } }
      );
      
      res.json({ success: true, message: 'Đã duyệt yêu cầu mượn sách' });
    } else if (action === 'reject') {
      // Từ chối yêu cầu
      await muonsachCollection.deleteOne({ _id: borrow._id });
      res.json({ success: true, message: 'Đã từ chối yêu cầu mượn sách' });
    } else {
      res.json({ success: false, message: 'Hành động không hợp lệ' });
    }
  } catch (error) {
    console.error('❌ Lỗi duyệt yêu cầu mượn sách:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Lấy danh sách yêu cầu chờ duyệt
app.get('/api/yeucau-choduyet', async (req, res) => {
  try {
    const muonsachCollection = db.collection('theodoimuonsach');
    const sachCollection = db.collection('sach');
    const docgiaCollection = db.collection('docgia');

    const pendingRequests = await muonsachCollection
      .find({ TrangThai: 'Chờ duyệt' })
      .toArray();

    const requestsWithDetails = await Promise.all(pendingRequests.map(async borrow => {
      const book = await sachCollection.findOne({ MaSach: borrow.MaSach });
      const reader = await docgiaCollection.findOne({ MaDocGia: borrow.MaDocGia });
      return {
        ...borrow,
        TenSach: book ? book.TenSach : 'Không xác định',
        TenDocGia: reader ? `${reader.HoLot} ${reader.Ten}` : 'Không xác định',
        SoQuyen: book ? book.SoQuyen : 0
      };
    }));

    res.json(requestsWithDetails);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách yêu cầu chờ duyệt:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Trả sách
app.post('/api/trasach', async (req, res) => {
  const { MaDocGia, MaSach } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const muonsachCollection = db.collection('theodoimuonsach');
    const sachCollection = db.collection('sach');

    const borrow = await muonsachCollection.findOne({ 
      MaDocGia: MaDocGia, 
      MaSach: MaSach, 
      TrangThai: { $in: ['Đang mượn', 'Quá hạn'] }
    });
    
    if (!borrow) {
      return res.json({ success: false, message: 'Không tìm thấy thông tin mượn sách' });
    }
    
    // Cập nhật trạng thái trả sách
    await muonsachCollection.updateOne(
      { _id: borrow._id },
      { $set: { NgayTra: today, TrangThai: 'Đã trả' } }
    );
    
    // Tăng số lượng sách
    await sachCollection.updateOne(
      { MaSach: MaSach },
      { $inc: { SoQuyen: 1 } }
    );
    
    res.json({ success: true, message: 'Trả sách thành công' });
  } catch (error) {
    console.error('❌ Lỗi trả sách:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Lấy lịch sử mượn sách của độc giả
app.get('/api/muonsach/:maDocGia', async (req, res) => {
  const { maDocGia } = req.params;
  console.log('🔍 Lấy lịch sử mượn sách cho:', maDocGia);
  
  try {
    const muonsachCollection = db.collection('theodoimuonsach');
    const sachCollection = db.collection('sach');

    const borrowHistory = await muonsachCollection
      .find({ MaDocGia: maDocGia })
      .toArray();

    console.log('📋 Lịch sử mượn sách thô:', borrowHistory);

    const historyWithDetails = await Promise.all(borrowHistory.map(async borrow => {
      const book = await sachCollection.findOne({ MaSach: borrow.MaSach });
      return {
        ...borrow,
        TenSach: book ? book.TenSach : 'Không xác định'
      };
    }));

    console.log('📋 Lịch sử mượn sách với chi tiết:', historyWithDetails);
    res.json(historyWithDetails);
  } catch (error) {
    console.error('❌ Lỗi lấy lịch sử mượn sách:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Lấy tất cả lịch sử mượn sách (cho quản lý)
app.get('/api/muonsach', async (req, res) => {
  try {
    const muonsachCollection = db.collection('theodoimuonsach');
    const sachCollection = db.collection('sach');
    const docgiaCollection = db.collection('docgia');

    const allBorrows = await muonsachCollection.find({}).toArray();

    const borrowsWithDetails = await Promise.all(allBorrows.map(async borrow => {
      const book = await sachCollection.findOne({ MaSach: borrow.MaSach });
      const reader = await docgiaCollection.findOne({ MaDocGia: borrow.MaDocGia });
      return {
        ...borrow,
        TenSach: book ? book.TenSach : 'Không xác định',
        TenDocGia: reader ? `${reader.HoLot} ${reader.Ten}` : 'Không xác định'
      };
    }));

    res.json(borrowsWithDetails);
  } catch (error) {
    console.error('❌ Lỗi lấy tất cả lịch sử mượn sách:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Lấy danh sách độc giả
app.get('/api/docgia', async (req, res) => {
  try {
    const docgiaCollection = db.collection('docgia');
    const docgia = await docgiaCollection.find({}).toArray();
    res.json(docgia);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách độc giả:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Thêm độc giả mới
app.post('/api/docgia', async (req, res) => {
  try {
    const docgiaCollection = db.collection('docgia');
    const count = await docgiaCollection.countDocuments();
    const newReader = {
      ...req.body,
      MaDocGia: `DG${String(count + 1).padStart(3, '0')}`
    };
    
    await docgiaCollection.insertOne(newReader);
    res.json({ success: true, reader: newReader });
  } catch (error) {
    console.error('❌ Lỗi thêm độc giả:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Cập nhật thông tin độc giả
app.put('/api/docgia/:maDocGia', async (req, res) => {
  const { maDocGia } = req.params;
  try {
    const docgiaCollection = db.collection('docgia');
    
    // Loại bỏ _id khỏi dữ liệu cập nhật
    const { _id, ...updateData } = req.body;
    
    const result = await docgiaCollection.updateOne(
      { MaDocGia: maDocGia },
      { $set: updateData }
    );
    if (result.matchedCount > 0) {
      const updatedReader = await docgiaCollection.findOne({ MaDocGia: maDocGia });
      res.json({ success: true, reader: updatedReader });
    } else {
      res.json({ success: false, message: 'Không tìm thấy độc giả' });
    }
  } catch (error) {
    console.error('❌ Lỗi cập nhật độc giả:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Xóa độc giả
app.delete('/api/docgia/:maDocGia', async (req, res) => {
  const { maDocGia } = req.params;
  try {
    const docgiaCollection = db.collection('docgia');
    const result = await docgiaCollection.deleteOne({ MaDocGia: maDocGia });
    if (result.deletedCount > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Không tìm thấy độc giả' });
    }
  } catch (error) {
    console.error('❌ Lỗi xóa độc giả:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Lấy danh sách nhân viên
app.get('/api/nhanvien', async (req, res) => {
  try {
    const nhanvienCollection = db.collection('nhanvien');
    const nhanvien = await nhanvienCollection.find({}).toArray();
    // Không trả về password vì lý do bảo mật
    const nhanvienWithoutPassword = nhanvien.map(nv => {
      const { Password, ...nvWithoutPassword } = nv;
      return nvWithoutPassword;
    });
    res.json(nhanvienWithoutPassword);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách nhân viên:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Thêm nhân viên mới
app.post('/api/nhanvien', async (req, res) => {
  try {
    const nhanvienCollection = db.collection('nhanvien');
    const count = await nhanvienCollection.countDocuments();
    const newEmployee = {
      ...req.body,
      MSNV: `NV${String(count + 1).padStart(3, '0')}`
    };
    
    await nhanvienCollection.insertOne(newEmployee);
    res.json({ success: true, employee: newEmployee });
  } catch (error) {
    console.error('❌ Lỗi thêm nhân viên:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Cập nhật thông tin nhân viên
app.put('/api/nhanvien/:msnv', async (req, res) => {
  const { msnv } = req.params;
  try {
    const nhanvienCollection = db.collection('nhanvien');
    
    // Loại bỏ _id khỏi dữ liệu cập nhật
    const { _id, ...updateData } = req.body;
    
    const result = await nhanvienCollection.updateOne(
      { MSNV: msnv },
      { $set: updateData }
    );
    if (result.matchedCount > 0) {
      const updatedEmployee = await nhanvienCollection.findOne({ MSNV: msnv });
      res.json({ success: true, employee: updatedEmployee });
    } else {
      res.json({ success: false, message: 'Không tìm thấy nhân viên' });
    }
  } catch (error) {
    console.error('❌ Lỗi cập nhật nhân viên:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Xóa nhân viên
app.delete('/api/nhanvien/:msnv', async (req, res) => {
  const { msnv } = req.params;
  try {
    const nhanvienCollection = db.collection('nhanvien');
    const result = await nhanvienCollection.deleteOne({ MSNV: msnv });
    if (result.deletedCount > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Không tìm thấy nhân viên' });
    }
  } catch (error) {
    console.error('❌ Lỗi xóa nhân viên:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Xử lý phạt quá hạn
app.post('/api/xuly-phat', async (req, res) => {
  const { MaDocGia, MaSach, penaltyAmount, penaltyNote } = req.body;
  
  try {
    const muonsachCollection = db.collection('theodoimuonsach');
    
    // Tìm sách quá hạn
    const overdueBook = await muonsachCollection.findOne({
      MaDocGia: MaDocGia,
      MaSach: MaSach,
      TrangThai: 'Quá hạn'
    });
    
    if (!overdueBook) {
      return res.json({ success: false, message: 'Không tìm thấy sách quá hạn' });
    }
    
    // Cập nhật trạng thái thành "Đã trả" và thêm thông tin phạt
    const updateData = {
      TrangThai: 'Đã trả',
      NgayTra: new Date().toISOString().split('T')[0],
      PenaltyInfo: {
        amount: penaltyAmount,
        note: penaltyNote,
        processedDate: new Date().toISOString(),
        overdueDays: Math.max(0, Math.ceil((new Date() - new Date(overdueBook.NgayMuon)) / (1000 * 60 * 60 * 24)) - 30)
      }
    };
    
    await muonsachCollection.updateOne(
      { _id: overdueBook._id },
      { $set: updateData }
    );
    
    // Tăng số lượng sách có sẵn
    const sachCollection = db.collection('sach');
    await sachCollection.updateOne(
      { MaSach: MaSach },
      { $inc: { SoQuyen: 1 } }
    );
    
    res.json({ 
      success: true, 
      message: `Đã xử lý phạt ${penaltyAmount.toLocaleString('vi-VN')} VNĐ cho độc giả ${MaDocGia}` 
    });
  } catch (error) {
    console.error('❌ Lỗi xử lý phạt:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// ===== API QUẢN LÝ NHÀ XUẤT BẢN =====

// Lấy danh sách nhà xuất bản
app.get('/api/nhaxuatban', async (req, res) => {
  try {
    const nhaxuatbanCollection = db.collection('nhaxuatban');
    const publishers = await nhaxuatbanCollection.find({}).toArray();
    res.json(publishers || []);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách nhà xuất bản:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Thêm nhà xuất bản mới
app.post('/api/nhaxuatban', async (req, res) => {
  const { MaNXB, TenNXB, DiaChi } = req.body;
  
  try {
    const nhaxuatbanCollection = db.collection('nhaxuatban');
    
    // Kiểm tra mã nhà xuất bản đã tồn tại
    const existingPublisher = await nhaxuatbanCollection.findOne({ MaNXB: MaNXB });
    if (existingPublisher) {
      return res.json({ success: false, message: 'Mã nhà xuất bản đã tồn tại' });
    }
    
    const newPublisher = {
      MaNXB,
      TenNXB,
      DiaChi
    };
    
    await nhaxuatbanCollection.insertOne(newPublisher);
    res.json({ success: true, message: 'Thêm nhà xuất bản thành công' });
  } catch (error) {
    console.error('❌ Lỗi thêm nhà xuất bản:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Cập nhật nhà xuất bản
app.put('/api/nhaxuatban/:manxb', async (req, res) => {
  const { manxb } = req.params;
  const { TenNXB, DiaChi } = req.body;
  
  try {
    const nhaxuatbanCollection = db.collection('nhaxuatban');
    const result = await nhaxuatbanCollection.updateOne(
      { MaNXB: manxb },
      { $set: { TenNXB, DiaChi } }
    );
    
    if (result.modifiedCount > 0) {
      res.json({ success: true, message: 'Cập nhật nhà xuất bản thành công' });
    } else {
      res.json({ success: false, message: 'Không tìm thấy nhà xuất bản' });
    }
  } catch (error) {
    console.error('❌ Lỗi cập nhật nhà xuất bản:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Xóa nhà xuất bản
app.delete('/api/nhaxuatban/:manxb', async (req, res) => {
  const { manxb } = req.params;
  
  try {
    const nhaxuatbanCollection = db.collection('nhaxuatban');
    
    // Kiểm tra xem có sách nào đang sử dụng nhà xuất bản này không
    const sachCollection = db.collection('sach');
    const booksUsingPublisher = await sachCollection.findOne({ MaNXB: manxb });
    
    if (booksUsingPublisher) {
      return res.json({ 
        success: false, 
        message: 'Không thể xóa nhà xuất bản vì có sách đang sử dụng' 
      });
    }
    
    const result = await nhaxuatbanCollection.deleteOne({ MaNXB: manxb });
    if (result.deletedCount > 0) {
      res.json({ success: true, message: 'Xóa nhà xuất bản thành công' });
    } else {
      res.json({ success: false, message: 'Không tìm thấy nhà xuất bản' });
    }
  } catch (error) {
    console.error('❌ Lỗi xóa nhà xuất bản:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Khởi tạo database và start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy trên port ${PORT}`);
      console.log(`📊 Database: MongoDB`);
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error);
    process.exit(1);
  }
}

startServer(); 