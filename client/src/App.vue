<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <i class="fas fa-book me-2"></i>
          Thư viện Online
        </router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Trang chủ</router-link>
            </li>
            <li class="nav-item" v-if="!authStore.isLoggedIn">
              <router-link class="nav-link" to="/login">Đăng nhập</router-link>
            </li>
            <li class="nav-item" v-if="authStore.isLoggedIn && authStore.userRole === 'docgia'">
              <router-link class="nav-link" to="/books">Xem sách</router-link>
            </li>
            <li class="nav-item" v-if="authStore.isLoggedIn && authStore.userRole === 'docgia'">
              <router-link class="nav-link" to="/my-books">Sách đang mượn</router-link>
            </li>
            <li class="nav-item" v-if="authStore.isLoggedIn && authStore.userRole === 'docgia'">
              <router-link class="nav-link" to="/reader-history">Lịch sử mượn trả</router-link>
            </li>
            <li class="nav-item" v-if="authStore.isLoggedIn && authStore.userRole === 'nhanvien'">
              <router-link class="nav-link" to="/manage-books">Quản lý sách</router-link>
            </li>
            <li class="nav-item" v-if="authStore.isLoggedIn && authStore.userRole === 'nhanvien'">
              <router-link class="nav-link" to="/manage-borrows">Quản lý mượn trả</router-link>
            </li>
            <li class="nav-item" v-if="authStore.isLoggedIn && authStore.userRole === 'nhanvien'">
              <router-link class="nav-link" to="/approve-requests">Duyệt yêu cầu</router-link>
            </li>
            <li class="nav-item" v-if="authStore.isLoggedIn && authStore.userRole === 'nhanvien'">
              <router-link class="nav-link" to="/manage-readers">Quản lý độc giả</router-link>
            </li>
            <li class="nav-item" v-if="authStore.isLoggedIn && authStore.userRole === 'nhanvien'">
              <router-link class="nav-link" to="/manage-publishers">Quản lý nhà xuất bản</router-link>
            </li>
            <li class="nav-item" v-if="authStore.isLoggedIn && authStore.userRole === 'nhanvien' && authStore.user?.ChucVu === 'Quản lý'">
              <router-link class="nav-link" to="/manage-employees">Quản lý nhân viên</router-link>
            </li>
          </ul>
          
          <ul class="navbar-nav" v-if="authStore.isLoggedIn">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                {{ authStore.getUserName() }}
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="logout">Đăng xuất</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="container mt-4">
      <router-view />
    </main>

    <footer class="bg-light mt-5 py-4">
      <div class="container text-center">
        <p class="mb-0">&copy; 2024 Hệ thống Quản lý Thư viện. Được phát triển với Vue.js, Node.js và Bootstrap.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { authStore } from './store'

export default {
  name: 'App',
  data() {
    return {
      authStore
    }
  },
  methods: {
    logout() {
      authStore.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.4;
}

/* ===== NAVBAR STYLING ===== */
.navbar {
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 0.75rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
  color: #fff !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  transform: translateY(-1px);
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.navbar-nav .nav-link {
  color: rgba(255,255,255,0.9) !important;
  font-weight: 500;
  padding: 0.75rem 1rem !important;
  margin: 0 0.25rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
}

.navbar-nav .nav-link:hover {
  color: #fff !important;
  background-color: rgba(255,255,255,0.1);
  transform: translateY(-1px);
}

.navbar-nav .nav-link.router-link-active {
  background-color: rgba(255,255,255,0.2);
  color: #fff !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-toggler {
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  background-color: rgba(255,255,255,0.1);
}

.navbar-toggler:focus {
  box-shadow: none;
  background-color: rgba(255,255,255,0.2);
}

.dropdown-menu {
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
}

/* ===== CONTAINER STYLING ===== */
.container {
  max-width: 1200px;
}

/* ===== CARD STYLING ===== */
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: none;
  border-radius: 8px;
}

/* ===== BUTTON STYLING ===== */
.btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* ===== TABLE STYLING ===== */
.table {
  border-radius: 8px;
  overflow: hidden;
}

/* ===== FORM ELEMENTS STYLING ===== */
.form-control, .form-select {
  height: 38px;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}

/* ===== ALERT STYLING ===== */
.alert {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border-radius: 6px;
  border: none;
}

/* ===== HEADING STYLING ===== */
h1, h2, h3, h4, h5, h6 {
  line-height: 1.2;
  color: #2c3e50;
}

/* ===== SPACING UTILITIES ===== */
.mb-3 {
  margin-bottom: 1rem !important;
}

.mt-4 {
  margin-top: 1.5rem !important;
}

/* ===== FOOTER STYLING ===== */
footer {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-top: 1px solid #e9ecef;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .navbar-brand {
    font-size: 1.25rem;
  }
  
  .navbar-nav .nav-link {
    padding: 0.5rem 0.75rem !important;
    margin: 0.25rem 0;
  }
  
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* ===== ANIMATIONS ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.router-view {
  animation: fadeIn 0.3s ease-out;
}

/* ===== CUSTOM SCROLLBAR ===== */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 