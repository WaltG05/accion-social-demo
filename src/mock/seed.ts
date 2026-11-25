// Generador de datos FICTICIOS para la demo.
// Nada de lo que se genera aquí corresponde a personas, domicilios ni casos reales:
// los nombres salen de listas inventadas, los contactos usan dominios reservados para
// pruebas (.test) y los teléfonos tienen un formato que no existe.

type Fila = Record<string, any>

// Generador pseudoaleatorio con semilla: la demo siempre arranca con los mismos datos.
function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NOMBRES = [
  'Lucía', 'Mateo', 'Valentina', 'Santiago', 'Camila', 'Joaquín', 'Martina', 'Tomás', 'Sofía', 'Benjamín',
  'Julieta', 'Lautaro', 'Agustina', 'Emiliano', 'Florencia', 'Facundo', 'Milagros', 'Bruno', 'Renata', 'Ignacio',
  'Abril', 'Thiago', 'Delfina', 'Gael', 'Antonella', 'Franco', 'Candela', 'Nahuel', 'Pilar', 'Dante',
]
const APELLIDOS = [
  'Almada', 'Benítez', 'Cabral', 'Domínguez', 'Escobar', 'Ferreyra', 'Godoy', 'Herrera', 'Ibarra', 'Juárez',
  'Luna', 'Medina', 'Navarro', 'Ojeda', 'Paz', 'Quiroga', 'Ramos', 'Sosa', 'Toledo', 'Urquiza',
  'Vera', 'Zárate', 'Acosta', 'Bustos', 'Correa', 'Duarte', 'Franco', 'Giménez', 'Ledesma', 'Maidana',
]

const CATEGORIAS = [
  'Asistencia alimentaria',
  'Vivienda y refacciones',
  'Salud y medicamentos',
  'Adultos mayores',
  'Niñez y adolescencia',
  'Servicios básicos (agua y luz)',
  'Discapacidad y accesibilidad',
  'Empleo y capacitación',
]

const DESCRIPCIONES: Record<string, string[]> = {
  'Asistencia alimentaria': [
    'La familia solicita una caja de alimentos por pérdida de ingresos en el hogar.',
    'Se pide apoyo alimentario para un comedor barrial que atiende a unas 30 personas.',
  ],
  'Vivienda y refacciones': [
    'Filtraciones en el techo de la vivienda; se solicita visita para evaluar materiales.',
    'Pedido de chapas y madera para reparar una pared dañada por la lluvia.',
  ],
  'Salud y medicamentos': [
    'Se solicita ayuda para conseguir medicación de uso crónico.',
    'Pedido de acompañamiento para un traslado a un turno médico en otra ciudad.',
  ],
  'Adultos mayores': [
    'Persona mayor que vive sola solicita visitas periódicas y asistencia con trámites.',
    'Se pide una evaluación para sumar a un adulto mayor a un programa de acompañamiento.',
  ],
  'Niñez y adolescencia': [
    'Solicitud de útiles escolares para tres niños en edad escolar.',
    'Consulta por apoyo escolar y actividades recreativas para adolescentes del barrio.',
  ],
  'Servicios básicos (agua y luz)': [
    'Se informa un corte de agua prolongado en una manzana del barrio.',
    'Conexión eléctrica precaria que genera riesgo; se pide inspección.',
  ],
  'Discapacidad y accesibilidad': [
    'Pedido de una rampa de acceso para una vivienda con una persona usuaria de silla de ruedas.',
    'Consulta por trámite de certificado y recursos de apoyo.',
  ],
  'Empleo y capacitación': [
    'La persona busca capacitación en oficios y orientación para conseguir empleo.',
    'Consulta por programas de microemprendimientos.',
  ],
}

const ESTADOS = ['recibida', 'en_evaluacion', 'asignada', 'en_intervencion', 'resuelta']
const PRIORIDADES = ['baja', 'normal', 'alta', 'urgente']

// Centro del mapa de la demo (cualquier punto sirve: los casos son inventados).
const CENTRO = { lat: -31.7455, lng: -60.5105 }

export function generarDatos(): Record<string, Fila[]> {
  const azar = mulberry32(20261125)
  const entre = (a: number, b: number) => a + Math.floor(azar() * (b - a + 1))
  const elegir = <T,>(lista: T[]): T => lista[Math.floor(azar() * lista.length)]
  const pesado = <T,>(lista: T[], pesos: number[]): T => {
    let r = azar() * pesos.reduce((a, b) => a + b, 0)
    for (let i = 0; i < lista.length; i++) {
      r -= pesos[i]
      if (r <= 0) return lista[i]
    }
    return lista[lista.length - 1]
  }
  const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

  const categorias = CATEGORIAS.map((nombre, i) => ({ id: i + 1, nombre }))

  const personas: Fila[] = []
  for (let i = 1; i <= 60; i++) {
    const nombre = elegir(NOMBRES)
    const apellido = elegir(APELLIDOS)
    personas.push({
      idpersona: i,
      nombre,
      apellido,
      dni: `${entre(90, 99)}.${String(entre(0, 999)).padStart(3, '0')}.${String(entre(0, 999)).padStart(3, '0')}`,
      email: `${sinTildes(nombre)}.${sinTildes(apellido)}${i}@ejemplo.test`,
      telefono: `000-555-${String(entre(0, 9999)).padStart(4, '0')}`,
    })
  }

  // Incidencias repartidas en los últimos ~7 meses (más recientes, más abiertas).
  const ahora = Date.now()
  const DIA = 24 * 60 * 60 * 1000
  const fechas = Array.from({ length: 190 }, () => ahora - Math.floor(azar() * azar() * 210) * DIA - entre(0, 20) * 3600 * 1000)
    .sort((a, b) => a - b)

  const incidencias: Fila[] = fechas.map((t, i) => {
    const cat = elegir(categorias)
    const antiguedad = (ahora - t) / DIA
    const estado = antiguedad > 45
      ? pesado(ESTADOS, [1, 1, 1, 1, 12])
      : pesado(ESTADOS, [5, 4, 3, 3, 4])
    return {
      idincidencia: i + 1,
      numero_denuncia: i + 1,
      idpersona: elegir(personas).idpersona,
      idcategoria: cat.id,
      contacto: `000-555-${String(entre(0, 9999)).padStart(4, '0')}`,
      prioridad: pesado(PRIORIDADES, [3, 8, 4, 2]),
      estado,
      descripcion: elegir(DESCRIPCIONES[cat.nombre]),
      fechaIncidencia: new Date(t).toISOString(),
      localizacion: {
        type: 'Point',
        coordinates: [CENTRO.lng + (azar() - 0.5) * 0.04, CENTRO.lat + (azar() - 0.5) * 0.03],
      },
      documentos: [],
    }
  })

  return {
    categorias,
    personas,
    incidencias,
    logs: [],
    __configuracion: [
      {
        nombre_organizacion: 'Municipio de Ejemplo',
        tiempo_limite_intervencion: 48,
        email_notificaciones_urgentes: 'avisos@ejemplo.test',
        logo: null,
      },
    ],
  }
}
