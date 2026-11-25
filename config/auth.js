// Sesión de demostración: no hay contraseñas ni usuarios reales.
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const CLAVE = 'accion-social-demo-sesion'
const sesion = ref(sessionStorage.getItem(CLAVE) === '1')

export function useAuth() {
  const router = useRouter()
  const isAuthenticated = computed(() => sesion.value)
  const isAdmin = computed(() => sesion.value)
  const isReadOnly = computed(() => false)
  const user = ref({ role: { name: 'Administrator' } })

  const login = async () => {
    sesion.value = true
    sessionStorage.setItem(CLAVE, '1')
  }
  const logout = async () => {
    sesion.value = false
    sessionStorage.removeItem(CLAVE)
    router.replace('/login')
  }
  return { user, isAuthenticated, isAdmin, isReadOnly, login, logout }
}
