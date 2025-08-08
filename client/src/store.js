import { reactive } from 'vue'

// Simple reactive store for authentication
export const authStore = reactive({
  isLoggedIn: false,
  userRole: null,
  user: null,
  
  init() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    this.userRole = localStorage.getItem('userRole')
    this.user = JSON.parse(localStorage.getItem('user') || 'null')
  },
  
  login(user, role) {
    this.isLoggedIn = true
    this.userRole = role
    this.user = user
    
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userRole', role)
    localStorage.setItem('user', JSON.stringify(user))
  },
  
  logout() {
    this.isLoggedIn = false
    this.userRole = null
    this.user = null
    
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
  },
  
  getUserName() {
    if (this.user && this.userRole === 'docgia') {
      return `${this.user.HoLot || ''} ${this.user.Ten || ''}`.trim()
    } else if (this.user && this.userRole === 'nhanvien') {
      return this.user.HoTenNV || ''
    }
    return ''
  }
})

// Initialize store on load
authStore.init() 