<template>
  <div class="books">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="text-center mb-3">
          <i class="fas fa-book me-2"></i>
          Danh Sách Sách
        </h2>
        
        <!-- Alert cảnh báo sách quá hạn -->
        <div v-if="hasOverdueBooks" class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Cảnh báo!</strong> Bạn có sách quá hạn. Vui lòng liên hệ nhân viên để xử lý phạt trước khi mượn sách mới.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
        
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                v-model="searchTerm" 
                placeholder="Tìm kiếm sách..."
              >
              <button class="btn btn-outline-secondary" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-6 text-end">
            <span class="badge bg-primary fs-6">{{ filteredBooks.length }} sách</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="alert alert-info mb-4">
          <i class="fas fa-info-circle me-2"></i>
          <strong>Quy trình mượn sách:</strong> 
          <ul class="mb-0 mt-2">
            <li>Khi bạn nhấn "Mượn sách", yêu cầu sẽ được gửi đến nhân viên để duyệt</li>
            <li>Bạn có thể theo dõi trạng thái yêu cầu trong trang "Sách của tôi"</li>
            <li>Sách chỉ được mượn thành công sau khi được nhân viên duyệt</li>
          </ul>
        </div>
        
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-dark">
              <tr>
                <th>Mã sách</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Nhà xuất bản</th>
                <th>Năm xuất bản</th>
                <th>Đơn giá</th>
                <th>Số quyển</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in filteredBooks" :key="book.MaSach">
                <td><strong>{{ book.MaSach }}</strong></td>
                <td>{{ book.TenSach }}</td>
                <td>{{ book.TacGia }}</td>
                <td>{{ book.TenNXB }}</td>
                <td>{{ book.NamXuatBan }}</td>
                <td>{{ formatPrice(book.DonGia) }}</td>
                <td>
                  <span :class="book.SoQuyen > 0 ? 'badge bg-success' : 'badge bg-danger'">
                    {{ book.SoQuyen }}
                  </span>
                </td>
                <td>
                  <button 
                    v-if="!hasBorrowedBook(book.MaSach)"
                    class="btn btn-sm btn-primary" 
                    @click="borrowBook(book)"
                    :disabled="book.SoQuyen <= 0 || loading"
                  >
                    <i class="fas fa-book-open me-1"></i>
                    Mượn sách
                  </button>
                  <span v-else-if="getBorrowStatus(book.MaSach) === 'Chờ duyệt'" class="badge bg-warning">
                    <i class="fas fa-clock me-1"></i>
                    Đang chờ duyệt
                  </span>
                  <span v-else-if="getBorrowStatus(book.MaSach) === 'Đang mượn'" class="badge bg-success">
                    <i class="fas fa-check me-1"></i>
                    Đã mượn
                  </span>
                  <span v-else-if="getBorrowStatus(book.MaSach) === 'Quá hạn'" class="badge bg-danger">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Quá hạn
                  </span>
                  <span v-else class="badge bg-secondary">
                    {{ getBorrowStatus(book.MaSach) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal thông báo -->
    <div class="modal fade" id="messageModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thông báo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            {{ modalMessage }}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Books',
  data() {
    return {
      books: [],
      searchTerm: '',
      loading: false,
      modalMessage: ''
    }
  },
  computed: {
    filteredBooks() {
      if (!this.searchTerm) return this.books
      
      const term = this.searchTerm.toLowerCase()
      return this.books.filter(book => 
        book.TenSach.toLowerCase().includes(term) ||
        book.TacGia.toLowerCase().includes(term) ||
        book.MaSach.toLowerCase().includes(term)
      )
    },
    hasOverdueBooks() {
      return this.books.some(book => book.UserStatus === 'Quá hạn')
    }
  },
  async mounted() {
    await this.loadBooks()
  },
  methods: {
    async loadBooks() {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const params = user ? { user: user.MaDocGia } : {}
        const response = await axios.get('/api/sach', { params })
        this.books = response.data
      } catch (error) {
        console.error('Error loading books:', error)
        this.showMessage('Có lỗi xảy ra khi tải danh sách sách')
      }
    },
    
    async borrowBook(book) {
      this.loading = true
      
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const response = await axios.post('/api/muonsach', {
          MaDocGia: user.MaDocGia,
          MaSach: book.MaSach
        })
        
        if (response.data.success) {
          this.showMessage('Yêu cầu mượn sách đã được gửi! Vui lòng chờ nhân viên duyệt.')
          await this.loadBooks() // Tải lại danh sách sách với thông tin mới
        } else {
          this.showMessage(response.data.message)
        }
      } catch (error) {
        console.error('Error borrowing book:', error)
        this.showMessage('Có lỗi xảy ra khi mượn sách')
      } finally {
        this.loading = false
      }
    },
    
    showMessage(message) {
      this.modalMessage = message
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('messageModal'))
        modal.show()
      } else {
        alert(message)
      }
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    },

    hasBorrowedBook(maSach) {
      const book = this.books.find(b => b.MaSach === maSach)
      if (!book || !book.UserStatus) return false
      
      const result = book.UserStatus === 'Chờ duyệt' || 
                    book.UserStatus === 'Đang mượn' || 
                    book.UserStatus === 'Quá hạn'
      
      console.log(`hasBorrowedBook(${maSach}):`, result, 'UserStatus:', book.UserStatus)
      return result
    },

    getBorrowStatus(maSach) {
      const book = this.books.find(b => b.MaSach === maSach)
      const status = book?.UserStatus || 'Chưa mượn'
      console.log(`getBorrowStatus(${maSach}):`, status)
      return status
    }

  }
}
</script>

<style scoped>
.table th {
  border-top: none;
}

.badge {
  font-size: 0.9em;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style> 