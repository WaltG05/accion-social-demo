<template>
  <div class="container-page">
    <div class="contenedor-principal">
      <div class="header" v-if="activeTab === 'viviendas'">
        <h1>Gestión de Viviendas</h1>
        <p>Agrega, actualiza y elimina viviendas</p>
      </div>

      <div class="header" v-if="activeTab === 'servicios'">
        <h1>Gestión de Servicios</h1>
        <p>Administra los servicios públicos</p>
      </div>

      <div class="header" v-if="activeTab === 'condiciones'">
        <h1>Gestión de Condiciones Habitacionales</h1>
        <p>Administra los servicios públicos</p>
      </div>

      <div class="header" v-if="activeTab === 'mapeo'">
        <h1>Gestión de Mapeo de Zonas</h1>
        <p>Visualiza las viviendas en un mapa interactivo</p>
      </div>

      <!-- Pestañas de navegación -->
      <div class="tabs">
        <button
          :class="['tab-button', { active: activeTab === 'viviendas' }]"
          @click="activeTab = 'viviendas'"
        >
          Viviendas
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'servicios' }]"
          @click="activeTab = 'servicios'"
        >
          Servicios Públicos
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'condiciones' }]"
          @click="activeTab = 'condiciones'"
        >
          Condiciones Habitacionales
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'mapeo' }]"
          @click="activeTab = 'mapeo'"
        >
          Mapeo de Zonas
        </button>
      </div>

      <!-- CONTENIDO DE VIVIENDAS -->
      <div v-if="activeTab === 'viviendas'" class="tab-content">
        <div class="viviendas-header">
          <h2 class="viviendas-title">Registro de Viviendas</h2>
          <button v-if="!isReadOnly" class="btn-agregar-vivienda" @click="mostrarFormulario = true">
            Agregar Nueva Vivienda
          </button>
        </div>

        <!-- Tabla de viviendas -->
        <div v-if="viviendas.length" class="tabla-container">
          <table class="tabla-viviendas">
            <thead>
              <th>Dirección</th>
              <th>Tipo</th>
              <th>Ambientes</th>
              <th>Habitantes</th>
              <th>Tenencia</th>
              <th>Servicios</th>
              <th>Acciones</th>
            </thead>
            <tbody>
              <tr v-for="(vivienda, index) in viviendas" :key="vivienda.idvivienda">
                <td>{{ vivienda.direccion }}</td>
                <td>{{ vivienda.tipoVivienda }}</td>
                <td>{{ vivienda.ambientes }}</td>
                <td>{{ vivienda.habitantes || '-' }}</td>
                <td>{{ vivienda.tenencia || '-' }}</td>
                <td>
                  <div
                    class="servicios-tags"
                    v-if="vivienda.servicios && vivienda.servicios.length"
                  >
                    <span
                      v-for="servicio in vivienda.servicios"
                      :key="servicio.id"
                      class="badge-servicio"
                    >
                      {{ servicio.nombreServicio }}
                    </span>
                  </div>
                  <span v-else class="no-servicios">-</span>
                </td>
                <td>
                  <div class="acciones">
                    <button class="btn-accion btn-ver" @click="verDetalles(vivienda)">Ver</button>
                    <button class="btn-accion btn-editar" @click="editarVivienda(index)" v-if="!isReadOnly">
                      Editar
                    </button>
                    <button
                      class="btn-accion btn-eliminar"
                      @click="eliminarVivienda(vivienda.idvivienda)" v-if="!isReadOnly"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="cargando" class="estado-cargando">
          <p>Cargando información...</p>
          <p>Por favor, espera...</p>
        </div>

        <div v-else class="no-data" v-if="!viviendas.length && !cargando">
          <p>No hay viviendas registradas aún</p>
          <p style="margin-top: 1rem; opacity: 0.7">
            Haz clic en "Agregar Nueva Vivienda" para comenzar
          </p>
        </div>
      </div>

      <!-- MODAL FORMULARIO -->
      <div v-if="mostrarFormulario" class="modal-overlay">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">
              {{ editIndex !== null ? 'Editar Vivienda' : 'Nueva Vivienda' }}
            </h3>
            <button class="btn-cerrar" @click="cancelarEdicion">×</button>
          </div>

          <div class="modal-content">
            <form @submit.prevent="agregarOEditarVivienda" class="formulario">
              <div class="campo-grupo">
                <div class="campo">
                  <label>Dirección *</label>
                  <input
                    v-model="nuevaVivienda.direccion"
                    placeholder="Ej: Av. San Martín 123"
                    class="input"
                    required
                  />
                </div>

                <div class="campo">
                  <label>Tipo de Vivienda *</label>
                  <select v-model="nuevaVivienda.tipoVivienda" class="input" required>
                    <option disabled value="">Seleccionar tipo</option>
                    <option>Casa</option>
                    <option>Departamento</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>

              <div class="campo-grupo">
                <div class="campo">
                  <label>Cantidad de Ambientes</label>
                  <input
                    v-model.number="nuevaVivienda.ambientes"
                    type="number"
                    min="1"
                    placeholder="Ej: 3"
                    class="input"
                  />
                </div>

                <div class="campo">
                  <label>Cantidad de Habitantes</label>
                  <input
                    v-model.number="nuevaVivienda.habitantes"
                    type="number"
                    min="1"
                    placeholder="Ej: 4"
                    class="input"
                  />
                </div>
              </div>

              <div class="campo-grupo">
                <div class="campo">
                  <label>Material del Techo</label>
                  <select v-model="nuevaVivienda.material_techo" class="input">
                    <option disabled value="">Seleccionar material</option>
                    <option>Baldosa, membrana, pizarra o teja</option>
                    <option>Losa o carpeta a la vista</option>
                    <option>Chapa de metal</option>
                    <option>Chapa de cartón, caña o paja</option>
                    <option>Otro material</option>
                  </select>
                </div>

                <div class="campo">
                  <label>Material del Piso</label>
                  <select v-model="nuevaVivienda.material_piso" class="input">
                    <option disabled value="">Seleccionar material</option>
                    <option>Cerámica, mosaico, madera</option>
                    <option>Carpeta o contrapiso</option>
                    <option>Tierra o ladrillo suelto</option>
                    <option>Otro material</option>
                  </select>
                </div>
              </div>

              <div class="campo-grupo">
                <div class="campo">
                  <label>Tenencia de Vivienda</label>
                  <select v-model="nuevaVivienda.tenencia" class="input">
                    <option disabled value="">Seleccionar tenencia</option>
                    <option>Propia</option>
                    <option>Alquilada</option>
                    <option>Cedida por trabajo</option>
                    <option>Prestada</option>
                    <option>Otra situación</option>
                  </select>
                </div>

                <div class="campo">
                  <label>Estado de la Calle</label>
                  <input
                    v-model="nuevaVivienda.calle_estado"
                    placeholder="Ej: Asfaltada, ripio, tierra"
                    class="input"
                  />
                </div>
              </div>

              <div class="campo">
                <label>Familia</label>
                <select v-model="nuevaVivienda.idfamilia" class="input">
                  <option disabled value="">Seleccionar Familia</option>
                  <option v-for="f in familiasDisponibles" :key="f.idfamilia" :value="f.idfamilia">
                    {{ f.nombre }}
                  </option>
                </select>
              </div>

              <div class="campo campo-check">
                <label class="checkbox-inline">
                  <input v-model="nuevaVivienda.noPoseeVivienda" type="checkbox" />
                  No posee una vivienda asociada
                </label>
                <small class="helper-text">
                  Marque esta opción si la familia no tiene una vivienda registrada en el sistema.
                </small>
              </div>

              <div class="campo">
                <label>Servicios Asociados</label>
                <div class="servicios-checkbox-container">
                  <div v-for="servicio in servicios" :key="servicio.id" class="checkbox-item">
                    <input
                      type="checkbox"
                      :id="'servicio-' + servicio.id"
                      :value="servicio.id"
                      v-model="nuevaVivienda.servicios"
                    />
                    <label :for="'servicio-' + servicio.id">{{ servicio.nombreServicio }}</label>
                  </div>
                </div>
              </div>

              <div class="campo">
                <label>Ubicación en el Mapa</label>
                <div id="mapa" class="mapa-container"></div>
                <small style="color: #6b7280; margin-top: 0.5rem; display: block">
                  Haz clic en el mapa para marcar la ubicación de la vivienda
                </small>
              </div>
            </form>
          </div>

          <div class="modal-acciones">
            <button type="button" class="btn-cancelar" @click="cancelarEdicion">Cancelar</button>
            <button type="submit" class="btn-guardar" @click="agregarOEditarVivienda">
              {{ editIndex !== null ? 'Actualizar' : 'Agregar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- CONTENIDO DE SERVICIOS -->
      <div v-if="activeTab === 'servicios'" class="tab-content">
        <div class="servicios-section">
          <h3>Gestión de Servicios Públicos</h3>

          <!-- Formulario de servicios -->
          <form @submit.prevent="agregarServicio" class="form-servicios" v-if="!isReadOnly">
            <div class="campo">
              <label>Nombre del Servicio</label>
              <input
                v-model="nuevoServicio.nombreServicio"
                placeholder="Ej: Agua, Luz, Internet"
                class="input"
              />
            </div>

            <div class="campo">
              <label>Observaciones</label>
              <input
                v-model="nuevoServicio.observaciones"
                placeholder="Comentarios adicionales (opcional)"
                class="input"
              />
            </div>

            <button v-if="!isReadOnly" type="submit" class="btn-guardar">Agregar Servicio</button>
          </form>

          <!-- Tabla de servicios -->
          <div v-if="servicios.length > 0" class="tabla-container">
            <table class="tabla-servicios">
              <thead>
                <th>Servicio</th>
                <th>Observaciones</th>
                <th v-if="!isReadOnly">Acciones</th>
              </thead>
              <tbody>
                <tr v-for="(servicio, index) in servicios" :key="servicio.id">
                  <td>
                    <input
                      v-if="editIndex === index"
                      v-model="editableServicio.nombreServicio"
                      class="input"
                    />
                    <span v-else>{{ servicio.nombreServicio }}</span>
                  </td>
                  <td>
                    <input
                      v-if="editIndex === index"
                      v-model="editableServicio.observaciones"
                      class="input"
                    />
                    <span v-else>{{ servicio.observaciones || 'Ninguna' }}</span>
                  </td>
                  <td v-if="!isReadOnly">
                    <div class="acciones" v-if="editIndex === index">
                      <button
                        @click="guardarEdicion(servicio.id, index)"
                        class="btn-accion btn-guardar"
                      >
                        Guardar
                      </button>
                      <button @click="cancelarEdicionS" class="btn-accion btn-cancelar">
                        Cancelar
                      </button>
                    </div>
                    <div class="acciones" v-else>
                      <button @click="editarServicio(index)" class="btn-accion btn-editar" v-if="!isReadOnly">
                        Editar
                      </button>
                      <button
                        @click="eliminarServicio(servicio.id, index)"
                        class="btn-accion btn-eliminar" v-if="!isReadOnly"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="cargandos" class="estado-cargando">
            <p>Cargando servicios...</p>
            <p>Por favor, espera...</p>
          </div>

          <div v-else class="no-data" v-if="!servicios.length && !cargandoServicios">
            <p>No hay servicios registrados aún</p>
          </div>
        </div>
      </div>

      <!-- CONTENIDO DE CONDICIONES HABITACIONALES -->
      <div v-if="activeTab === 'condiciones'" class="tab-content">
        <!-- INDICADORES VISUALES -->
        <div class="condiciones-indicadores">
          <div class="indicador-card indicador-total">
            <div class="indicador-icono">🏠</div>
            <div class="indicador-contenido">
              <h3>Total Evaluadas</h3>
              <p class="indicador-numero">{{ condicionesMetricas.total }}</p>
            </div>
          </div>

          <div class="indicador-card indicador-bueno">
            <div class="indicador-icono">✅</div>
            <div class="indicador-contenido">
              <h3>Condiciones Buenas</h3>
              <p class="indicador-numero">{{ condicionesMetricas.buenas }}</p>
              <span class="indicador-porcentaje">{{ condicionesMetricas.porcentajeBuenas }}%</span>
            </div>
          </div>

          <div class="indicador-card indicador-regular">
            <div class="indicador-icono">⚠️</div>
            <div class="indicador-contenido">
              <h3>Condiciones Regulares</h3>
              <p class="indicador-numero">{{ condicionesMetricas.regulares }}</p>
              <span class="indicador-porcentaje">{{ condicionesMetricas.porcentajeRegulares }}%</span>
            </div>
          </div>

          <div class="indicador-card indicador-critico">
            <div class="indicador-icono">🚨</div>
            <div class="indicador-contenido">
              <h3>Casos Críticos</h3>
              <p class="indicador-numero">{{ condicionesMetricas.criticas }}</p>
              <span class="indicador-porcentaje">{{ condicionesMetricas.porcentajeCriticas }}%</span>
            </div>
          </div>
        </div>

        <!-- ÚLTIMAS REVISIONES -->
        <div class="condiciones-revisiones">
          <div class="revisiones-header">
            <h2 class="revisiones-title">Últimas Evaluaciones</h2>
            <div v-if="!isReadOnly" class="revisiones-acciones">
              <button class="btn-agregar-revision" @click="abrirFormularioRevision">
                + Nueva Evaluación
              </button>
            </div>
          </div>

          <div v-if="cargandoCondiciones" class="estado-cargando">
            <p>Cargando evaluaciones...</p>
            <p>Por favor, espera...</p>
          </div>

          <div v-else-if="condiciones.length > 0" class="tabla-container">
            <table class="tabla-condiciones">
              <thead>
                <th>Dirección</th>
                <th>Tipo de Vivienda</th>
                <th>Estado</th>
                <th>Fecha de Revisión</th>
                <th>Evaluador</th>
                <th>Observaciones</th>
                <th v-if="!isReadOnly">Acciones</th>
              </thead>
              <tbody>
                <tr v-for="condicion in condiciones" :key="condicion.id" :class="`estado-${condicion.estado}`">
                  <td>{{ condicion.idvivienda?.direccion || 'N/A' }}</td>
                  <td>{{ condicion.idvivienda?.tipoVivienda || 'N/A' }}</td>
                  <td>
                    <span :class="`badge-estado badge-${condicion.estado}`">
                      {{ formatearEstado(condicion.estado) }}
                    </span>
                  </td>
                  <td>{{ formatearFecha(condicion.fecha_revision) }}</td>
                  <td>{{ condicion.evaluador || 'Sin asignar' }}</td>
                  <td class="observaciones-cell">{{ condicion.observaciones || '-' }}</td>
                  <td v-if="!isReadOnly">
                    <div class="acciones">
                      <button class="btn-accion btn-editar" @click="editarCondicion(condicion)">
                        Editar
                      </button>
                      <button class="btn-accion btn-eliminar" @click="eliminarCondicion(condicion.id)">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="no-data">
            <p>📋 No hay evaluaciones registradas aún</p>
            <p style="margin-top: 1rem; opacity: 0.7">
              Haz clic en "Nueva Evaluación" para agregar una
            </p>
          </div>
        </div>

        <!-- MODAL FORMULARIO REVISIÓN -->
        <div v-if="mostrarFormularioRevision" class="modal-overlay">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">
                {{ editandoCondicion ? 'Editar Evaluación' : 'Nueva Evaluación' }}
              </h3>
              <button class="btn-cerrar" @click="cerrarFormularioRevision">×</button>
            </div>

            <div class="modal-content">
              <form @submit.prevent="guardarCondicion" class="formulario">
                <div class="campo">
                  <label>Vivienda *</label>
                  <select v-model="nuevaCondicion.idvivienda" class="input" required>
                    <option disabled value="">Seleccionar vivienda</option>
                    <option v-for="vivienda in viviendas" :key="vivienda.idvivienda" :value="vivienda.idvivienda">
                      {{ vivienda.direccion }} - {{ vivienda.tipoVivienda }}
                    </option>
                  </select>
                </div>

                <div class="campo-grupo">
                  <div class="campo">
                    <label>Estado de la Vivienda *</label>
                    <select v-model="nuevaCondicion.estado" class="input" required>
                      <option disabled value="">Seleccionar estado</option>
                      <option value="bueno">Condiciones Buenas</option>
                      <option value="regular">Condiciones Regulares</option>
                      <option value="critico">Caso Crítico</option>
                    </select>
                  </div>

                  <div class="campo">
                    <label>Fecha de Revisión *</label>
                    <input
                      v-model="nuevaCondicion.fecha_revision"
                      type="date"
                      class="input"
                      required
                    />
                  </div>
                </div>

                <div class="campo">
                  <label>Evaluador</label>
                  <input
                    v-model="nuevaCondicion.evaluador"
                    placeholder="Nombre del evaluador"
                    class="input"
                  />
                </div>

                <div class="campo">
                  <label>Observaciones</label>
                  <textarea
                    v-model="nuevaCondicion.observaciones"
                    placeholder="Detalles sobre el estado de la vivienda..."
                    class="input textarea"
                    rows="4"
                  ></textarea>
                </div>

                <!-- Sección expandible de detalles -->
                <div class="campo">
                  <label>
                    <input type="checkbox" v-model="mostrarDetalles" />
                    Agregar detalles adicionales
                  </label>
                </div>

                <div v-if="mostrarDetalles" class="detalles-seccion">
                  <h4>Detalles de La Evaluación</h4>
                  
                  <div class="campo-grupo">
                    <div class="campo">
                      <label>Acceso a Agua Potable</label>
                      <select v-model="nuevaCondicion.agua_potable" class="input">
                        <option value="">Sin especificar</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div class="campo">
                      <label>Acceso a Electricidad</label>
                      <select v-model="nuevaCondicion.electricidad" class="input">
                        <option value="">Sin especificar</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  <div class="campo-grupo">
                    <div class="campo">
                      <label>Acceso a Gas</label>
                      <select v-model="nuevaCondicion.gas" class="input">
                        <option value="">Sin especificar</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div class="campo">
                      <label>Acceso a Cloacas</label>
                      <select v-model="nuevaCondicion.cloacas" class="input">
                        <option value="">Sin especificar</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  <div class="campo">
                    <label>Necesidades Detectadas</label>
                    <textarea
                      v-model="nuevaCondicion.necesidades"
                      placeholder="Describir qué necesita la vivienda..."
                      class="input textarea"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </form>
            </div>

            <div class="modal-acciones">
              <button type="button" class="btn-cancelar" @click="cerrarFormularioRevision">Cancelar</button>
              <button type="submit" class="btn-guardar" @click="guardarCondicion">
                {{ editandoCondicion ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'mapeo'" class="tab-content">
        <h3 class="viviendas-title">Ubicación de Todas las Viviendas</h3>
        <p>Haz clic en un marcador para ver los detalles de la vivienda.</p>
        <div id="mapa-zonas" class="mapa-container-grande"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { readItems, createItem, deleteItem, updateItem } from '@directus/sdk'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '../../config/auth.js'
import { directus } from '../../config/directus.js'

// Importación de Leaflet y corrección de íconos
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
// --- Fin de la corrección de íconos ---

const { isReadOnly } = useAuth()

// const viviendas = ref([])
const servicios = ref([])
const viviendas = ref([])
const familias = ref([])
const cargando = ref(true)
const cargandoServicios = ref(true)

const nuevoServicio = ref({
  nombreServicio: '',
  observaciones: '',
})

const nuevaVivienda = ref({
  direccion: '',
  tipoVivienda: '',
  noPoseeVivienda: false,
  ambientes: '',
  localizacion: null, // aquí vamos a guardar { type: 'Point', coordinates: [lon, lat] }
  habitantes: '',
  material_techo: '',
  material_piso: '',
  tenencia: '',
  calle_estado: '',
  idfamilia: null,
  servicios: [],
})
const activeTab = ref('viviendas')
const editIndex = ref(null)
const mostrarFormulario = ref(false)

// Variables para Condiciones Habitacionales
const condiciones = ref([])
const cargandoCondiciones = ref(false)
const mostrarFormularioRevision = ref(false)
const editandoCondicion = ref(false)
const mostrarDetalles = ref(false)

const nuevaCondicion = ref({
  id: null,
  idvivienda: null,
  estado: '',
  fecha_revision: new Date().toISOString().split('T')[0],
  evaluador: '',
  observaciones: '',
  agua_potable: '',
  electricidad: '',
  gas: '',
  cloacas: '',
  necesidades: '',
})

const condicionesMetricas = computed(() => {
  const total = condiciones.value.length
  const buenas = condiciones.value.filter((c) => c.estado === 'bueno').length
  const regulares = condiciones.value.filter((c) => c.estado === 'regular').length
  const criticas = condiciones.value.filter((c) => c.estado === 'critico').length

  return {
    total,
    buenas,
    regulares,
    criticas,
    porcentajeBuenas: total > 0 ? Math.round((buenas / total) * 100) : 0,
    porcentajeRegulares: total > 0 ? Math.round((regulares / total) * 100) : 0,
    porcentajeCriticas: total > 0 ? Math.round((criticas / total) * 100) : 0,
  }
})

const familiasDisponibles = computed(() => {
  //Obtener los idfamilia que ya están usados en viviendas
  const familiasConVivienda = viviendas.value.map((v) => v.idfamilia)

  return familias.value.filter((f) => {
    //si estoy editando, dejar pasar tambien la familia asignada a la vivienda actual
    if (editIndex.value !== null && nuevaVivienda.value.idfamilia === f.idfamilia) {
      return true
    }
    return !familiasConVivienda.includes(f.idfamilia)
  })
})

let map = null
let mapaZonas = null
let marker = null

onMounted(async () => {
  try {
    cargandoServicios.value = true
    const resServicios = await directus.value.request(readItems('servicios'))
    servicios.value = resServicios
    cargandoServicios.value = false

    const resFamilias = await directus.value.request(readItems('grupofamiliar'))
    familias.value = resFamilias

    await fetchViviendasYServicios()
    await fetchCondiciones()
  } catch (error) {
    cargandoServicios.value = false
    console.error('Error al cargar datos:', error)
  } finally {
  }
})

const fetchViviendasYServicios = async () => {
  const viviendasData = await directus.value.request(
    readItems('vivienda', {
      fields: ['*', 'localizacion'], // Aseguramos que siempre se traiga la localización
      limit: -1,
    }),
  )
  const relaciones = await directus.value.request(
    readItems('servicio_vivienda', {
      fields: ['vivienda', 'servicio.id', 'servicio.nombreServicio'],
      limit: -1,
    }),
  )

  viviendasData.forEach((vivienda) => {
    vivienda.servicios = relaciones
      .filter((rel) => rel.vivienda === vivienda.idvivienda)
      .map((rel) => rel.servicio)
  })

  viviendas.value = viviendasData
  cargando.value = false
}

const agregarOEditarVivienda = async () => {
  if (!nuevaVivienda.value.noPoseeVivienda) {
    if (!nuevaVivienda.value.direccion.trim()) {
      alert('La dirección es obligatoria')
      return
    }
    if (!nuevaVivienda.value.tipoVivienda) {
      alert('Selecciona un tipo de vivienda')
      return
    }
  }

  try {
    if (editIndex.value !== null) {
      // --- LÓGICA DE EDICIÓN ---
      const { servicios: serviciosIds, noPoseeVivienda, ...datosVivienda } = nuevaVivienda.value
      const datosFinales = {
        ...datosVivienda,
        direccion: noPoseeVivienda ? 'Sin dirección especificada' : datosVivienda.direccion.trim(),
        tipoVivienda: noPoseeVivienda ? 'No especificado' : datosVivienda.tipoVivienda,
      }

      // 1. Actualizar los datos de la vivienda
      // Aquí 'datosVivienda.idvivienda' existe porque estamos editando.
      await directus.value.request(updateItem('vivienda', datosFinales.idvivienda, datosFinales))

      // 2. Gestionar la tabla intermedia `servicio_vivienda`
      // 2.1. Obtener las relaciones existentes para esta vivienda
      const relacionesExistentes = await directus.value.request(
        readItems('servicio_vivienda', {
          filter: { vivienda: { _eq: datosVivienda.idvivienda } },
          fields: ['id'], // 'id' es la clave primaria de la tabla servicio_vivienda
        }),
      )

      // 2.2. Eliminar todas las relaciones antiguas
      if (relacionesExistentes.length > 0) {
        await directus.value.request(
          deleteItem(
            'servicio_vivienda',
            relacionesExistentes.map((r) => r.id),
          ),
        )
      }

      // 2.3. Crear las nuevas relaciones
      for (const servicioId of serviciosIds) {
        await directus.value.request(
          createItem('servicio_vivienda', {
            vivienda: datosVivienda.idvivienda,
            servicio: servicioId,
          }),
        )
      }

      editIndex.value = null
      Swal.fire({
        title: 'Actualizado',
        text: 'La vivienda ha sido actualizada',
        icon: 'success',
      })
    } else {
      // --- LÓGICA DE CREACIÓN ---
      const { servicios: serviciosIds, noPoseeVivienda, ...datosVivienda } = nuevaVivienda.value
      const datosFinales = {
        ...datosVivienda,
        direccion: noPoseeVivienda ? 'Sin dirección especificada' : datosVivienda.direccion.trim(),
        tipoVivienda: noPoseeVivienda ? 'No especificado' : datosVivienda.tipoVivienda,
      }
      // 1. Crear la nueva vivienda
      const viviendaCreada = await directus.value.request(createItem('vivienda', datosFinales))

      // 2. Crear las relaciones en la tabla intermedia
      for (const servicioId of serviciosIds) {
        await directus.value.request(
          createItem('servicio_vivienda', {
            vivienda: viviendaCreada.idvivienda,
            servicio: servicioId,
          }),
        )
      }
    }

    // Resetear formulario
    nuevaVivienda.value = {
      direccion: '',
      tipoVivienda: '',
      noPoseeVivienda: false,
      ambientes: 1,
      localizacion: null,
      habitantes: 1,
      material_techo: '',
      material_piso: '',
      tenencia: '',
      calle_estado: '',
      idfamilia: null,
      servicios: [],
    }
    mostrarFormulario.value = false

    // Forzar la recarga de los datos para reflejar los cambios en los servicios
    await fetchViviendasYServicios()
  } catch (error) {
    console.error('Error al agregar o editar vivienda:', error)
  }
}

const fetchViviendas = async () => {
  const resViviendas = await directus.value.request(
    readItems('vivienda', {
      fields: ['*', 'servicios.servicio.*'],
    }),
  )
  viviendas.value = resViviendas
}

const editarVivienda = (index) => {
  const viviendaAEditar = viviendas.value[index]
  nuevaVivienda.value = {
    ...viviendaAEditar,
    // Mapeamos los servicios para obtener solo sus IDs para el v-model
    servicios: viviendaAEditar.servicios ? viviendaAEditar.servicios.map((s) => s.id) : [],
  }
  editIndex.value = index
  mostrarFormulario.value = true

  nextTick(() => {
    initMap()
  })
}

watch(activeTab, (newTab) => {
  nextTick(() => {
    if (newTab === 'mapeo') initMapaZonas()
  })
})

watch(
  viviendas,
  (newViviendas) => {
    // Si los datos de las viviendas cambian y estamos en la pestaña de mapeo,
    // reinicializamos el mapa para reflejar los cambios.
    if (activeTab.value === 'mapeo' && newViviendas.length > 0) {
      nextTick(() => initMapaZonas())
    }
  },
  { deep: true },
)

const verDetalles = (vivienda) => {
  const serviciosHtml =
    vivienda.servicios && vivienda.servicios.length > 0
      ? `<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px;">
        ${vivienda.servicios
          .map(
            (servicio) =>
              `<span style="background-color: #eef2ff; color: #4f46e5; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 500;">
                ${servicio.nombreServicio}
            </span>`,
          )
          .join('')}
       </div>`
      : '<span style="color: #6b7280;">No tiene servicios asociados</span>'

  Swal.fire({
    title: 'Detalles de la Vivienda',
    html: `
      <div style="font-size: 15px; line-height: 1.6; text-align: left;">
        <style>
            .swal2-html-container { text-align: left !important; }
            .swal2-table td { padding: 8px; vertical-align: top; }
        </style>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px;"><b>Dirección:</b></td>
            <td style="padding: 6px;">${vivienda.direccion}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding: 6px;"><b>Tipo:</b></td>
            <td style="padding: 6px;">${vivienda.tipoVivienda}</td>
          </tr>
          <tr>
            <td style="padding: 6px;"><b>Ambientes:</b></td>
            <td style="padding: 6px;">${vivienda.ambientes || 'No especificado'}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding: 6px;"><b>Habitantes:</b></td>
            <td style="padding: 6px;">${vivienda.habitantes || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 6px;"><b>Tenencia:</b></td>
            <td style="padding: 6px;">${vivienda.tenencia || 'No especificado'}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding: 6px;"><b>Estado calle:</b></td>
            <td style="padding: 6px;">${vivienda.calle_estado || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 6px;"><b>Material techo:</b></td>
            <td style="padding: 6px;">${vivienda.material_techo || 'No especificado'}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding: 6px;"><b>Material piso:</b></td>
            <td style="padding: 6px;">${vivienda.material_piso || 'No especificado'}</td>
          </tr>
          <tr>
            <td style="padding: 6px; vertical-align: top;"><b>Servicios:</b></td>
            <td style="padding: 6px;">
                ${serviciosHtml}</td>
          </tr>
        </table>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Cerrar',
    width: '650px',
    background: '#fff',
    customClass: {
      popup: 'shadow-lg rounded-xl',
    },
  })
}

const eliminarVivienda = async (id) => {
  Swal.fire({
    title: '¿Estás seguro de que quieres eliminar esta vivienda?',
    text: 'No podrás revertir esta acción.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await directus.value.request(deleteItem('vivienda', id))
        viviendas.value = viviendas.value.filter((v) => v.idvivienda !== id)

        Swal.fire({
          title: 'Eliminado',
          text: 'La vivienda ha sido eliminada.',
          icon: 'success',
        })
      } catch (error) {
        console.error('Error al eliminar vivienda:', error)
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la vivienda.',
          icon: 'error',
        })
      }
    }
  })
}

const agregarServicio = async () => {
  if (!nuevoServicio.value.nombreServicio.trim()) {
    Swal.fire({
      title: 'Error',
      text: 'El nombre del servicio es obligatorio',
      icon: 'error',
      allowOutsideClick: false,
    })
    return
  }
  try {
    const creado = await directus.value.request(createItem('servicios', nuevoServicio.value))
    servicios.value.push(creado)

    nuevoServicio.value.nombreServicio = ''
    nuevoServicio.value.observaciones = ''

    Swal.fire({
      title: 'Agregado',
      text: 'El servicio ha sido agregado',
      icon: 'success',
      allowOutsideClick: false,
    })
  } catch (error) {
    console.error('Error al agregar servicio:', error)
  }
}

const eliminarServicio = async (id, index) => {
  Swal.fire({
    title: '¿Estás seguro de que quieres eliminar este servicio?',
    text: 'No podrás revertir esta acción.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    allowOutsideClick: false,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await directus.value.request(deleteItem('servicios', id))
        servicios.value.splice(index, 1)

        Swal.fire({
          title: 'Eliminado',
          text: 'El servicio ha sido eliminado.',
          icon: 'success',
          allowOutsideClick: false,
        })
      } catch (error) {
        console.error('Error al eliminar servicio:', error)
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el servicio.',
          icon: 'error',
          allowOutsideClick: false,
        })
      }
    }
  })
}

const editableServicio = ref({
  nombreServicio: '',
  observaciones: '',
})

const editarServicio = (index) => {
  editIndex.value = index
  editableServicio.value = {
    nombreServicio: servicios.value[index].nombreServicio,
    observaciones: servicios.value[index].observaciones,
  }
}
const cancelarEdicionS = () => {
  const hasChangesS = () => {
    if (editIndex.value !== null) {
      const original = servicios.value[editIndex.value]
      return (
        editableServicio.value.nombreServicio !== original.nombreServicio ||
        editableServicio.value.observaciones !== original.observaciones
      )
    } else {
      // Si es nuevo servicio, revisar si hay algún valor ingresado
      return Object.values(editableServicio.value).some(
        (val) => val !== '' && val !== null && val !== 1,
      )
    }
  }
  if (hasChangesS()) {
    Swal.fire({
      title: '¿Salir sin guardar?',
      text: 'Tienes cambios sin guardar, ¿quieres salir de todas formas?',
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Seguir editando',
    }).then((result) => {
      if (result.isConfirmed) {
        // Resetea el formulario y cierra
        editableServicio.value = {
          nombreServicio: '',
          observaciones: '',
        }
        editIndex.value = null
      }
    })
  } else {
    // Si no hay cambios, cerramos directamente
    editableServicio.value = {
      nombreServicio: '',
      observaciones: '',
    }
    editIndex.value = null
  }
}

const cancelarEdicion = () => {
  const hasChanges = () => {
    if (editIndex.value !== null) {
      const original = viviendas.value[editIndex.value]
      return (
        nuevaVivienda.value.direccion !== original.direccion ||
        nuevaVivienda.value.tipoVivienda !== original.tipoVivienda ||
        nuevaVivienda.value.ambientes !== original.ambientes ||
        nuevaVivienda.value.habitantes !== original.habitantes ||
        nuevaVivienda.value.material_techo !== original.material_techo ||
        nuevaVivienda.value.material_piso !== original.material_piso ||
        nuevaVivienda.value.tenencia !== original.tenencia ||
        nuevaVivienda.value.calle_estado !== original.calle_estado ||
        nuevaVivienda.value.idfamilia !== original.idfamilia
      )
    } else {
      // Si es nueva vivienda, revisar si hay algún valor ingresado
      return Object.values(nuevaVivienda.value).some(
        (val) => val !== '' && val !== null && val !== 1,
      )
    }
  }

  if (hasChanges()) {
    Swal.fire({
      title: '¿Salir sin guardar?',
      text: 'Tienes cambios sin guardar, ¿quieres salir de todas formas?',
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Seguir editando',
    }).then((result) => {
      if (result.isConfirmed) {
        // Resetea el formulario y cierra
        nuevaVivienda.value = {
          direccion: '',
          tipoVivienda: '',
          ambientes: 1,
          localizacion: null,
          habitantes: 1,
          material_techo: '',
          material_piso: '',
          tenencia: '',
          calle_estado: '',
          idfamilia: null,
          servicios: [],
        }
        editIndex.value = null
        mostrarFormulario.value = false
      }
    })
  } else {
    // Si no hay cambios, cerramos directamente
    editIndex.value = null
    mostrarFormulario.value = false
  }
}

const guardarEdicion = async (id, index) => {
  try {
    const actualizado = await directus.value.request(updateItem('servicios', id, editableServicio.value))

    servicios.value[index] = actualizado
    editIndex.value = null

    Swal.fire({
      title: 'Servicio actualizado',
      text: 'El servicio  se ha actualizado',
      icon: 'success',
      allowOutsideClick: false,
    })
  } catch (error) {
    console.error('Error al guardar cambios:', error)
  }
}
const hasChanges = () => {
  if (editIndex.value !== null) {
    const original = viviendas.value[editIndex.value]
    // Comparamos los campos relevantes del formulario con los valores originales
    return (
      nuevaVivienda.value.direccion !== original.direccion ||
      nuevaVivienda.value.tipoVivienda !== original.tipoVivienda ||
      nuevaVivienda.value.ambientes !== original.ambientes ||
      nuevaVivienda.value.habitantes !== original.habitantes ||
      nuevaVivienda.value.material_techo !== original.material_techo ||
      nuevaVivienda.value.material_piso !== original.material_piso ||
      nuevaVivienda.value.tenencia !== original.tenencia ||
      nuevaVivienda.value.calle_estado !== original.calle_estado ||
      nuevaVivienda.value.idfamilia !== original.idfamilia
    )
  } else {
    // Si es nueva vivienda, chequear si algún campo tiene valor
    return Object.values(nuevaVivienda.value).some((val) => val !== '' && val !== null && val !== 1)
  }
}

const cerrarModal = async () => {
  if (editIndex.value !== null && hasChanges()) {
    const result = await Swal.fire({
      title: 'Tienes cambios sin guardar',
      text: '¿Quieres salir sin guardar?',
      icon: 'warning',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Salir',
      cancelButtonText: 'Cancelar',
    })
    if (result.isConfirmed) {
      mostrarFormulario.value = false
      editIndex.value = null
    }
  } else {
    mostrarFormulario.value = false
  }
  // mostrarFormulario.value = false;
  // editIndex.value = null;
  nuevaVivienda.value = {
    direccion: '',
    tipoVivienda: '',
    ambientes: 1,
    localizacion: null,
    habitantes: 1,
    material_techo: '',
    material_piso: '',
    tenencia: '',
    calle_estado: '',
    idfamilia: null,
    servicios: [],
  }
}
const initMap = () => {
  if (map) {
    map.remove()
  }

  setTimeout(() => {
    const mapContainer = document.getElementById('mapa')
    if (mapContainer) {
      map = L.map('mapa').setView([-31.7455, -60.5105], 14)

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      // Si hay una ubicación guardada, mostrar marcador
      if (nuevaVivienda.value.localizacion && nuevaVivienda.value.localizacion.coordinates) {
        const coords = nuevaVivienda.value.localizacion.coordinates
        marker = L.marker([coords[1], coords[0]]).addTo(map)
        map.setView([coords[1], coords[0]], 15)
      }

      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        nuevaVivienda.value.localizacion = {
          type: 'Point',
          coordinates: [lng, lat], // siempre [longitud, latitud]
        }

        // Remover marcador anterior si existe
        if (marker) {
          map.removeLayer(marker)
        }

        // Agregar nuevo marcador
        marker = L.marker([lat, lng]).addTo(map)
      })

      // Forzar el redimensionamiento del mapa
      setTimeout(() => {
        map.invalidateSize()
      }, 100)
    }
  }, 100)
}

const initMapaZonas = () => {
  const mapContainer = document.getElementById('mapa-zonas')
  if (mapaZonas) {
    mapaZonas.remove()
  }
  if (mapContainer) {
    mapaZonas = L.map('mapa-zonas').setView([-31.7455, -60.5105], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapaZonas)

    const markers = []
    viviendas.value.forEach((vivienda) => {
      if (vivienda.localizacion && vivienda.localizacion.coordinates) {
        const [lng, lat] = vivienda.localizacion.coordinates
        const marker = L.marker([lat, lng])
          .addTo(mapaZonas)
          .bindPopup(`<b>${vivienda.direccion}</b><br>${vivienda.tipoVivienda}`)
        markers.push(marker)
      }
    })

    if (markers.length > 0) {
      const group = new L.featureGroup(markers)
      mapaZonas.fitBounds(group.getBounds().pad(0.1))
    }
  }
}

// ============ FUNCIONES PARA CONDICIONES HABITACIONALES ============

const fetchCondiciones = async () => {
  try {
    cargandoCondiciones.value = true
    const resCondiciones = await directus.value.request(
      readItems('condiciones_habitacionales', {
        fields: ['*', 'idvivienda.idvivienda', 'idvivienda.direccion', 'idvivienda.tipoVivienda'],
        limit: -1,
        sort: ['-fecha_revision'], // Ordenar por fecha descendente (más recientes primero)
      }),
    )
    condiciones.value = resCondiciones.map((c) => ({
      ...c,
      idvivienda: c.idvivienda || {}, // Asegurar que idvivienda sea un objeto
    }))
  } catch (error) {
    console.error('Error al cargar condiciones:', error)
  } finally {
    cargandoCondiciones.value = false
  }
}

const abrirFormularioRevision = () => {
  editandoCondicion.value = false
  nuevaCondicion.value = {
    id: null,
    idvivienda: null,
    estado: '',
    fecha_revision: new Date().toISOString().split('T')[0],
    evaluador: '',
    observaciones: '',
    agua_potable: '',
    electricidad: '',
    gas: '',
    cloacas: '',
    necesidades: '',
  }
  mostrarDetalles.value = false
  mostrarFormularioRevision.value = true
}

const cerrarFormularioRevision = () => {
  mostrarFormularioRevision.value = false
  editandoCondicion.value = false
  mostrarDetalles.value = false
}

const editarCondicion = (condicion) => {
  editandoCondicion.value = true
  nuevaCondicion.value = {
    id: condicion.id,
    idvivienda: condicion.vivienda?.idvivienda || condicion.idvivienda,
    estado: condicion.estado,
    fecha_revision: condicion.fecha_revision,
    evaluador: condicion.evaluador || '',
    observaciones: condicion.observaciones || '',
    agua_potable: condicion.agua_potable || '',
    electricidad: condicion.electricidad || '',
    gas: condicion.gas || '',
    cloacas: condicion.cloacas || '',
    necesidades: condicion.necesidades || '',
  }
  mostrarFormularioRevision.value = true
}

const guardarCondicion = async () => {
  // Validar campos requeridos
  if (!nuevaCondicion.value.idvivienda) {
    Swal.fire({
      title: 'Error',
      text: 'Debes seleccionar una vivienda',
      icon: 'error',
    })
    return
  }

  if (!nuevaCondicion.value.estado) {
    Swal.fire({
      title: 'Error',
      text: 'Debes seleccionar un estado',
      icon: 'error',
    })
    return
  }

  if (!nuevaCondicion.value.fecha_revision) {
    Swal.fire({
      title: 'Error',
      text: 'Debes ingresar una fecha de revisión',
      icon: 'error',
    })
    return
  }

  try {
    const datosCondicion = {
      idvivienda: nuevaCondicion.value.idvivienda,
      estado: nuevaCondicion.value.estado,
      fecha_revision: nuevaCondicion.value.fecha_revision,
      evaluador: nuevaCondicion.value.evaluador,
      observaciones: nuevaCondicion.value.observaciones,
      agua_potable: nuevaCondicion.value.agua_potable || null,
      electricidad: nuevaCondicion.value.electricidad || null,
      gas: nuevaCondicion.value.gas || null,
      cloacas: nuevaCondicion.value.cloacas || null,
      necesidades: nuevaCondicion.value.necesidades || null,
    }

    if (editandoCondicion.value && nuevaCondicion.value.id) {
      // Actualizar condición existente
      await directus.value.request(updateItem('condiciones_habitacionales', nuevaCondicion.value.id, datosCondicion))
      Swal.fire({
        title: 'Actualizado',
        text: 'La evaluación ha sido actualizada',
        icon: 'success',
      })
    } else {
      // Crear nueva condición
      await directus.value.request(createItem('condiciones_habitacionales', datosCondicion))
      Swal.fire({
        title: 'Guardado',
        text: 'La evaluación ha sido registrada',
        icon: 'success',
      })
    }

    // Recargar condiciones
    await fetchCondiciones()
    cerrarFormularioRevision()
  } catch (error) {
    console.error('Error al guardar condición:', error)
    Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar la evaluación',
      icon: 'error',
    })
  }
}

const eliminarCondicion = async (id) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esta acción.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await directus.value.request(deleteItem('condiciones_habitacionales', id))
        await fetchCondiciones()
        Swal.fire({
          title: 'Eliminado',
          text: 'La evaluación ha sido eliminada.',
          icon: 'success',
        })
      } catch (error) {
        console.error('Error al eliminar condición:', error)
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la evaluación.',
          icon: 'error',
        })
      }
    }
  })
}

const formatearEstado = (estado) => {
  const estados = {
    bueno: '✅ Bueno',
    regular: '⚠️ Regular',
    critico: '🚨 Crítico',
  }
  return estados[estado] || estado
}

const formatearFecha = (fecha) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

</script>

<style scoped>
.contenedor-principal {
  margin: 0 auto;
  background: rgba(245, 241, 241);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.header {
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  background: linear-gradient(135deg, #1f9e26, #169770);
  color: white;
  padding: 2rem;
  text-align: center;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.header p {
  opacity: 0.9;
  font-size: 1rem;
}

/* TABS */
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

.tab-content {
  padding: 2rem;
  min-height: 70vh;
}

/* VIVIENDAS SECTION */
.viviendas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.viviendas-title {
  font-size: 2rem;
  color: #1e293b;
  font-weight: 600;
}

.btn-agregar-vivienda {
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

.btn-agregar-vivienda:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* TABLA MODERNA */
.tabla-container {
  background: rgb(255, 253, 253);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.tabla-viviendas {
  width: 100%;
  border-collapse: collapse;
}

.tabla-viviendas th {
  color: white;
  padding: 0.85rem;
  font-weight: 700;
  text-align: left;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tabla-viviendas thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.tabla-viviendas td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
}

.tabla-viviendas tr {
  transition: all 0.3s ease;
}

.tabla-viviendas tr:hover {
  background: #e7e8e9;
}

.tabla-viviendas tr:last-child td {
  border-bottom: none;
}

/* BOTONES DE ACCIÓN */
.acciones {
  display: flex;
  gap: 0.5rem;
  justify-content: space-around;
  /* width: 100%; */
}

.btn-accion {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 35%;
}

.btn-editar {
  background: #f59e0b;
  color: white;
}

.btn-editar:hover {
  background: #d97706;
  transform: translateY(-2px);
}

.btn-eliminar {
  background: #ef4444;
  color: white;
}

.btn-eliminar:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.btn-ver {
  background: #3b82f6;
  color: white;
  width: 100%;
}

.btn-ver:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
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
  color: white;
  padding: 2rem;
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
  /* padding: -15px; */
  border-radius: 50%;
  transition: all 0.5s ease;
}

.btn-cerrar:hover {
  /* background: rgba(255, 255, 255, 0.2); */
  transform: scale(1.3);
}

.btn-cerrar svg {
  transform: rotate(90deg);
}

.modal-content {
  padding: 2rem;
}

/* FORMULARIO */
.formulario {
  display: grid;
  gap: 1.5rem;
}

.campo-grupo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
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

/* MAPA */
.mapa-container {
  height: 275px;
  /* border-radius: 10px; */
  overflow: hidden;
  margin: 1rem 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.mapa-container-grande {
  height: 60vh;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* BOTONES DEL MODAL */
.modal-acciones {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.btn-guardar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  /* margin-top: 15px; */
}

.btn-guardar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.btn-cancelar {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar:hover {
  background: #4b5563;
  transform: translateY(-2px);
}

/* SERVICIOS */
.servicios-section h3 {
  font-size: 1.8rem;
  color: #1e293b;
  text-align: center;
  margin-bottom: 2rem;
}

.form-servicios {
  max-width: 600px;
  margin: 0 auto 2rem;
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.form-servicios {
  display: flex;
  flex-direction: column;
}

.tabla-servicios {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.tabla-servicios th {
  color: white;
  padding: 1.5rem 1rem;
  font-weight: 600;
  text-align: center;
}

.tabla-servicios thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.tabla-servicios td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  border-right: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.tabla-servicios td:last-child {
  border-bottom: none;
}

.tabla-servicios tr {
  transition: all 0.3s ease;
}

.tabla-servicios tr:hover {
  background: #f1f1f1;
}
.servicios-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 250px;
}
.badge-servicio {
  background-color: #e0e7ff;
  color: #4338ca;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid #c7d2fe;
}
.no-servicios {
  color: #9ca3af;
  font-style: italic;
}
.servicios-checkbox-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(auto, 150px));
  gap: 10px;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 0.5rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}
.checkbox-item:hover {
  border-color: #c7d2fe;
  background-color: #eef2ff;
}
.servicios-checkbox-container label {
  font-size: 0.95rem;
  color: #374151;
  cursor: pointer;
  margin-top: 6px;
}
.servicios-checkbox-container input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
  margin: 0;
  cursor: pointer;
}
.estado-cargando {
  text-align: center;
  padding: 10px;
  font-size: 16px;
  font-weight: 600;
}
.no-data {
  text-align: center;
  color: #6b7280;
  font-size: 1.1rem;
  padding: 3rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
.viviendas-title {
  font-size: 1.8rem;
  border-radius: 15px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .contenedor-principal {
    margin: 0;
  }
  .header h1 {
    font-size: 1.8rem;
  }
  .header p {
    font-size: 0.9rem;
  }
  .viviendas-header {
    flex-direction: column;
    align-items: stretch;
  }
  .tabs {
    /* flex-direction: column; */
    overflow-y: auto;
    scrollbar-width: none;
  }

  .tab-button {
    text-align: center;
    padding: 0.85rem;
    font-size: 0.8rem;
  }

  .tabla-container {
    overflow-x: auto;
    margin-left: -7px;
    min-width: 365px;
  }
  .modal {
    width: 100vw;
    /* margin: 1rem; */
  }

  .campo-grupo {
    grid-template-columns: 1fr;
  }
  .tab-content {
    padding: 1.5rem 1rem;
  }
  .form-servicios {
    padding: 1.5rem;
    margin: 0 0 2rem 0;
    width: 100%;
    box-sizing: border-box;
  }
  .tabla-servicios .acciones {
    flex-direction: column;
  }
  .tabla-servicios .btn-accion {
    width: 100%;
    margin-bottom: 5px;
  }
  .servicios-section {
    padding: 0;
  }
}
/* ANIMACIONES */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-content {
  animation: slideIn 0.3s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal {
  animation: modalIn 0.3s ease;
}

/* ============ ESTILOS PARA CONDICIONES HABITACIONALES ============ */

/* INDICADORES */
.condiciones-indicadores {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.indicador-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-left: 5px solid #e5e7eb;
  transition: all 0.3s ease;
}

.indicador-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.indicador-icono {
  font-size: 3rem;
  min-width: 60px;
  text-align: center;
}

.indicador-contenido h3 {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.indicador-numero {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.indicador-porcentaje {
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 500;
}

.indicador-total {
  border-left-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
}

.indicador-bueno {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.indicador-bueno .indicador-numero {
  color: #059669;
}

.indicador-regular {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.indicador-regular .indicador-numero {
  color: #d97706;
}

.indicador-critico {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.indicador-critico .indicador-numero {
  color: #dc2626;
}

/* REVISIONES SECTION */
.condiciones-revisiones {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.revisiones-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.revisiones-title {
  font-size: 1.8rem;
  color: #1e293b;
  font-weight: 600;
}

.btn-agregar-revision {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  white-space: nowrap;
}

.btn-agregar-revision:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* TABLA CONDICIONES */
.tabla-condiciones {
  width: 100%;
  border-collapse: collapse;
}

.tabla-condiciones th {
  color: white;
  padding: 1rem;
  font-weight: 700;
  text-align: left;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.tabla-condiciones td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  font-size: 0.95rem;
}

.tabla-condiciones tr {
  transition: all 0.3s ease;
}

.tabla-condiciones tr:hover {
  background: #f8fafc;
}

.tabla-condiciones tr.estado-bueno:hover {
  background: #f0fdf4;
}

.tabla-condiciones tr.estado-regular:hover {
  background: #fffbeb;
}

.tabla-condiciones tr.estado-critico:hover {
  background: #fef2f2;
}

/* BADGES DE ESTADO */
.badge-estado {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-bueno {
  background: #dcfce7;
  color: #065f46;
  border: 1px solid #86efac;
}

.badge-regular {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.badge-critico {
  background: #fee2e2;
  color: #7f1d1d;
  border: 1px solid #fca5a5;
}

/* OBSERVACIONES CELL */
.observaciones-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* DETALLES ADICIONALES */
.detalles-seccion {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.detalles-seccion h4 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

/* RESPONSIVE CONDICIONES */
@media (max-width: 768px) {
  .condiciones-indicadores {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .indicador-card {
    padding: 1.5rem 1rem;
    gap: 1rem;
  }

  .indicador-icono {
    font-size: 2rem;
    min-width: 50px;
  }

  .indicador-numero {
    font-size: 2rem;
  }

  .revisiones-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-agregar-revision {
    width: 100%;
    text-align: center;
  }

  .tabla-condiciones {
    font-size: 0.85rem;
  }

  .tabla-condiciones th {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }

  .tabla-condiciones td {
    padding: 0.75rem 0.5rem;
  }

  .observaciones-cell {
    max-width: 150px;
  }

  .detalles-seccion {
    padding: 1rem;
  }

  .condiciones-revisiones {
    padding: 1rem;
  }
}
</style>

