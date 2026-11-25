<template>
  <div class="container-page">
    <!-- 🔹 Header fijo arriba -->
    <header class="page-header" v-if="activeTab === 'personas'">
      <h1>Gestión de Personas</h1>
      <p>Administra y Gestiona las personas</p>
    </header>

    <header class="page-header" v-if="activeTab === 'familias'">
      <h1>Gestión de Familias</h1>
      <p>Administra y Gestiona las familias</p>
    </header>

    <!-- 🔹 Tabs -->
    <div class="tabs">
      <button
        :class="['tab-button', { active: activeTab === 'personas' }]"
        @click="activeTab = 'personas'"
      >
        Personas
      </button>
      <button
        :class="['tab-button', { active: activeTab === 'familias' }]"
        @click="activeTab = 'familias'"
      >
        Familias
      </button>
    </div>

    <!-- 🔹 Contenido Personas -->
    <div v-if="activeTab === 'personas'" class="tab-content">
      <div class="contenedor-beneficiarios">
        <div class="personas-section">
          <div class="section-header">
            <h2>Registro de Personas</h2>
            <router-link v-if="!isReadOnly" to="/personas/nueva" class="btn-add"> + Agregar Persona </router-link>
          </div>

          <!-- Filtros -->
          <div class="filters-section">
            <div class="search-bar">
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o DNI..."
                v-model="searchQuery"
              />
            </div>

            <div class="filter-grid">
              <select v-model="filtroBeneficios" class="filter-select">
                <option value="">Todos los beneficios</option>
                <option
                  v-for="beneficio in beneficiosDisponibles"
                  :key="beneficio.id"
                  :value="beneficio.nombrebeneficio"
                >
                  {{ beneficio.nombrebeneficio }}
                </option>
                <option value="Ninguno">Sin Beneficios</option>
              </select>

              <button @click="limpiarFiltros" class="btn-clear">Limpiar filtros</button>
            </div>
          </div>

          <!-- Estadísticas rápidas -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ totalPersonas }}</div>
              <div class="stat-label">Total Personas</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ personasConBeneficios }}</div>
              <div class="stat-label">Con Beneficios</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ promedioEdad }}</div>
              <div class="stat-label">Edad Promedio</div>
            </div>
          </div>

          <!-- Tabla -->
          <div class="table-container">
            <table class="personas-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th v-if="!isReadOnly">DNI</th>
                  <th>Edad</th>
                  <th>Beneficios</th>
                  <!-- <th>Situación</th> -->
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="persona in personasPaginadas" :key="persona.idpersona">
                  <td class="nombre-cell">
                    <div class="nombre-principal">{{ persona.nombre }} {{ persona.apellido }}</div>
                    <div class="info-secundaria" v-if="!isReadOnly">{{ persona.telefono }}</div>
                  </td>
                  <td v-if="!isReadOnly">{{ formatearDNI(persona.DNI) }}</td>
                  <td>{{ calcularEdad(persona.fechaNacimiento) }} años</td>
                  <td>
                    <div class="beneficios-tags">
                      <template v-if="persona.beneficios && persona.beneficios.length > 0">
                        <span
                          v-for="beneficio in persona.beneficios"
                          :key="beneficio"
                          class="badge-beneficio"
                          :style="{ backgroundColor: getBenefitColor(beneficio) }"
                        >
                          {{ beneficio }}
                        </span>
                      </template>
                      <span v-else class="badge badge-light">Sin beneficios</span>
                    </div>
                  </td>
                  <!-- <td>
                    <span v-if="esVulnerable(persona)" class="badge badge-warning">Vulnerable</span>
                    <span v-else class="badge badge-info">Estable</span>
                  </td> -->
                  <td class="acciones">
                    <router-link :to="`/personas/${persona.idpersona}`" class="btn-details"
                      >Ver</router-link
                    >
                    <router-link :to="`/personas/${persona.idpersona}/editar`" class="btn-edit" 
                      v-if="!isReadOnly"
                      >Editar</router-link
                    >
                    <button class="btn-delete" @click="eliminarPersona(persona.idpersona)" v-if="!isReadOnly">
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Paginación y Selector de Items -->
            <div class="paginacion-wrapper" v-if="personasFiltradas.length > 0">
              <div class="items-por-pagina">
                <label for="itemsPorPaginaSelect">Mostrar:</label>
                <select id="itemsPorPaginaSelect" v-model="personasPorPagina" class="filter-select">
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                </select>
                <span>personas por página.</span>
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

            <div v-if="cargando" class="estado-cargando">
              <p>Cargando información...</p>
              <p>Por favor, espera...</p>
            </div>

            <div v-if="personas.length === 0 && !cargando">
              <p>No se encontraron personas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔹 Contenido Familias -->
    <div v-if="activeTab === 'familias'" class="tab-content-familias">
      <div class="contenedor-familias">
        <form @submit.prevent="agregarFamilia" class="form-familias" v-if="!isReadOnly">
          <div class="campo">
            <label>Nombre de la familia</label>
            <input
              v-model="nuevaFamilia.nombre"
              type="text"
              placeholder="Ej: Familia Gomez"
              required
              class="search-bar-familia"
            />
          </div>
          <button type="submit" class="btn-agregar">Agregar familia</button>
        </form>

        <table class="tabla-familias" v-if="familias.length > 0">
          <thead>
            <th>Nombre</th>
            <th>Acciones</th>
          </thead>
          <tbody>
            <tr v-for="(familia, index) in familias" :key="familia.idfamilia">
              <td>
                <input v-if="editIndex === index" v-model="editableFamilia.nombre" class="input" />
                <span class="nombre-familia" v-else>{{ familia.nombre }}</span>
              </td>
              <td>
                <div v-if="editIndex === index" class="acciones">
                  <button
                    @click="guardarEdicion(familia.idfamilia, index)"
                    class="btn-accion btn-guardar"
                  >
                    Guardar
                  </button>
                  <button @click="cancelarEdicion" class="btn-accion btn-cancelar">Cancelar</button>
                </div>
                <div v-else class="acciones">
                  <button @click="verFamilia(familia)" class="btn-accion btn-ver">Ver</button>
                  <button @click="editarFamilia(index)" class="btn-accion btn-editar" v-if="!isReadOnly">
                    Editar
                  </button>
                  <button
                    @click="eliminarFamilia(familia.idfamilia, index)"
                    class="btn-accion btn-eliminar" v-if="!isReadOnly"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else>No hay familias cargadas.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { directus } from '../../config/directus.js'
import { useAuth } from '../../config/auth.js'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import {
  createDirectus,
  rest,
  staticToken,
  readItems,
  createItem,
  updateItem,
  deleteItem,
} from '@directus/sdk'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
// import { DIRECTUS_URL, DIRECTUS_TOKEN } from '../../config/token.js'

// Conexión al backend de Directus

// const directus = createDirectus(DIRECTUS_URL).with(rest()).with(staticToken(DIRECTUS_TOKEN))

const router = useRouter()
const { isReadOnly } = useAuth()
const personas = ref([])
const beneficiosDisponibles = ref([])

const viviendas = ref([])
const familias = ref([])
const editIndex = ref(null)

const cargando = ref(true)
const searchQuery = ref('')
const filtroBeneficios = ref('')

const activeTab = ref('personas')
const generarPDF = (familia) => {
  const doc = new jsPDF('p', 'pt', 'a4')
  const miembros = personas.value.filter(
    (p) => String(p.idfamilia) === String(familia.idfamilia)
  )
  const body = miembros.length > 0 
    ? miembros.map(m => [
        `${m.nombre} ${m.apellido}`,
        m.DNI,
        calcularEdad(m.fechaNacimiento), // Si no tenés esta función a mano, podés poner m.fechaNacimiento o ''
        (m.beneficios && Array.isArray(m.beneficios)) ? m.beneficios.join(', ') : 'Sin beneficios'
      ])
    : [['Este grupo familiar no tiene miembros asignados aún.', '-', '-', '-']]
  doc.setFontSize(16)
  doc.text(`Reporte de Grupo Familiar: ${familia.nombre}`, 40, 40)
  doc.setFontSize(10)
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 40, 55)

  autoTable(doc, {
    startY: 70,
    head: [['Nombre Completo', 'DNI', 'Edad', 'Beneficios']],
    body: body
  })
  doc.save(`familia_${familia.nombre}.pdf`)
}

// Estado para la paginación
const paginaActual = ref(1)
const personasPorPagina = ref(5)

onMounted(async () => {
  try {
    //obtener personas
    const resPersonas = await directus.value.request(readItems('personas'))
    personas.value = resPersonas

    const resBP = await directus.value.request(readItems('beneficios_personas'))
    const beneficiosPersonas = resBP

    const resBeneficios = await directus.value.request(readItems('beneficios'))
    const beneficios = resBeneficios
    beneficiosDisponibles.value = resBeneficios

    const resFamilias = await directus.value.request(readItems('grupofamiliar'))
    familias.value = resFamilias

    const resViviendas = await directus.value.request(
      readItems('vivienda', { fields: ['direccion', 'idfamilia'] }),
    )
    viviendas.value = resViviendas

    personas.value.forEach((persona) => {
      const bp = beneficiosPersonas.filter((b) => b.idpersona === persona.idpersona)

      persona.beneficios = bp
        .map((b) => {
          const beneficio = beneficios.find((ben) => ben.id === b.idbeneficio)
          return beneficio ? beneficio.nombrebeneficio : null
        })
        .filter(Boolean)

      if (!persona.beneficios) persona.beneficios = []
    })

    // console.log(beneficiosPersonas.data);
    // console.log(beneficios.data);
    console.log(resPersonas)
  } catch (error) {
    console.error('Error al cargar personas y beneficios:', error)
  } finally {
    cargando.value = false
  }
})

const benefitColorMap = ref({})
const colorPalette = [
  '#4363d8',
  '#3cb44b',
  '#f58231',
  '#911eb4',
  '#42d4f4',
  '#f032e6',
  '#e6194B',
  '#ffe119',
  '#bfef45',
  '#fabed4',
  '#469990',
  '#dcbeff',
  '#9A6324',
  '#800000',
  '#aaffc3',
  '#808000',
  '#000075',
  '#ffd8b1',
]
let colorIndex = 0

const getBenefitColor = (benefitName) => {
  if (!benefitColorMap.value[benefitName]) {
    benefitColorMap.value[benefitName] = colorPalette[colorIndex++ % colorPalette.length]
  }
  return benefitColorMap.value[benefitName]
}
function getLocalISO() {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000 // offset en ms
  const localTime = new Date(now.getTime() - tzOffset)
  return localTime.toISOString().slice(0, 19) // elimina milisegundos
}
const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)

  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

const esVulnerable = (persona) => {
  return (
    persona.ingresos === 'Sin ingresos' ||
    persona.tipoVivienda === 'Casa prestada' ||
    (persona.ocupacion && persona.ocupacion.toLowerCase().includes('desemplead'))
  )
}

const formatearDNI = (dni) => {
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const promedioEdad = computed(() => {
  if (!personas || personas.value.length === 0) return 0

  const sumaEdades = personas.value.reduce((total, persona) => {
    return total + calcularEdad(persona.fechaNacimiento)
  }, 0)

  return (sumaEdades / personas.value.length).toFixed(1)
})

const totalPersonas = computed(() => personas.value.length)

const personasConBeneficios = computed(() => {
  return personas.value.filter((p) => p.beneficios?.length > 0).length
})

const personasFiltradas = computed(() => {
  return personas.value.filter((persona) => {
    // 1️⃣ Filtro por búsqueda de texto
    const coincideTexto =
      persona.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      persona.apellido.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      persona.DNI.includes(searchQuery.value)

    // 2️⃣ Filtro por beneficio seleccionado
    let coincideBeneficio = true // por defecto coincide
    if (filtroBeneficios.value && filtroBeneficios.value !== '') {
      if (filtroBeneficios.value === 'Ninguno') {
        // Mostrar los que no tienen beneficios
        coincideBeneficio = !persona.beneficios || persona.beneficios.length === 0
      } else {
        // Mostrar los que tienen el beneficio seleccionado
        coincideBeneficio =
          persona.beneficios && persona.beneficios.includes(filtroBeneficios.value)
      }
    }

    // Devuelve solo las que cumplen ambos filtros
    return coincideTexto && coincideBeneficio
  })
})

// Cuando cambian los filtros, volvemos a la página 1
watch([searchQuery, filtroBeneficios], () => {
  paginaActual.value = 1
})

// Cuando cambia la cantidad de items por página, volvemos a la página 1
watch(personasPorPagina, () => {
  paginaActual.value = 1
})

const paginasTotales = computed(() => {
  return Math.ceil(personasFiltradas.value.length / personasPorPagina.value)
})

const personasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * personasPorPagina.value
  const fin = inicio + personasPorPagina.value
  return personasFiltradas.value.slice(inicio, fin)
})

const limpiarFiltros = () => {
  searchQuery.value = ''
  filtroBeneficios.value = ''
}

const eliminarPersona = async (idpersona) => {
  Swal.fire({
    title: 'Eliminar persona',
    text: '¿Seguro que quieres eliminar esta persona?',
    icon: 'question',
    allowOutsideClick: false,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then(async (result) => {
    if (result.isConfirmed) {
      // 1. Encontrar la persona y guardar su nombre ANTES de borrarla
      const personaAEliminar = personas.value.find((p) => p.idpersona === idpersona)
      const nombrePersona = personaAEliminar
        ? `${personaAEliminar.nombre} ${personaAEliminar.apellido}`
        : 'Desconocida'

      // 2. Eliminar los beneficios asociados (tabla intermediaria)
      const beneficiosAsociados = await directus.value.request(
        readItems('beneficios_personas', { filter: { idpersona: { _eq: idpersona } } }),
      )

      for (const bp of beneficiosAsociados) {
        await directus.value.request(deleteItem('beneficios_personas', bp.id))
      }

      // 2️⃣ Eliminar la persona

      await directus.value.request(deleteItem('personas', idpersona))

      // 3️⃣ Actualizar lista local
      personas.value = personas.value.filter((p) => p.idpersona !== idpersona)

      // 4. Registrar en el log con el nombre ya guardado
      await directus.value.request(
        createItem('logs', {
          fecha: getLocalISO(),
          nivel: 'INFO',
          mensaje: `La persona '${nombrePersona}' ha sido eliminada`,
        }),
      )
    }
  })
}

const nuevaFamilia = ref({
  nombre: '',
})

const agregarFamilia = async () => {
  if (!nuevaFamilia.value.nombre) return

  try {
    const nombreExistente = familias.value.some(
      (familia) =>
        familia.nombre.toLowerCase() ===
        nuevaFamilia.value.nombre.toLowerCase(),
    )
    if (nombreExistente) {
      Swal.fire({
        title: 'Error',
        text: 'Ya existe una familia con ese nombre.',
        icon: 'error',
        allowOutsideClick: false,
      })
      return
    }
    const creado = await directus.value.request(createItem('grupofamiliar', nuevaFamilia.value))
    familias.value.push(creado)
    nuevaFamilia.value.nombre = ''
    await generarPDF(creado)
    Swal.fire({
      title: 'Agregado',
      text: 'La familia ha sido agregada',
      icon: 'success',
      allowOutsideClick: false,
    })
  } catch (error) {
    console.error('Error al verificar nombre existente:', error)
  }
}

const eliminarFamilia = async (idfamilia, index) => {
  Swal.fire({
    title: '¿Estás seguro de que quieres eliminar esta familia?',
    text: 'No podrás revertir esta acción.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    allowOutsideClick: false,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await directus.value.request(deleteItem('grupofamiliar', idfamilia))
        familias.value.splice(index, 1)
        Swal.fire({
          title: 'Eliminado',
          text: 'La familia ha sido eliminada',
          icon: 'success',
          allowOutsideClick: false,
        })
      } catch (error) {
        console.error('Error al eliminar familia:', error)
      }
    }
  })
}

const editableFamilia = ref({
  nombre: '',
})

const editarFamilia = (index) => {
  editIndex.value = index
  editableFamilia.value = { ...familias.value[index] } // Clonar los datos para edición
}
const cancelarEdicion = () => {
  const hasChanges = () => {
    const original = familias.value[editIndex.value]
    return original.nombre !== editableFamilia.value.nombre
  }

  if (hasChanges()) {
    Swal.fire({
      title: '¿Descartar cambios?',
      text: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres cancelar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, descartar',
      cancelButtonText: 'No, continuar editando',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        editIndex.value = null
      }
    })
  } else {
    editIndex.value = null
  }
}

const guardarEdicion = async (id, index) => {
  try {
    const actualizado = await directus.value.request(
      updateItem('grupofamiliar', id, editableFamilia.value),
    )

    familias.value[index] = actualizado
    editIndex.value = null

    await generarPDF(actualizado)

    Swal.fire({
      title: 'Familia actualizada',
      text: 'La familia se ha actualizado',
      icon: 'success',
      allowOutsideClick: false,
    })
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo actualizar la familia',
      icon: 'error',
      allowOutsideClick: false,
    })
    console.error('Error al guardar cambios:', error)
  }
}

const verFamilia = async (familia) => {
  // Filtrar las personas que pertenecen a esta familia
  const miembros = personas.value.filter((p) => p.idfamilia === familia.idfamilia)

  // Buscar la vivienda asociada
  const viviendaAsociada = viviendas.value.find((v) => v.idfamilia === familia.idfamilia)
  let viviendaHtml = ''
  if (viviendaAsociada) {
    viviendaHtml = `
      <div style="margin-bottom: 20px; padding: 12px; background: #eef2f7; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <strong style="color: #1e293b; display: block; margin-bottom: 4px;">Vivienda Asociada:</strong>
        <span style="color: #475569;">${viviendaAsociada.direccion}</span>
      </div>
    `
  } else {
    viviendaHtml = `
      <div style="margin-bottom: 20px; padding: 12px; background: #f8f9fa; border-radius: 8px; text-align: center;"><span style="color: #6c757d; font-style: italic;">Sin vivienda asignada</span></div>
    `
  }
  let miembrosHtml = ''
  if (miembros.length > 0) {
    miembrosHtml = `
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${miembros
          .map((miembro) => {
            const beneficiosHtml =
              miembro.beneficios && miembro.beneficios.length > 0
                ? `<div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
                ${miembro.beneficios
                  .map(
                    (b) => `
                  <span style="background-color: ${getBenefitColor(b)}; color: white; padding: 4px 6px; border-radius: 12px; font-size: 0.7em; font-weight: 600;">
                    ${b}
                  </span>
                `,
                  )
                  .join('')}
              </div>`
                : `<div style="font-size: 0.85em; color: #95a5a6; margin-top: 8px; font-style: italic;">Sin beneficios asignados</div>`;
            return `
            <li style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="font-weight: 500; color: #2c3e50;">${miembro.nombre} ${miembro.apellido}</span>
                  ${!isReadOnly.value ? `<span style="font-size: 0.9em; color: #6c757d; display: block; margin-top: 2px;">DNI: ${formatearDNI(miembro.DNI)}</span>` : ''}
                </div>
                ${!isReadOnly.value ? `<button style="background: #debc35; padding: 6px; color: white; border: none; cursor: pointer; border-radius: 10px;" class="btn-accion btn-editar" onclick="window.irAEditarPersona('${miembro.idpersona}')">Editar</button>` : ''}
              </div>
              ${beneficiosHtml}
            </li>`
          })
          .join('')}
      </ul>
    `
  } else {
    miembrosHtml =
      '<p style="text-align: center; color: #6c757d; margin-top: 20px;">Esta familia no tiene miembros registrados.</p>'
  }

  const htmlContent = `
    <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      ${viviendaHtml}
      <h3 style="font-size: 1.2em; color: #2c3e50; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; margin-bottom: 20px;">
        Miembros de la Familia
      </h3>
      ${miembrosHtml}
    </div>
  `

  await Swal.fire({
    title: `<span style="font-size: 1.3em; font-weight: 600;">${familia.nombre}</span>`,
    html: htmlContent,
    width: '600px',
    showCloseButton: true,
    showConfirmButton: true,
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#6c757d',
  })
}

window.irAEditarPersona = (id) => {
  Swal.close() // Cierra el modal actual
  router.push(`/personas/${id}/editar`)
  console.log(id)
}

function cambiarPagina(pagina) {
  if (pagina > 0 && pagina <= paginasTotales.value) {
    paginaActual.value = pagina
  }
}
</script>

<style scoped>
.container-page {
  min-height: 100vh;
  /* background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%); */
  /* padding: 2rem; */
  background: rgb(245, 241, 241);
}

.contenedor-beneficiarios {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
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
.tabs {
  display: flex;
  background: #f8fafc;
}
.tab-button {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 1rem;
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

.tab-button:disabled {
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.5;
}

.tab-content {
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

/* Contenido de personas */
.personas-section {
  padding: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
}

.btn-add {
  background-color: #31b950;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-add:hover {
  background-color: #289940;
  transform: translateY(-1px);
}

/* Filtros */
.filters-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.search-bar {
  margin-bottom: 15px;
}

.search-bar input {
  width: 98%;
  padding: 12px 16px;
  /* padding: 12px 0 12px 16px; */
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 15px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
}

.btn-clear {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-clear:hover {
  background: #5a6268;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.estado-cargando {
  text-align: center;
  padding: 10px;
  font-size: 16px;
  font-weight: 600;
}
/* Tabla */
.table-container {
  overflow-x: auto;
}

.personas-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.personas-table th,
.personas-table td {
  padding: 12px 15px;
  text-align: left;
}

.personas-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.personas-table thead th {
  font-weight: 600;
  font-size: 0.9rem;
}

.personas-table tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.personas-table tbody tr:hover {
  background-color: #e3f2fd;
}

.nombre-cell {
  min-width: 160px;
}

.nombre-principal {
  font-weight: 600;
  color: #2c3e50;
}

.info-secundaria {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 2px;
}

.badge {
  padding: 4px 8px;
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
.badge-info {
  background: #d1ecf1;
  color: #0c5460;
}
.badge-light {
  background: #f8f9fa;
  color: #6c757d;
}
.beneficios-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.badge-beneficio {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Acciones */
.acciones {
  white-space: nowrap;
  display: flex;
  gap: 5px;
}

.btn-details,
.btn-edit,
.btn-delete {
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  margin-right: 5px;
  cursor: pointer;
  font-size: 0.88rem;
  text-decoration: none;
  display: inline-block;
  color: white;
  width: 100%;
  text-align: center;
  font-weight: 600;
  transition: all 0.4s ease;
}

.btn-details {
  background-color: #17a2b8;
}

.btn-edit {
  background-color: #ffc107;
}

.btn-delete {
  background-color: #dc3545;
}

.btn-details:hover,
.btn-edit:hover,
.btn-delete:hover {
  transform: translateY(-2px);
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

/* Responsive */
/* @media (max-width: 1920px){
  .contenedor-beneficiarios {
    max-width: 100%;
  }
  .search-bar input {
    width: 92%;
  }
  .tab-button {
    font-size: 1.1rem;
  }
  .page-header{
    padding: 25px;
  }
  .page-header h1{
    font-size: 2.5rem;
  }
  .page-header p{
    font-size: 1.4rem;
  }
  .tab-button{
    font-size: 1.3rem;
  }
  .personas-section{
    padding: 20px;
  }
} */
@media (max-width: 768px) {
  .personas-section {
    padding: 15px;
  }
  .contenedor-beneficiarios {
    margin: 0;
    padding: 0;
  }
  .section-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  .page-header h1 {
    font-size: 1.8rem;
  }
  .page-header p {
    font-size: 0.9rem;
  }
  .tab-button {
    font-size: 1rem;
    padding: 12px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .personas-table {
    font-size: 0.85rem;
  }

  .personas-table th,
  .personas-table td {
    padding: 8px 10px;
  }
}

/* Familias */

/* h1{
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 2rem;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(90deg, #2563eb, #9333ea);
  padding: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
} */
.contenedor-familias {
  max-width: 900px;
  margin: 20px auto;
  padding: 25px;
  background: #f9fafb;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.contenedor-familias h2 {
  margin-bottom: 20px;
  font-size: 2.2rem;
  color: #2563eb;
  text-align: center;
  font-weight: 600;
}
.form-familias {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}
.campo {
  display: flex;
  flex-direction: column;
}
.campo label {
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: #374151;
}
.campo input {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 1rem;
}
.campo input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 8px rgba(37, 99, 235, 0.5);
}
.btn-agregar {
  /* grid-column: 1 / -1; */
  padding: 8px 16px;
  background: #31b950;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 700;
  /* width: 180px; */
  /* align-self: center; */
  transition: all 0.3s ease;
}
.btn-agregar:hover {
  opacity: 0.9;
  background: #289940;
  transform: translateY(-2px);
}
.tabla-familias {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  font-size: 0.95rem;
}
.tabla-familias thead {
  background: linear-gradient(90deg, #2563eb, #9333ea);
  color: white;
  font-weight: 600;
  font-size: 1rem;
}
.tabla-familias th,
.tabla-familias td {
  padding: 10px 14px;
  text-align: left;
}

.tabla-familias tr:nth-child(even) {
  background: #f3f4f6;
}
.tabla-familias tr:hover {
  background: #e0f2fe;
  transition: 0.3s;
}

.acciones {
  display: flex;
  gap: 8px;
  justify-content: space-around;
}

.btn-accion {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.89rem;
  transition: all 0.3s ease;
  width: 100%;
}
.btn-accion:hover {
  transform: translateY(-2px);
}

.btn-ver {
  background: #0bd44e;
}
.btn-ver:hover {
  background: #2d9243;
}
.btn-eliminar {
  background: #dc2626;
}
.btn-eliminar:hover {
  background: #b91c1c;
}
.btn-editar {
  background: #3b82f6;
}
.btn-editar:hover {
  background: #1d4ed8;
}
.btn-guardar {
  background: #22c55e;
}
.btn-guardar:hover {
  background: #15803d;
}
.btn-cancelar {
  background: #f59e0b;
}
.btn-cancelar:hover {
  background: #d97706;
}
.input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 90%;
  transition: all 0.3s ease;
}
.input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 6px rgba(37, 99, 235, 0.4);
}
.nombre-familia {
  white-space: nowrap;
}

/* .tab-button {
    flex: 1;
    padding: 1.5rem 2rem;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    color: #64748b;
    transition: all 0.3s ease;
    position: relative;
}*/

.tab-content {
  padding: 2rem;
  min-height: 70vh;
}

.paginacion-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 0 1rem;
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
</style>
