<template>
  <div class="login-container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-header bg-primary text-white text-center">
            <h4 class="mb-0">
              <i class="fas fa-sign-in-alt me-2"></i>
              Đăng nhập
            </h4>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label">Vai trò</label>
                <select v-model="role" class="form-select" required>
                  <option value="">Chọn vai trò</option>
                  <option value="docgia">Độc giả</option>
                  <option value="nhanvien">Nhân viên</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">
                  {{ role === 'docgia' ? 'Mã độc giả' : 'Mã nhân viên' }}
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="username" 
                  :placeholder="role === 'docgia' ? 'VD: DG001' : 'VD: NV001'"
                  required
                >
              </div>

              <div class="mb-3" v-if="role === 'nhanvien'">
                <label class="form-label">Mật khẩu</label>
                <input 
                  type="password" 
                  class="form-control" 
                  v-model="password" 
                  placeholder="Nhập mật khẩu"
                  required
                >
              </div>

              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                </button>
              </div>
            </form>

            <div v-if="error" class="alert alert-danger mt-3">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { authStore } from '../store'

export default {
  name: 'Login',
  data() {
    return {
      role: '',
      username: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.post('/api/login', {
          username: this.username,
          password: this.password,
          role: this.role
        })

        if (response.data.success) {
          // Sử dụng store để login
          authStore.login(response.data.user, this.role)
          
          // Chuyển hướng dựa trên vai trò
          if (this.role === 'docgia') {
            this.$router.push('/books')
          } else {
            this.$router.push('/manage-books')
          }
        } else {
          this.error = response.data.message
        }
      } catch (error) {
        console.error('Login error:', error)
        this.error = 'Có lỗi xảy ra khi đăng nhập. Vui lòng kiểm tra kết nối mạng.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 70vh;
  align-items: center;
}

.card {
  border: none;
  border-radius: 15px;
  max-width: 400px;
  margin: 0 auto;
}

.card-header {
  border-radius: 15px 15px 0 0 !important;
  padding: 1rem;
}

.card-header h4 {
  font-size: 1.25rem;
  margin: 0;
  line-height: 1.2;
}

.form-control, .form-select {
  border-radius: 8px;
  height: 38px;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.btn {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  height: 38px;
}

.alert {
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.list-unstyled li {
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
}

h6 {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.small {
  font-size: 0.8rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .login-container {
    min-height: 60vh;
    padding: 1rem;
  }
  
  .card {
    margin: 0;
  }
}
</style> 