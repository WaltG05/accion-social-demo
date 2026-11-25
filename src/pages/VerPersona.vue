<template>
  <div class="container-vista-persona">
    <div class="header-vista">
      <h1>Perfil de Persona</h1>
      <p class="subtitle">Información completa del registro de Acción Social</p>
    </div>

    <div v-if="cargando" class="estado-cargando">
      <p>Cargando información...</p>
      <p>Por favor, espera...</p>
    </div>
    <div v-else-if="persona" class="tarjeta-persona">
      <!-- Información Principal -->
      <div class="seccion-principal">
        <div class="avatar-section">
          <div class="avatar">
            {{ (persona.nombre || '?').charAt(0) }}{{ (persona.apellido || '?').charAt(0) }}
          </div>
          <h2 class="nombre-completo">{{ persona.nombre }} {{ persona.apellido }}</h2>
          <p class="dni" v-if="!isReadOnly">DNI: {{ formatearDNI(persona.DNI) }}</p>
        </div>
      </div>

      <!-- Datos Personales -->
      <div v-if="seccionActual === 0" class="seccion-datos seccion-fade">
        <h3 class="titulo-seccion">
          <!-- <i class="icon">👤</i> -->
          Datos Personales
        </h3>
        <div class="campos-vista">
          <div class="campo-vista">
            <span class="etiqueta">Nombre Completo</span>
            <span class="valor">{{ persona.nombre }} {{ persona.apellido }}</span>
          </div>
          <div class="campo-vista" v-if="!isReadOnly">
            <span class="etiqueta">DNI</span>
            <span class="valor">{{ formatearDNI(persona.DNI) }}</span>
          </div>
          <div class="campo-vista" v-if="persona.fechaNacimiento">
            <span class="etiqueta">Fecha de Nacimiento</span>
            <span class="valor">{{ formatearFecha(persona.fechaNacimiento) }}</span>
          </div>
          <div class="campo-vista">
            <span class="etiqueta">Edad</span>
            <span class="valor">{{ calcularEdad(persona.fechaNacimiento) }} años</span>
          </div>
          <div class="campo-vista" v-if="persona.genero">
            <span class="etiqueta">Género</span>
            <span class="valor">{{ persona.genero }}</span>
          </div>
          <div class="campo-vista" v-if="persona.estadoCivil">
            <span class="etiqueta">Estado Civil</span>
            <span class="valor">{{ persona.estadoCivil }}</span>
          </div>
        </div>
      </div>

      <!-- Contacto y Domicilio -->
      <div v-if="seccionActual === 1" class="seccion-datos seccion-fade">
        <h3 class="titulo-seccion">
          <!-- <i class="icon">📍</i> -->
          Contacto y Domicilio
        </h3>
        <div class="campos-vista">
          <div class="campo-vista campo-completo" v-if="persona.direccion">
            <span class="etiqueta">Domicilio</span>
            <span class="valor">{{ persona.direccion }}</span>
          </div>
          <div class="campo-vista" v-if="persona.telefono && !isReadOnly">
            <span class="etiqueta">Teléfono</span>
            <span class="valor">{{ persona.telefono }}</span>
          </div>
          <div class="campo-vista" v-if="persona.email && !isReadOnly">
            <span class="etiqueta">Correo Electrónico</span>
            <span class="valor">{{ persona.email }}</span>
          </div>
        </div>
      </div>

      <!-- Información Socioeconómica -->
      <div v-if="seccionActual === 2" class="seccion-datos seccion-fade">
        <h3 class="titulo-seccion">
          <!-- <i class="icon">🏠</i> -->
          Información Socioeconómica
        </h3>
        <div class="campos-vista">
          <div class="campo-vista" v-if="persona.ocupacion">
            <span class="etiqueta">Ocupación</span>
            <span class="valor">{{ persona.ocupacion }}</span>
          </div>
          <!-- <div class="campo-vista" v-if="persona.ingresos">
            <span class="etiqueta">Ingresos Mensuales</span>
            <span class="valor">{{ persona.ingresos }}</span>
          </div> -->
          <div class="campo-vista">
            <span class="etiqueta">Obra Social</span>
            <span class="valor">{{ persona.obrasocial || 'Ninguna' }}</span>
          </div>
          <!-- <div class="campo-vista" v-if="persona.grupoFamiliar">
            <span class="etiqueta">Grupo Familiar</span>
            <span class="valor">{{ persona.grupoFamiliar }} miembros</span>
          </div> -->
          <!-- <div class="campo-vista" v-if="persona.tipoVivienda">
            <span class="etiqueta">Tipo de Vivienda</span>
            <span class="valor">{{ persona.tipoVivienda }}</span>
          </div> -->
          <div class="campo-vista" v-if="persona.beneficios?.length">
            <span class="etiqueta">Beneficios Sociales</span>
            <ul>
              <li
                v-for="(beneficio, index) in persona.beneficios"
                :key="index"
                class="item-beneficio"
              >
                {{ beneficio }}
              </li>
            </ul>
            <!-- <span class="valor">{{ persona.beneficiosSociales }}</span> -->
          </div>
        </div>
      </div>

      <!-- Observaciones -->
      <div class="seccion-datos seccion-fade" v-if="persona.observaciones && seccionActual === 3">
        <h3 class="titulo-seccion">
          <!-- <i class="icon">📝</i> -->
          Observaciones
        </h3>
        <div class="observaciones-texto">
          {{ persona.observaciones }}
        </div>
      </div>

      <!-- Navegación de Secciones -->
      <div class="navegacion-secciones">
        <button @click="anteriorSeccion" :disabled="seccionActual === 0" class="btn-nav">
          <span class="arrow">←</span> Anterior
        </button>
        <span class="nav-info">
          Paso {{ seccionActual + 1 }} de {{ totalSecciones }}
        </span>
        <button
          @click="siguienteSeccion"
          :disabled="seccionActual === totalSecciones - 1"
          class="btn-nav"
        >
          Siguiente <span class="arrow">→</span>
        </button>
      </div>

      <!-- Botones de Acción -->
      <div class="botones-accion">
        <router-link to="/personas" class="btn-volver">
          <!-- <i class="icon">⬅️</i> -->
          Volver a Personas
        </router-link>
        <router-link :to="`/personas/${persona.idpersona}/editar`" class="btn-editar" v-if="!isReadOnly">
          <!-- <i class="icon">✏️</i> -->
          Editar Persona
        </router-link>
      </div>
    </div>

    <!-- Estado de carga o error -->
    <div v-else class="estado-vacio">
      <h2>Persona no encontrada</h2>
      <p>No se pudo encontrar la información de la persona solicitada.</p>
      <router-link to="/personas" class="btn-volver">
        <!-- <i class="icon">⬅️</i> -->
        Volver a Personas
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { readItems } from '@directus/sdk'
import { directus } from '../../config/directus.js'
import { useAuth } from '../../config/auth.js'

const route = useRoute()
const { isReadOnly } = useAuth()

// Estado para la navegación por secciones
const seccionActual = ref(0)

const secciones = computed(() => {
  const lista = ['Datos Personales', 'Contacto y Domicilio', 'Información Socioeconómica']
  if (persona.value?.observaciones) {
    lista.push('Observaciones')
  }
  return lista
})

const totalSecciones = computed(() => secciones.value.length)

function siguienteSeccion() {
  if (seccionActual.value < totalSecciones.value - 1) {
    seccionActual.value++
  }
}

function anteriorSeccion() {
  if (seccionActual.value > 0) {
    seccionActual.value--
  }
}

const persona = ref(null)
const cargando = ref(true)

onMounted(async () => {
  try {
    // 1. Obtener el ID de la ruta (este valor es una cadena, ya sea un entero o un UUID)

    const idDesdeRuta = route.params.idpersona

    const res = await directus.value.request(
      readItems('personas', {
        filter: { idpersona: { _eq: idDesdeRuta } },
      }),
    )

    const personaCargada = res?.[0] || null

    if (personaCargada) {
      const resBP = await directus.value.request(readItems('beneficios_personas'))
      const resBeneficios = await directus.value.request(readItems('beneficios'))

      const bp = resBP.filter((b) => b.idpersona === personaCargada.idpersona)

      personaCargada.beneficios = bp
        .map((b) => {
          const beneficio = resBeneficios.find((ben) => ben.id === b.idbeneficio)
          return beneficio ? beneficio.nombrebeneficio : null
        })
        .filter(Boolean)

      if (!personaCargada.beneficios) personaCargada.beneficios = []
    }
    persona.value = personaCargada
    // persona.value = res?.[0] || null;
    console.log('Respuesta Directus:', res)
  } catch (error) {
    console.error('Error al cargar la persona: ', error)
    persona.value = null
  } finally {
    cargando.value = false
  }
})
const formatearFecha = (fechaISO) => {
  if (!fechaISO) return ''
  const fecha = new Date(fechaISO)

  const dia = String(fecha.getUTCDate()).padStart(2, '0')
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0')
  const anio = fecha.getUTCFullYear()

  return `${dia}/${mes}/${anio}`
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
const formatearDNI = (dni) => {
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
</script>

<style scoped>
.container-vista-persona {
  min-height: 100vh;
  background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%); /* ✅ Fondo correcto */
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header-vista {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.header-vista h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 300;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 0;
}
.campo-vista ul {
  list-style: none;
  padding-left: 0rem;
}
.campo-vista ul li {
  background: #e9ebec;
  margin-bottom: 0.3rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 1rem;
  color: #444444;
  font-weight: 700;
}

.item-beneficio {
  background: #afceec;
  margin-bottom: 0.3rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 1rem;
  color: #444444;
  font-weight: 600;
}

.estado-cargando {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  padding: 2.4rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

.estado-cargando p {
  color: #444;
  margin-bottom: 0.8rem;
  font-size: 2rem;
  font-weight: 600;
}
.tarjeta-persona {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.seccion-fade {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}


.seccion-principal {
  background: linear-gradient(135deg, #1d2b38 0%, #274355 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.nombre-completo {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 400;
}

.dni {
  font-size: 1.1rem;
  opacity: 0.9;
}

.seccion-datos {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.seccion-datos:last-of-type {
  border-bottom: none;
}

.titulo-seccion {
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.titulo-seccion .icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.campos-vista {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.campo-vista {
  display: flex;
  flex-direction: column;
}

.campo-completo {
  grid-column: 1 / -1;
}

.etiqueta {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.valor {
  color: #333;
  font-size: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.observaciones-texto {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  color: #555;
  line-height: 1.6;
  font-style: italic;
}
.navegacion-secciones {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.btn-nav {
  background-color: #5392c9;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-nav:hover:not(:disabled) {
  background-color: #447bac;
  transform: translateY(-2px);
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-info {
  font-weight: 600;
  color: #495057;
}

.botones-accion {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.btn-volver,
.btn-editar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  min-width: 150px;
  justify-content: center;
}

.btn-volver {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: white;
}

.btn-volver:hover {
  background: linear-gradient(135deg, #5a6268, #495057);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(108, 117, 125, 0.4);
}

.btn-editar {
  background: linear-gradient(135deg, #f4a261, #e76f51);
  color: white;
}

.btn-editar:hover {
  background: linear-gradient(135deg, #e76f51, #d63031);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(244, 162, 97, 0.4);
}

.estado-vacio {
  max-width: 500px;
  margin: 0 auto;
  background: white;
  padding: 3rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.estado-vacio h2 {
  color: #e76f51;
  margin-bottom: 1rem;
}

.estado-vacio p {
  color: #666;
  margin-bottom: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .container-vista-persona {
    padding: 1rem;
  }

  .header-vista h1 {
    font-size: 2rem;
  }

  .seccion-datos {
    padding: 1.5rem;
  }

  .campos-vista {
    grid-template-columns: 1fr;
  }

  .botones-accion {
    flex-direction: column;
    padding: 1.5rem;
  }

  .avatar {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .nombre-completo {
    font-size: 1.5rem;
  }
}

.tarjeta-persona {
  animation: fadeIn 0.5s ease-out;
}
</style>
