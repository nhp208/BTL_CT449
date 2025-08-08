import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Books from '../views/Books.vue'
import MyBooks from '../views/MyBooks.vue'
import ManageBooks from '../views/ManageBooks.vue'
import ManageBorrows from '../views/ManageBorrows.vue'
import ApproveRequests from '../views/ApproveRequests.vue'
import ManageReaders from '../views/ManageReaders.vue'
import ManageEmployees from '../views/ManageEmployees.vue'
import ManagePublishers from '../views/ManagePublishers.vue'
import ReaderHistory from '../views/ReaderHistory.vue'
import { authStore } from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/books',
    name: 'Books',
    component: Books,
    meta: { requiresAuth: true, role: 'docgia' }
  },
  {
    path: '/my-books',
    name: 'MyBooks',
    component: MyBooks,
    meta: { requiresAuth: true, role: 'docgia' }
  },
  {
    path: '/reader-history',
    name: 'ReaderHistory',
    component: ReaderHistory,
    meta: { requiresAuth: true, role: 'docgia' }
  },
  {
    path: '/manage-books',
    name: 'ManageBooks',
    component: ManageBooks,
    meta: { requiresAuth: true, role: 'nhanvien' }
  },
  {
    path: '/manage-borrows',
    name: 'ManageBorrows',
    component: ManageBorrows,
    meta: { requiresAuth: true, role: 'nhanvien' }
  },
  {
    path: '/approve-requests',
    name: 'ApproveRequests',
    component: ApproveRequests,
    meta: { requiresAuth: true, role: 'nhanvien' }
  },
  {
    path: '/manage-readers',
    name: 'ManageReaders',
    component: ManageReaders,
    meta: { requiresAuth: true, role: 'nhanvien' }
  },
  {
    path: '/manage-employees',
    name: 'ManageEmployees',
    component: ManageEmployees,
    meta: { requiresAuth: true, role: 'nhanvien', adminOnly: true }
  },
  {
    path: '/manage-publishers',
    name: 'ManagePublishers',
    component: ManagePublishers,
    meta: { requiresAuth: true, role: 'nhanvien' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.role && to.meta.role !== authStore.userRole) {
    next('/')
  } else if (to.meta.adminOnly && authStore.user?.ChucVu !== 'Quản lý') {
    next('/')
  } else {
    next()
  }
})

export default router 