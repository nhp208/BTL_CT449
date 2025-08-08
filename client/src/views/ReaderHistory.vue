<template>
  <div class="reader-history">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="text-center mb-3">
          <i class="fas fa-history me-2"></i>
          Lịch sử Mượn Trả Sách
        </h2>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <!-- Thống kê tổng quan -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <i class="fas fa-book fa-2x mb-2"></i>
                <h5 class="card-title">{{ totalBooks }} sách</h5>
                <p class="card-text">Tổng số sách đã mượn</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <i class="fas fa-check-circle fa-2x mb-2"></i>
                <h5 class="card-title">{{ returnedBooks }} sách</h5>
                <p class="card-text">Đã trả</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-warning text-white">
              <div class="card-body text-center">
                <i class="fas fa-clock fa-2x mb-2"></i>
                <h5 class="card-title">{{ borrowedBooks }} sách</h5>
                <p class="card-text">Đang mượn</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card bg-danger text-white">
              <div class="card-body text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <h5 class="card-title">{{ overdueBooks }} sách</h5>
                <p class="card-text">Quá hạn</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bộ lọc -->
        <div class="row mb-3">
          <div class="col-md-6">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                v-model="searchTerm" 
                placeholder="Tìm kiếm theo tên sách..."
              >
              <button class="btn btn-outline-secondary" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-6">
            <div class="btn-group" role="group">
              <button 
                type="button" 
                class="btn btn-outline-primary" 
                :class="{ 'active': statusFilter === 'all' }"
                @click="statusFilter = 'all'"
              >
                Tất cả
              </button>
              <button 
                type="button" 
                class="btn btn-outline-success" 
                :class="{ 'active': statusFilter === 'returned' }"
                @click="statusFilter = 'returned'"
              >
                Đã trả
              </button>
              <button 
                type="button" 
                class="btn btn-outline-warning" 
                :class="{ 'active': statusFilter === 'borrowed' }"
                @click="statusFilter = 'borrowed'"
              >
                Đang mượn
              </button>
              <button 
                type="button" 
                class="btn btn-outline-danger" 
                :class="{ 'active': statusFilter === 'overdue' }"
                @click="statusFilter = 'overdue'"
              >
                Quá hạn
              </button>
            </div>
          </div>
        </div>

        <!-- Bảng lịch sử -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-dark">
              <tr>
                <th>Mã sách</th>
                <th>Tên sách</th>
                <th>Ngày mượn</th>
                <th>Ngày trả</th>
                <th>Trạng thái</th>
                <th>Số ngày mượn</th>
                <th>Phạt quá hạn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="borrow in filteredHistory" :key="`${borrow.MaSach}-${borrow.NgayMuon}`">
                <td><strong>{{ borrow.MaSach }}</strong></td>
                <td>{{ borrow.TenSach }}</td>
                <td>{{ formatDate(borrow.NgayMuon) }}</td>
                <td>{{ borrow.NgayTra ? formatDate(borrow.NgayTra) : '-' }}</td>
                <td>
                  <span v-if="borrow.TrangThai === 'Đang mượn'" class="badge bg-warning">
                    <i class="fas fa-clock me-1"></i>
                    Đang mượn
                  </span>
                  <span v-else-if="borrow.TrangThai === 'Chờ duyệt'" class="badge bg-warning">
                    <i class="fas fa-clock me-1"></i>
                    Chờ duyệt
                  </span>
                  <span v-else-if="borrow.TrangThai === 'Đã trả'" class="badge bg-success">
                    <i class="fas fa-check me-1"></i>
                    Đã trả
                  </span>
                  <span v-else-if="borrow.TrangThai === 'Quá hạn'" class="badge bg-danger">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Quá hạn
                  </span>
                  <span v-else class="badge bg-secondary">
                    {{ borrow.TrangThai }}
                  </span>
                </td>
                <td>{{ calculateDays(borrow.NgayMuon, borrow.NgayTra) }} ngày</td>
                <td>
                  <span v-if="borrow.Phạt" class="text-danger fw-bold">
                    {{ formatPrice(borrow.Phạt) }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <button 
                    v-if="borrow.Phạt && borrow.TrangThai === 'Đã trả'"
                    class="btn btn-sm btn-info" 
                    @click="viewPenaltyDetails(borrow)"
                  >
                    <i class="fas fa-info-circle me-1"></i>
                    Chi tiết phạt
                  </button>
                  <span v-else class="text-muted">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredHistory.length === 0" class="text-center py-5">
          <i class="fas fa-history fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Không có lịch sử mượn sách</h5>
        </div>
      </div>
    </div>

    <!-- Modal chi tiết phạt -->
    <div class="modal fade" id="penaltyModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-triangle text-warning me-2"></i>
              Chi tiết Phạt Quá Hạn
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Thông tin sách:</h6>
                <p><strong>Mã sách:</strong> {{ selectedPenalty?.MaSach }}</p>
                <p><strong>Tên sách:</strong> {{ selectedPenalty?.TenSach }}</p>
                <p><strong>Ngày mượn:</strong> {{ formatDate(selectedPenalty?.NgayMuon) }}</p>
                <p><strong>Ngày trả:</strong> {{ formatDate(selectedPenalty?.NgayTra) }}</p>
              </div>
              <div class="col-md-6">
                <h6>Thông tin phạt:</h6>
                <p><strong>Số ngày quá hạn:</strong> {{ selectedPenalty?.SoNgayQuaHan }} ngày</p>
                <p><strong>Mức phạt:</strong> 5,000 VNĐ/ngày</p>
                <p><strong>Tổng tiền phạt:</strong> <span class="text-danger fw-bold">{{ formatPrice(selectedPenalty?.Phạt) }}</span></p>
              </div>
            </div>
            <div class="alert alert-info mt-3">
              <i class="fas fa-info-circle me-2"></i>
              <strong>Lưu ý:</strong> Phạt quá hạn được tính theo quy định của thư viện. 
              Vui lòng thanh toán phạt tại quầy thủ thư để được mượn sách tiếp.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
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
  name: 'ReaderHistory',
  data() {
    return {
      borrowHistory: [],
      loading: false,
      modalMessage: '',
      searchTerm: '',
      statusFilter: 'all',
      selectedPenalty: null
    }
  },
  computed: {
    filteredHistory() {
      let filtered = this.borrowHistory

      // Lọc theo trạng thái
      if (this.statusFilter !== 'all') {
        filtered = filtered.filter(borrow => {
          switch (this.statusFilter) {
            case 'returned':
              return borrow.TrangThai === 'Đã trả'
            case 'borrowed':
              return borrow.TrangThai === 'Đang mượn'
            case 'overdue':
              return borrow.TrangThai === 'Quá hạn'
            default:
              return true
          }
        })
      }

      // Lọc theo từ khóa tìm kiếm
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(borrow => 
          borrow.TenSach.toLowerCase().includes(term) ||
          borrow.MaSach.toLowerCase().includes(term)
        )
      }

      return filtered
    },
    totalBooks() {
      return this.borrowHistory.length
    },
    returnedBooks() {
      return this.borrowHistory.filter(b => b.TrangThai === 'Đã trả').length
    },
    borrowedBooks() {
      return this.borrowHistory.filter(b => b.TrangThai === 'Đang mượn').length
    },
    overdueBooks() {
      return this.borrowHistory.filter(b => b.TrangThai === 'Quá hạn').length
    }
  },
  async mounted() {
    await this.loadBorrowHistory()
  },
  methods: {
    async loadBorrowHistory() {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const response = await axios.get(`/api/muonsach/${user.MaDocGia}`)
        this.borrowHistory = (response.data || []).map(borrow => {
          // Tính toán phạt quá hạn
          const penalty = this.calculatePenalty(borrow)
          return {
            ...borrow,
            Phạt: penalty.amount,
            SoNgayQuaHan: penalty.days
          }
        })
      } catch (error) {
        console.error('Error loading borrow history:', error)
        this.borrowHistory = []
      }
    },
    
    calculatePenalty(borrow) {
      if (borrow.TrangThai !== 'Đã trả' && borrow.TrangThai !== 'Quá hạn') {
        return { amount: 0, days: 0 }
      }

      const borrowDate = new Date(borrow.NgayMuon)
      const returnDate = borrow.NgayTra ? new Date(borrow.NgayTra) : new Date()
      const dueDate = new Date(borrowDate)
      dueDate.setDate(dueDate.getDate() + 30) // Giả sử thời hạn mượn là 30 ngày

      if (returnDate > dueDate) {
        const daysOverdue = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24))
        const penaltyAmount = daysOverdue * 5000 // 5,000 VNĐ/ngày
        return { amount: penaltyAmount, days: daysOverdue }
      }

      return { amount: 0, days: 0 }
    },
    
    calculateDays(borrowDate, returnDate) {
      const start = new Date(borrowDate)
      const end = returnDate ? new Date(returnDate) : new Date()
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    },
    
    viewPenaltyDetails(borrow) {
      this.selectedPenalty = borrow
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('penaltyModal'))
        modal.show()
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
    
    formatPrice(price) {
      if (!price) return '-'
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

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.btn-group .btn.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}
</style> 