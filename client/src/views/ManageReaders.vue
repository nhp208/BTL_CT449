<template>
  <div class="manage-readers">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="text-center mb-3">
          <i class="fas fa-users me-2"></i>
          Quản lý Độc giả
        </h2>
        <div class="row">
          <div class="col-md-6">
            <button class="btn btn-success" @click="showAddModal">
              <i class="fas fa-plus me-2"></i>
              Thêm độc giả mới
            </button>
          </div>
          <div class="col-md-6 text-end">
            <span class="badge bg-primary fs-6">{{ readers.length }} độc giả</span>
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
                <th>Mã độc giả</th>
                <th>Họ lót</th>
                <th>Tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Địa chỉ</th>
                <th>Điện thoại</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reader in readers" :key="reader.MaDocGia">
                <td><strong>{{ reader.MaDocGia }}</strong></td>
                <td>{{ reader.HoLot }}</td>
                <td>{{ reader.Ten }}</td>
                <td>{{ formatDate(reader.NgaySinh) }}</td>
                <td>{{ reader.Phai }}</td>
                <td>{{ reader.DiaChi }}</td>
                <td>{{ reader.DienThoai }}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1" @click="editReader(reader)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteReader(reader)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal thêm/sửa độc giả -->
    <div class="modal fade" id="readerModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Sửa thông tin độc giả' : 'Thêm độc giả mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveReader">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Họ lót *</label>
                    <input type="text" class="form-control" v-model="readerForm.HoLot" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Tên *</label>
                    <input type="text" class="form-control" v-model="readerForm.Ten" required>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Ngày sinh *</label>
                    <input type="date" class="form-control" v-model="readerForm.NgaySinh" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Giới tính *</label>
                    <select class="form-select" v-model="readerForm.Phai" required>
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Địa chỉ *</label>
                    <input type="text" class="form-control" v-model="readerForm.DiaChi" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Điện thoại *</label>
                    <input type="tel" class="form-control" v-model="readerForm.DienThoai" required>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveReader" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm độc giả') }}
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
            <p>Bạn có chắc chắn muốn xóa độc giả "<strong>{{ selectedReader?.HoLot }} {{ selectedReader?.Ten }}</strong>"?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Đang xóa...' : 'Xóa độc giả' }}
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
  name: 'ManageReaders',
  data() {
    return {
      readers: [],
      loading: false,
      modalMessage: '',
      isEditing: false,
      selectedReader: null,
      readerForm: {
        HoLot: '',
        Ten: '',
        NgaySinh: '',
        Phai: '',
        DiaChi: '',
        DienThoai: ''
      }
    }
  },
  async mounted() {
    await this.loadReaders()
  },
  methods: {
    async loadReaders() {
      try {
        const response = await axios.get('/api/docgia')
        this.readers = response.data || []
      } catch (error) {
        console.error('Error loading readers:', error)
        this.readers = []
      }
    },
    
    showAddModal() {
      this.isEditing = false
      this.resetForm()
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('readerModal'))
        modal.show()
      }
    },
    
    editReader(reader) {
      this.isEditing = true
      this.selectedReader = reader
      // Loại bỏ _id khỏi dữ liệu form
      const { _id, ...readerData } = reader
      this.readerForm = { ...readerData }
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('readerModal'))
        modal.show()
      }
    },
    
    async saveReader() {
      this.loading = true
      
      try {
        if (this.isEditing) {
          const response = await axios.put(`/api/docgia/${this.selectedReader.MaDocGia}`, this.readerForm)
          if (response.data.success) {
            this.showMessage('Cập nhật thông tin độc giả thành công!')
            await this.loadReaders()
            this.closeModal('readerModal')
          }
        } else {
          const response = await axios.post('/api/docgia', this.readerForm)
          if (response.data.success) {
            this.showMessage('Thêm độc giả thành công!')
            await this.loadReaders()
            this.closeModal('readerModal')
          }
        }
      } catch (error) {
        console.error('Error saving reader:', error)
        this.showMessage('Có lỗi xảy ra khi lưu thông tin độc giả')
      } finally {
        this.loading = false
      }
    },
    
    deleteReader(reader) {
      this.selectedReader = reader
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('deleteModal'))
        modal.show()
      }
    },
    
    async confirmDelete() {
      this.loading = true
      
      try {
        const response = await axios.delete(`/api/docgia/${this.selectedReader.MaDocGia}`)
        if (response.data.success) {
          this.showMessage('Xóa độc giả thành công!')
          await this.loadReaders()
          this.closeModal('deleteModal')
        }
      } catch (error) {
        console.error('Error deleting reader:', error)
        this.showMessage('Có lỗi xảy ra khi xóa độc giả')
      } finally {
        this.loading = false
      }
    },
    
    resetForm() {
      this.readerForm = {
        HoLot: '',
        Ten: '',
        NgaySinh: '',
        Phai: '',
        DiaChi: '',
        DienThoai: ''
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
    
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
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