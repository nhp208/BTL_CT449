<template>
  <div class="approve-requests">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="text-center mb-3">
          <i class="fas fa-clipboard-check me-2"></i>
          Duyệt Yêu Cầu Mượn Sách
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
            <span class="badge bg-warning fs-6">{{ filteredRequests.length }} yêu cầu chờ duyệt</span>
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
                <th>Ngày yêu cầu</th>
                <th>Số quyển có sẵn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in filteredRequests" :key="`${request.MaDocGia}-${request.MaSach}-${request.NgayMuon}`">
                <td><strong>{{ request.MaDocGia }}</strong></td>
                <td>{{ request.TenDocGia }}</td>
                <td><strong>{{ request.MaSach }}</strong></td>
                <td>{{ request.TenSach }}</td>
                <td>{{ formatDate(request.NgayMuon) }}</td>
                <td>
                  <span :class="request.SoQuyen > 0 ? 'badge bg-success' : 'badge bg-danger'">
                    {{ request.SoQuyen }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-success me-1" 
                    @click="approveRequest(request)"
                    :disabled="request.SoQuyen <= 0 || loading"
                  >
                    <i class="fas fa-check me-1"></i>
                    Duyệt
                  </button>
                  <button 
                    class="btn btn-sm btn-danger" 
                    @click="rejectRequest(request)"
                    :disabled="loading"
                  >
                    <i class="fas fa-times me-1"></i>
                    Từ chối
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="filteredRequests.length === 0" class="text-center py-5">
          <i class="fas fa-clipboard-check fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Không có yêu cầu nào chờ duyệt</h5>
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
  name: 'ApproveRequests',
  data() {
    return {
      requests: [],
      searchTerm: '',
      loading: false,
      modalMessage: ''
    }
  },
  computed: {
    filteredRequests() {
      if (!this.searchTerm) return this.requests
      
      const term = this.searchTerm.toLowerCase()
      return this.requests.filter(request => 
        request.TenSach.toLowerCase().includes(term) ||
        request.TenDocGia.toLowerCase().includes(term) ||
        request.MaSach.toLowerCase().includes(term) ||
        request.MaDocGia.toLowerCase().includes(term)
      )
    }
  },
  async mounted() {
    await this.loadRequests()
  },
  methods: {
    async loadRequests() {
      try {
        const response = await axios.get('/api/yeucau-choduyet')
        this.requests = response.data || []
      } catch (error) {
        console.error('Error loading requests:', error)
        this.requests = []
      }
    },
    
    async approveRequest(request) {
      this.loading = true
      
      try {
        const response = await axios.post('/api/duyet-muonsach', {
          MaDocGia: request.MaDocGia,
          MaSach: request.MaSach,
          action: 'approve'
        })
        
        if (response.data.success) {
          this.showMessage('Đã duyệt yêu cầu mượn sách thành công!')
          await this.loadRequests()
        } else {
          this.showMessage(response.data.message)
        }
      } catch (error) {
        console.error('Error approving request:', error)
        this.showMessage('Có lỗi xảy ra khi duyệt yêu cầu')
      } finally {
        this.loading = false
      }
    },
    
    async rejectRequest(request) {
      this.loading = true
      
      try {
        const response = await axios.post('/api/duyet-muonsach', {
          MaDocGia: request.MaDocGia,
          MaSach: request.MaSach,
          action: 'reject'
        })
        
        if (response.data.success) {
          this.showMessage('Đã từ chối yêu cầu mượn sách!')
          await this.loadRequests()
        } else {
          this.showMessage(response.data.message)
        }
      } catch (error) {
        console.error('Error rejecting request:', error)
        this.showMessage('Có lỗi xảy ra khi từ chối yêu cầu')
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