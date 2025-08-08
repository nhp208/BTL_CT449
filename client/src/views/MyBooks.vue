<template>
  <div class="my-books">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="text-center mb-3">
          <i class="fas fa-user-books me-2"></i>
          Sách Đang Mượn
        </h2>
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
                <th>Ngày mượn</th>
                <th>Ngày trả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="borrow in currentBorrows" :key="`${borrow.MaSach}-${borrow.NgayMuon}`">
                <td><strong>{{ borrow.MaSach }}</strong></td>
                <td>{{ borrow.TenSach }}</td>
                <td>{{ formatDate(borrow.NgayMuon) }}</td>
                <td>{{ borrow.NgayTra ? formatDate(borrow.NgayTra) : '-' }}</td>
                <td>
                  <span v-if="borrow.TrangThai === 'Đang mượn'" class="badge bg-success">
                    <i class="fas fa-check me-1"></i>
                    Đang mượn
                  </span>
                  <span v-else-if="borrow.TrangThai === 'Chờ duyệt'" class="badge bg-warning">
                    <i class="fas fa-clock me-1"></i>
                    Chờ duyệt
                  </span>
                  <span v-else-if="borrow.TrangThai === 'Quá hạn'" class="badge bg-danger">
                    <i class="fas fa-exclamation-triangle me-1"></i>
                    Quá hạn
                  </span>
                  <span v-else class="text-muted">Đã trả</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="currentBorrows.length === 0" class="text-center py-5">
          <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Bạn chưa mượn sách nào</h5>
          <p class="text-muted">Hãy mượn sách để xem danh sách sách đang mượn tại đây</p>
          <router-link to="/books" class="btn btn-primary">
            <i class="fas fa-search me-2"></i>
            Xem sách có sẵn
          </router-link>
        </div>
        
        <div v-else-if="hasPendingRequests" class="alert alert-warning mt-3">
          <i class="fas fa-clock me-2"></i>
          <strong>Lưu ý:</strong> Bạn có {{ pendingCount }} yêu cầu mượn sách đang chờ nhân viên duyệt. 
          Sách sẽ chỉ được mượn sau khi được duyệt. Để trả sách, vui lòng liên hệ nhân viên thư viện.
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
  name: 'MyBooks',
  data() {
    return {
      borrowHistory: [],
      loading: false,
      modalMessage: ''
    }
  },
  async mounted() {
    await this.loadBorrowHistory()
  },
  computed: {
    hasPendingRequests() {
      return this.borrowHistory.some(borrow => borrow.TrangThai === 'Chờ duyệt')
    },
    pendingCount() {
      return this.borrowHistory.filter(borrow => borrow.TrangThai === 'Chờ duyệt').length
    },
    // Chỉ hiển thị sách đang mượn (không bao gồm đã trả)
    currentBorrows() {
      return (this.borrowHistory || []).filter(borrow => 
        borrow.TrangThai === 'Đang mượn' || 
        borrow.TrangThai === 'Chờ duyệt' || 
        borrow.TrangThai === 'Quá hạn'
      )
    }
  },
  methods: {
    async loadBorrowHistory() {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const response = await axios.get(`/api/muonsach/${user.MaDocGia}`)
        this.borrowHistory = response.data || []
      } catch (error) {
        console.error('Error loading borrow history:', error)
        this.borrowHistory = []
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