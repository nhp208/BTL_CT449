<template>
  <div class="manage-publishers">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2><i class="fas fa-building me-2"></i>Quản lý Nhà xuất bản</h2>
      <button class="btn btn-primary" @click="openModal('add')">
        <i class="fas fa-plus me-1"></i>Thêm nhà xuất bản
      </button>
    </div>

    <!-- Bảng nhà xuất bản -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-dark">
              <tr>
                <th>Mã NXB</th>
                <th>Tên nhà xuất bản</th>
                <th>Địa chỉ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="publisher in publishers" :key="publisher.MaNXB">
                <td><strong>{{ publisher.MaNXB }}</strong></td>
                <td>{{ publisher.TenNXB }}</td>
                <td>{{ publisher.DiaChi }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" @click="editPublisher(publisher)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deletePublisher(publisher)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="publishers.length === 0">
                <td colspan="4" class="text-center text-muted">
                  <i class="fas fa-info-circle me-2"></i>Chưa có nhà xuất bản nào
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal thêm/sửa nhà xuất bản -->
    <div class="modal fade" id="publisherModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-building me-2"></i>
              {{ isEditing ? 'Sửa nhà xuất bản' : 'Thêm nhà xuất bản mới' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePublisher">
              <div class="mb-3">
                <label class="form-label">Mã nhà xuất bản</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="publisherForm.MaNXB"
                  :readonly="isEditing"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Tên nhà xuất bản</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="publisherForm.TenNXB"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <textarea 
                  class="form-control" 
                  v-model="publisherForm.DiaChi"
                  rows="3"
                  required
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="savePublisher" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? 'Cập nhật' : 'Thêm' }}
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
            <h5 class="modal-title text-danger">
              <i class="fas fa-exclamation-triangle me-2"></i>Xác nhận xóa
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa nhà xuất bản <strong>{{ selectedPublisher?.TenNXB }}</strong>?</p>
            <p class="text-muted small">Lưu ý: Không thể xóa nhà xuất bản đang có sách sử dụng.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
              Xóa
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
            <h5 class="modal-title">
              <i class="fas fa-info-circle me-2"></i>Thông báo
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ManagePublishers',
  data() {
    return {
      publishers: [],
      publisherForm: {
        MaNXB: '',
        TenNXB: '',
        DiaChi: ''
      },
      selectedPublisher: null,
      isEditing: false,
      loading: false,
      message: ''
    }
  },
  async mounted() {
    await this.loadPublishers()
  },
  methods: {
    async loadPublishers() {
      try {
        const response = await axios.get('/api/nhaxuatban')
        this.publishers = response.data || []
      } catch (error) {
        console.error('Error loading publishers:', error)
        this.showMessage('Có lỗi xảy ra khi tải danh sách nhà xuất bản')
      }
    },

    openModal(type) {
      this.isEditing = type === 'edit'
      if (type === 'add') {
        this.publisherForm = {
          MaNXB: '',
          TenNXB: '',
          DiaChi: ''
        }
      }
      
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('publisherModal'))
        modal.show()
      }
    },

    editPublisher(publisher) {
      this.selectedPublisher = publisher
      this.publisherForm = {
        MaNXB: publisher.MaNXB,
        TenNXB: publisher.TenNXB,
        DiaChi: publisher.DiaChi
      }
      this.openModal('edit')
    },

    async savePublisher() {
      this.loading = true
      
      try {
        if (this.isEditing) {
          const response = await axios.put(`/api/nhaxuatban/${this.publisherForm.MaNXB}`, {
            TenNXB: this.publisherForm.TenNXB,
            DiaChi: this.publisherForm.DiaChi
          })
          
          if (response.data.success) {
            this.showMessage(response.data.message)
            this.closeModal('publisherModal')
            await this.loadPublishers()
          } else {
            this.showMessage(response.data.message)
          }
        } else {
          const response = await axios.post('/api/nhaxuatban', this.publisherForm)
          
          if (response.data.success) {
            this.showMessage(response.data.message)
            this.closeModal('publisherModal')
            await this.loadPublishers()
          } else {
            this.showMessage(response.data.message)
          }
        }
      } catch (error) {
        console.error('Error saving publisher:', error)
        this.showMessage('Có lỗi xảy ra khi lưu nhà xuất bản')
      } finally {
        this.loading = false
      }
    },

    deletePublisher(publisher) {
      this.selectedPublisher = publisher
      
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('deleteModal'))
        modal.show()
      }
    },

    async confirmDelete() {
      this.loading = true
      
      try {
        const response = await axios.delete(`/api/nhaxuatban/${this.selectedPublisher.MaNXB}`)
        
        if (response.data.success) {
          this.showMessage(response.data.message)
          this.closeModal('deleteModal')
          await this.loadPublishers()
        } else {
          this.showMessage(response.data.message)
        }
      } catch (error) {
        console.error('Error deleting publisher:', error)
        this.showMessage('Có lỗi xảy ra khi xóa nhà xuất bản')
      } finally {
        this.loading = false
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
      this.message = message
      
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('messageModal'))
        modal.show()
      }
    }
  }
}
</script>

<style scoped>
.manage-publishers {
  max-width: 1200px;
  margin: 0 auto;
}

.table th {
  font-weight: 600;
  background-color: #343a40;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.form-label {
  font-weight: 500;
  color: #495057;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table-responsive {
  border-radius: 0.375rem;
}
</style> 