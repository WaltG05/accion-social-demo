<template>
  <div class="container-page">
    <div class="contenedor-admin">
      <header class="page-header">
        <h1>Administración del Sistema</h1>
        <p>Gestión de usuarios, configuración y mantenimiento</p>
      </header>

      <!-- Pestañas de navegación -->
      <div class="tabs-container">
        <button
          :class="['tab-button', { active: activeTab === 'dashboard' }]"
          @click="activeTab = 'dashboard'"
        >
          Panel General
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'usuarios' }]"
          @click="activeTab = 'usuarios'"
        >
          Usuarios
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'configuracion' }]"
          @click="activeTab = 'configuracion'"
        >
          Configuración
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'logs' }]"
          @click="activeTab = 'logs'"
        >
          Auditoría
        </button>
      </div>

      <!-- PANEL GENERAL -->
      <div v-if="activeTab === 'dashboard'" class="tab-content">
        <h2>Panel de Administración</h2>
        <div class="cards-grid">
          <div class="admin-card">
            <div class="card-header">
              <div class="card-icon">👥</div>
              <h3 class="card-title">Gestión de Usuarios</h3>
            </div>
            <p class="card-description">
              Administrar trabajadores sociales, psicólogos y personal administrativo. Controlar
              accesos y permisos del sistema.
            </p>
            <div class="card-actions">
              <button class="btn btn-primary" @click="activeTab = 'usuarios'">Gestionar</button>
            </div>
          </div>

          <div class="admin-card">
            <div class="card-header">
              <div class="card-icon">⚙️</div>
              <h3 class="card-title">Configuración General</h3>
            </div>
            <p class="card-description">
              Configurar categorías de incidencias, estados de incidencias, programas sociales disponibles y
              parámetros del sistema.
            </p>
            <div class="card-actions">
              <button class="btn btn-primary" @click="activeTab = 'configuracion'">
                Configurar
              </button>
            </div>
          </div>

          <div class="admin-card">
            <div class="card-header">
              <div class="card-icon">🔒</div>
              <h3 class="card-title">Seguridad y Auditoría</h3>
            </div>
            <p class="card-description">
              Revisar logs de actividad, accesos al sistema y cambios realizados. Monitorear la
              seguridad de los datos.
            </p>
            <div class="card-actions">
              <button class="btn btn-warning" @click="activeTab = 'logs'">Ver Logs</button>
            </div>
          </div>

          <div class="admin-card">
            <div class="card-header">
              <div class="card-icon">🔄</div>
              <h3 class="card-title">Respaldos</h3>
            </div>
            <p class="card-description">
              Generar copias de seguridad de la base de datos y restaurar información en caso de
              necesidad.
            </p>
            <div class="card-actions">
              <button class="btn btn-success" @click="generarRespaldo">Crear Respaldo</button>
              <button class="btn btn-secondary">Restaurar</button>
            </div>
          </div>

          <div class="admin-card">
            <div class="card-header">
              <div class="card-icon">🔗</div>
              <h3 class="card-title">Integraciones</h3>
            </div>
            <p class="card-description">
              Configurar conexiones con ANSES, RENAPER, sistemas provinciales y otras bases de datos
              gubernamentales.
            </p>
            <div class="card-actions">
              <button class="btn btn-primary">Configurar</button>
            </div>
          </div>

          <div class="admin-card">
            <div class="card-header">
              <div class="card-icon">📊</div>
              <h3 class="card-title">Reportes Estadísticos</h3>
            </div>
            <p class="card-description">
              Generar informes para organismos superiores, estadísticas mensuales y reportes de
              gestión.
            </p>
            <div class="card-actions">
              <button class="btn btn-primary">Generar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- USUARIOS -->
      <div v-if="activeTab === 'usuarios'" class="tab-content">
        <div class="section-header">
          <h2>Gestión de Usuarios</h2>
          <button class="btn btn-success" @click="abrirModalNuevo">+ Nuevo Usuario</button>
        </div>

        <table class="users-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Último acceso</th>
              <th style="text-align: center">Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuarios" :key="usuario.id" class="capitalize">
              <td>{{ usuario.first_name }} {{ usuario.last_name }}</td>
              <td>{{ usuario.email }}</td>
              <td>{{ usuario.rolNombre }}</td>
              <td>{{ formatearFecha(usuario.last_access) }}</td>
              <td style="text-align: center">
                <span
                  :class="['status-badge', getEstadoUsuario(usuario.status)]"
                  class="capitalize"
                >
                  {{ usuario.status }}
                </span>
              </td>
              <td class="acciones">
                <button class="btn btn-primary btn-sm" @click="editarUsuario(usuario)">
                  Editar
                </button>
                <button class="btn btn-secondary btn-sm" @click="gestionarPermisos(usuario)">
                  Permisos
                </button>
                <button class="btn btn-danger btn-sm" @click="eliminarUsuario(usuario)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CONFIGURACIÓN -->
      <div v-if="activeTab === 'configuracion'" class="tab-content">
        <h2>Configuración del Sistema</h2>
        <p v-if="guardandoConfig" class="guardando-mensaje">Guardando cambios, por favor espera...</p>

        <div class="config-form">
          <h3>Categorías de Incidencias</h3>
          <div class="form-group">
            <label>Nueva categoría</label>
            <input
              v-model="nuevaCategoria"
              type="text"
              class="form-input"
              placeholder="Ej: Asistencia legal"
            />
          </div>
          <button class="btn btn-success" @click="agregarCategoria">Agregar Categoría</button>

          <hr style="margin: 30px 0" />

          <h3>Estados de Incidencias</h3>
          <div class="form-group">
            <label>Orden de estados en el flujo</label>
            <select v-model="flujoEstados" class="form-select">
              <option>Recibida → En Evaluación → Asignada → En Intervención → Resuelta</option>
            </select>
          </div>

          <hr style="margin: 30px 0" />

          <h3>Configuración General</h3>
          <div class="form-group">
            <label>Tiempo límite para primera intervención (días)</label>
            <input v-model.number="tiempoLimite" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <label>Email para notificaciones urgentes</label>
            <input v-model="emailUrgencias" type="email" class="form-input" />
          </div>
          <div class="form-group">
            <label>Nombre de la organización</label>
            <input v-model="nombreOrganizacion" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Logo de la organización</label>
            <input type="file" @change="onFileSelected" accept="image/*" class="form-input" />
            <div v-if="logoPreviewUrl" class="logo-preview">
              <p>Previsualización:</p>
              <img :src="logoPreviewUrl" alt="Previsualización del logo" />
            </div>
            <button v-if="logoPreviewUrl" @click="quitarLogo" class="btn btn-secondary btn-sm" style="margin-top: 10px;">
              Quitar Logo
            </button>
          </div>

          <button class="btn btn-primary" @click="guardarConfiguracion" :disabled="guardandoConfig">
            Guardar Configuración
          </button>
        </div>
      </div>

      <!-- Modal de Nuevo Programa-->
      <div class="modal-overlay" v-if="mostrarModalUsuario">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h3>
            <button class="btn-cerrar" @click="cerrarModalUsuario">×</button>
          </div>

          <div class="modal-content">
            <form class="formulario" @submit.prevent="guardarUsuario">
              <div class="campo-grupo">
                <div class="campo">
                  <label for="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    class="input"
                    v-model="formUsuario.first_name"
                    required
                  />
                </div>
                <div class="campo">
                  <label for="apellido">Apellido *</label>
                  <input
                    type="text"
                    id="apellido"
                    class="input"
                    v-model="formUsuario.last_name"
                    required
                  />
                </div>
              </div>
              <div class="campo-grupo">
                <div class="campo">
                  <label for="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    class="input"
                    v-model="formUsuario.password"
                    :placeholder="usuarioEditando ? 'Dejar en blanco para no cambiar' : 'Requerida'"
                  />
                </div>
                <div class="campo">
                  <label for="rol">Rol *</label>
                  <select id="rol" class="input" v-model="formUsuario.rol" required>
                    <option :value="null" disabled>Seleccionar un rol</option>
                    <option v-for="rol in rolesDisponibles" :key="rol.id" :value="rol.id">
                      {{ rol.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="campo-grupo">
                <div class="campo">
                  <label for="email">Correo electrónico *</label>
                  <input
                    type="email"
                    id="email"
                    class="input"
                    v-model="formUsuario.email"
                    required
                  />
                </div>
                <div class="campo">
                  <label for="estado">Estado</label>
                  <select id="estado" class="input" v-model="formUsuario.status">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-acciones">
            <button class="btn-cancelar" @click="cerrarModalUsuario">Cancelar</button>
            <button class="btn-guardar" @click="guardarUsuario">
              {{ usuarioEditando ? 'Actualizar' : 'Guardar' }} Usuario
            </button>
          </div>
        </div>
      </div>

      <!-- LOGS -->
      <div v-if="activeTab === 'logs'" class="tab-content">
        <h2>Auditoría y Logs del Sistema</h2>

        <div class="log-container">
          <div v-for="(log, index) in logs" :key="index" class="log-entry">
            <span class="log-time">{{ formatearFecha(log.fecha) }}</span>
            <span :class="['log-level', getLogClass(log.nivel)]">{{ log.nivel }}</span>
            <span class="log-message">{{ log.mensaje }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  createItem,
  readItem,
  readItems,
  deleteItem,
  updateSingleton,
  updateItem,
  readUsers,
  readRoles,
  createUser,
  updateUser,
  deleteUser,
  uploadFiles
} from '@directus/sdk'
import Swal from 'sweetalert2'
import { globalConfig, fetchGlobalConfig } from '../../config/globalConfig.js'
import 'sweetalert2/dist/sweetalert2.min.css'
import { directus } from '../../config/directus.js' // 👈 Importamos el cliente reactivo

const activeTab = ref('dashboard')

//Usuarios desde Directus
const usuarios = ref([])
const rolesDisponibles = ref([])

function formatearFecha(fecha) {
  const opciones = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return new Date(fecha).toLocaleDateString('es-ES', opciones)
}

//Categorias y configuración
const nuevaCategoria = ref('')
const flujoEstados = ref('Recibida → En Evaluación → Asignada → En Intervención → Resuelta')
const tiempoLimite = ref(3)
const emailUrgencias = ref('')
const categorias = ref([])
const nombreOrganizacion = ref('')
const guardandoConfig = ref(false)

const logoFile = ref(null)
const logoPreviewUrl = ref(null)

const mostrarModalUsuario = ref(false)
const usuarioEditando = ref(null)
const formUsuario = ref({
  nombre: '',
  apellido: '', // En Directus es first_name y last_name
  email: '',
  rol: null,
  status: 'active',
})

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (file) {
    logoFile.value = file
    logoPreviewUrl.value = URL.createObjectURL(file)
  }
}

const quitarLogo = () => {
  logoFile.value = null
  logoPreviewUrl.value = null
  // También podrías resetear el input de archivo si es necesario
}

function getLocalISO() {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000 // offset en ms
  const localTime = new Date(now.getTime() - tzOffset)
  return localTime.toISOString().slice(0, 19) // elimina milisegundos
}

const abrirModalNuevo = () => {
  mostrarModalUsuario.value = true
  usuarioEditando.value = null
  formUsuario.value = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    rol: null, // Usaremos 'role' para el ID del rol
    status: 'active',
    ultimoAcceso: getLocalISO(),
  }
}

//Logs desde directus
const logs = ref([])

//Métodos
const fetchUsuarios = async () => {
  try {
    // Usamos readUsers() para la colección de usuarios
    const res = await directus.value.request(
      readUsers({
        fields: [
          'id',
          'first_name',
          'last_name',
          'email',
          'role.id',
          'role.name',
          'last_access',
          'status',
        ],
        sort: ['-last_access'],
      }),
    )
    usuarios.value = res.map((u) => ({ ...u, rolNombre: u.role?.name || 'Sin rol' })) // Mapeamos para la tabla
  } catch (error) {
    console.error('Error al cargar usuarios: ', error)
  }
}

const editarUsuario = (usuario) => {
  usuarioEditando.value = usuario
  formUsuario.value = {
    id: usuario.id,
    first_name: usuario.first_name,
    last_name: usuario.last_name,
    email: usuario.email,
    rol: usuario.role?.id, // Guardamos el ID del rol
    status: usuario.status,
    password: '', // El campo de contraseña estará vacío al editar
  }
  mostrarModalUsuario.value = true
}

const gestionarPermisos = (usuario) => {
  Swal.fire(
    'En desarrollo',
    `La gestión de permisos para ${usuario.first_name} ${usuario.last_name} aún no está implementada.`,
    'info',
  )
}

const eliminarUsuario = async (usuario) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Esta acción eliminará permanentemente al usuario "${usuario.first_name} ${usuario.last_name}". No podrás revertir esto.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  })

  if (result.isConfirmed) {
    try {
      // 1. Eliminar el usuario del sistema de Directus
      await directus.value.request(deleteUser(usuario.id))

      // 3. Registrar la acción en los logs
      await directus.value.request(
        createItem('logs', {
          nivel: 'INFO',
          mensaje: `Usuario ${usuario.first_name} ${usuario.last_name} eliminado por el administrador.`,
          fecha: getLocalISO(),
        }),
      )

      Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success')
      // 4. Quitar el usuario de la lista local para actualizar la UI (corregido)
      usuarios.value = usuarios.value.filter((u) => u.id !== usuario.id)
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      Swal.fire('Error', 'No se pudo eliminar el usuario. Por favor, inténtalo de nuevo.', 'error')
    }
  }
}

const getEstadoUsuario = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'active':
      return 'status-active'
    case 'suspended':
      return 'status-suspended'
    case 'archived':
      return 'status-archived'
    case 'inactive':
    default:
      return 'status-inactive'
  }
}

const fetchLogs = async () => {
  try {
    const res = await directus.value.request(
      readItems('logs', {
        fields: ['fecha', 'nivel', 'mensaje'],
        sort: ['-fecha'],
        limit: 20,
      }),
    )
    logs.value = res
  } catch (error) {
    console.error('Error cargando logs: ', error)
  }
}

const guardarUsuario = async () => {
  if (
    !formUsuario.value.first_name ||
    !formUsuario.value.last_name ||
    !formUsuario.value.email ||
    !formUsuario.value.rol
  ) {
    Swal.fire({
      title: 'Error al agregar',
      text: 'Todos los campos son obligatorios',
      icon: 'error',
      confirmButtonText: 'Aceptar',
    })
    return
  }

  // Para nuevos usuarios, la contraseña es obligatoria
  if (!usuarioEditando.value && !formUsuario.value.password) {
    Swal.fire('Error', 'La contraseña es obligatoria para nuevos usuarios.', 'error')
    return
  }

  try {
    const datosUsuario = {
      first_name: formUsuario.value.first_name,
      last_name: formUsuario.value.last_name,
      email: formUsuario.value.email,
      role: formUsuario.value.rol, // ID del rol
      status: formUsuario.value.status || 'active',
    }

    if (usuarioEditando.value) {
      // --- EDITAR USUARIO ---
      // Solo incluimos la contraseña si el usuario la ha escrito
      if (formUsuario.value.password) {
        datosUsuario.password = formUsuario.value.password
      }
      await directus.value.request(updateUser(usuarioEditando.value.id, datosUsuario))
      Swal.fire('¡Usuario actualizado!', 'El usuario se ha actualizado.', 'success')
    } else {
      // --- CREAR NUEVO USUARIO ---
      datosUsuario.password = formUsuario.value.password
      await directus.value.request(createUser(datosUsuario))
      Swal.fire('¡Usuario creado!', 'El usuario se ha creado exitosamente.', 'success')
    }

    cerrarModalUsuario()
    await fetchUsuarios() // Recargar la lista de usuarios
  } catch (error) {
    console.error('Error al agregar o actualizar usuario: ', error)
    let mensajeError = 'Ocurrió un error al guardar el usuario.'
    if (error.errors && error.errors[0]?.message) {
      mensajeError = error.errors[0].message
    }
    Swal.fire({
      title: 'Error',
      text: mensajeError,
      icon: 'error',
    })
  }
}
const cerrarModalUsuario = () => {
  mostrarModalUsuario.value = false
  usuarioEditando.value = null
}
const agregarCategoria = async () => {
  try {
    if (nuevaCategoria.value.trim()) {
      Swal.fire({
        title: '¡Categoría agregada!',
        text: 'La categoría se ha agregado.',
        icon: 'success',
      })

      await directus.value.request(
        createItem('categorias', {
          nombre: nuevaCategoria.value,
        }),
      )

      await directus.value.request(
        createItem('logs', {
          nivel: 'INFO',
          mensaje: `Se ha creado una nueva categoría: ${nuevaCategoria.value}`,
          fecha: getLocalISO(),
        }),
      )
      nuevaCategoria.value = ''
    } else {
      Swal.fire({
        title: 'Error al agregar',
        text: 'El nombre de la categoría no puede estar vacío.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      })
    }
  } catch (error) {
    console.error('Error al agregar categoria: ', error)
  }
}

const guardarConfiguracion = async () => {
  guardandoConfig.value = true
  try {
    let logoId = globalConfig.value?.logo || null

    // 1. Si hay un nuevo archivo de logo, subirlo primero
    if (logoFile.value) {
      const formData = new FormData()
      formData.append('file', logoFile.value)
      const fileResponse = await directus.value.request(uploadFiles(formData))
      logoId = fileResponse.id
    }

    // 2. Guardar la configuración en la base de datos, incluyendo el ID del logo
    const updatedConfig = await directus.value.request(
      updateSingleton('configuracion', {
        tiempo_limite_intervencion: tiempoLimite.value,
        email_notificaciones_urgentes: emailUrgencias.value,
        nombre_organizacion: nombreOrganizacion.value,
        logo: logoId,
      }),
    )

    // 3. Actualizar el estado reactivo global para que se refleje en toda la app
    if (globalConfig.value) {
      globalConfig.value.nombre_organizacion = updatedConfig.nombre_organizacion
      globalConfig.value.tiempo_limite_intervencion = updatedConfig.tiempo_limite_intervencion
      globalConfig.value.email_notificaciones_urgentes = updatedConfig.email_notificaciones_urgentes
      globalConfig.value.logo = updatedConfig.logo
    }

    // Limpiar el estado del logo después de guardar
    logoFile.value = null
    logoPreviewUrl.value = null

    Swal.fire({
      title: 'Configuración Guardada',
      text: 'Los ajustes del sistema se han actualizado correctamente.',
      icon: 'success',
    })

    await directus.value.request(
      createItem('logs', {
        nivel: 'INFO',
        mensaje: `Configuración del sistema actualizada.`,
        fecha: getLocalISO(),
      }),
    )
  } catch (error) {
    console.error('Error al guardar la configuración:', error)
    Swal.fire('Error', 'No se pudo guardar la configuración.', 'error')
  } finally {
    guardandoConfig.value = false
  }
}

const generarRespaldo = () => {
  alert(
    'Generando respaldo de la base de datos...\n\nEsta funcionalidad se implementará con el backend.',
  )
}

const getLogClass = (nivel) => {
  switch (nivel?.toUpperCase()) {
    case 'INFO':
      return 'log-info'
    case 'WARN':
      return 'log-warning'
    case 'ERROR':
      return 'log-error'
    default:
      return 'log-info'
  }
}

onMounted(async () => {
  try {
    fetchUsuarios()
    fetchLogs()

    // Cargar roles disponibles para el formulario
    const roles = await directus.value.request(
      readRoles({
        filter: { name: { _nin: ['Public'] } }, // Excluimos roles que no queremos asignar
      }),
    )
    rolesDisponibles.value = roles

    // Cargar la configuración global
    await fetchGlobalConfig()
    if (globalConfig.value) {
      tiempoLimite.value = globalConfig.value.tiempo_limite_intervencion
      emailUrgencias.value = globalConfig.value.email_notificaciones_urgentes
      nombreOrganizacion.value = globalConfig.value.nombre_organizacion
    }
  } catch (error) {
    console.error('Error al traer datos desde Directus: ', error)
  }
})
</script>

<style scoped>
.logo-preview {
  margin-top: 15px;
  padding: 10px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  text-align: center;
}
.logo-preview img {
  max-height: 80px;
  max-width: 100%;
}
</style>

<style scoped>
.capitalize {
  text-transform: capitalize;
}
.guardando-mensaje {
  text-align: center;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 1rem;
  animation: fadeIn 0.5s;
}
.container-page {
  min-height: 100vh;
  /* background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%); */
  background: rgba(245, 241, 241);
  /* padding: 2rem; */
}

.contenedor-admin {
  /* max-width: 1400px; */
  margin: 0 auto;
  /* background: white; */
  /* padding: 2rem; */
  /* box-shadow: 0 4px 6px rgba(0,0,0,0.1); */
  overflow: hidden;
}

.page-header {
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  background: linear-gradient(135deg, #1f9e26, #169770);
  color: white;
  padding: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 8px 0;
}

.page-header p {
  margin: 0;
  opacity: 0.9;
}

/* Pestañas */
.tabs-container {
  display: flex;
  background: #f8f9fa;
  margin-bottom: 2rem;
}

.tab-button {
  flex: 1;
  padding: 15px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #64748b;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button.active {
  background: white;
  border-bottom-color: #007bff;
  color: #3b82f6;
  font-weight: 600;
}

.tab-button:hover:not(.active) {
  background: #e9ecef;
}

.tab-content {
  padding: 20px;
  margin: 20px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0px 15px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease;
}

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

.tab-content h2 {
  color: #2c3e50;
  margin-bottom: 25px;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.admin-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.admin-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: #6f42c1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  margin-right: 15px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.card-description {
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 15px;
}

.card-actions {
  display: flex;
  gap: 10px;
}

/* Botones */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #6f42c1;
  color: white;
}
.btn-secondary {
  background: #6c757d;
  color: white;
}
.btn-success {
  background: #28a745;
  color: white;
}
.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  margin-right: 4px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Sección Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  margin: 0;
}

/* Tabla Usuarios */
.users-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.users-table th,
.users-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.users-table thead {
  background: #6f42c1;
  color: white;
}

.users-table tbody tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-active {
  background: #d4edda;
  color: #155724;
}
.status-inactive {
  background: #f8d7da;
  color: #721c24;
}
.status-suspended {
  background: #fff3cd;
  color: #856404;
}
.status-archived {
  background: #e2e3e5;
  color: #383d41;
}

/* Formulario Configuración */
.config-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.config-form h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #495057;
}

.form-input,
.form-select {
  width: 99%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #6f42c1;
  box-shadow: 0 0 0 2px rgba(111, 66, 193, 0.25);
}

/* Logs */
.log-container {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
}

.log-entry {
  display: flex;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #e9ecef;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #6c757d;
  font-size: 12px;
  margin-right: 15px;
  min-width: 150px;
}

.log-level {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  margin-right: 10px;
  text-transform: uppercase;
}

.log-info {
  background: #d1ecf1;
  color: #0c5460;
}
.log-warning {
  background: #fff3cd;
  color: #856404;
}
.log-error {
  background: #f8d7da;
  color: #721c24;
}

.log-message {
  flex: 1;
  font-size: 13px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(3px);
}

.modal {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 70vw;
  max-height: 100vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}
.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-size: 2rem;
  font-weight: 600;
}

.btn-cerrar {
  background: none;
  border: none;
  color: white;
  font-size: 2.7rem;
  cursor: pointer;
  height: 20px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}
.btn-cerrar:hover {
  transform: scale(1.2);
}
.modal-content {
  padding: 2rem;
}
.rol {
  margin-top: 10px;
}
.campo-grupo {
  display: flex;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.campo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.campo label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fafafa;
}
.input:focus {
  border-color: #667eea;
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.modal-acciones {
  display: flex;
  /* gap: rem; */
  justify-content: flex-end;
  padding: 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.btn-cancelar {
  background: #6b7280;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  margin-right: 1rem;
  border-radius: 10px;
  padding: 0.65rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-cancelar:hover {
  transform: translateY(-2px);
}
.btn-guardar {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}
.btn-guardar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}
/* Responsive */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  .page-header p {
    font-size: 0.9rem;
  }
  .tab-button {
    font-size: 0.9rem;
  }
  .log-container {
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .log-entry {
    flex-direction: column;
    align-items: flex-start;
    padding: 5px 0;
  }
  .log-time {
    font-size: 0.8rem;
    margin-right: 10px;
    min-width: auto;
    margin-bottom: 5px;
  }
  .log-message {
    font-size: 0.9rem;
    margin-top: 5px;
  }
  .users-table {
    overflow-x: auto;
    display: block;
    white-space: nowrap;
  }
  .tab-content {
    padding: 20px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .users-table {
    font-size: 12px;
  }

  .users-table th,
  .users-table td {
    padding: 12px 8px;
    font-size: 12px;
  }

  .acciones {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .btn-sm {
    margin-right: 0;
  }
  .modal {
    width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }
  .campo-grupo {
    flex-direction: column;
    gap: 1rem;
  }
  .modal-title {
    font-size: 1.8rem;
    font-weight: 600;
  }
  .btn-cerrar {
    font-size: 2.5rem;
    height: 30px;
    width: 30px;
  }
  .btn-guardar {
    padding: 10px;
    /* font-size: 0.9rem; */
  }
}
</style>
