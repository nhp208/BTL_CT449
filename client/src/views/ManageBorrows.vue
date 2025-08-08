<template>
  <div class="manage-borrows">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="text-center mb-3">
          <i class="fas fa-clipboard-list me-2"></i>
          Quản lý Mượn Trả Sách
        </h2>
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                v-model="searchTerm" 
                placeholder="Tìm kiếm theo tên sách hoặc độc giả..."
              >
              <button class="btn btn-outline-secondary" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-6 text-end">
            <div class="btn-group" role="group">
              <button 
                type="button" 
                class="btn" 
                :class="filterStatus === '' ? 'btn-primary' : 'btn-outline-primary'"
                @click="filterStatus = ''"
              >
                Tất cả
              </button>
              <button 
                type="button" 
                class="btn" 
                :class="filterStatus === 'Đang mượn' ? 'btn-warning' : 'btn-outline-warning'"
                @click="filterStatus = 'Đang mượn'"
              >
                Đang mượn
              </button>
              <button 
                type="button" 
                class="btn" 
                :class="filterStatus === 'Đã trả' ? 'btn-success' : 'btn-outline-success'"
                @click="filterStatus = 'Đã trả'"
              >
                Đã trả
              </button>
              <button 
                type="button" 
                class="btn" 
                :class="filterStatus === 'Chờ duyệt' ? 'btn-warning' : 'btn-outline-warning'"
                @click="filterStatus = 'Chờ duyệt'"
              >
                Chờ duyệt
              </button>
              <button 
                type="button" 
                class="btn" 
                :class="filterStatus === 'Quá hạn' ? 'btn-danger' : 'btn-outline-danger'"
                @click="filterStatus = 'Quá hạn'"
              >
                Quá hạn
              </button>
            </div>
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
                <th>Tên độc giả</th>
                <th>Mã sách</th>
                <th>Tên sách</th>
                <th>Ngày mượn</th>
                <th>Ngày trả</th>
                <th>Trạng thái</th>
                <th>Phạt quá hạn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="borrow in filteredBorrows" :key="`${borrow.MaDocGia}-${borrow.MaSach}-${borrow.NgayMuon}`">
                <td><strong>{{ borrow.MaDocGia }}</strong></td>
                <td>{{ borrow.TenDocGia }}</td>
                <td><strong>{{ borrow.MaSach }}</strong></td>
                <td>{{ borrow.TenSach }}</td>
                <td>{{ formatDate(borrow.NgayMuon) }}</td>
                <td>{{ borrow.NgayTra ? formatDate(borrow.NgayTra) : '-' }}</td>
                <td>
                  <span :class="getStatusClass(borrow.TrangThai)">
                    {{ borrow.TrangThai }}
                  </span>
                </td>
                <td>
                  <span v-if="(borrow.TrangThai === 'Đang mượn' && isOverdue(borrow.NgayMuon)) || borrow.TrangThai === 'Quá hạn'" 
                        class="badge bg-danger">
                    Quá hạn {{ getOverdueDays(borrow.NgayMuon) }} ngày
                  </span>
                  <span v-else-if="borrow.TrangThai === 'Đã trả' && isOverdue(borrow.NgayMuon)" 
                        class="badge bg-warning">
                    Đã trả quá hạn
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <button 
                    v-if="borrow.TrangThai === 'Đang mượn'"
                    class="btn btn-sm btn-success me-1" 
                    @click="processReturn(borrow)"
                    :disabled="loading"
                  >
                    <i class="fas fa-check me-1"></i>
                    Xử lý trả
                  </button>
                  <button 
                    v-if="(borrow.TrangThai === 'Đang mượn' && isOverdue(borrow.NgayMuon)) || borrow.TrangThai === 'Quá hạn'"
                    class="btn btn-sm btn-danger" 
                    @click="processPenalty(borrow)"
                    :disabled="loading"
                  >
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Xử lý phạt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="filteredBorrows.length === 0" class="text-center py-5">
          <i class="fas fa-clipboard fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Không có dữ liệu mượn trả</h5>
        </div>
      </div>
    </div>

    <!-- Modal xử lý phạt -->
    <div class="modal fade" id="penaltyModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Xử lý Phạt Quá Hạn
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <strong>Sách quá hạn:</strong> {{ selectedBorrow?.TenSach }}
            </div>
            <div class="alert alert-info">
              <strong>Độc giả:</strong> {{ selectedBorrow?.TenDocGia }}
            </div>
            <div class="alert alert-danger">
              <strong>Số ngày quá hạn:</strong> {{ selectedBorrow ? getOverdueDays(selectedBorrow.NgayMuon) : 0 }} ngày
            </div>
            <div class="mb-3">
              <label class="form-label">Số tiền phạt (VNĐ)</label>
              <input 
                type="number" 
                class="form-control" 
                v-model="penaltyAmount" 
                :placeholder="`${selectedBorrow ? getOverdueDays(selectedBorrow.NgayMuon) * 5000 : 0}`"
              >
              <small class="form-text text-muted">Mặc định: 5,000 VNĐ/ngày quá hạn</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Ghi chú</label>
              <textarea class="form-control" v-model="penaltyNote" rows="3" placeholder="Ghi chú về việc xử lý phạt..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmPenalty" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Đang xử lý...' : 'Xác nhận phạt' }}
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
  name: 'ManageBorrows',
  data() {
    return {
      borrows: [],
      searchTerm: '',
      filterStatus: '',
      loading: false,
      modalMessage: '',
      selectedBorrow: null,
      penaltyAmount: 0,
      penaltyNote: ''
    }
  },
  computed: {
    filteredBorrows() {
      let filtered = this.borrows
      
      if (this.filterStatus) {
        filtered = filtered.filter(borrow => borrow.TrangThai === this.filterStatus)
      }
      
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(borrow => 
          borrow.TenSach.toLowerCase().includes(term) ||
          borrow.TenDocGia.toLowerCase().includes(term) ||
          borrow.MaSach.toLowerCase().includes(term) ||
          borrow.MaDocGia.toLowerCase().includes(term)
        )
      }
      
      return filtered
    }
  },
  async mounted() {
    await this.loadBorrows()
  },
  methods: {
    async loadBorrows() {
      try {
        const response = await axios.get('/api/muonsach')
        this.borrows = response.data || []
      } catch (error) {
        console.error('Error loading borrows:', error)
        this.borrows = []
      }
    },
    
    async processReturn(borrow) {
      this.loading = true
      
      try {
        const response = await axios.post('/api/trasach', {
          MaDocGia: borrow.MaDocGia,
          MaSach: borrow.MaSach
        })
        
        if (response.data.success) {
          this.showMessage('Xử lý trả sách thành công!')
          await this.loadBorrows()
        } else {
          this.showMessage(response.data.message)
        }
      } catch (error) {
        console.error('Error processing return:', error)
        this.showMessage('Có lỗi xảy ra khi xử lý trả sách')
      } finally {
        this.loading = false
      }
    },
    
    processPenalty(borrow) {
      this.selectedBorrow = borrow
      this.penaltyAmount = this.getOverdueDays(borrow.NgayMuon) * 5000
      this.penaltyNote = ''
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('penaltyModal'))
        modal.show()
      }
    },
    
    async confirmPenalty() {
      this.loading = true
      
      try {
        const response = await axios.post('/api/xuly-phat', {
          MaDocGia: this.selectedBorrow.MaDocGia,
          MaSach: this.selectedBorrow.MaSach,
          penaltyAmount: this.penaltyAmount,
          penaltyNote: this.penaltyNote
        })
        
        if (response.data.success) {
          this.showMessage(response.data.message)
          this.closeModal('penaltyModal')
          await this.loadBorrows() // Reload danh sách
        } else {
          this.showMessage(response.data.message)
        }
      } catch (error) {
        console.error('Error processing penalty:', error)
        this.showMessage('Có lỗi xảy ra khi xử lý phạt')
      } finally {
        this.loading = false
      }
    },
    
    isOverdue(borrowDate) {
      const borrow = new Date(borrowDate)
      const today = new Date()
      const diffTime = today - borrow
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 30 // Giả sử thời hạn mượn là 30 ngày
    },
    
    getOverdueDays(borrowDate) {
      const borrow = new Date(borrowDate)
      const today = new Date()
      const diffTime = today - borrow
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays - 30)
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
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'Đang mượn':
          return 'badge bg-warning'
        case 'Chờ duyệt':
          return 'badge bg-warning'
        case 'Đã trả':
          return 'badge bg-success'
        case 'Quá hạn':
          return 'badge bg-danger'
        default:
          return 'badge bg-secondary'
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

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.btn-group .btn:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}
</style> 