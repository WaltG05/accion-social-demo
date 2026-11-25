<script setup>
import { ref, reactive, onMounted, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { readItems } from '@directus/sdk'
import { directus } from '../../config/directus.js'
const router = useRouter()

const stats = reactive({
  newCases: 0,
  inProgress: 0,
  resolved: 0,
  urgent: 0,
})
const recentCases = ref([])
const todosLosCasos = ref([]) // los gráficos usan todo el historial, no solo los últimos 50

const notifications = ref([
  {
    id: 1,
    type: 'info',
    icon: 'fas fa-info-circle',
    title: 'Mantenimiento Programado',
    text: 'El sistema estará en mantenimiento el 15 de marzo de 2:00 AM a 4:00 AM.',
  },
  {
    id: 2,
    type: 'warning',
    icon: 'fas fa-exclamation-triangle',
    title: 'Atención Urgente',
    text: 'Hay 5 incidencias urgentes que requieren atención inmediata.',
  },
  {
    id: 3,
    type: 'success',
    icon: 'fas fa-check-circle',
    title: 'Actualización Exitosa',
    text: 'El sistema se ha actualizado correctamente a la versión 2.1.0.',
  },
])

// Verificar si la fecha es hoy o ayer
function isTodayOrYesterday(date) {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const d = new Date(date)
  return d.toDateString() === today.toDateString() || d.toDateString() === yesterday.toDateString()
}

// Computed Properties
const newCasesCount = computed(() => {
  return recentCases.value.filter((c) => isTodayOrYesterday(c.date)).length
})

const casesByStatus = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const casosDelMes = recentCases.value.filter((c) => {
    const fecha = new Date(c.fechaIncidencia)
    return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear
  })

  return {
    new: casosDelMes.filter((c) => c.estado === 'recibida').length,
    inProgress: casosDelMes.filter((c) => c.estado === 'en_evaluacion').length,
    resolved: casosDelMes.filter((c) => c.estado === 'resuelta').length,
    urgent: casosDelMes.filter((c) => c.prioridad?.toLowerCase() === 'urgente').length,
  }
})

const compararCasos = reactive({
  new: { actual: 0, anterior: 0, porcentaje: 0 },
  inProgress: { actual: 0, anterior: 0, porcentaje: 0 },
  resolved: { actual: 0, anterior: 0, porcentaje: 0 },
  urgent: { actual: 0, anterior: 0, porcentaje: 0 },
})
// Función para obtener el rango de fechas de un mes
function getDateRange(year, month) {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59)
  return { start: start.toISOString(), end: end.toISOString() }
}

const totalCases = computed(() => recentCases.value.length)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
// Cargar datos
async function cargarDatos() {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const mesActual = hoy.getMonth() // 0 = enero
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1
  const yearAnterior = mesActual === 0 ? year - 1 : year

  const rangoActual = getDateRange(year, mesActual)
  const rangoAnterior = getDateRange(yearAnterior, mesAnterior)

  // Traer incidencias de Directus
  // const { data: incidencias } = await directus.items("incidencias").readByQuery({
  //   fields: ["estado", "fechaIncidencia", "prioridad"],
  //   filter: {
  //     fechaIncidencia: {
  //       _between: [rangoAnterior.start, rangoActual.end] // traemos ambos meses de una sola
  //     }
  //   },
  //   limit: -1
  // });

  const incidencias = await directus.value.request(
    readItems('incidencias', {
      fields: ['estado', 'fechaIncidencia', 'prioridad'],
      filter: {
        fechaIncidencia: {
          _between: [rangoAnterior.start, rangoActual.end],
        },
      },
      limit: -1,
    }),
  )

  // Contadores por mes
  const countsActual = { new: 0, inProgress: 0, resolved: 0, urgent: 0 }
  const countsAnterior = { new: 0, inProgress: 0, resolved: 0, urgent: 0 }

  incidencias.forEach((caso) => {
    const fecha = new Date(caso.fechaIncidencia)
    const mes = fecha.getMonth()
    const anio = fecha.getFullYear()

    const isActual = anio === year && mes === mesActual
    const isAnterior = anio === yearAnterior && mes === mesAnterior

    if (isActual || isAnterior) {
      let estadoKey = null

      if (caso.estado === 'recibida') estadoKey = 'new'
      else if (caso.estado === 'en_evaluacion') estadoKey = 'inProgress'
      else if (caso.estado === 'resuelta') estadoKey = 'resolved'

      if (caso.prioridad?.toLowerCase() === 'urgente') estadoKey = 'urgent'

      if (estadoKey) {
        if (isActual) countsActual[estadoKey] += 1
        if (isAnterior) countsAnterior[estadoKey] += 1
      }
    }
  })

  // Calcular comparaciones
  Object.keys(compararCasos).forEach((estado) => {
    const actual = countsActual[estado]
    const anterior = countsAnterior[estado]
    let porcentaje = 0
    if (anterior > 0) {
      porcentaje = ((actual - anterior) / anterior) * 100
    }
    compararCasos[estado].actual = actual
    compararCasos[estado].anterior = anterior
    compararCasos[estado].porcentaje = porcentaje
  })
}
// const currentDate = computed(() =>
//   new Date().toLocaleDateString('es-AR', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   })
// )

//Metodos
const showNewCaseForm = () => router.push('/incidencias')
const showReports = () => router.push('/reportes')
const exportData = () => alert('Funcionalidad de exportación en desarrollo')

const loading = ref(false)

const refreshCases = async () => {
  loading.value = true
  try {
    const items = await directus.value.request(
      readItems('incidencias', {
        fields: [
          'idincidencia',
          'estado',
          'prioridad',
          'fechaIncidencia',
          'numero_denuncia',
          'idcategoria.*',
        ],
        sort: ['-fechaIncidencia'],
        limit: -1,
      }),
    )
    todosLosCasos.value = items
    recentCases.value = items.slice(0, 50)
  } catch (error) {
    console.error('Error al actualizar incidencias:', error)
  } finally {
    loading.value = false
  }
}

const selectedYear = ref(String(new Date().getFullYear()))
let mensualChart = null
let categoryChart = null

const renderCharts = () => {
  // Casos por mes
  const monthlyCounts = Array(12).fill(0)
  todosLosCasos.value.forEach((c) => {
    const date = new Date(c.fechaIncidencia)
    if (date.getFullYear().toString() === selectedYear.value) {
      monthlyCounts[date.getMonth()]++
    }
  })

  if (mensualChart) {
    mensualChart.destroy()
  }
  mensualChart = new Chart(document.getElementById('mensualChart'), {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: 'Incidencias',
          data: monthlyCounts,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0,0,0,0.1)',
          },
          ticks: {
            color: '#7f8c8d',
            stepSize: 1,
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
  // Casos por tipo
  const categoryCounts = {}
  todosLosCasos.value.forEach((caso) => {
    const categoriaNombre = caso.idcategoria?.nombre || 'Sin Categoría'
    categoryCounts[categoriaNombre] = (categoryCounts[categoriaNombre] || 0) + 1
  })

  // Labels y colores dinámicos
  const labels = Object.keys(categoryCounts)
  const dataValues = Object.values(categoryCounts)
  const backgroundColors = Object.keys(categoryCounts).map(
    (tipo) => categoryColors[tipo] || '#7f8c8d',
  )

  if (categoryChart) {
    categoryChart.destroy()
  }

  categoryChart = new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          label: 'Incidencias',
          data: dataValues,
          backgroundColor: backgroundColors,
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
          // display: true,
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            color: '#2c3e50',
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#2c3e50',
          bodyColor: '#2c3e50',
          borderColor: '#e9ecef',
          borderWidth: 1,
        },
      },
    },
  })
}

const estados = {
  recibida: { label: 'Recibida', class: 'badge-secondary' },
  en_evaluacion: { label: 'En Evaluación', class: 'badge-primary' },
  asignada: { label: 'Asignada', class: 'badge-warning' },
  en_intervencion: { label: 'En Intervención', class: 'badge-danger' },
  resuelta: { label: 'Resuelta', class: 'badge-success' },
}

function getEstadoLabel(estado) {
  return estados[estado?.toLowerCase()]?.label || estado
}
function getEstadoClass(estado) {
  return estados[estado?.toLowerCase()]?.class || 'badge-secondary'
}

onMounted(async () => {
  try {
    await refreshCases()
    renderCharts()
    cargarDatos()
  } catch (error) {
    console.error('Error al cargar incidencias desde Directus:', error)
  }
})

watch(selectedYear, () => {
  renderCharts()
})
</script>

<template>
  <div class="dashboard-container">
    <div class="stats-grid">
      <div class="stat-card new">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fa-solid fa-file"></i>
          </div>
        </div>
        <div class="stat-value">{{ compararCasos.new.actual }}</div>
        <div class="stat-text">Incidencias Nuevas</div>
        <div
          class="stat-trend"
          :class="{
            'trend-positive': compararCasos.new.porcentaje > 0,
            'trend-negative': compararCasos.new.porcentaje < 0,
            'trend-neutral': compararCasos.new.porcentaje === 0,
          }"
        >
          <i
            :class="{
              'fas fa-arrow-up': compararCasos.new.porcentaje > 0,
              'fas fa-arrow-down': compararCasos.new.porcentaje < 0,
              'fas fa-minus': compararCasos.new.porcentaje === 0,
            }"
          ></i>
          {{ compararCasos.new.porcentaje.toFixed(1) }}% vs mes anterior
        </div>
      </div>

      <div class="stat-card in-progress">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
        </div>
        <div class="stat-value">{{ compararCasos.inProgress.actual }}</div>
        <div class="stat-text">En Proceso</div>
        <div
          class="stat-trend"
          :class="{
            'trend-positive': compararCasos.inProgress.porcentaje > 0,
            'trend-negative': compararCasos.inProgress.porcentaje < 0,
            'trend-neutral': compararCasos.inProgress.porcentaje === 0,
          }"
        >
          <i
            :class="{
              'fas fa-arrow-up': compararCasos.inProgress.porcentaje > 0,
              'fas fa-arrow-down': compararCasos.inProgress.porcentaje < 0,
              'fas fa-minus': compararCasos.inProgress.porcentaje === 0,
            }"
          ></i>
          {{ compararCasos.inProgress.porcentaje.toFixed(1) }}% vs mes anterior
        </div>
      </div>

      <div class="stat-card resolved">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>
        <div class="stat-value">{{ compararCasos.resolved.actual }}</div>
        <div class="stat-text">Resueltos</div>
        <div
          class="stat-trend"
          :class="{
            'trend-positive': compararCasos.resolved.porcentaje > 0,
            'trend-negative': compararCasos.resolved.porcentaje < 0,
            'trend-neutral': compararCasos.resolved.porcentaje === 0,
          }"
        >
          <i
            :class="{
              'fas fa-arrow-up': compararCasos.resolved.porcentaje > 0,
              'fas fa-arrow-down': compararCasos.resolved.porcentaje < 0,
              'fas fa-minus': compararCasos.resolved.porcentaje === 0,
            }"
          ></i>
          {{ compararCasos.resolved.porcentaje.toFixed(1) }}% vs mes anterior
        </div>
      </div>
      <div class="stat-card urgent">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
        </div>
        <div class="stat-value">{{ compararCasos.urgent.actual }}</div>
        <div class="stat-text">Urgentes</div>
        <div
          class="stat-trend"
          :class="{
            'trend-positive': compararCasos.urgent.porcentaje > 0,
            'trend-negative': compararCasos.urgent.porcentaje < 0,
            'trend-neutral': compararCasos.urgent.porcentaje === 0,
          }"
        >
          <i
            :class="{
              'fas fa-arrow-up': compararCasos.urgent.porcentaje > 0,
              'fas fa-arrow-down': compararCasos.urgent.porcentaje < 0,
              'fas fa-minus': compararCasos.urgent.porcentaje === 0,
            }"
          ></i>
          {{ compararCasos.urgent.porcentaje.toFixed(1) }}% vs mes anterior
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Incidencias por Mes - {{ selectedYear }}</h3>
          <select class="chart-filter" v-model="selectedYear">
            <option :value="String(new Date().getFullYear())">{{ new Date().getFullYear() }}</option>
            <option :value="String(new Date().getFullYear() - 1)">{{ new Date().getFullYear() - 1 }}</option>
          </select>
        </div>
        <div class="chart-container">
          <canvas id="mensualChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Tipos de Incidencias</h3>
        </div>
        <div class="chart-container">
          <canvas id="categoryChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Casos Recientes -->
    <div class="bottom-section">
      <div class="recent-cases">
        <div class="section-header">
          <h3 class="section-title">Incidencias Recientes</h3>
          <button class="refresh-btn" @click="refreshCases" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            {{ loading ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
        <div class="cases-list">
          <div v-for="case_ in recentCases" :key="case_.idincidencia" class="case-item">
            <div class="case-info">
              <div class="case-id">
                Incidencia #{{ case_.numero_denuncia?.toString().padStart(4, '0') }}
              </div>
              <div class="case-type">{{ case_.idcategoria?.nombre }}</div>
              <div class="case-date">{{ formatDate(case_.fechaIncidencia) }}</div>
            </div>
            <div :class="['case-status', getEstadoClass(case_.estado)]">
              {{ getEstadoLabel(case_.estado) }}
            </div>
          </div>
        </div>
      </div>

      <div class="notifications">
        <div class="section-header">
          <h3 class="section-title">Notificaciones</h3>
        </div>

        <div class="notifications-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="['notification-item', notification.type]"
          >
            <div class="notification-icon">
              <i :class="notification.icon"></i>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-text">{{ notification.text }}</div>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <button class="action-btn" @click="showNewCaseForm">
            <i class="fas fa-plus"></i>
            Nuevo Caso
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
  margin: 0 auto;
  /* background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%); */
  /* background: white; */
  background: rgb(245, 241, 241);
  min-height: 100vh;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}
.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 0px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-color);
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stat-card.new {
  --card-color: #3498db;
}
.stat-card.in-progress {
  --card-color: #f39c12;
}
.stat-card.resolved {
  --card-color: #28af60;
}
.stat-card.urgent {
  --card-color: #e74c3c;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  color: white;
  background: var(--card-color);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}
.stat-text {
  color: #7f8c8d;
  font-size: 0.95rem;
  margin-bottom: 10px;
}
.stat-trend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  font-weight: 500;
}
.trend-positive {
  color: #1e8f4d;
}
.trend-negative {
  color: #d82511;
}
.trend-neutral {
  color: #7f8c8d;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
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
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.chart-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}
.chart-filter {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 8px 15px;
  border-radius: 8px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
}
.chart-filter:hover {
  background: #e9ecef;
}
.chart-container {
  position: relative;
  height: 300px;
}
.bottom-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}
.recent-cases,
.notifications {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 0px 15px rgba(0, 0, 0, 0.3);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}
.refresh-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 8px 15px;
  border-radius: 8px;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.refresh-btn:hover:not(:disabled) {
  background: #e9ecef;
}
.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.cases-list {
  max-height: 400px;
  overflow-y: auto;
}

.case-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 10px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
.case-item:hover {
  background: #edf5fd;
  transform: translateY(5px);
  border-color: #dee2e6;
}
.case-info {
  flex: 1;
}
.case-id {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 3px;
}
.case-type {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 5px;
}
.case-date {
  font-size: 0.8rem;
  color: #adb5bd;
}
.case-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
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

.status-new {
  background: #e3f2fd;
  color: #1976d2;
}
.status-in-progress {
  background: #fff3e0;
  color: #f57c00;
}

.status-resolved {
  background: #daeeda;
  color: #388e3c;
}

.status-urgent {
  background: #ffebee;
  color: #d32f2f;
}

.notifications-list {
  margin-bottom: 25px;
}
.notification-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-left: 4px solid #3498db;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
  transition: all 0.2s ease;
  border-left-color: var(--noti-color);
}

.notification-item:hover {
  background: #e9ecef;
}
.notification-item.warning {
  --noti-color: #f39c12;
}

.notification-item.success {
  --noti-color: #27ae60;
}

.notification-item.info {
  --noti-color: #3498db;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  background: var(--noti-color);
}
/* Para navegadores WebKit (Chrome, Edge, Safari) */

.notification-content {
  flex: 1;
}
.notification-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 3px;
}
.notification-text {
  font-size: 0.9em;
  color: #6c757d;
}
.quick-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
.action-btn {
  background: linear-gradient(130deg, #36b43d 20%, #3a8ac0 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 0.9em;
}
.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0px 5px 15px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-section,
  .bottom-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
  .chart-card,
  .recent-cases,
  .notifications {
    padding: 20px;
  }
  .quick-actions {
    justify-content: center;
  }
  .action-btn {
    padding: 10px 15px;
  }
}
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .case-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .case-status {
    align-self: flex-end;
  }
}
</style>
