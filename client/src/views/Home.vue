<template>
  <div class="home">
    <div class="row">
      <div class="col-12">
        <div class="jumbotron bg-primary text-white rounded p-5 mb-4">
          <h1 class="display-4">Chào mừng đến với Thư viện Online</h1>
          <p class="lead">Hệ thống quản lý thư viện hiện đại với giao diện thân thiện</p>
          <hr class="my-4">
          <p>Khám phá kho tàng sách phong phú và quản lý việc mượn trả sách một cách dễ dàng.</p>
          <router-link v-if="!isLoggedIn" class="btn btn-light btn-lg" to="/login">
            Đăng nhập ngay
          </router-link>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="fas fa-book fa-3x text-primary mb-3"></i>
            <h5 class="card-title">Xem và Mượn Sách</h5>
            <p class="card-text">Độc giả có thể xem danh sách sách có sẵn và đăng ký mượn sách một cách dễ dàng.</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="fas fa-history fa-3x text-success mb-3"></i>
            <h5 class="card-title">Quản lý Lịch sử</h5>
            <p class="card-text">Theo dõi lịch sử mượn sách, trả sách và quản lý tài khoản cá nhân.</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <i class="fas fa-user-shield fa-3x text-warning mb-3"></i>
            <h5 class="card-title">Quản lý Hệ thống</h5>
            <p class="card-text">Nhân viên thư viện có thể quản lý sách, theo dõi mượn trả và xử lý phạt quá hạn.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-5">
      <div class="col-12">
        <h2 class="text-center mb-4">Thông tin Hệ thống</h2>
        <div class="row">
          <div class="col-md-6">
            <h5>Chức năng cho Độc giả:</h5>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">
                <i class="fas fa-check text-success me-2"></i>
                Xem danh sách sách có sẵn
              </li>
              <li class="list-group-item">
                <i class="fas fa-check text-success me-2"></i>
                Đăng ký mượn sách (chờ duyệt)
              </li>
              <li class="list-group-item">
                <i class="fas fa-check text-success me-2"></i>
                Xem lịch sử mượn sách chi tiết
              </li>
              <li class="list-group-item">
                <i class="fas fa-check text-success me-2"></i>
                Xem sách đang mượn và theo dõi trạng thái
              </li>
              <li class="list-group-item">
                <i class="fas fa-check text-success me-2"></i>
                Theo dõi phạt quá hạn và thanh toán
              </li>
            </ul>
          </div>
          
          <div class="col-md-6">
            <h5>Chức năng cho Quản lý:</h5>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">
                <i class="fas fa-check text-success me-2"></i>
                Thêm, sửa, xóa sách
              </li>
              <li class="list-group-item">
                <i class="fas fa-check text-success me-2"></i>
                Xem trạng thái mượn trả và xử lý trả sách
              </li>
              <li class="list-group-item">
                <i class="fas fa-check text-success me-2"></i>
                Duyệt yêu cầu mượn sách
              </li>
              <li class="list-group-item">
                <i class="fas fa-check text-success me-2"></i>
                Quản lý độc giả
              </li>
              <li class="list-group-item" v-if="authStore.user?.ChucVu === 'Quản lý'">
                <i class="fas fa-check text-success me-2"></i>
                Quản lý nhân viên (Chỉ Admin)
              </li>
              <li class="list-group-item">
                <i class="fas fa-check text-success me-2"></i>
                Xử lý phạt sách quá hạn
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authStore } from '../store'

export default {
  name: 'Home',
  data() {
    return {
      authStore
    }
  },
  computed: {
    isLoggedIn() {
      return this.authStore.isLoggedIn
    }
  }
}
</script>

<style scoped>
.jumbotron {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.fas {
  color: #007bff;
}
</style> 