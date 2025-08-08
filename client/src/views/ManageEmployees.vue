<template>
  <div class="manage-employees">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="text-center mb-3">
          <i class="fas fa-user-shield me-2"></i>
          Quản lý Nhân viên
        </h2>
        <div class="row">
          <div class="col-md-6">
            <button class="btn btn-success" @click="showAddModal">
              <i class="fas fa-plus me-2"></i>
              Thêm nhân viên mới
            </button>
          </div>
          <div class="col-md-6 text-end">
            <span class="badge bg-primary fs-6">{{ employees.length }} nhân viên</span>
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
                <th>Mã nhân viên</th>
                <th>Họ tên</th>
                <th>Chức vụ</th>
                <th>Địa chỉ</th>
                <th>Số điện thoại</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in employees" :key="employee.MSNV">
                <td><strong>{{ employee.MSNV }}</strong></td>
                <td>{{ employee.HoTenNV }}</td>
                <td>{{ employee.ChucVu }}</td>
                <td>{{ employee.DiaChi }}</td>
                <td>{{ employee.SoDienThoai }}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1" @click="editEmployee(employee)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteEmployee(employee)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal thêm/sửa nhân viên -->
    <div class="modal fade" id="employeeModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEmployee">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Họ tên *</label>
                    <input type="text" class="form-control" v-model="employeeForm.HoTenNV" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Chức vụ *</label>
                    <select class="form-select" v-model="employeeForm.ChucVu" required>
                      <option value="">Chọn chức vụ</option>
                      <option value="Quản lý">Quản lý</option>
                      <option value="Nhân viên">Nhân viên</option>
                      <option value="Thủ thư">Thủ thư</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Địa chỉ *</label>
                    <input type="text" class="form-control" v-model="employeeForm.DiaChi" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Số điện thoại *</label>
                    <input type="tel" class="form-control" v-model="employeeForm.SoDienThoai" required>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Mật khẩu *</label>
                    <input type="password" class="form-control" v-model="employeeForm.Password" required>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveEmployee" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm nhân viên') }}
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
            <p>Bạn có chắc chắn muốn xóa nhân viên "<strong>{{ selectedEmployee?.HoTenNV }}</strong>"?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Đang xóa...' : 'Xóa nhân viên' }}
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
  name: 'ManageEmployees',
  data() {
    return {
      employees: [],
      loading: false,
      modalMessage: '',
      isEditing: false,
      selectedEmployee: null,
      employeeForm: {
        HoTenNV: '',
        ChucVu: '',
        DiaChi: '',
        SoDienThoai: '',
        Password: ''
      }
    }
  },
  async mounted() {
    await this.loadEmployees()
  },
  methods: {
    async loadEmployees() {
      try {
        const response = await axios.get('/api/nhanvien')
        this.employees = response.data || []
      } catch (error) {
        console.error('Error loading employees:', error)
        this.employees = []
      }
    },
    
    showAddModal() {
      this.isEditing = false
      this.resetForm()
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('employeeModal'))
        modal.show()
      }
    },
    
    editEmployee(employee) {
      this.isEditing = true
      this.selectedEmployee = employee
      // Loại bỏ _id khỏi dữ liệu form
      const { _id, ...employeeData } = employee
      this.employeeForm = { 
        ...employeeData, 
        Password: '' // Không hiển thị password cũ
      }
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('employeeModal'))
        modal.show()
      }
    },
    
    async saveEmployee() {
      this.loading = true
      
      try {
        if (this.isEditing) {
          const response = await axios.put(`/api/nhanvien/${this.selectedEmployee.MSNV}`, this.employeeForm)
          if (response.data.success) {
            this.showMessage('Cập nhật thông tin nhân viên thành công!')
            await this.loadEmployees()
            this.closeModal('employeeModal')
          }
        } else {
          const response = await axios.post('/api/nhanvien', this.employeeForm)
          if (response.data.success) {
            this.showMessage('Thêm nhân viên thành công!')
            await this.loadEmployees()
            this.closeModal('employeeModal')
          }
        }
      } catch (error) {
        console.error('Error saving employee:', error)
        this.showMessage('Có lỗi xảy ra khi lưu thông tin nhân viên')
      } finally {
        this.loading = false
      }
    },
    
    deleteEmployee(employee) {
      this.selectedEmployee = employee
      if (window.bootstrap) {
        const modal = new window.bootstrap.Modal(document.getElementById('deleteModal'))
        modal.show()
      }
    },
    
    async confirmDelete() {
      this.loading = true
      
      try {
        const response = await axios.delete(`/api/nhanvien/${this.selectedEmployee.MSNV}`)
        if (response.data.success) {
          this.showMessage('Xóa nhân viên thành công!')
          await this.loadEmployees()
          this.closeModal('deleteModal')
        }
      } catch (error) {
        console.error('Error deleting employee:', error)
        this.showMessage('Có lỗi xảy ra khi xóa nhân viên')
      } finally {
        this.loading = false
      }
    },
    
    resetForm() {
      this.employeeForm = {
        HoTenNV: '',
        ChucVu: '',
        DiaChi: '',
        SoDienThoai: '',
        Password: ''
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