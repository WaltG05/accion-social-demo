<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <!-- Solo mostrar el contenido cuando globalConfig esté cargado -->
        <template v-if="globalConfig">
          <img v-if="logoUrl" :src="logoUrl" alt="Logo Organización" class="logo" />
          <div v-else>
            <h2>{{ nombreOrganizacion }}</h2>
            <p>Acción Social</p>
          </div>
        </template>
        <div v-else>
          <p>{{ nombreOrganizacion }}</p>
          <h2>Acción Social</h2>
        </div>
      </div>
      <div class="login-form">
        <p class="demo-aviso">
          Esta es una <strong>demostración con datos ficticios</strong>. No hay contraseñas ni
          información real: podés crear, editar y borrar sin consecuencias.
        </p>
        <button type="button" class="login-btn" :disabled="loading" @click="handleLogin">
          {{ loading ? 'Ingresando...' : 'Entrar como administrador (demo)' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/../config/auth'
import { globalConfig, fetchGlobalConfig, logoUrl } from '../../config/globalConfig.js'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)
const router = useRouter()
const { login } = useAuth()

// Al montar el componente, nos aseguramos de que la configuración se haya cargado.
onMounted(async () => {
  await fetchGlobalConfig()
})

const nombreOrganizacion = computed(() => {
  return globalConfig.value ? globalConfig.value.nombre_organizacion : 'Municipalidad'
})

const handleLogin = async () => {
  loading.value = true
  error.value = null
  try {
    await login()
    router.push('/home')
  } catch (err) {
    console.error('Login failed:', err)
    error.value = 'Credenciales incorrectas. Por favor, intente de nuevo.'
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1f9e26, #169770);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  margin-bottom: 30px;
}

.logo {
  /* width: 180px; */
  max-width: 250px;
  max-height: 80px;
  margin-bottom: 15px;
}

.login-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.login-header p {
  margin: 5px 0 0;
  color: #7f8c8d;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}

.input-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #169770;
  box-shadow: 0 0 0 3px rgba(22, 151, 112, 0.2);
}

.error-message {
  color: #e74c3c;
  background: #fbe9e7;
  border: 1px solid #ffab91;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.login-btn {
  background: linear-gradient(135deg, #1f9e26, #169770);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(22, 151, 112, 0.3);
}

.login-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}
.demo-aviso { font-size: 0.9rem; color: #555; line-height: 1.5; margin: 0 0 1rem; text-align: center; }
</style>
