<template>
  <div class="container-formulario">
    <div class="header-form">
      <h1>{{ isEditMode ? 'Editar Persona' : 'Agregar Nueva Persona' }}</h1>
      <p class="subtitle">Complete los datos de la persona para el registro de Acción Social</p>
    </div>

    <form @submit.prevent="guardarPersona" class="formulario-persona">
      <!-- Datos Personales -->
      <div class="seccion">
        <h3 class="titulo-seccion">
          <p>Datos Personales</p>
        </h3>
        <div class="campos-grupo">
          <div class="campo">
            <label for="nombre">Nombre *</label>
            <input
              id="nombre"
              v-model="form.nombre"
              type="text"
              placeholder="Ingrese el nombre"
              required
            />
          </div>
          <div class="campo">
            <label for="apellido">Apellido *</label>
            <input
              id="apellido"
              v-model="form.apellido"
              type="text"
              placeholder="Ingrese el apellido"
              required
            />
          </div>
          <div class="campo">
            <label for="dni">DNI *</label>
            <input id="dni" v-model="form.DNI" type="text" placeholder="12.345.678" required />
          </div>
          <div class="campo">
            <label for="fechaNacimiento">Fecha de Nacimiento</label>
            <input id="fechaNacimiento" v-model="form.fechaNacimiento" type="date" />
          </div>
          <div class="campo">
            <label for="genero">Género</label>
            <select id="genero" v-model="form.genero">
              <option value="">Seleccionar género</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="No binario">No binario</option>
              <option value="Prefiero no decir">Prefiero no decir</option>
            </select>
          </div>

          <div class="campo">
            <label for="nacionalidad">Nacionalidad</label>
            <input
              id="nacionalidad"
              type="text"
              v-model="form.nacionalidad"
              placeholder="Nacionalidad"
            />
          </div>

          <div class="campo">
            <label for="provincia">Provincia</label>
            <input id="provincia" type="text" v-model="form.provincia" placeholder="Provincia" />
          </div>

          <div class="campo">
            <label for="localidad">Localidad</label>
            <input id="localidad" type="text" v-model="form.localidad" placeholder="Localidad" />
          </div>

         <div class="campo campo-grupo-familiar">
  <label for="familia">
    Grupo Familiar
    <span class="badge-opcional">Opcional</span>
  </label>
  <select id="familia" v-model="form.idfamilia" class="select-grupo-familiar">
    <option value="">— Sin grupo familiar —</option>
    <option v-for="f in familias" :key="f.idfamilia" :value="f.idfamilia">
      {{ f.nombre }}
    </option>
  </select>
  <p class="campo-ayuda">
    <span class="icono-info">ℹ️</span>
    Podés dejar este campo vacío si la persona no pertenece a ningún grupo familiar registrado.
  </p>
</div>

          <div class="campo">
            <label for="vivienda">Vivienda asociada</label>
            <select id="vivienda" v-model="form.idvivienda" :disabled="form.noPoseeVivienda">
              <option value="">Seleccionar vivienda</option>
              <option v-for="v in viviendas" :key="v.idvivienda" :value="v.idvivienda">
                {{ v.direccion }}
              </option>
            </select>
          </div>

           <div class="campo campo-completo">
            <label class="checkbox-inline">
              <input v-model="form.noPoseeVivienda" type="checkbox" />
              No posee vivienda
            </label>
            <small class="helper-text">
              Si esta opción está activada, la vivienda no se podrá seleccionar en esta carga.
            </small>
          </div>

          <div class="campo campo-completo">
            <small class="helper-text">
              Si elige una vivienda asociada, el domicilio se deshabilita porque ya cuenta con una vivienda registrada.
            </small>

           </div>
        </div>
      </div>

      <!-- Contacto y Domicilio -->
      <div class="seccion">
        <h3 class="titulo-seccion">
          <p>Contacto y Domicilio</p>
        </h3>
        <div class="campos-grupo">
          <div class="campo campo-completo">
            <label for="domicilio">Domicilio</label>
            <input
              id="domicilio"
              v-model="form.direccion"
              type="text"
              placeholder="Calle y número, barrio"
              :disabled="form.idvivienda !== '' || form.noPoseeVivienda"
            />
          </div>
          <div class="campo">
            <label for="telefono">Teléfono</label>
            <input id="telefono" v-model="form.telefono" type="tel" placeholder="000-555-0100" />
          </div>
          <div class="campo">
            <label for="correo">Correo Electrónico</label>
            <input id="correo" v-model="form.email" type="email" placeholder="ejemplo@correo.com" />
          </div>
        </div>
      </div>

      <!-- Información Socioeconómica -->
      <div class="seccion">
        <h3 class="titulo-seccion">
          <p>Información Socioeconómica</p>
        </h3>
        <div class="campos-grupo">
          <div class="campo">
            <label for="ocupacion">Ocupación</label>
            <input
              id="ocupacion"
              v-model="form.ocupacion"
              type="text"
              placeholder="Trabajo actual"
            />
          </div>

          <div class="campo">
            <label for="obraSocial">Obra Social</label>
            <input
              id="obraSocial"
              v-model="form.obrasocial"
              type="text"
              placeholder="OSDE, PAMI, etc."
            />
          </div>

          <div class="campo campo-completo">
            <label for="beneficios">Beneficios Sociales</label>
            <div class="lista-beneficios">
              <div
                v-for="beneficio in beneficiosDisponibles"
                :key="beneficio.id"
                class="checkbox-beneficio"
              >
                <input
                  type="checkbox"
                  v-model="form.beneficios"
                  :value="beneficio.id"
                  :id="'beneficio-' + beneficio.id"
                />
                <label :for="'beneficio-' + beneficio.id">
                  {{ beneficio.nombrebeneficio }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="botones-accion">
        <button type="button" class="btn-cancelar" @click="cancelar">
          <!-- <i class="icon">❌</i> -->
          Cancelar
        </button>
        <button type="submit" class="btn-guardar" :disabled="guardando">
          <!-- <i class="icon">💾</i> -->
          {{ guardando ? (isEditMode ? 'Actualizando...' : 'Guardando...') : (isEditMode ? 'Actualizar Persona' : 'Guardar Persona') }}
        </button>
      </div>
    </form>
  </div>

  <!-- El contenedor debe estar en el DOM pero fuera de la vista visual para que html2pdf lo pueda renderizar -->
  <div style="position: absolute; left: -9999px; top: -9999px; width: 800px; background: white;">
    <ComprobantePersona id="comprobante-oculto" :reporte="datosParaTicket"/>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { readItems, readItem, updateItem, createItem, createItems, deleteItems, readMe } from '@directus/sdk' // ajustá según tu proyecto
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { directus } from '../../config/directus.js'
import ComprobantePersona from './ComprobantePersona.vue'
import html2pdf from 'html2pdf.js'

const isEditMode = ref(false)
const loading = ref(false)
const guardando = ref(false)
const beneficiosDisponibles = ref([])
const familias = ref([])
const viviendas = ref([])
const originalForm = ref({})
const form = ref({
  nombre: '',
  apellido: '',
  DNI: '',
  fechaNacimiento: '',
  genero: '',
  nacionalidad: '',
  provincia: '',
  localidad: '',
  direccion: '',
  telefono: '',
  email: '',
  ocupacion: '',
  obrasocial: '',
  beneficios: [],
  idfamilia: '',
  idvivienda: '',
  noPoseeVivienda: false,
  noPoseeDomicilio: false,
})

const datosParaTicket = ref({
  tipoOperacion: 'Alta',
  fecha: '',
  usuario: '',
  persona: '',
  codigo: '',
  datos: {}
})

const route = useRoute()
const router = useRouter()

watch(
  () => form.value.idvivienda,
  (nuevoValor) => {
    if (nuevoValor) {
      form.value.noPoseeVivienda = false
    }
  },
)

watch(
  () => form.value.noPoseeVivienda,
  (nuevoValor) => {
    if (nuevoValor) {
      form.value.idvivienda = ''
    }
  },
)

onMounted(async () => {
  loading.value = true
  try {
    const resBeneficios = await directus.value.request(readItems('beneficios'))
    beneficiosDisponibles.value = resBeneficios

    const resFamilias = await directus.value.request(readItems('grupofamiliar'))
    familias.value = resFamilias

    const resViviendas = await directus.value.request(
      readItems('vivienda', { fields: ['idvivienda', 'direccion'] }),
    )
    viviendas.value = resViviendas

    const idDesdeRuta = route.params.idpersona
    if (idDesdeRuta && idDesdeRuta !== 'nueva') {
      isEditMode.value = true
      const persona = await directus.value.request(readItem('personas', idDesdeRuta))

      // Formatear fecha para el input type="date"
      if (persona.fechaNacimiento) {
        persona.fechaNacimiento = persona.fechaNacimiento.split('T')[0]
      }

      form.value = {
        ...persona,
        beneficios: [],
        idvivienda: persona.idvivienda || '',
        noPoseeVivienda: Boolean(persona.noPoseeVivienda),
        noPoseeDomicilio: Boolean(persona.noPoseeDomicilio),
      }

      const resBP = await directus.value.request(
        readItems('beneficios_personas', {
          filter: { idpersona: { _eq: idDesdeRuta } },
        }),
      )
      form.value.beneficios = resBP.map((bp) => bp.idbeneficio)
      
      // Guardar el estado original para luego poder comparar qué cambió
      originalForm.value = JSON.parse(JSON.stringify(form.value))
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    Swal.fire('Error', 'No se pudieron cargar los datos para el formulario.', 'error')
  } finally {
    loading.value = false
  }
})

const getLocalISO = () => {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000 // offset en ms
  const localTime = new Date(now.getTime() - tzOffset)
  return localTime.toISOString().slice(0, 19) // elimina milisegundos
}

const formatearFechaStr = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

const obtenerNombreLegible = (clave, valor) => {
  if (valor === '' || valor === null || valor === undefined) return 'Vacío';
  
  if (clave === 'fechaNacimiento') {
    const partes = valor.split('T')[0].split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
  }

  if (clave === 'beneficios' && Array.isArray(valor)) {
    if (valor.length === 0) return 'Ninguno';
    return valor.map(id => {
      const ben = beneficiosDisponibles.value.find(b => b.id === id);
      return ben ? ben.nombrebeneficio : id;
    }).join(', ');
  }
  
  if (clave === 'idfamilia') {
    const fam = familias.value.find(f => f.idfamilia === valor);
    return fam ? fam.nombre : valor;
  }
  
  return valor;
}

const generarPDF = () => {
  return new Promise((resolve) => {
    // Le damos un pequeño tiempo a Vue para que actualice el componente en el DOM con los nuevos datos
    setTimeout(() => {
      const elemento = document.getElementById('ticket-content');
      if (!elemento) {
        resolve();
        return;
      }

      const opciones = {
        margin:       [0.5, 0.5, 0.5, 0.5], // márgenes en pulgadas
        filename:     `Reporte-${datosParaTicket.value.tipoOperacion}-${datosParaTicket.value.codigo || '0000'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, // scale 2 mejora la resolución
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // Para abrir en una nueva pestaña en lugar de descargar:
      // En la demo se descarga el comprobante (abrirlo en otra pestaña lo bloquean los navegadores).
      html2pdf().set(opciones).from(elemento).save().then(() => resolve()).catch(() => resolve());
    }, 100);
  });
}

const guardarPersona = async () => {
  guardando.value = true
  const accion = isEditMode.value ? 'Actualizando' : 'Guardando'

  Swal.fire({
    title: `${accion}...`,
    text: 'Por favor, espera.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
  try {
    // Preparamos los datos para Directus.
    // La relación M2M se actualiza pasando un array de objetos que representan
    // las filas de la tabla intermedia 'beneficios_personas'.
    const { beneficios, ...personaData } = form.value
    const datosParaGuardar = {
      ...personaData,
      beneficios: beneficios.map((idBeneficio) => ({
        beneficios_personas_id: { idpersona: form.value.idpersona, idbeneficio: idBeneficio },
      })),
    }

    // Mejora: Asegurarse de que si no se selecciona familia, se envíe null.
    if (datosParaGuardar.idfamilia === '') {
      datosParaGuardar.idfamilia = null
    }

    if (isEditMode.value) {
      // Para la actualización, es más simple: Directus maneja la sincronización
      // si le pasamos solo el array de IDs de los beneficios.
      const datosParaActualizar = {
        ...personaData,
        beneficios: beneficios, // Directus espera un array de IDs para sincronizar.
      }
      if (datosParaActualizar.idfamilia === '') {
        datosParaActualizar.idfamilia = null
      }

      await directus.value.request(
        updateItem('personas', form.value.idpersona, datosParaActualizar),
      )

      const antiguos = await directus.value.request(
        readItems('beneficios_personas', { filter: { idpersona: { _eq: form.value.idpersona } } }),
      )
      if (antiguos.length > 0) {
        await directus.value.request(
          deleteItems(
            'beneficios_personas',
            antiguos.map((item) => item.id),
          ),
        )
      }

      if (beneficios.length > 0) {
        const nuevosBeneficios = beneficios.map((idBeneficio) => ({
          idpersona: form.value.idpersona,
          idbeneficio: idBeneficio,
        }))
        await directus.value.request(createItems('beneficios_personas', nuevosBeneficios))
      }

      // Extraer solo los datos que fueron modificados comparando con originalForm
      const datosModificados = {}
      for (const key in form.value) {
        // Se ignora la comparación para idpersona para no mostrarlo como "modificado" a menos que se quiera, pero es clave primaria.
        if (JSON.stringify(form.value[key]) !== JSON.stringify(originalForm.value[key])) {
          let oldVal = obtenerNombreLegible(key, originalForm.value[key])
          let newVal = obtenerNombreLegible(key, form.value[key])

          datosModificados[key] = `${newVal} (antes: ${oldVal})`
        }
      }

      let nombreUsuario = 'Desconocido';
      try {
        const me = await directus.value.request(readMe({ fields: ['first_name', 'last_name', 'email'] }));
        nombreUsuario = me.first_name ? `${me.first_name} ${me.last_name || ''}`.trim() : me.email;
      } catch (err) {
        console.warn("No se pudo obtener el usuario", err);
      }

      datosParaTicket.value = {
        tipoOperacion: 'Modificación',
        fecha: formatearFechaStr(getLocalISO()),
        usuario: nombreUsuario,
        persona: originalForm.value.nombre + ' ' + originalForm.value.apellido,
        codigo: form.value.idpersona,
        datos: Object.keys(datosModificados).length ? datosModificados : { Mensaje: "No se registraron cambios" }
      }

      await Swal.fire('Actualizado', 'La persona ha sido actualizada', 'success')
      await directus.value.request(
        createItem('logs', {
          fecha: getLocalISO(),
          nivel: 'INFO',
          mensaje: `La persona ${datosParaActualizar.nombre} ${datosParaActualizar.apellido} ha sido actualizada`,
        }),
      )
    } else {
      // Para la creación, pasamos el objeto completo con la estructura de la relación.
      const nuevaPersona = await directus.value.request(createItem('personas', personaData))

      // Después de crear la persona, creamos las relaciones en la tabla intermedia.
      if (beneficios.length > 0) {
        const nuevasRelaciones = beneficios.map((idBeneficio) => ({
          idpersona: nuevaPersona.idpersona,
          idbeneficio: idBeneficio,
        }))
        await directus.value.request(createItem('beneficios_personas', nuevasRelaciones))
      }

      let nombreUsuario = 'Desconocido';
      try {
        const me = await directus.value.request(readMe({ fields: ['first_name', 'last_name', 'email'] }));
        nombreUsuario = me.first_name ? `${me.first_name} ${me.last_name || ''}`.trim() : me.email;
      } catch (err) {
        console.warn("No se pudo obtener el usuario", err);
      }

      const datosAlta = {}
      for (const key in form.value) {
        datosAlta[key] = obtenerNombreLegible(key, form.value[key])
      }

      datosParaTicket.value = {
        tipoOperacion: 'Alta',
        fecha: formatearFechaStr(getLocalISO()),
        usuario: nombreUsuario,
        persona: form.value.nombre + ' ' + form.value.apellido,
        codigo: nuevaPersona.idpersona,
        datos: datosAlta
      }

      await Swal.fire('Agregado', 'La persona ha sido agregada', 'success')
      await directus.value.request(
        createItem('logs', {
          fecha: getLocalISO(),
          nivel: 'INFO',
          mensaje: `La persona ${form.value.nombre} ${form.value.apellido} ha sido creada`,
        }),
      )
    }

    // <-- Llamamos a la función para descargar el PDF antes de redirigir
    await generarPDF()

    router.push('/personas')
  } catch (error) {
    console.error('Error al guardar:', error)
    Swal.fire('Error', 'Ocurrió un error al guardar la persona', 'error')
    await directus.value.request(
      createItem('logs', {
        fecha: getLocalISO(),
        nivel: 'ERROR',
        mensaje: `Ocurrió un error al guardar la persona`,
      }),
    )
  } finally {
    guardando.value = false
  }
}

const cancelar = () => {
  router.push('/personas')
}
</script>

<style scoped>
.container-formulario {
  min-height: 100vh;
  /* background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%); ✅ Fondo correcto   */
  background: rgba(245, 241, 241);
  /* padding: 2rem; */
}

.header-form {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #1f9e26, #169770);
  padding: 1rem;
}

.header-form h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 0;
}

.formulario-persona {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
}

.seccion {
  margin-bottom: 2.5rem;
}
.lista-beneficios {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}
.checkbox-beneficio {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 6px 10px;
  gap: 6px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}
.checkbox-beneficio label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 7px;
}
.checkbox-beneficio input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.checkbox-beneficio input[type='checkbox']:checked {
  accent-color: #28a745;
}
.checkbox-beneficio:hover {
  background-color: #eff1f3;
  border-color: #e3e7eb;
  transform: translateY(-1px);
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

.campos-grupo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.campo {
  display: flex;
  flex-direction: column;
}

.campo-completo {
  grid-column: 1 / -1;
}

.campo label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.campo input,
.campo select,
.campo textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #fff;
}

.campo input:focus,
.campo select:focus,
.campo textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.campo textarea {
  resize: vertical;
  min-height: 100px;
}

.botones-accion {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.btn-guardar,
.btn-cancelar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  justify-content: center;
}

.btn-guardar {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.btn-guardar:hover {
  background: linear-gradient(135deg, #218838, #1ca085);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
}

.btn-cancelar {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.btn-cancelar:hover {
  background: linear-gradient(135deg, #c82333, #a71e2a);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .formulario-persona {
    padding: 1.5rem;
    max-width: 80%;
  }

  .header-form h1 {
    font-size: 2rem;
  }
  .header-form p {
    font-size: 1rem;
  }

  .campos-grupo {
    grid-template-columns: 1fr;
  }

  .botones-accion {
    flex-direction: column;
  }
}

/* Animaciones */
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

.formulario-persona {
  animation: fadeIn 0.5s ease-out;
}


/* Grupo Familiar */
.campo-grupo-familiar {
  position: relative;
}

.badge-opcional {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 1px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6c757d;
  background-color: #e9ecef;
  border-radius: 12px;
  vertical-align: middle;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.select-grupo-familiar option[value=''] {
  color: #6c757d;
  font-style: italic;
}

.campo-ayuda {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: #6c757d;
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  line-height: 1.4;
}

.icono-info {
  font-size: 0.85rem;
  flex-shrink: 0;
  margin-top: 1px;
}

</style>