<template>
  <div class="container-principal">
    <div class="header">
      <h1>Gestión de Programas Sociales</h1>
      <p>Administra programas AUH, pensiones y ayudas sociales</p>
    </div>

    <div class="tabs">
      <button
        class="tab-button"
        :class="{ active: tabActiva === 'programas' }"
        @click="cambiarTab('programas')"
      >
        Programas Activos
      </button>

      <!-- <button
        class="tab-button"
        :class="{ active: tabActiva === 'beneficiarios' }"
        @click="cambiarTab('beneficiarios')"
      >
        Beneficiarios
      </button> -->

      <button
        class="tab-button"
        :class="{ active: tabActiva === 'reportes' }"
        @click="cambiarTab('reportes')"
      >
        Reportes
      </button>
    </div>

    <div class="tab-content">
      <div class="programas-header">
        <h2 class="programas-title">
          {{
            tabActiva === 'programas'
              ? 'Programas Sociales Activos'
              : tabActiva === 'beneficiarios'
                ? 'Gestión de Beneficiarios'
                : 'Reportes y Estadísticas'
          }}
        </h2>
        <button class="btn-agregar" @click="abrirModalNuevo" v-if="tabActiva === 'programas' && !isReadOnly">
          Nuevo Programa
        </button>
        <button
          class="btn-agregar"
          @click="abrirModalBeneficiario"
          v-if="tabActiva === 'beneficiarios' && !isReadOnly"
        >
          Agregar Beneficiario
        </button>
      </div>

      <!-- Tabla de Programas -->
      <div class="tabla-container" v-if="tabActiva === 'programas'">
        <table class="tabla-programas">
          <thead>
            <th>Nombre del Programa</th>
            <th>Categoría</th>
            <th>Tipo</th>
            <!-- <th>Monto</th> -->
            <th>Beneficiarios</th>
            <th>Estado</th>
            <th>Acciones</th>
          </thead>
          <tbody>
            <tr v-for="beneficio in programasPaginados" :key="beneficio.id">
              <td>
                <strong>{{ beneficio.nombrebeneficio }}</strong
                ><br />
                <small style="color: #6b7280">{{ beneficio.descripcionCorta }}</small>
              </td>
              <td>
                <span class="badge-categoria" :style="getEstiloCategoria(beneficio.categoria)">
                  {{ getNombreCategoria(beneficio.categoria) }}
                </span>
              </td>

              <td class="capitalize">{{ beneficio.tipo }}</td>

              <!-- <td>{{ programa.monto | currency }}</td> -->

              <td>{{ contarBeneficiarios()[beneficio.id] || 0 }}</td>

              <td class="capitalize">
                <span :style="getColorEstado(beneficio.estado)">
                  {{ beneficio.estado }}
                </span>
              </td>
              <td>
                <div class="acciones">
                  <button class="btn-accion btn-editar" @click="editarPrograma(beneficio.id)" v-if="!isReadOnly">
                    Editar
                  </button>
                  <button
                    class="btn-accion btn-eliminar"
                    @click="cambiarEstadoPrograma(beneficio.id)"
                    v-if="beneficio.estado?.toLowerCase() === 'activo' && !isReadOnly" 
                  >
                    Pausar
                  </button>
                  <button
                    class="btn-accion btn-ver"
                    @click="activarPrograma(beneficio.id)"
                    v-if="beneficio.estado?.toLowerCase() === 'pausado' && !isReadOnly"
                  >
                    Activar
                  </button>
                  <button class="btn-accion btn-ver" @click="verDetalles(beneficio.id)">Ver</button>
                  <button class="btn-accion btn-eliminar" @click="eliminarPrograma(beneficio.id)" v-if="!isReadOnly">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Paginación y Selector de Items -->
        <div class="paginacion-wrapper" v-if="beneficios.length > 0">
          <div class="items-por-pagina">
            <label for="itemsPorPaginaSelect">Mostrar:</label>
            <select id="itemsPorPaginaSelect" v-model="programasPorPagina" class="filter-select">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
            <span>programas por página.</span>
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

      <!-- Modal de Nuevo Programa-->
      <div class="modal-overlay" v-if="mostrarModalPrograma">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ programaEditando ? 'Editar Programa' : 'Nuevo Programa Social' }}
            </h3>
            <button class="btn-cerrar" @click="cerrarModalPrograma">×</button>
          </div>

          <div class="modal-content">
            <form class="formulario" @submit.prevent="guardarPrograma">
              <div class="campo-grupo">
                <div class="campo">
                  <label for="nombre">Nombre del Programa *</label>
                  <input
                    type="text"
                    id="nombre"
                    class="input"
                    v-model="formPrograma.nombrebeneficio"
                    required
                    placeholder="Ej: AUH - Asignación Universal por Hijo"
                  />
                </div>
                <div class="campo">
                  <label for="categoria">Categoría *</label>
                  <select id="categoria" class="input" v-model="formPrograma.categoria" required>
                    <option value="">Seleccionar categoría</option>
                    <option v-for="(cat, key) in categorias" :key="key" :value="key">
                      {{ cat.nombre }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="campo-grupo">
                <div class="campo">
                  <label for="tipo">Tipo *</label>
                  <select id="tipo" class="input" v-model="formPrograma.tipo" required>
                    <option value="">Seleccionar tipo</option>
                    <option value="nacional">Nacional</option>
                    <option value="provincial">Provincial</option>
                    <option value="municipal">Municipal</option>
                  </select>
                </div>
                <!-- <div class="campo">
                            <label for="monto">Monto Mensual *</label>
                            <input 
                            type="number" 
                            id="monto" 
                            class="input" 
                            v-model="formPrograma.montoActual"
                            required
                            min="0"
                            step="100"
                            >
                        </div> -->
              </div>

              <div class="campo">
                <label for="descripcion">Descripción corta</label>
                <textarea
                  id="descripcion"
                  class="input"
                  rows="2"
                  v-model="formPrograma.descripcionCorta"
                  placeholder="Descripción corta del programa..."
                ></textarea>
              </div>

              <!-- <div class="campo">
                            <label>Requisitos</label>
                            <div class="requisitos-list">
                                <div 
                                v-for="(requisito, index) in formPrograma.requisitos" 
                                :key="index"
                                class="requisito-item"
                                >
                                <input 
                                    type="text" 
                                    class="input" 
                                    v-model="formPrograma.requisitos[index]"
                                    placeholder="Agregar requisito..."
                                >
                                <button 
                                    type="button" 
                                    class="btn-eliminar-requisito"
                                    @click="eliminarRequisito(index)"
                                >
                                    ×
                                </button>
                                </div>
                                <button type="button" class="btn-agregar-requisito" @click="agregarRequisito">
                                + Agregar Requisito
                                </button>
                            </div>
                        </div> -->
            </form>
          </div>

          <div class="modal-acciones">
            <button class="btn-cancelar" @click="cerrarModalPrograma">Cancelar</button>
            <button class="btn-guardar" @click="guardarPrograma">
              {{ programaEditando ? 'Actualizar' : 'Guardar' }} Programa
            </button>
          </div>
        </div>
      </div>

      <div v-if="beneficioSeleccionado" class="modal-overlay-ver active">
        <div class="modal-ver">
          <div class="modal-header-ver">
            <h3 class="modal-title-ver">Detalles del programa</h3>
            <button class="btn-cerrar-ver" @click="beneficioSeleccionado = null">×</button>
          </div>
          <div class="modal-content-ver">
            <h2>{{ beneficioSeleccionado.nombrebeneficio }}</h2>
            <p class="description">{{ beneficioSeleccionado.descripcionCorta }}</p>

            <div class="info-grid">
              <div class="info-card">
                <div
                  style="
                    font-weight: 600;
                    color: #2c3e50;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                  "
                >
                  Categoría
                </div>
                <div class="nomcategoria">
                  {{ getNombreCategoria(beneficioSeleccionado.categoria) }}
                </div>
              </div>
              <div class="info-card">
                <div
                  style="
                    font-weight: 600;
                    color: #2c3e50;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                  "
                >
                  Tipo
                </div>
                <div class="capitalize nomtipo">
                  {{ beneficioSeleccionado.tipo }}
                </div>
              </div>
              <div class="info-card">
                <div
                  style="
                    font-weight: 600;
                    color: #2c3e50;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                  "
                >
                  Estado
                </div>
                <span :style="getColorEstado(beneficioSeleccionado.estado)" class="capitalize">
                  {{ beneficioSeleccionado.estado }}
                </span>
              </div>
            </div>

            <h3>Personas beneficiarias</h3>
            <ul>
              <li
                v-for="persona in personasDelBeneficio"
                :key="persona.id"
                class="fade-in"
                style="font-weight: 600; color: #2c3e50; font-size: 16px"
              >
                {{ persona.nombre }} {{ persona.apellido }}
                <small
                  style="
                    color: #7f8c8d;
                    font-size: 14px;
                    display: block;
                    margin-top: 6px;
                    font-weight: normal;
                  "
                  v-if="!isReadOnly"
                >
                  DNI: {{ formatearDNI(persona.DNI) }} • Familia: {{ persona.idfamilia?.nombre }}
                </small>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- <div v-if="beneficioSeleccionado" class="modal-overlay-ver"
                <div class="modal-ver"></div>
                <div class="modal-header-ver">
                    <h3 class="modal-title-ver">Detalles del Programa</h3>
                    <button class="btn-cerrar-ver" @click="beneficioSeleccionado = null">×</button>
                </div>

                <div class="modal-content-ver">
                    <h2>{{ beneficioSeleccionado.nombrebeneficio }}</h2>
                    <p>{{ beneficioSeleccionado.descripcionCorta }}</p>
                    <p><strong>Categoría:</strong> {{ beneficioSeleccionado.categoria }}</p>
                    <p><strong>Tipo:</strong> {{ beneficioSeleccionado.tipo }}</p>
                    <p><strong>Estado:</strong> {{ beneficioSeleccionado.estado }}</p>

                    <h3>Personas beneficiarias</h3>
                    <ul>
                    <li v-for="persona in personasDelBeneficio" :key="persona.id">
                        {{ persona.nombre }} {{ persona.apellido }} -
                        <small>(DNI: {{ formatearDNI(persona.DNI) }} - Familia: {{ persona.idfamilia?.nombre }})</small>
                    </li>
                    </ul>

                    <button @click="beneficioSeleccionado = null">Cerrar</button>
                </div>
            </div> -->

      <div v-if="cargando" class="estado-cargando">
        <p>Cargando información...</p>
        <p>Por favor, espera...</p>
      </div>

      <!-- Mensaje cuando no hay datos -->
      <div
        class="no-data"
        v-if="
          tabActiva === 'programas' && beneficios.length === 0 && !cargando
          // (tabActiva === 'beneficiarios' && familias.length === 0)
        "
      >
        No hay {{ tabActiva === 'programas' ? 'programas' : 'beneficiarios' }} registrados
      </div>

      <!-- Pestaña de Reportes -->
      <div v-if="tabActiva === 'reportes'" class="reportes-container fade-in">
        <div class="estadisticas-grid">
          <div class="estadistica-card">
            <h3>Total de Programas</h3>
            <p>{{ beneficios.length }}</p>
          </div>
          <div class="estadistica-card">
            <h3>Total de Beneficiarios</h3>
            <p>{{ totalBeneficiarios }}</p>
          </div>
          <div class="estadistica-card">
            <h3>Familias Beneficiarias</h3>
            <p>{{ totalFamiliasBeneficiarias }}</p>
          </div>
          <div class="estadistica-card">
            <h3>Personas sin Beneficios</h3>
            <p>{{ personasSinBeneficios }}</p>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h3>Beneficiarios por Programa</h3>
            <div class="chart-wrapper">
              <canvas id="beneficiariosPorProgramaChart"></canvas>
            </div>
          </div>
          <div class="chart-card">
            <h3>Distribución por Categoría</h3>
            <div class="chart-wrapper">
              <canvas id="distribucionCategoriaChart"></canvas>
            </div>
          </div>
          <div class="chart-card">
            <h3>Beneficiarios por Grupo Etario</h3>
            <div class="chart-wrapper">
              <canvas id="grupoEtarioChart"></canvas>
            </div>
          </div>
          <div class="chart-card">
            <h3>Programas por Tipo</h3>
            <div class="chart-wrapper">
              <canvas id="programasPorTipoChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import {
  createDirectus,
  rest,
  authentication,
  staticToken,
  readItems,
  readItem,
  createItem,
  updateItem,
  deleteItem,
} from '@directus/sdk'
import Swal from 'sweetalert2'
import Chart from 'chart.js/auto'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../config/auth.js'
import dayjs from 'dayjs'
import { directus } from '../../config/directus.js'

const tabActiva = ref('programas')
const beneficioSeleccionado = ref(null)
const beneficios = ref([])
const personas = ref([])
const mostrarModalPrograma = ref(false)
let beneficiariosPorProgramaChart = null
let distribucionCategoriaChart = null
let grupoEtarioChart = null
let programasPorTipoChart = null

// Estado para la paginación
const paginaActual = ref(1)
const programasPorPagina = ref(5)

const { isReadOnly } = useAuth()

let scrollY = 0

const bloquearScroll = () => {
  scrollY = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.overflow = 'hidden'
}

const permitirScroll = () => {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.overflow = ''
  window.scrollTo(0, scrollY)
}

watch(mostrarModalPrograma, (nuevoValor) => {
  if (nuevoValor) {
    bloquearScroll()
  } else {
    permitirScroll()
  }
})
watch(beneficioSeleccionado, (nuevoValor) => {
  if (nuevoValor) {
    bloquearScroll()
  } else {
    permitirScroll()
  }
})
watch(programasPorPagina, () => {
  paginaActual.value = 1;
})

const paginasTotales = computed(() => {
  return Math.ceil(beneficios.value.length / programasPorPagina.value)
})

const programasPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * programasPorPagina.value
  const fin = inicio + programasPorPagina.value
  return beneficios.value.slice(inicio, fin)
})
function cambiarPagina(pagina) {
  if(pagina > 0 && pagina <= paginasTotales.value) {
    paginaActual.value = pagina;
  }
}
// const showModalBeneficiario = ref(false);
// const beneficiarioEditando = ref(null);

const mostrarConfirmacion = ref(false)
const mensajeConfirmacion = ref('')
const idPendiente = ref(null)
const accionPendiente = ref(null)

const programaEditando = ref(null)
// const nuevoPrograma = ref({
//     nombre: '',
//     descripcionCorta: '',
//     categoria: '',
//     tipo: '',
//     estado: 'activo'
// });
const nuevoPrograma = ref(null)

const cargando = ref(true)
const formatearDNI = (dni) => {
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const formPrograma = ref({
  nombrebeneficio: '',
  descripcionCorta: '',
  categoria: '',
  tipo: '',
  // monto: 0,
  estado: 'activo',
})
const nuevoBeneficiario = ref({
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  programaId: null,
})
const categorias = {
  pensiones_jubilaciones: { nombre: 'Jubilaciones y Pensiones', color: '#10b981' },
  asignaciones_familiares: { nombre: 'Asignaciones Familiares', color: '#3B82F6' },
  ayuda_emergencia: { nombre: 'Ayuda de Emergencia', color: '#f59e0b' },
  becas_estudios: { nombre: 'Becas y Educación', color: '#81bf1d' },
  empleo_capacitacion: { nombre: 'Empleo y Capacitación', color: '#ef4444' },
  vivienda_infraestructura: { nombre: 'Vivienda e Infraestructura Social', color: '#c4921b' },
  otros: { nombre: 'Otros', color: '#A78BFA' },
}
const estados = {
  activo: { nombre: 'Activo', class: 'badge-success', color: '#1fbd89' },
  pausado: { nombre: 'Pausado', class: 'badge-warning', color: '#FBBF24' },
  finalizado: { nombre: 'Finalizado', class: 'badge-secondary', color: '#6B7280' },
}
const getEstiloCategoria = (categoria) => {
  const cat = categorias[categoria]
  return cat ? `background-color: ${cat.color};` : ''
}
const getNombreCategoria = (categoria) => {
  return categorias[categoria] ? categorias[categoria].nombre : categoria
}

const getColorEstado = (estado) => {
  const e = estados[estado?.toLowerCase()]
  return e ? `background-color: ${e.class}; color: ${e.color}; font-weight: 600;` : ''
}

const cambiarTab = (tab) => {
  tabActiva.value = tab
  if (tab === 'reportes') {
    nextTick(() => renderizarGraficos())
  }
}
const abrirModalNuevo = () => {
  mostrarModalPrograma.value = true
  programaEditando.value = null
  formPrograma.value = {
    nombrebeneficio: '',
    descripcionCorta: '',
    categoria: '',
    tipo: '',
    // monto: 0,
    estado: 'activo',
  }
}
const cambiarEstadoPrograma = (id) => {
  idPendiente.value = id

  Swal.fire({
    title: 'Pausar Programa',
    text: '¿Deseas pausar este programa?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Si, pausar',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const updated = await directus.value.request(
        updateItem('beneficios', idPendiente.value, { estado: 'pausado' }),
      )
      const index = beneficios.value.findIndex((p) => p.id === idPendiente.value)
      if (index !== -1) beneficios.value[index] = updated

      const nombrePrograma = beneficios.value[index].nombrebeneficio

      Swal.fire({
        title: '¡Programa pausado!',
        text: 'El programa se ha pausado.',
        icon: 'success',
      })

      await directus.value.request(
        createItem('logs', {
          fecha: getLocalISO(),
          nivel: 'INFO',
          mensaje: `El programa ${nombrePrograma} ha sido PAUSADO`,
        }),
      )
    }
  })
}
const activarPrograma = async (id) => {
  idPendiente.value = id
  Swal.fire({
    title: 'Activar Programa',
    text: '¿Deseas activar este programa?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, activar',
    cancelButtonText: 'Cancelar',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const updated = await directus.value.request(
        updateItem('beneficios', idPendiente.value, { estado: 'activo' }),
      )
      const index = beneficios.value.findIndex((p) => p.id === idPendiente.value)
      if (index !== -1) beneficios.value[index] = updated

      const nombrePrograma = beneficios.value[index].nombrebeneficio

      Swal.fire({
        title: '¡Programa activado!',
        text: 'El programa se ha actvado.',
        icon: 'success',
      })

      await directus.value.request(
        createItem('logs', {
          fecha: getLocalISO(),
          nivel: 'INFO',
          mensaje: `El programa ${nombrePrograma} ha sido ACTIVADO`,
        }),
      )
    }
  })
}
const editarPrograma = async (id) => {
  try {
    //Trae el registro desde directus
    const programa = await directus.value.request(readItem('beneficios', id))

    //Guarda referencia del programa que estamos editando
    programaEditando.value = programa

    //Rellena el form con los datos actuales
    formPrograma.value = {
      nombrebeneficio: programa.nombrebeneficio || '',
      descripcionCorta: programa.descripcionCorta || '',
      categoria: programa.categoria || '',
      tipo: programa.tipo?.toLowerCase() || '',
      estado: programa.estado || 'activo',
    }

    //Abrir modal
    mostrarModalPrograma.value = true
  } catch (error) {
    console.error('Error al cargar el programa para editar: ', error)
  }
}

const eliminarPrograma = async (id) => {
  try {
    Swal.fire({
      title: 'Eliminar Programa',
      text: '¿Deseas eliminar este programa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const index = beneficios.value.findIndex((p) => p.id === id)
        if (index !== -1) {
          const nombreProgramaEliminado = beneficios.value[index].nombrebeneficio

          // 1. Eliminar de Directus
          await directus.value.request(deleteItem('beneficios', id))
          // 2. Eliminar del array local
          beneficios.value.splice(index, 1)

          // 3. Registrar en el log con el nombre ya guardado
          await directus.value.request(
            createItem('logs', {
              fecha: getLocalISO(),
              nivel: 'INFO',
              mensaje: `Programa eliminado: ${nombreProgramaEliminado}`,
            }),
          )
        }
      }
    })
  } catch (error) {
    console.error('Error al eliminar el programa: ', error)
  }
}
function getLocalISO() {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000 // offset en ms
  const localTime = new Date(now.getTime() - tzOffset)
  return localTime.toISOString().slice(0, 19) // elimina milisegundos
}

const guardarPrograma = async () => {
  try {
    if (programaEditando.value) {
      //Editar existente
      const updated = await directus.value.request(
        updateItem('beneficios', programaEditando.value.id, formPrograma.value),
      )
      const index = beneficios.value.findIndex((p) => p.id === programaEditando.value.id)
      if (index !== -1) beneficios.value[index] = updated

      cerrarModalPrograma()

      Swal.fire({
        title: '¡Programa actualizado!',
        text: 'El programa se ha actualizado.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      })
    } else {
      //Crear nuevo
      const created = await directus.value.request(createItem('beneficios', formPrograma.value))
      beneficios.value.push(created)

      await directus.value.request(
        createItem('logs', {
          fecha: getLocalISO(),
          nivel: 'INFO',
          mensaje: `Nuevo programa creado: ${formPrograma.value.nombrebeneficio}`,
        }),
      )

      cerrarModalPrograma()

      Swal.fire({
        title: '¡Programa creado!',
        text: 'El programa se ha creado.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      })
    }

    // cerrarModalPrograma();
  } catch (error) {
    console.error('Error al guardar programa:', error)

    Swal.fire({
      title: 'Error al guardar programa',
      text: 'Ocurrió un problema al intentar guardar el programa',
      icon: 'error',
    })

    await directus.value.request(
      createItem('logs', {
        fecha: getLocalISO(),
        nivel: 'ERROR',
        mensaje: `Error al guardar programa`,
      }),
    )
  }
}

const personasDelBeneficio = ref([])

const verDetalles = async (beneficioId) => {
  //Traigo el beneficio en si
  const beneficio = await directus.value.request(readItem('beneficios', beneficioId))
  beneficioSeleccionado.value = beneficio

  //Traigo las personas asociadas a ese beneficio
  const relaciones = await directus.value.request(
    readItems('beneficios_personas', {
      filter: { idbeneficio: { _eq: beneficioId } },
      fields: [
        'id',
        'idpersona.idpersona',
        'idpersona.nombre',
        'idpersona.apellido',
        'idpersona.DNI',
        'idpersona.idfamilia.nombre',
      ],
      limit: -1,
    }),
  )
  personasDelBeneficio.value = relaciones.map((r) => r.idpersona)
}

const cerrarModalPrograma = () => {
  mostrarModalPrograma.value = false
  programaEditando.value = null
}
const bp = ref([])
// const familias = ref([]);

const contarBeneficiarios = () => {
  const count = bp.value.reduce((acc, item) => {
    acc[item.idbeneficio] = (acc[item.idbeneficio] || 0) + 1
    return acc
  }, {})

  return count
}

const totalBeneficiarios = computed(() => {
  if (!bp.value) return 0
  const beneficiariosIds = new Set(bp.value.map((item) => item.idpersona.idpersona))
  return beneficiariosIds.size
})

const totalFamiliasBeneficiarias = computed(() => {
  if (!bp.value) return 0
  const familiasIds = new Set(
    bp.value.map((item) => item.idpersona.idfamilia?.idfamilia).filter(Boolean),
  )
  return familiasIds.size
})

const personasSinBeneficios = computed(() => {
  if (!personas.value.length || !bp.value.length) return personas.value.length

  const idsConBeneficio = new Set(bp.value.map((item) => item.idpersona.idpersona))
  const totalPersonas = personas.value.length

  return totalPersonas - idsConBeneficio.size
})

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  const edad = dayjs().diff(dayjs(fechaNacimiento), 'year')
  return edad
}

const distribucionPorCategoria = computed(() => {
  if (!beneficios.value.length) return []
  const distribucion = {}
  beneficios.value.forEach((b) => {
    if (b.categoria && categorias[b.categoria]) {
      const nombreCat = categorias[b.categoria].nombre
      distribucion[nombreCat] = (distribucion[nombreCat] || 0) + 1
    }
  })
  return distribucion
})

const distribucionGrupoEtario = computed(() => {
  const grupos = {
    'Niños y Adolescentes (0-17)': 0,
    'Adultos (18-64)': 0,
    'Adultos Mayores (65+)': 0,
  }

  if (!bp.value.length) return grupos

  const beneficiariosUnicos = [
    ...new Map(bp.value.map((item) => [item.idpersona.idpersona, item.idpersona])).values(),
  ]

  beneficiariosUnicos.forEach((persona) => {
    const edad = calcularEdad(persona.fechaNacimiento)
    if (edad === null) return
    if (edad <= 17) grupos['Niños y Adolescentes (0-17)']++
    else if (edad <= 64) grupos['Adultos (18-64)']++
    else grupos['Adultos Mayores (65+)']++
  })
  return grupos
})
const renderizarGraficos = () => {
  const beneficiariosData = contarBeneficiarios()
  const labelsProgramas = beneficios.value.map((b) => b.nombrebeneficio)
  const dataProgramas = beneficios.value.map((b) => beneficiariosData[b.id] || 0)

  if (beneficiariosPorProgramaChart) {
    beneficiariosPorProgramaChart.destroy()
  }
  const ctx1 = document.getElementById('beneficiariosPorProgramaChart')
  const coloresProgramas = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
  ]
  if (ctx1) {
    beneficiariosPorProgramaChart = new Chart(ctx1, {
      type: 'polarArea',
      data: {
        labels: labelsProgramas,
        datasets: [
          {
            label: 'Nº de Beneficiarios',
            data: dataProgramas,
            backgroundColor: dataProgramas.map(
              (_, index) => coloresProgramas[index % coloresProgramas.length],
            ),
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          r: {
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    })
  }

  const distribucionData = distribucionPorCategoria.value
  const labelsCategorias = Object.keys(distribucionData)
  const dataCategorias = Object.values(distribucionData)
  const coloresCategorias = labelsCategorias.map((label) => {
    const catKey = Object.keys(categorias).find((key) => categorias[key].nombre === label)
    return catKey ? categorias[catKey].color : '#ccc'
  })

  if (distribucionCategoriaChart) {
    distribucionCategoriaChart.destroy()
  }
  const ctx2 = document.getElementById('distribucionCategoriaChart')
  if (ctx2) {
    distribucionCategoriaChart = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: labelsCategorias,
        datasets: [
          {
            data: dataCategorias,
            backgroundColor: coloresCategorias,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  const etarioData = distribucionGrupoEtario.value
  const labelsEtario = Object.keys(etarioData)
  const dataEtario = Object.values(etarioData)

  if (grupoEtarioChart) {
    grupoEtarioChart.destroy()
  }
  const ctx3 = document.getElementById('grupoEtarioChart')
  if (ctx3) {
    grupoEtarioChart = new Chart(ctx3, {
      type: 'pie',
      data: {
        labels: labelsEtario,
        datasets: [
          {
            data: dataEtario,
            backgroundColor: [
              'rgba(255, 159, 64, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    })
  }

  if (programasPorTipoChart) {
    programasPorTipoChart.destroy()
  }
  const ctx4 = document.getElementById('programasPorTipoChart')
  if (ctx4) {
    programasPorTipoChart = new Chart(ctx4, {
      type: 'bar',
      data: {
        labels: ['Nacional', 'Provincial', 'Municipal'],
        datasets: [
          {
            label: 'Nº de Programas',
            data: [
              beneficios.value.filter((b) => b.tipo === 'nacional').length,
              beneficios.value.filter((b) => b.tipo === 'provincial').length,
              beneficios.value.filter((b) => b.tipo === 'municipal').length,
            ],
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            grid: {
              display: false,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    })
  }
}
// const obtenerFamiliasPorBeneficio = (beneficioId) => {
//   const familiasMap = new Map();

//   bp.value
//     .filter(bpItem => bpItem.idbeneficio === beneficioId)
//     .forEach(bpItem => {
//       const persona = bpItem.idpersona;
//       if (persona?.idfamilia) {
//         familiasMap.set(
//           persona.idfamilia.idfamilia,
//           persona.idfamilia.nombre
//         );
//       }
//     });

//   return Array.from(familiasMap.entries()).map(([id, nombre]) => ({ id, nombre }));
// };

onMounted(async () => {
  try {
    const resProgramas = await directus.value.request(readItems('beneficios'))
    beneficios.value = resProgramas

    const resBP = await directus.value.request(
      readItems('beneficios_personas', {
        fields: ['id', 'idbeneficio', 'idpersona.*', 'idpersona.idfamilia.*'],
      }),
    )
    bp.value = resBP

    const resPersonas = await directus.value.request(
      readItems('personas', {
        fields: ['idpersona', 'idfamilia.*'],
      }),
    )
    personas.value = resPersonas

    // const resPersonas = await directus.value.request(readItems('personas'));
    // personas.value = resPersonas;
  } catch (error) {
    console.error('Error al cargar programas:', error)
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.container-principal {
  background-color: #f1efef;
  min-height: 100vh;
}

.header {
  /* margin-bottom: 1rem; */
  text-align: center;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  background: linear-gradient(135deg, #1f9e26, #169770);
  padding: 2rem;
  color: white;
}
.header h1 {
  margin: 0 0 8px 0;
  font-size: 2.5rem;
}
.header p {
  margin: 0;
  opacity: 0.9;
}

.tabs {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}
.tab-button {
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.4s ease;
  border-bottom: 3px solid transparent;
  /* width: 100%; */
  position: relative;
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
.estado-cargando {
  text-align: center;
  padding: 10px;
  font-size: 16px;
  font-weight: 600;
}
.tab-content {
  padding: 2rem;
  min-height: 70vh;
}
.programas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.programas-title {
  font-size: 2rem;
  color: #1e293b;
  font-weight: 600;
}
.btn-agregar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}
.btn-agregar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}
.tabla-container {
  background: rgb(255, 253, 253);
  border-radius: 15px;
  /* overflow: hidden; */
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  /* padding: 1rem; */
  overflow-x: auto;
}
.tabla-programas {
  width: 100%;
  border-collapse: collapse;
}
.tabla-programas th {
  color: white;
  padding: 0.85rem;
  font-weight: 700;
  text-align: left;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tabla-programas thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.tabla-programas td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  /* color: #475569; */
}
.tabla-programas td:nth-child(2) {
  /* text-align: center; */
  /* width: 100%; */
  /* display: inline-block; */
  white-space: nowrap;
}
.tabla-programas tr {
  transition: all 0.3s ease;
}
.tabla-programas tr:hover {
  background: #e9eaeb;
}
.tabla-programas tr:last-child td {
  border-bottom: none;
}
.capitalize {
  text-transform: capitalize;
}
.badge-categoria {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
}
.acciones {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.btn-accion {
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.87rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  font-weight: 600;
}
.btn-editar {
  background: #3b82f6;
  color: white;
}
.btn-editar:hover {
  background: #2563eb;
  transform: scale(1.05);
}
.acciones .btn-eliminar {
  background: #ef4444;
  color: white;
}
.acciones .btn-eliminar:hover {
  transform: scale(1.05);
}

.modal-acciones .btn-eliminar {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.7rem 1.2rem;
  transition: all 0.3s ease;
}
.btn-eliminar:hover {
  background: #dc2626;
  transform: translateY(-2px);
}
.btn-ver {
  background: #1fc450;
  color: white;
}
.btn-ver:hover {
  background: #16a34a;
  transform: scale(1.05);
}
.no-data {
  text-align: center;
  font-size: 1.25rem;
  color: #6b7280;
}
/* Modal */
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
  width: 90vw;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}
.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
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
  overflow-y: auto;
}

.modal-overlay-ver {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}
.modal-overlay-ver.active {
  opacity: 1;
  visibility: visible;
}
.modal-ver {
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 95%;
  max-height: 100vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  transform: scale(0.9) translateY(50px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-overlay-ver.active .modal-ver {
  transform: scale(1) translateY(0);
}
.modal-header-ver {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 30px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title-ver {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn-cerrar-ver {
  background: transparent;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 2rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.4s ease;
}
.btn-cerrar-ver:hover {
  transform: scale(1.3);
}

.modal-content-ver {
  padding: 30px;
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}
.modal-content-ver::-webkit-scrollbar {
  width: 8px;
}

.modal-content-ver::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-content-ver::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

/* Título principal */
.modal-content-ver h2 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
/* Descripción */
.modal-content-ver .description {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
  padding: 20px;
  background: #f2f2f7;
  border-radius: 12px;
  /* border-left: 3px solid #667eea; */
  position: relative;
  overflow: hidden;
}
.modal-content-ver .description::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Info Grid */
.modal-content-ver .info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.modal-content-ver .info-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #b2b7bbcb;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.modal-content-ver .info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Párrafos con información */
.modal-content-ver p {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.modal-content-ver p strong {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

/* Sección de beneficiarios */
.modal-content-ver h3 {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
  margin-top: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Lista de beneficiarios */
.modal-content-ver ul {
  list-style: none;
  padding: 0;
}

.modal-content-ver li {
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.modal-content-ver li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-content-ver li:hover {
  border-color: #667eea;
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
}

.modal-content-ver li small {
  color: #7f8c8d;
  font-size: 14px;
  display: block;
  margin-top: 6px;
}

/* Estados con colores */
.capitalize {
  text-transform: capitalize;
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
.modal-content form {
  display: grid;
  gap: 1.5rem;
}
.campo-grupo {
  display: grid;
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
.campo textarea {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  color: #475569;
  resize: none;
}
.reportes-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
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
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}
.estadisticas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.estadistica-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-top: 4px solid;
  transition: all 0.3s ease;
}
.estadistica-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}
.estadistica-card:nth-child(1) {
  border-color: #3b82f6;
}
.estadistica-card:nth-child(2) {
  border-color: #10b981;
}
.estadistica-card:nth-child(3) {
  border-color: #f59e0b;
}
.estadistica-card:nth-child(4) {
  border-color: #ef4444;
}

.estadistica-card h3 {
  color: #4b5563;
  font-size: 1rem;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
}
.estadistica-card p {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}
.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
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
.chart-wrapper {
  position: relative;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px; /* Altura mínima para el gráfico */
}
.chart-wrapper canvas {
  max-width: 100%;
  max-height: 100%;
}
.chart-card h3 {
  text-align: center;
  font-size: 1.2rem;
  color: #374151;
  margin-bottom: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header h1 {
    font-size: 1.8rem;
  }
  .header p {
    font-size: 0.9rem;
  }
  .programas-title {
    margin: 0 -1rem;
    font-size: 1.4rem;
  }
  .tab-button {
    padding: 1rem;
    font-size: 0.9rem;
  }
  .tabla-container {
    margin: -1rem;
  }
  .tabla-programas {
    font-size: 0.75rem;
  }
  .btn-agregar {
    margin: 0 -1rem;
    padding: 10px 20px;
    font-size: 0.9rem;
  }
  .btn-editar {
    padding: 5px 10px;
    font-size: 0.75rem;
  }
  .btn-eliminar,
  .btn-ver {
    padding: 5px 10px;
    font-size: 0.75rem;
  }
  .estado-cargando {
    margin-top: 10px;
  }
  .no-data {
    margin-top: 30px;
  }
  .btn-ver {
    background: #1fc450;
    color: white;
  }
  .btn-ver:hover {
    background: #16a34a;
    transform: scale(1.05);
  }
  .btn-cerrar {
    font-size: 2rem;
  }
  .btn-guardar,
  .btn-cancelar {
    padding: 10px 15px;
    font-size: 0.9rem;
  }

  .modal-ver {
    max-width: 95%;
    width: 95%;
    margin: 10px;
    max-height: calc(100vh - 3rem);
  }
  .modal-overlay {
    padding: 10px;
    align-items: flex-start;
    padding-top: 2rem;
  }
  .modal {
    width: 100%;
    margin: 5px;
    max-height: calc(100vh - 3rem);
  }
  .modal-header {
    align-items: flex-start;
    gap: 10px;
    padding: 1.5rem;
  }
  .modal-title {
    font-size: 1.5rem;
    line-height: 1.2;
  }
  .modal-content {
    padding: 10px;
    overflow: auto;
  }
  .campo-grupo {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .modal-title-ver {
    font-size: 1.5rem;
  }
  .modal-content-ver {
    padding: 15px;
    max-height: calc(100vh - 120px);
  }

  .modal-content-ver h2 {
    font-size: 1.5rem;
  }

  .modal-content-ver .description {
    padding: 15px;
  }

  .modal-content-ver .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }

  .modal-content-ver .info-card {
    padding: 10px;
  }
  .info-card .nomcategoria,
  .info-card .nomtipo {
    color: #717e91;
    font-weight: 500;
    font-size: 0.95rem;
  }
  .modal-content-ver p {
    margin-bottom: 10px;
  }

  .modal-content-ver p strong {
    font-size: 1rem;
    margin-bottom: 3px;
  }
  .modal-content-ver h3 {
    font-size: 1.25rem;
    margin-bottom: 15px;
  }
  .modal-content-ver li {
    padding: 12px;
  }
  .modal-content-ver ul {
    margin: 0;
    padding: 0;
  }

  .tabla-programas th,
  .tabla-programas td {
    padding: 0.75rem;
    font-size: 0.75rem;
  }
  .tabla-programas {
    font-size: 14px;
    /* width: 10%; */
  }
  .badge-categoria {
    font-size: 0.7rem;
    margin: 0;
    padding: 2px 4px;
    border-radius: 10px;
    text-align: center;
    display: inline-block;
    /* white-space: nowrap; */
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
