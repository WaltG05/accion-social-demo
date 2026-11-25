<template>
  <div class="container-page">
    <div class="contenedor-denuncias">
      <header class="page-header">
        <h1>Gestión de Incidencias</h1>
        <p>Registro y seguimiento de situaciones sociales</p>
      </header>

      <!-- Pestañas de navegación -->
      <div class="tabs-container">
        <button
          v-if="!isReadOnly" :class="['tab-button', { active: activeTab === 'nueva' }]"
          @click="activeTab = 'nueva'"
        >
          Nueva Incidencia
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'listado' }]"
          @click="activeTab = 'listado'"
        >
          Listado
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'estadisticas' }]"
          @click="activeTab = 'estadisticas'"
        >
          Estadísticas
        </button>
      </div>

      <!-- PESTAÑA NUEVA DENUNCIA -->
      <div v-if="activeTab === 'nueva'" class="tab-content">
        <div class="form-container">
          <h2>Registrar Nueva Incidencia</h2>

          <form @submit.prevent="enviarDenuncia" class="form-denuncia">
            <div class="form-section">
              <h3>Datos del Denunciante</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Persona *</label>
                  <select v-model="form.idpersona" required class="form-input">
                    <option disabled value="">Seleccione una persona</option>
                    <option v-for="p in personas" :key="p.idpersona" :value="p.idpersona">
                      {{ p.nombre }} {{ p.apellido }}
                    </option>
                  </select>
                  <!-- <input type="text" v-model="form.nombre" required class="form-input"> -->
                </div>
                <div class="form-group">
                  <label>Email / Teléfono *</label>
                  <input type="text" v-model="form.contacto" class="form-input" disabled />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Información de la Incidencia</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Categoría *</label>
                  <select v-model="form.idcategoria" required class="form-input">
                    <option disabled value="">Seleccione una categoría</option>
                    <option v-for="c in categorias" :key="c.id" :value="c.id">
                      {{ c.nombre }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Prioridad</label>
                  <select v-model="form.prioridad" class="form-input">
                    <option value="baja">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Ubicación del hecho</label>
                <div id="mapaDenuncia" class="mapa-container"></div>
                <small>Haz clic en el mapa para marcar la ubicación.</small>
              </div>

              <div class="form-group">
                <label>Descripción detallada *</label>
                <textarea
                  v-model="form.descripcion"
                  rows="4"
                  required
                  class="form-input"
                  placeholder="Describa la situación con el mayor detalle posible..."
                ></textarea>
              </div>

              <div class="form-group">
                <h2>Documentos Adjuntos</h2>
                <div class="upload-area">
                  <input
                    type="file"
                    id="documentos"
                    @change="handleFileUpload"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    class="file-input"
                  />
                  <label for="documentos" class="upload-label">
                    <span class="upload-icon">📎</span>
                    <span>Seleccionar archivos</span>
                    <small>PDF, DOC, DOCX, JPG, PNG (máx. 5MB c/u)</small>
                  </label>
                </div>
                <!-- Lista de archivos seleccionados -->
                <div v-if="form.documentos.length > 0" class="documents-list">
                  <div v-for="(file, index) in form.documentos" :key="index" class="document-item">
                    <div class="document-info">
                      <span class="document-name">{{ file.name }}</span>
                      <span class="document-size">{{ formatearTamaño(file.size) }}</span>
                    </div>
                    <button type="button" @click="eliminarDocumento(index)" class="btn-delete-doc">
                      ❌
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions" :disabled="cargando">
              <button type="submit" class="btn btn-success" :disabled="cargando">
                <span v-if="cargando">Guardando...</span>
                <span v-else>Guardar Incidencia</span>
              </button>
              <button type="button" @click="resetForm" class="btn btn-secondary">
                Limpiar formulario
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- PESTAÑA LISTADO -->
      <div v-if="activeTab === 'listado'" class="tab-content">
        <div class="contenedor-listado">
          <div class="section-header">
            <h2>Listado de Incidencias</h2>
          </div>

          <!-- Filtros -->
          <div class="filters-section">
            <div class="filter-grid">
              <input
                v-model="filtroTexto"
                type="text"
                placeholder="Buscar por nombre, categoría o descripción..."
                class="filter-input"
              />
              <select v-model="filtroCategoria" class="filter-select">
                <option value="">Todas las categorías</option>
                <option v-for="c in categorias" :key="c.id" :value="c.id">
                  {{ c.nombre }}
                </option>
                <!-- <option value="otros">Otros</option> -->
              </select>
              <select v-model="filtroEstado" class="filter-select">
                <option value="">Todos los estados</option>
                <option value="recibida">Recibida</option>
                <option value="en_evaluacion">En Evaluación</option>
                <option value="asignada">Asignada</option>
                <option value="en_intervencion">En Intervención</option>
                <option value="resuelta">Resuelta</option>
              </select>
              <button @click="limpiarFiltros" class="btn btn-secondary btn-sm">Limpiar</button>
            </div>
          </div>

          <!-- Tabla de denuncias -->
          <div class="table-container">
            <table class="denuncias-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Denunciante</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <!-- <th>Ubicación</th> -->
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="denuncia in denunciasPaginadas" :key="denuncia.idincidencia">
                  <td class="id-cell">
                    #{{ denuncia.numero_denuncia?.toString().padStart(4, '0') }}
                  </td>
                  <td class="denunciante-cell">
                    <div class="denunciante-info">
                      <div class="nombre">
                        {{ denuncia.idpersona.nombre }} {{ denuncia.idpersona.apellido }}
                      </div>
                      <!-- <div class="contacto">{{ denuncia.contacto }}</div> -->
                    </div>
                  </td>
                  <td>
                    <!-- <span class="categoria-tag">{{ getCategoriaLabel(denuncia.tipoIncidencia) }}</span> -->
                    <span class="categoria-tag">{{
                      denuncia.idcategoria?.nombre || 'Sin categoría'
                    }}</span>
                  </td>
                  <td class="descripcion-cell">
                    {{ denuncia.descripcion.substring(0, 80)
                    }}{{ denuncia.descripcion.length > 80 ? '...' : '' }}
                  </td>
                  <!-- <td>{{ denuncia.localizacion || '-' }}</td> -->
                  <td>
                    <span :class="['badge', getPrioridadClass(denuncia.prioridad?.toLowerCase())]">
                      {{ getPrioridadLabel(denuncia.prioridad) }}
                    </span>
                  </td>
                  <td>
                    <span :class="['badge', getEstadoClass(denuncia.estado)]" class="estado-tag">
                      {{ getEstadoLabel(denuncia.estado) }}
                    </span>
                  </td>
                  <td class="fecha-cell">{{ formatearFecha(denuncia.fechaIncidencia) }}</td>
                  <td class="acciones">
                    <button class="btn btn-info btn-sm" @click="verDenuncia(denuncia)">Ver</button>
                    <button class="btn btn-warning btn-sm" @click="asignarDenuncia(denuncia)" v-if="!isReadOnly">
                      Asignar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- Paginación y Selector de Items -->
            <div class="paginacion-wrapper" v-if="denunciasFiltradas.length > 0">
              <div class="items-por-pagina">
                <label for="itemsPorPaginaSelect">Mostrar:</label>
                <select id="itemsPorPaginaSelect" v-model="denunciasPorPagina" class="filter-select">
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                </select>
                <span>incidencias por página.</span>
              </div>

              <div class="paginacion-container" v-if="paginasTotales > 1">
                <button
                  @click="cambiarPagina(paginaActual - 1)"
                  :disabled="paginaActual === 1"
                  class="btn-paginacion"
                >
                  Anterior
                </button>
                <span class="info-pagina">Página {{ paginaActual }} de {{ paginasTotales }}</span>
                <button
                  @click="cambiarPagina(paginaActual + 1)"
                  :disabled="paginaActual === paginasTotales"
                  class="btn-paginacion"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PESTAÑA ESTADÍSTICAS -->
      <div v-if="activeTab === 'estadisticas'" class="tab-content">
        <div class="contenedor-listado">
          <div class="section-header">
            <h2>Estadísticas y Reportes</h2>
          </div>

          <div class="stats-grid">
            <div class="stat-card stat-total">
              <div class="stat-number">{{ totalDenunciasMes }}</div>
              <div class="stat-label">Total Incidencias</div>
              <div class="stat-period">Este mes</div>
            </div>
            <div class="stat-card stat-pendientes">
              <div class="stat-number">{{ denunciasPendientes }}</div>
              <div class="stat-label">Pendientes</div>
              <div class="stat-period">Por resolver</div>
            </div>
            <div class="stat-card stat-urgentes">
              <div class="stat-number">{{ denunciasUrgentes }}</div>
              <div class="stat-label">Urgentes</div>
              <div class="stat-period">Atención inmediata</div>
            </div>
            <div class="stat-card stat-resueltas">
              <div class="stat-number">{{ denunciasResueltas }}</div>
              <div class="stat-label">Resueltas</div>
              <div class="stat-period">Últimos 30 días</div>
            </div>
          </div>

          <div class="charts-section">
            <div class="chart-card">
              <h3>Incidencias por Categoría</h3>
              <div class="chart-placeholder">
                <div class="chart-bar" v-for="categoria in categoriaStats" :key="categoria.name">
                  <div class="bar-label">{{ categoria.name }}</div>
                  <div class="bar-container">
                    <div class="bar-fill" :style="{ width: categoria.porcentaje + '%' }"></div>
                    <span class="bar-value">{{ categoria.count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="chart-card">
              <h3>Estados de Incidencias</h3>
              <div class="estados-grid">
                <div v-for="estado in estadoStats" :key="estado.name" class="estado-item">
                  <div :class="['estado-indicator', estado.class]"></div>
                  <div class="estado-info">
                    <div class="estado-name">{{ estado.name }}</div>
                    <div class="estado-count">{{ estado.count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { uploadFiles } from '@directus/sdk'
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { createDirectus, rest, staticToken, readItems, createItem, updateItem } from '@directus/sdk'
import dayjs from 'dayjs'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../config/auth.js'
import { directus } from '../../config/directus.js'

// Los íconos por defecto de Leaflet no se resuelven solos con Vite: se indican a mano.
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const activeTab = ref('listado')
const denuncias = ref([])
const categorias = ref([])
const filtroTexto = ref('')
const filtroCategoria = ref('')
const filtroEstado = ref('')
const cargando = ref(false)

// Estado para la paginación
const paginaActual = ref(1)
const denunciasPorPagina = ref(5)

const { isReadOnly } = useAuth()

const totalDenunciasMes = computed(() => {
  const ahora = new Date()
  const mesActual = ahora.getMonth()
  const yearActual = ahora.getFullYear()
  return denuncias.value.filter((d) => {
    const fecha = new Date(d.fechaIncidencia)
    return fecha.getMonth() === mesActual && fecha.getFullYear() === yearActual
  }).length
})

const denunciasFiltradas = computed(() => {
  return denuncias.value.filter((d) => {
    // const cat = categorias[d.tipoIncidencia] ? d.tipoIncidencia : 'otros'
    const cat = d.idcategoria?.id || 'otros'
    const matchEstado =
      filtroEstado.value === '' || d.estado?.toLowerCase() === filtroEstado.value.toLowerCase()
    const matchCategoria = filtroCategoria.value === '' || filtroCategoria.value === cat
    const texto = filtroTexto.value.toLowerCase()
    const matchTexto =
      texto === '' ||
      d.idpersona?.nombre?.toLowerCase().includes(texto) ||
      d.idpersona?.apellido?.toLowerCase().includes(texto) ||
      d.idcategoria?.nombre?.toLowerCase().includes(texto) ||
      d.descripcion?.toLowerCase().includes(texto)

    return matchEstado && matchCategoria && matchTexto
  })
})

// Cuando cambian los filtros, volvemos a la página 1
watch([filtroTexto, filtroCategoria, filtroEstado], () => {
  paginaActual.value = 1
})

// Cuando cambia la cantidad de items por página, volvemos a la página 1
watch(denunciasPorPagina, () => {
  paginaActual.value = 1
})

const paginasTotales = computed(() => {
  return Math.ceil(denunciasFiltradas.value.length / denunciasPorPagina.value)
})

const denunciasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * denunciasPorPagina.value
  const fin = inicio + denunciasPorPagina.value
  return denunciasFiltradas.value.slice(inicio, fin)
})

// const fechaFormateada = dayjs(denuncias.fechaIncidencia).format('DD/MM/YYYY');
const personas = ref([])

const form = ref({
  idpersona: '',
  contacto: '',
  idcategoria: '',
  prioridad: 'normal',
  localizacion: null,
  descripcion: '',
  documentos: [],
})

const estados = {
  recibida: { label: 'Recibida', class: 'badge-secondary' },
  en_evaluacion: { label: 'En Evaluación', class: 'badge-primary' },
  asignada: { label: 'Asignada', class: 'badge-warning' },
  en_intervencion: { label: 'En Intervención', class: 'badge-danger' },
  resuelta: { label: 'Resuelta', class: 'badge-success' },
}
const prioridades = {
  baja: { label: 'Baja', class: 'badge-secondary' },
  normal: { label: 'Normal', class: 'badge-primary' },
  alta: { label: 'Alta', class: 'badge-warning' },
  urgente: { label: 'Urgente', class: 'badge-danger' },
}

onMounted(async () => {
  try {
    const resDenuncias = await directus.value.request(
      readItems('incidencias', {
        fields: ['*', 'idpersona.*', 'idcategoria.*'],
        sort: '-fechaIncidencia',
      }),
    )
    denuncias.value = resDenuncias

    const resPersonas = await directus.value.request(
      readItems('personas', {
        fields: ['idpersona', 'nombre', 'apellido', 'email', 'telefono'],
        limit: -1,
      }),
    )
    personas.value = resPersonas

    const resCategorias = await directus.value.request(
      readItems('categorias', {
        fields: ['id', 'nombre'],
        sort: 'nombre',
      }),
    )
    categorias.value = resCategorias
  } catch (error) {
    console.error('Error al cargar incidencias:', error)
  }
})

watch(
  () => form.value.idpersona,
  (nuevoid) => {
    const persona = personas.value.find((p) => p.idpersona === nuevoid)
    if (persona) {
      // form.value.nombre = `${persona.nombre} ${persona.apellido}`;
      form.value.contacto = persona.email || persona.telefono || ''
    } else {
      form.value.contacto = ''
    }
  },
)

let map = null
let marker = null

const initMap = () => {
  if (map) {
    map.remove()
    map = null
  }

  const mapContainer = document.getElementById('mapaDenuncia')
  if (mapContainer) {
    map = L.map('mapaDenuncia').setView([-31.7455, -60.5105], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      form.value.localizacion = {
        type: 'Point',
        coordinates: [lng, lat],
      }

      if (marker) {
        map.removeLayer(marker)
      }
      marker = L.marker([lat, lng]).addTo(map)
    })
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'nueva') {
    nextTick(() => initMap())
  }
})

async function enviarDenuncia() {
  if (!form.value.idcategoria || !form.value.descripcion) {
    alert('Por favor, complete todos los campos obligatorios.')
    return
  }
  cargando.value = true

  try {
    const ultima = await directus.value.request(
      readItems('incidencias', {
        limit: 1,
        sort: ['-numero_denuncia'],
        fields: ['numero_denuncia'],
      }),
    )
    const nuevoNumero = (ultima[0]?.numero_denuncia || 0) + 1

    // 1. Subir archivos a Directus si existen
    let idsDeArchivos = []
    if (form.value.documentos.length > 0) {
      const formData = new FormData()
      form.value.documentos.forEach((file) => {
        formData.append('files[]', file, file.name)
      })
      // console.log('Archivo subido: ', uploaded);

      // form.value.documentos.forEach((file) => {
      //   const blob = new Blob([file], { type: file.type || 'application/octet-stream' });
      //   // Adjuntamos cada archivo con sus metadatos. El SDK de Directus espera
      //   // que cada archivo sea un objeto con 'blob', 'name' y 'type'.
      //   formData.append('files[]', blob, file.name);
      // });

      const resArchivos = await directus.value.request(uploadFiles(formData))
      // // Asegurarnos de que siempre sea un array para poder usar .map()
      const archivosArray = Array.isArray(resArchivos) ? resArchivos : [resArchivos]
      idsDeArchivos = archivosArray.map((file) => file.id)
    }
    // 2. Crear la denuncia con la referencia a los archivos
    const nuevaDenuncia = {
      idpersona: form.value.idpersona,
      contacto: form.value.contacto,
      idcategoria: form.value.idcategoria,
      prioridad: form.value.prioridad,
      localizacion: form.value.localizacion,
      descripcion: form.value.descripcion,
      estado: 'recibida',
      fechaIncidencia: new Date().toISOString(),
      numero_denuncia: nuevoNumero,
      documentos: idsDeArchivos, // <-- ¡CORRECCIÓN! Simplemente pasamos el array de IDs
    }

    const res = await directus.value.request(
      createItem('incidencias', nuevaDenuncia, {
        fields: ['*', 'idpersona.*', 'idcategoria.*'], // Pedimos que nos devuelva el item completo
      }),
    )
    denuncias.value.unshift(res)

    resetForm()
    Swal.fire('¡Éxito!', 'Denuncia enviada correctamente.', 'success')
  } catch (error) {
    console.error('Error al enviar denuncia:', error)
    Swal.fire('Error', 'Hubo un problema al enviar la denuncia. Intenta de nuevo.', 'error')
  } finally {
    cargando.value = false
  }
}

function formatearFecha(fecha) {
  const opciones = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(fecha).toLocaleDateString('es-ES', opciones)
}

function formatearTamaño(tamaño) {
  if (tamaño < 1024) {
    return tamaño + ' B'
  } else if (tamaño < 1024 * 1024) {
    return (tamaño / 1024).toFixed(2) + ' KB'
  } else {
    return (tamaño / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

function getPrioridadLabel(prioridad) {
  if (!prioridad) return ''
  const p = prioridades[prioridad.toLowerCase()]
  return p ? p.label : prioridad
}
function getPrioridadClass(prioridad) {
  if (!prioridad) return 'badge-secondary'
  const p = prioridades[prioridad.toLowerCase()]
  return p ? p.class : 'badge-secondary'
}

function getEstadoLabel(estado) {
  return estados[estado?.toLowerCase()]?.label || estado
}

function getEstadoClass(estado) {
  return estados[estado?.toLowerCase()]?.class || 'badge-secondary'
}


function limpiarFiltros() {
  filtroTexto.value = ''
  filtroCategoria.value = ''
  filtroEstado.value = ''
}

function eliminarDocumento(index) {
  form.value.documentos.splice(index, 1)
}

function handleFileUpload(event) {
  const files = event.target.files
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.size <= 5 * 1024 * 1024) {
      // Límite de 5MB
      form.value.documentos.push(file)
    } else {
      Swal.fire(
        'Archivo demasiado grande',
        `El archivo ${file.name} excede el tamaño máximo de 5MB y no será agregado.`,
        'warning',
      )
    }
  }
  event.target.value = '' // Limpiar el input para poder seleccionar el mismo archivo de nuevo
}

function cambiarPagina(pagina) {
  if(pagina > 0 && pagina <= paginasTotales.value) {
    paginaActual.value = pagina
  }
}

function resetForm() {
  form.value = {
    idpersona: '',
    contacto: '',
    idcategoria: '',
    prioridad: 'normal',
    localizacion: null,
    descripcion: '',
    documentos: [],
  }
}

function asignarDenuncia(denuncia) {
  if (denuncia.estado !== 'recibida') {
    alert('Solo se pueden asignar incidencias en estado "Recibida".')
    return
  }
  denuncia.estado = 'asignada'
  alert('Incidencia asignada con éxito.')
}

async function verDenuncia(denuncia) {
  const tieneUbicacion = denuncia.localizacion && denuncia.localizacion.coordinates
  const mapaHtml = tieneUbicacion
    ? `<div id="mapaDetalle" style="height: 250px; width: 100%; border-radius: 12px; margin-top: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>`
    : `<div style="height: 100px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 12px; margin-top: 10px; color: #6c757d; font-weight: 500;">No hay ubicación registrada.</div>`

  const htmlContent = `
    <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px;">
          <strong style="display: block; color: #495057; font-size: 13px; margin-bottom: 5px;">Denunciante</strong>
          <span style="font-size: 15px; color: #212529;">${denuncia.idpersona.nombre} ${denuncia.idpersona.apellido}</span>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px;">
          <strong style="display: block; color: #495057; font-size: 13px; margin-bottom: 5px;">Categoría</strong>
          <span style="font-size: 15px; color: #212529;">${denuncia.idcategoria?.nombre || 'Sin categoría'}</span>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px;">
          <strong style="display: block; color: #495057; font-size: 13px; margin-bottom: 5px;">Fecha</strong>
          <span style="font-size: 15px; color: #212529;">${formatearFecha(denuncia.fechaIncidencia)}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px;">
          <strong style="display: block; color: #495057; font-size: 13px; margin-bottom: 5px;">Prioridad</strong>
          <span class="badge ${getPrioridadClass(denuncia.prioridad?.toLowerCase())}" style="font-size: 14px;">${getPrioridadLabel(denuncia.prioridad)}</span>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 12px;">
          <strong style="display: block; color: #495057; font-size: 13px; margin-bottom: 5px;">Estado</strong>
          <span class="badge ${getEstadoClass(denuncia.estado)}" style="font-size: 14px;">${getEstadoLabel(denuncia.estado)}</span>
        </div>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <strong style="display: block; color: #495057; font-size: 13px; margin-bottom: 8px;">Descripción del Hecho</strong>
        <p style="font-size: 15px; color: #212529; line-height: 1.6; margin: 0;">${denuncia.descripcion}</p>
      </div>

      <div>
        <strong style="display: block; color: #495057; font-size: 13px; margin-bottom: 5px;">Ubicación Registrada</strong>
      </div>
      ${mapaHtml}
    </div>
  `

  await Swal.fire({
    title: `Detalles de la Incidencia #${denuncia.numero_denuncia?.toString().padStart(4, '0')}`,
    html: htmlContent,
    width: '800px',
    showCloseButton: true,
    showConfirmButton: false,
    didOpen: () => {
      if (tieneUbicacion) {
        const coords = denuncia.localizacion.coordinates
        const map = L.map('mapaDetalle').setView([coords[1], coords[0]], 15)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)
        L.marker([coords[1], coords[0]]).addTo(map)
      }
    },
  })
}

const denunciasPendientes = computed(
  () => denuncias.value.filter((d) => d.estado !== 'resuelta').length,
)
const denunciasUrgentes = computed(
  () =>
    denuncias.value.filter(
      (d) => d.prioridad?.toLowerCase() === 'urgente' && d.estado !== 'resuelta',
    ).length,
)
const denunciasResueltas = computed(() => {
  const hoy = new Date()
  const hace30Dias = new Date()
  hace30Dias.setDate(hoy.getDate() - 30)

  return denuncias.value.filter((d) => {
    const fecha = new Date(d.fechaIncidencia)
    return d.estado === 'resuelta' && fecha >= hace30Dias && fecha <= hoy
  }).length
})

const categoriaStats = computed(() => {
  if (!denuncias.value.length) return []

  const stats = categorias.value.map((cat) => {
    const count = denuncias.value.filter((d) => d.idcategoria?.id === cat.id).length
    const porcentaje = denuncias.value.length > 0 ? (count / denuncias.value.length) * 100 : 0

    return {
      name: cat.nombre,
      count,
      porcentaje: Math.round(porcentaje),
    }
  })

  stats.sort((a, b) => b.count - a.count)

  return stats
})

const estadoStats = computed(() => {
  return Object.entries(estados)
    .map(([key, value]) => {
      const count = denuncias.value.filter((d) => d.estado === key).length
      return {
        name: value.label,
        count,
        class: value.class,
      }
    })
    .filter((stat) => stat.count > 0)
})
</script>

<style scoped>
.container-page {
  min-height: 100vh;
  /* background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%); */
  /* background: linear-gradient(135deg, #1f9e26, #169770); */
  background: rgba(245, 241, 241);
  /* padding: 2rem; */
}
.contenedor-listado {
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.page-header {
  /* background: #2c3e50; */
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  background: linear-gradient(135deg, #1f9e26, #169770);
  color: white;
  padding: 2rem;
  /* padding: 20px 30px; */
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
  padding: 2rem;
  min-height: 70vh;
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

.section-header {
  margin-bottom: 25px;
}

.mapa-container {
  height: 250px;
  width: 100%;
  border-radius: 8px;
  margin-top: 5px;
  margin-bottom: 5px;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
}

/* Formularios */
.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-container h2 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.form-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-section h3 {
  color: #495057;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 8px;
}
.form-section:nth-child(2) input {
  margin-bottom: 15px;
}
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}
.form-group h2 {
  margin-top: 25px;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.form-help {
  color: #6c757d;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

/* Filtros */
.filters-section {
  /* background: #d6d6d6; */
  /* padding: 20px; */
  border-radius: 8px;
  margin-bottom: 25px;
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 15px;
  align-items: center;
}

.filter-input,
.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
}

.paginacion-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

/* Tablas */
.table-container {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.denuncias-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  min-width: 1200px;
}

.denuncias-table th,
.denuncias-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  font-size: 13px;
}

.denuncias-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.denuncias-table tbody tr:hover {
  background-color: #f8f9fa;
}

.id-cell {
  font-weight: 700;
  color: #dc3545;
  min-width: 60px;
}
.fecha-cell {
  white-space: nowrap;
  /* min-width: 80px; */
}

.denunciante-cell {
  min-width: 150px;
}

.denunciante-info .nombre {
  font-weight: 600;
  color: #2c3e50;
}

.denunciante-info .contacto {
  font-size: 11px;
  color: #6c757d;
  margin-top: 2px;
}

.descripcion-cell {
  max-width: 200px;
  line-height: 1.3;
}

.categoria-tag {
  background: #e9ecef;
  color: #495057;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.estado-tag {
  white-space: nowrap;
}
.upload-area {
  margin-bottom: 1.5rem;
}
.file-input {
  display: none;
}
.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}
.upload-label:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
}
.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.upload-label span:nth-child(2) {
  color: #1e40af;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}
.upload-label small {
  color: #64748b;
  font-size: 0.875rem;
}
.documents-list {
  space-y: 0.75rem;
}
.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
}
.document-item:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}
.document-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}
.document-name {
  font-weight: 600;
  color: #374151;
}
.document-size,
.document-date {
  font-size: 0.875rem;
  color: #64748b;
}
.btn-delete-doc {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  transition: transform 0.2s ease;
}
/* Botones */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  width: 100%;
}
.acciones {
  display: flex;
  justify-content: space-between;
}

.btn-success {
  background: #28a745;
  color: white;
}
.btn-primary {
  background: #007bff;
  color: white;
}
.btn-secondary {
  background: #6c757d;
  color: white;
}
.btn-warning {
  background: #ffc107;
  color: #212529;
}
.btn-danger {
  background: #dc3545;
  color: white;
}
.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
  margin-right: 4px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Badges */
.badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}
.badge-warning {
  background: #fff3cd;
  color: #856404;
}
.badge-danger {
  background: #f8d7da;
  color: #721c24;
}
.badge-info {
  background: #d1ecf1;
  color: #0c5460;
}
.badge-primary {
  background: #cce5ff;
  color: #004085;
}
.badge-secondary {
  background: #e2e3e5;
  color: #383d41;
}
.badge-critical {
  background: #721c24;
  color: white;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: white;
}

.stat-total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.stat-pendientes {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
}
.stat-urgentes {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}
.stat-resueltas {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 1rem;
  margin-bottom: 3px;
  font-weight: 600;
}

.stat-period {
  font-size: 0.8rem;
  opacity: 0.9;
}

/* Gráficos */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.chart-card {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.chart-card h3 {
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
}

.chart-placeholder .chart-bar {
  margin-bottom: 15px;
}

.bar-label {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 5px;
}

.bar-container {
  display: flex;
  align-items: center;
  background: #e9ecef;
  border-radius: 20px;
  height: 25px;
  position: relative;
}

.bar-fill {
  background: linear-gradient(135deg, #5edf65 0%, #09a709);
  height: 100%;
  border-radius: 20px;
  transition: width 0.3s ease;
  min-width: 20px;
}

.bar-value {
  position: absolute;
  right: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #495057;
}

.estados-grid {
  display: grid;
  gap: 15px;
}

.estado-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.estado-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.estado-info {
  flex: 1;
}

.estado-name {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.estado-count {
  color: #6c757d;
  font-size: 13px;
}

.items-por-pagina {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: #495057;
}

.paginacion-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
}

.btn-paginacion {
  padding: 8px 16px;
  border: 1px solid #ced4da;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-paginacion:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-pagina {
  font-weight: 600;
  color: #495057;
}

/* Responsive */
@media (max-width: 768px) {
  .container-page {
    /* padding: 10px; */
    background: #f1efef;
  }
  .contenedor-listado {
    padding: 0.7rem;
    /* background: none; */
    /* box-shadow: none; */
  }
  .form-group small {
    margin-bottom: 15px;
  }
  .page-header h1 {
    font-size: 1.8rem;
  }
  .page-header p {
    font-size: 0.9rem;
  }
  .tab-content {
    padding: 20px;
  }

  .form-container {
    max-width: none;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .form-actions {
    flex-direction: column;
    align-items: center;
  }

  .filter-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stat-number {
    font-size: 2rem;
  }

  .charts-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .denuncias-table {
    min-width: 800px;
  }

  .denuncias-table th,
  .denuncias-table td {
    padding: 8px 6px;
    font-size: 12px;
  }

  .descripcion-cell {
    max-width: 150px;
  }

  .acciones {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 80px;
  }

  .btn-sm {
    margin-right: 0;
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tab-button {
    padding: 10px;
    text-align: center;
  }
}
</style>
