<template>
  <div class="manage-books">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="text-center mb-3">
          <i class="fas fa-cogs me-2"></i>
          Quản lý Sách
        </h2>
        <div class="row">
          <div class="col-md-6">
            <button class="btn btn-success" @click="showAddModal">
              <i class="fas fa-plus me-2"></i>
              Thêm sách mới
            </button>
          </div>
          <div class="col-md-6 text-end">
            <span class="badge bg-primary fs-6">{{ books.length }} sách</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
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
              <tr v-for="book in books" :key="book.MaSach">
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
                  <button class="btn btn-sm btn-warning me-1" @click="editBook(book)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteBook(book)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal thêm/sửa sách -->
    <div class="modal fade" id="bookModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Sửa sách' : 'Thêm sách mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveBook">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Tên sách *</label>
                    <input type="text" class="form-control" v-model="bookForm.TenSach" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Tác giả *</label>
                    <input type="text" class="form-control" v-model="bookForm.TacGia" required>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Nhà xuất bản *</label>
                    <select class="form-select" v-model="bookForm.MaNXB" required>
                      <option value="">Chọn nhà xuất bản</option>
                      <option v-for="publisher in publishers" :key="publisher.MaNXB" :value="publisher.MaNXB">
                        {{ publisher.TenNXB }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Năm xuất bản *</label>
                    <input type="number" class="form-control" v-model="bookForm.NamXuatBan" min="1900" max="2024" required>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Đơn giá (VNĐ) *</label>
                    <input type="number" class="form-control" v-model="bookForm.DonGia" min="0" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Số quyển *</label>
                    <input type="number" class="form-control" v-model="bookForm.SoQuyen" min="0" required>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveBook" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm sách') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận xóa -->
    <div class="modal fade" id="deleteModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa sách "<strong>{{ selectedBook?.TenSach }}</strong>"?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Đang xóa...' : 'Xóa sách' }}
            </button>
          </div>
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
  name: 'ManageBooks',
  data() {
    return {
      books: [],
      publishers: [],
      loading: false,
      modalMessage: '',
      isEditing: false,
      selectedBook: null,
      bookForm: {
        TenSach: '',
        TacGia: '',
        MaNXB: '',
        NamXuatBan: new Date().getFullYear(),
        DonGia: 0,
        SoQuyen: 1
      }
    }
  },
  async mounted() {
    await this.loadBooks()
    await this.loadPublishers()
  },
  methods: {
    async loadBooks() {
      try {
        const response = await axios.get('/api/sach')
        this.books = response.data || []
      } catch (error) {
        console.error('Error loading books:', error)
        this.books = []
        this.showMessage('Có lỗi xảy ra khi tải danh sách sách')
      }
    },

    async loadPublishers() {
      try {
        const response = await axios.get('/api/nhaxuatban')
        this.publishers = response.data || []
      } catch (error) {
        console.error('Error loading publishers:', error)
        this.publishers = []
      }
    },
    
    showAddModal() {
      this.isEditing = false
      this.resetForm()
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('bookModal'))
        modal.show()
      }
    },
    
    editBook(book) {
      this.isEditing = true
      this.selectedBook = book
      // Loại bỏ _id khỏi dữ liệu form
      const { _id, ...bookData } = book
      this.bookForm = { ...bookData }
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('bookModal'))
        modal.show()
      }
    },
    
    async saveBook() {
      this.loading = true
      
      try {
        if (this.isEditing) {
          const response = await axios.put(`/api/sach/${this.selectedBook.MaSach}`, this.bookForm)
          if (response.data.success) {
            this.showMessage('Cập nhật sách thành công!')
            await this.loadBooks()
            this.closeModal('bookModal')
          }
        } else {
          const response = await axios.post('/api/sach', this.bookForm)
          if (response.data.success) {
            this.showMessage('Thêm sách thành công!')
            await this.loadBooks()
            this.closeModal('bookModal')
          }
        }
      } catch (error) {
        console.error('Error saving book:', error)
        this.showMessage('Có lỗi xảy ra khi lưu sách')
      } finally {
        this.loading = false
      }
    },
    
    deleteBook(book) {
      this.selectedBook = book
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('deleteModal'))
        modal.show()
      }
    },
    
    async confirmDelete() {
      this.loading = true
      
      try {
        const response = await axios.delete(`/api/sach/${this.selectedBook.MaSach}`)
        if (response.data.success) {
          this.showMessage('Xóa sách thành công!')
          await this.loadBooks()
          this.closeModal('deleteModal')
        }
      } catch (error) {
        console.error('Error deleting book:', error)
        this.showMessage('Có lỗi xảy ra khi xóa sách')
      } finally {
        this.loading = false
      }
    },
    
    resetForm() {
      this.bookForm = {
        TenSach: '',
        TacGia: '',
        MaNXB: '',
        NamXuatBan: new Date().getFullYear(),
        DonGia: 0,
        SoQuyen: 1
      }
    },
    
    closeModal(modalId) {
      if (window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance(document.getElementById(modalId))
        if (modal) {
          modal.hide()
        }
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