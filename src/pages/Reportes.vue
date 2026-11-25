<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import Chart from 'chart.js/auto'
import { useRouter } from 'vue-router'
import {
  createDirectus,
  rest,
  authentication,
  readItems,
  refresh,
  staticToken,
} from '@directus/sdk'
import { directus } from '../../config/directus.js'

const denuncias = ref([])

const category = ref([])


onMounted(async () => {
  try {
    const resDenuncias = await directus.value.request(
      readItems('incidencias', {
        fields: ['*', 'idpersona.*', 'idcategoria.*'],
      }),
    )
    denuncias.value = resDenuncias

    const resCategorias = await directus.value.request(readItems('categorias'))
    category.value = resCategorias
  } catch (error) {
    console.error('Error al cargar incidencias:', error)
  }
})

const filtroEstado = ref('all')
const filtroCategoria = ref('all')
const filtroTexto = ref('')

const filters = reactive({
  dateRange: 'last-month',
  startDate: '',
  endDate: '',
  category: 'all',
  status: 'all',
  priority: 'all',
})

const denunciasFiltradas = computed(() => {
  let items = denuncias.value

  // 1. Filtro por rango de fechas
  const ahora = new Date()
  let fechaInicio = null
  let fechaFin = new Date()

  switch (filters.dateRange) {
    case 'last-week':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 7)
      break
    case 'last-month':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate())
      break
    case 'last-quarter':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate())
      break
    case 'last-year':
      fechaInicio = new Date(ahora.getFullYear() - 1, ahora.getMonth(), ahora.getDate())
      break
    case 'custom':
      fechaInicio = filters.startDate ? new Date(filters.startDate) : null
      fechaFin = filters.endDate ? new Date(filters.endDate) : null
      if (fechaFin) fechaFin.setHours(23, 59, 59, 999) // Incluir todo el día final
      break
  }

  if (fechaInicio || fechaFin) {
    items = items.filter((d) => {
      const fechaCaso = new Date(d.fechaIncidencia)
      const despuesDeInicio = fechaInicio ? fechaCaso >= fechaInicio : true
      const antesDeFin = fechaFin ? fechaCaso <= fechaFin : true
      return despuesDeInicio && antesDeFin
    })
  }

  // 2. Filtro por estado
  if (filtroEstado.value && filtroEstado.value !== 'all') {
    items = items.filter((d) => d.estado?.toLowerCase() === filtroEstado.value.toLowerCase())
  }

  // 3. Filtro por categoría
  if (filtroCategoria.value && filtroCategoria.value !== 'all') {
    items = items.filter((d) => d.idcategoria?.nombre === filtroCategoria.value)
  }

  // 4. Filtro por prioridad
  if (filters.priority && filters.priority !== 'all') {
    items = items.filter((d) => d.prioridad?.toLowerCase() === filters.priority.toLowerCase())
  }

  // 5. Filtro por texto
  if (filtroTexto.value) {
    const texto = filtroTexto.value.toLowerCase()
    items = items.filter(
      (d) =>
        (d.idpersona?.nombre + ' ' + d.idpersona?.apellido).toLowerCase().includes(texto) ||
        d.idcategoria?.nombre?.toLowerCase().includes(texto) ||
        d.descripcion?.toLowerCase().includes(texto),
    )
  }

  return items
})

const resumenFiltrado = computed(() => {
  const data = denunciasFiltradas.value
  const casosResueltos = data.filter(
    (d) => d.estado === 'resuelta' && d.fechaIncidencia && d.fecha_resolucion,
  )

  // Cálculo del tiempo promedio de resolución en días
  let tiempoPromedioResolucion = 0
  if (casosResueltos.length > 0) {
    const totalDias = casosResueltos.reduce((sum, caso) => {
      const fechaInicio = new Date(caso.fechaIncidencia)
      const fechaFin = new Date(caso.fecha_resolucion)
      const diffTiempo = fechaFin.getTime() - fechaInicio.getTime()
      const diffDias = diffTiempo / (1000 * 3600 * 24)
      return sum + diffDias
    }, 0)
    tiempoPromedioResolucion = (totalDias / casosResueltos.length).toFixed(1)
  }

  // Cálculo de la satisfacción promedio (asumiendo un campo 'calificacion_satisfaccion' de 1 a 5)
  let satisfaccionPromedio = 0
  const casosConSatisfaccion = casosResueltos.filter((d) => d.calificacion_satisfaccion != null)
  if (casosConSatisfaccion.length > 0) {
    const totalSatisfaccion = casosConSatisfaccion.reduce(
      (sum, caso) => sum + caso.calificacion_satisfaccion,
      0,
    )
    const promedio = totalSatisfaccion / casosConSatisfaccion.length
    satisfaccionPromedio = ((promedio / 5) * 100).toFixed(0) // Convertido a porcentaje
  }

  return {
    total: data.length,
    nuevos: data.filter((d) => d.estado === 'recibida').length,
    resueltos: casosResueltos.length,
    enProceso: data.filter(
      (d) =>
        d.estado === 'en_evaluacion' || d.estado === 'en_intervencion' || d.estado === 'asignada',
    ).length,
    urgentes: data.filter(
      (d) => d.prioridad?.toLowerCase() === 'urgente' && d.estado !== 'resuelta',
    ).length,
    tiempoPromedioResolucion: tiempoPromedioResolucion,
    satisfaccionPromedio: satisfaccionPromedio,
  }
})

// const denunciasFiltradas = computed(() => {
//   return denuncias.value.filter(d => {
//     const cat = categorias[d.tipoIncidencia] ? d.tipoIncidencia : 'otros'
//     //Filtro por estado
//     const matchEstado = !filtroEstado.value || d.estado?.toLowerCase() === filtroEstado.value.toLowerCase()

//     //Filtro por categoria
//     const matchCategoria = filtroCategoria.value === '' || filtroCategoria.value === cat

//     //Filtro por texto
//     const texto = filtroTexto.value.toLowerCase()
//     const matchTexto = !texto ||
//       d.idpersona?.nombre?.toLowerCase().includes(texto) ||
//       d.idpersona?.apellido?.toLowerCase().includes(texto) ||
//       d.tipoIncidencia?.toLowerCase().includes(texto) ||
//       d.descripcion?.toLowerCase().includes(texto)

//       return matchEstado && matchCategoria && matchTexto
//   })
// });

const denunciasPorCategoria = computed(() => {
  if (!denuncias.value.length) return []

  const datosFiltrados = denunciasFiltradas.value
  const total = datosFiltrados.length
  const agrupadas = {}

  datosFiltrados.forEach((d) => {
    const cat = d.idcategoria?.nombre || 'Sin categoría'
    if (!agrupadas[cat]) {
      agrupadas[cat] = {
        categoria: cat,
        cantidad: 0,
        porcentaje: 0,
        tendencia: 0,
      }
    }
    agrupadas[cat].cantidad++
  })

  //Calcular % y tendencia
  Object.values(agrupadas).forEach((cat) => {
    cat.porcentaje = ((cat.cantidad / total) * 100).toFixed(1)
    cat.tendencia = Math.floor(Math.random() * 11) - 5
  })

  return Object.values(agrupadas)
})

const loading = ref(false)

// Este watcher re-ejecutará los cálculos cada vez que los filtros cambien.
watch(denunciasFiltradas, () => {
  cargarGraficos()
  // cargarDatos ya no es necesaria, los resúmenes son computados.
})

const resetFilters = () => {
  filters.dateRange = 'last-month'
  filters.startDate = ''
  filters.endDate = ''
  filters.category = 'all'
  filters.status = 'all'
  filters.priority = 'all'
  applyFilters()
}

const convertToCSV = (data) => {
  if (!data || data.length === 0) {
    return ''
  }
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]

  for (const row of data) {
    const values = headers.map((header) => {
      let value = row[header]
      if (value === null || value === undefined) {
        value = ''
      } else if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`
      }
      return value
    })
    csvRows.push(values.join(','))
  }
  return csvRows.join('\n')
}

const exportReport = (format) => {
  const fechaGeneracion = new Date().toISOString().split('T')[0]
  const filename = `reporte_accion_social_${fechaGeneracion}`

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (format === 'json') {
    const dataToExport = {
      fecha_generacion: fechaGeneracion,
      filtros: {
        ...filters,
        filtroEstado: filtroEstado.value,
        filtroCategoria: filtroCategoria.value,
        filtroTexto: filtroTexto.value,
      },
      resumen: resumenFiltrado.value,
      detalle_por_categoria: denunciasPorCategoria.value,
      casos_filtrados: denunciasFiltradas.value,
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `${filename}.json`)
  } else if (format === 'csv') {
    const csvData = convertToCSV(
      denunciasFiltradas.value.map((d) => ({
        ID: d.numero_denuncia?.toString().padStart(4, '0'),
        Fecha: new Date(d.fechaIncidencia).toLocaleDateString('es-ES'),
        Denunciante: `${d.idpersona?.nombre} ${d.idpersona?.apellido}`,
        DNI: d.idpersona?.DNI,
        Categoria: d.idcategoria?.nombre,
        Descripcion: d.descripcion,
        Prioridad: d.prioridad,
        Estado: d.estado,
        Coordenadas: d.localizacion
          ? `${d.localizacion.coordinates[1]}, ${d.localizacion.coordinates[0]}`
          : '',
        FechaResolucion: d.fecha_resolucion
          ? new Date(d.fecha_resolucion).toLocaleDateString('es-ES')
          : '',
      })),
    )
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `${filename}.csv`)
  }
}

let categoryChart = null
let trendChart = null
let resolutionByCategoryChart = null

let demographicChart = null

const cargarGraficos = () => {
  // --- Gráfico de Casos por Categoría (Bar) ---
  // Casos por tipo
  const categoryCounts = {}
  denunciasFiltradas.value.forEach((caso) => {
    const categoriaNombre = caso.idcategoria?.nombre || 'Sin Categoría'
    categoryCounts[categoriaNombre] = (categoryCounts[categoriaNombre] || 0) + 1
  })
  const categoryColors = {
    'Asistencia alimentaria': '#3498db',
    'Vivienda y refacciones': '#34495e',
    'Salud y medicamentos': '#e74c3c',
    'Adultos mayores': '#1abc9c',
    'Niñez y adolescencia': '#f1c40f',
    'Servicios básicos (agua y luz)': '#e67e22',
    'Discapacidad y accesibilidad': '#9b59b6',
    'Empleo y capacitación': '#2ecc71',
    'Sin Categoría': '#cccccc',
  }
  // Labels y colores dinámicos
  let labels = Object.keys(categoryCounts)
  let dataValues = Object.values(categoryCounts)
  let backgroundColors = Object.keys(categoryCounts).map(
    (tipo) => categoryColors[tipo] || '#7f8c8d',
  )

  let combined = labels.map((label, i) => ({
    label,
    value: dataValues[i],
    color: backgroundColors[i],
  }))

  combined.sort((a, b) => b.value - a.value)

  const sortedLabels = combined.map((item) => item.label)
  const sortedDataValues = combined.map((item) => item.value)
  const sortedBackgroundColors = combined.map((item) => item.color)

  if (categoryChart) {
    categoryChart.destroy()
  }

  categoryChart = new Chart(document.getElementById('categoryChart'), {
    type: 'bar',
    data: {
      labels: sortedLabels,
      datasets: [
        {
          label: 'Incidencias',
          data: sortedDataValues,
          backgroundColor: sortedBackgroundColors,
          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: '#ffffff',
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
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#2c3e50',
          bodyColor: '#2c3e50',
          borderColor: '#e9ecef',
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0,0,0,0.1)',
          },
          ticks: {
            color: '#7f8c8d',
            stepSize: 1, // sube de 1 en 1
            precision: 0, // sin decimales
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            autoSkip: false,
            color: '#7f8c8d',
          },
        },
      },
    },
  })

  // --- Gráfico de Tendencia Mensual (Línea) ---
  const monthlyData = {}

  denunciasFiltradas.value.forEach((caso) => {
    const fecha = new Date(caso.fechaIncidencia)
    const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, resueltos: 0, nuevos: 0 }
    }

    monthlyData[monthKey].total++
    if (caso.estado === 'resuelta') {
      monthlyData[monthKey].resueltos++
    }
    if (caso.estado === 'recibida') {
      monthlyData[monthKey].nuevos++
    }
  })

  const sortedMonths = Object.keys(monthlyData).sort()

  const trendLabels = sortedMonths.map((monthKey) => {
    const [year, month] = monthKey.split('-')
    return new Date(year, month - 1).toLocaleString('es-ES', { month: 'short', year: 'numeric' })
  })

  const trendDataTotal = sortedMonths.map((monthKey) => monthlyData[monthKey].total)
  const trendDataResueltos = sortedMonths.map((monthKey) => monthlyData[monthKey].resueltos)
  const trendDataNuevos = sortedMonths.map((monthKey) => monthlyData[monthKey].nuevos)

  if (trendChart) {
    trendChart.destroy()
  }

  trendChart = new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels: trendLabels,
      datasets: [
        {
          label: 'Total de Incidencias',
          data: trendDataTotal,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Incidencias Resueltas',
          data: trendDataResueltos,
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Incidencias Nuevas',
          data: trendDataNuevos,
          borderColor: '#f39c12',
          backgroundColor: 'rgba(243, 156, 18, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
        x: { grid: { display: false } },
      },
    },
  })

  // --- Gráfico de Tiempo de Resolución (Torta) ---
  const resolutionRanges = {
    'Menos de 7 días': 0,
    '7-15 días': 0,
    '15-30 días': 0,
    'Más de 30 días': 0,
  }

  const casosResueltos = denunciasFiltradas.value.filter(
    (d) => d.estado === 'resuelta' && d.fechaIncidencia && d.fecha_resolucion,
  )

  casosResueltos.forEach((caso) => {
    const fechaInicio = new Date(caso.fechaIncidencia)
    const fechaFin = new Date(caso.fecha_resolucion)
    const diffTiempo = fechaFin.getTime() - fechaInicio.getTime()
    const diffDias = diffTiempo / (1000 * 3600 * 24)

    if (diffDias < 7) {
      resolutionRanges['Menos de 7 días']++
    } else if (diffDias <= 15) {
      resolutionRanges['7-15 días']++
    } else if (diffDias <= 30) {
      resolutionRanges['15-30 días']++
    } else {
      resolutionRanges['Más de 30 días']++
    }
  })

  if (resolutionByCategoryChart) {
    resolutionByCategoryChart.destroy()
  }

  resolutionByCategoryChart = new Chart(document.getElementById('resolutionByCategoryChart'), {
    type: 'pie',
    data: {
      labels: Object.keys(resolutionRanges),
      datasets: [
        {
          label: 'Cantidad de Incidencias',
          data: Object.values(resolutionRanges),
          backgroundColor: [
            '#27ae60', // Verde para rápido
            '#f39c12', // Amarillo para normal
            '#e67e22', // Naranja para lento
            '#e74c3c', // Rojo para muy lento
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
          },
        },
      },
    },
  })

  // --- Gráfico de Distribución Demográfica (Polar Area) ---
  const ageRanges = {
    '18-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-55': 0,
    '56+': 0,
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  denunciasFiltradas.value.forEach((caso) => {
    const edad = calcularEdad(caso.idpersona?.fechaNacimiento)
    if (edad === null) return

    if (edad >= 18 && edad <= 25) ageRanges['18-25']++
    else if (edad >= 26 && edad <= 35) ageRanges['26-35']++
    else if (edad >= 36 && edad <= 45) ageRanges['36-45']++
    else if (edad >= 46 && edad <= 55) ageRanges['46-55']++
    else if (edad >= 56) ageRanges['56+']++
  })

  if (demographicChart) {
    demographicChart.destroy()
  }

  demographicChart = new Chart(document.getElementById('demographicChart'), {
    type: 'polarArea',
    data: {
      labels: Object.keys(ageRanges),
      datasets: [
        {
          label: 'Cantidad de Incidencias',
          data: Object.values(ageRanges),
          backgroundColor: [
            'rgba(52, 152, 219, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(39, 174, 96, 0.7)',
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
          },
        },
      },
      scales: {
        r: {
          grid: {
            circular: true,
          },
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  })
}
</script>

<template>
  <div class="reportes-container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="header-title">
          <h1>Reportes y Estadísticas</h1>
          <small>Análisis detallado de incidencias de Acción Social</small>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn print-btn" @click="printReport">
          <i class="fas fa-print"></i>
          Imprimir
        </button>
        <div class="export-dropdown">
          <button class="action-btn export-btn">
            <i class="fas fa-download"></i>
            Exportar
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="dropdown-content">
            <button @click="exportReport('json')">
              <i class="fas fa-file-code"></i>
              JSON
            </button>
            <button @click="exportReport('csv')">
              <i class="fas fa-file-csv"></i>
              CSV
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters-header">
        <h3>🔍 Filtros de Búsqueda</h3>
        <div class="filters-actions">
          <button class="filter-btn apply" @click="applyFilters" :disabled="loading">
            <i class="fas fa-search" :class="{ 'fa-spin': loading }"></i>
            {{ loading ? 'Aplicando...' : 'Aplicar' }}
          </button>
          <button class="filter-btn reset" @click="resetFilters">
            <i class="fas fa-undo"></i>
            Resetear
          </button>
        </div>
      </div>

      <div class="filters-grid">
        <div class="filter-group">
          <label>Período</label>
          <select v-model="filters.dateRange">
            <option value="last-week">Última semana</option>
            <option value="last-month">Último mes</option>
            <option value="last-quarter">Último trimestre</option>
            <option value="last-year">Último año</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <div class="filter-group" v-if="filters.dateRange === 'custom'">
          <label>Fecha Inicio</label>
          <input
            type="date"
            v-model="filters.startDate"
            :disabled="filters.dateRange !== 'custom'"
          />
        </div>

        <div class="filter-group" v-if="filters.dateRange === 'custom'">
          <label>Fecha Fin</label>
          <input type="date" v-model="filters.endDate" :disabled="filters.dateRange !== 'custom'" />
        </div>

        <div class="filter-group">
          <label>Categoría</label>
          <select v-model="filtroCategoria">
            <option value="all">Todas las categorías</option>
            <option v-for="c in category" :key="c.id" :value="c.nombre">
              {{ c.nombre }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Estado</label>
          <select v-model="filtroEstado">
            <option value="all">Todos los estados</option>
            <option value="new">Nuevos</option>
            <option value="in-progress">En Proceso</option>
            <option value="resolved">Resueltos</option>
            <option value="closed">Cerrados</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Prioridad</label>
          <select v-model="filters.priority">
            <option value="all">Todas las prioridades</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Resumen Ejecutivo -->
    <div class="summary-section">
      <h3>📈 Resumen Ejecutivo</h3>
      <div class="summary-cards">
        <div class="summary-card total">
          <div class="card-icon">
            <i class="fas fa-folder"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ resumenFiltrado.total }}</div>
            <div class="card-label">Total de Incidencias (Filtrados)</div>
          </div>
        </div>

        <div class="summary-card new">
          <div class="card-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ resumenFiltrado.nuevos }}</div>
            <div class="card-label">Incidencias Nuevas</div>
          </div>
        </div>

        <div class="summary-card resolved">
          <div class="card-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ resumenFiltrado.resueltos }}</div>
            <div class="card-label">Incidencias Resueltas</div>
          </div>
        </div>

        <div class="summary-card progress">
          <div class="card-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ resumenFiltrado.enProceso }}</div>
            <div class="card-label">En Proceso</div>
          </div>
        </div>

        <div class="summary-card urgent">
          <div class="card-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ resumenFiltrado.urgentes }}</div>
            <div class="card-label">Incidencias Urgentes</div>
          </div>
        </div>

        <div class="summary-card metric">
          <div class="card-icon">
            <i class="fas fa-hourglass-half"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ resumenFiltrado.tiempoPromedioResolucion }}d</div>
            <div class="card-label">Tiempo Promedio</div>
          </div>
        </div>

        <div class="summary-card satisfaction">
          <div class="card-icon">
            <i class="fas fa-thumbs-up"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ resumenFiltrado.satisfaccionPromedio }}%</div>
            <div class="card-label">Satisfacción</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="charts-section">
      <!-- Tendencia Mensual -->
      <div class="chart-card large">
        <div class="chart-header">
          <h4>Tendencia Mensual de Incidencias</h4>
          <p>Evolución de incidencias totales, resueltos y nuevos por mes</p>
        </div>
        <div class="chart-container">
          <canvas id="trendChart"></canvas>
        </div>
      </div>

      <!-- Distribución por Categorías -->
      <div class="chart-card medium">
        <div class="chart-header">
          <h4>Incidencias por Categoría</h4>
          <p>Distribución de incidencias por tipo de problema</p>
        </div>
        <div class="chart-container">
          <canvas id="categoryChart"></canvas>
        </div>
      </div>

      <!-- Tiempo de Resolución -->
      <div class="chart-card medium">
        <div class="chart-header">
          <h4>Tiempo de Resolución</h4>
          <p>Distribución de incidencias por tiempo de resolución</p>
        </div>
        <div class="chart-container">
          <canvas id="resolutionByCategoryChart"></canvas>
        </div>
      </div>

      <!-- Datos Demográficos -->
      <div class="chart-card medium">
        <div class="chart-header">
          <h4>Distribución Demográfica</h4>
          <p>Incidencias por rango de edad</p>
        </div>
        <div class="chart-container">
          <canvas id="demographicChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Tabla Detallada -->
    <!-- <div class="table-section">
      <div class="table-header">
        <h3>Análisis Detallado por Categoría</h3>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Porcentaje</th>
              <th>Tendencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="categoria in denunciasPorCategoria" :key="categoria.categoria">
              <td>{{ categoria.categoria }}</td>
              <td>
                <span class="count-badge">{{ categoria.cantidad }}</span>
              </td>
              <td>{{ categoria.porcentaje }}%</td>
              <td>
                <span
                  :class="{ positivo: categoria.tendencia > 0, negativo: categoria.tendencia < 0 }"
                >
                  {{ categoria.tendencia }}
                </span>
              </td>
              <td>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: categoria.porcentaje + '%' }"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> -->
  </div>
</template>

<style scoped>
.reportes-container {
  padding: 20px;
  margin: 0 auto;
  /* background: linear-gradient(45deg, #95faa6 0%, #1c77ac 100%); */
  background: rgba(245, 241, 241);
  min-height: 100vh;
}
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px 30px;
  margin-bottom: 30px;
  box-shadow: 0 0px 15px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.back-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}
.header-title h1 {
  color: #2c3e50;
  font-size: 2.2em;
  font-weight: 700;
  margin: 0 0 5px 0;
}
.header-title small {
  color: #7f8c8d;
  display: block;
}
.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}
.action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
.export-dropdown {
  position: relative;
}
.dropdown-content {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgb(241, 240, 240);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  min-width: 150px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  border: 1px solid #ccc;
  z-index: 1000;
}

.export-dropdown:hover .dropdown-content {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.dropdown-content button {
  background: none;
  border: none;
  padding: 10px 15px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2c3e50;
}
.dropdown-content button:hover {
  background: #f8f9fa;
  border-radius: 5px;
}
.filters-section {
  background: rgba(255, 255, 255, 0.95);
  /* backdrop-filter: blur(10px); */
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 0px 15px rgba(0, 0, 0, 0.3);
}
.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}
.filters-header h3 {
  color: #2c3e50;
  font-size: 1.4em;
  font-weight: 600;
  margin: 0;
}
.filters-actions {
  display: flex;
  gap: 10px;
}
.filter-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-btn.apply {
  background: #27ae60;
  color: white;
}
.filter-btn.apply:hover:not(:disabled) {
  background: #229954;
}
.filter-btn.apply:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.filter-btn.reset {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
}
.filter-btn.reset:hover {
  background: #e9ecef;
}
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9em;
}
.filter-group select,
.filter-group input {
  padding: 10px 15px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  color: #495057;
  transition: all 0.3s ease;
}
.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.summary-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}
.summary-section h3 {
  color: #2c3e50;
  font-size: 1.4em;
  font-weight: 600;
  margin: 0 0 25px 0;
}
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.summary-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  border-top: 4px solid var(--card-color);
  box-shadow: 0 0px 10px rgba(0, 0, 0, 0.2);
}
.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}
.summary-card.total {
  --card-color: #2c3e50;
}
.summary-card.new {
  --card-color: #3498db;
}
.summary-card.resolved {
  --card-color: #27ae60;
}
.summary-card.progress {
  --card-color: #f39c12;
}
.summary-card.urgent {
  --card-color: #e74c3c;
}
.summary-card.metric {
  --card-color: #9b59b6;
}
.summary-card.satisfaction {
  --card-color: #1abc9c;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  color: white;
  background: var(--card-color);
  flex-shrink: 0;
}
.card-content {
  flex: 1;
}
.card-value {
  font-size: 2.2em;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}
.card-label {
  color: #7f8c8d;
  font-size: 0.9em;
  font-weight: 500;
}
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}
.chart-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 0px 15px rgba(0, 0, 0, 0.3);
}
.chart-card.large {
  grid-column: 1 / -1;
}
.chart-header {
  margin-bottom: 25px;
}
.chart-header h4 {
  color: #2c3e50;
  font-size: 1.3em;
  font-weight: 600;
  margin: 0 0 8px 0;
}
.chart-header p {
  color: #7f8c8d;
  font-size: 0.9em;
  margin: 0;
}
.chart-container {
  position: relative;
  height: 350px;
}
.chart-card.large .chart-container {
  height: 400px;
}

.table-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 0px 15px rgba(0, 0, 0, 0.3);
}
.table-header {
  margin-bottom: 25px;
}
.table-header h3 {
  color: #2c3e50;
  font-size: 1.4em;
  font-weight: 600;
  margin: 0;
}
.table-container {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}
.data-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* Colores */
  /* background: linear-gradient(135deg, #1f9e26, #169770); */
}
.data-table th {
  padding: 20px 15px;
  text-align: left;
  color: white;
  font-weight: 600;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.data-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f3f5;
  color: #2c3e50;
}
.data-table tbody tr:hover {
  background: #f8f9fa;
}
.data-table tbody tr:last-child td {
  border-bottom: none;
}
.count-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9em;
}
.trend-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.8em;
}
.trend-badge.positive {
  background: #e8f5e8;
  color: #388e3c;
}

.trend-badge.negative {
  background: #ffebee;
  color: #d32f2f;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background: #f1f3f5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}
/* Responsive */
@media (max-width: 1200px) {
  .charts-section {
    grid-template-columns: 1fr;
  }

  .chart-card.large {
    grid-column: 1;
  }
}
@media (max-width: 768px) {
  .reportes-container {
    padding: 15px;
  }

  .header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .header-left {
    flex-direction: column;
    gap: 15px;
  }

  .header-title h1 {
    font-size: 1.8em;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .summary-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
  }

  .data-table {
    font-size: 0.85em;
  }

  .data-table th,
  .data-table td {
    padding: 10px 8px;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .summary-card {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .filters-header {
    flex-direction: column;
    gap: 15px;
  }

  .filters-actions {
    width: 100%;
    justify-content: center;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
