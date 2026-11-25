<script>
import { useAuth } from '@/../config/auth.js'
import { onMounted, computed } from 'vue'
import { restablecerDemo } from '@/mock/store'
import { globalConfig, fetchGlobalConfig, logoUrl } from '../../config/globalConfig.js'

export default {
  name: 'compNav',
  data() {
    return {
      menuAbierto: false,
    }
  },
  setup() {
    const { isAuthenticated, logout } = useAuth()

    onMounted(async () => {
      await fetchGlobalConfig();
    });

    const nombreOrganizacion = computed(() => {
      return globalConfig.value ? globalConfig.value.nombre_organizacion : 'Acción Social';
    });

    return { isAuthenticated, logout, nombreOrganizacion, logoUrl, globalConfig }
  },
  methods: {
    restablecer() {
      restablecerDemo()
      window.location.assign('/home')
    },
    toggleMenu() {
      this.menuAbierto = !this.menuAbierto
    },
  },
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-ban">
      <template v-if="globalConfig">
        <!-- <img v-if="logoUrl" :src="logoUrl" alt="Logo Organización" class="navbar-logo" /> -->
        <span>{{ nombreOrganizacion }} - Acción Social</span>
      </template>
      <!-- <span v-else>Cargando...</span> -->
    </div>

    <!-- Boton hamburguesa para movil -->
    <button class="btn-menu" @click="toggleMenu" aria-label="Toggle Menu">
      <span :class="{ linea: true, linea1: true, abierto: menuAbierto }"></span>
      <span :class="{ linea: true, linea2: true, abierto: menuAbierto }"></span>
      <span :class="{ linea: true, linea3: true, abierto: menuAbierto }"></span>
    </button>

    <ul v-if="isAuthenticated" :class="['navbar-menu', { activo: menuAbierto }]">
      <router-link to="/home" custom v-slot="{ href, navigate, isActive }">
        <li :class="{ 'link-activo': isActive }">
          <a :href="href" @click="navigate">Dashboard</a>
        </li>
      </router-link>
      <router-link to="/personas" custom v-slot="{ href, navigate, isActive }">
        <li :class="{ 'link-activo': isActive }">
          <a :href="href" @click="navigate">Personas</a>
        </li>
      </router-link>
      <router-link to="/incidencias" custom v-slot="{ href, navigate, isActive }">
        <li :class="{ 'link-activo': isActive }">
          <a :href="href" @click="navigate">Incidencias</a>
        </li>
      </router-link>
      <li>
        <a @click="restablecer" class="logout-btn">Restablecer demo</a>
      </li>
      <li>
        <a @click="logout" class="logout-btn">Cerrar Sesión</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  padding: 1rem;
  margin: 0;
  color: white;
  position: relative;
}
.navbar-ban {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* 12px */
  font-weight: bold;
  font-size: 1.1rem;
}
.navbar-logo {
  height: 60px;
  width: auto;
}

.navbar-ban2 {
  display: none;
}
.navbar-menu {
  list-style: none;
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
  transition: max-height 0.5s ease;
}
.navbar-menu li a {
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 4px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}
.navbar-menu li a:hover {
  background: #33c27bd0;
  /* padding: 6px; */
  /* border-radius: 5px; */
  transform: scale(1.04);
}
.navbar-menu li.link-activo a {
  background-color: #1f9e26;
  font-weight: bold;
}

.logout-btn {
  background-color: #c82333;
  cursor: pointer;
}

/* Boton hamburguesa - oculto en desktop */
.btn-menu {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 28px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;
}
.linea {
  width: 28px;
  height: 4px;
  background-color: white;
  border-radius: 2px;
  transition:
    transform 0.4s ease,
    opacity 0.2s ease;
  position: relative;
  transform-origin: 1px;
}
.linea1.abierto {
  transform: rotate(45deg);
  top: -1px;
  position: relative;
}
.linea2.abierto {
  opacity: 0;
}
.linea3.abierto {
  transform: rotate(-45deg);
  top: 1px;
  position: relative;
}
@media (max-width: 768px) {
  .btn-menu {
    display: flex;
  }
  .navbar-ban {
    display: block;
    margin-right: 10px;
    font-size: 0.9rem;
  }
  .navbar-ban span {
    display: none; /* Ocultamos el texto en móvil para dar más espacio */
  }

  .navbar-menu {
    flex-direction: column;
    background-color: #2c3e50;
    box-shadow: 0px 0px 10px rgba(20, 20, 20, 0.699);
    position: absolute;
    top: 60px;
    right: 0;
    width: 200px;
    max-height: 0;
    overflow: hidden;
    border-radius: 8px 0 0 8px;
    z-index: 1;
  }
  .navbar-menu.activo {
    max-height: 500px;
  }
  .navbar-menu li {
    margin: 0;
    border-bottom: 1px solid #3b4a5a;
  }
  .navbar-menu li a {
    display: block;
    padding: 8px 16px;
    border-radius: 0;
  }
  .navbar-menu li.link-activo a {
    border-radius: 0;
  }
}
</style>
