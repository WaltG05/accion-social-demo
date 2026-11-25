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

  // Grupos familiares (se nombran con un apellido de la lista).
  const familias: Fila[] = []
  const apellidosUsados = new Set<string>()
  while (familias.length < 18) {
    const ap = elegir(APELLIDOS)
    if (apellidosUsados.has(ap)) continue
    apellidosUsados.add(ap)
    familias.push({ idfamilia: familias.length + 1, nombre: `Familia ${ap}` })
  }

  // Viviendas ficticias: calles inventadas, una por familia (y algunas sueltas).
  const CALLES = ['Los Ceibos', 'Del Sol', 'Las Acacias', 'Primavera', 'Los Naranjos', 'Del Río', 'San Telmo', 'La Esperanza', 'Los Álamos', 'El Mirador']
  const viviendas: Fila[] = familias.map((f, i) => ({
    idvivienda: i + 1,
    direccion: `Calle ${elegir(CALLES)} ${entre(100, 2400)}, Barrio ${elegir(['Norte', 'Sur', 'Este', 'Oeste', 'Centro', 'Los Pinos'])}`,
    idfamilia: f.idfamilia,
  }))

  const BENEFICIOS = [
    'Bolsón alimentario', 'Subsidio de alquiler', 'Medicamentos', 'Kit escolar',
    'Materiales de construcción', 'Pensión municipal', 'Capacitación laboral', 'Transporte social',
  ]
  const beneficios: Fila[] = BENEFICIOS.map((nombrebeneficio, i) => ({ id: i + 1, nombrebeneficio }))

  const OCUPACIONES = ['Albañil', 'Docente', 'Empleada doméstica', 'Changarín', 'Comerciante', 'Jubilada', 'Estudiante', 'Desempleado', 'Cuidadora', 'Costurera']
  const OBRAS = ['PAMI', 'OSEP', 'Sin obra social', 'Obra social ficticia A', 'Obra social ficticia B']
  const ESTADOS_CIVILES = ['Soltero/a', 'Casado/a', 'Unión convivencial', 'Viudo/a', 'Separado/a']

  const personas: Fila[] = []
  for (let i = 1; i <= 60; i++) {
    const nombre = elegir(NOMBRES)
    const anioNac = entre(1948, 2018)
    const edad = 2026 - anioNac
    const fam = i <= 54 ? familias[(i - 1) % familias.length] : null
    // Quienes integran una familia comparten su apellido.
    const apellido = fam ? fam.nombre.replace('Familia ', '') : elegir(APELLIDOS)
    const sinVivienda = !fam || azar() < 0.08
    personas.push({
      idpersona: i,
      nombre,
      apellido,
      DNI: `${entre(90, 99)}.${String(entre(0, 999)).padStart(3, '0')}.${String(entre(0, 999)).padStart(3, '0')}`,
      fechaNacimiento: `${anioNac}-${String(entre(1, 12)).padStart(2, '0')}-${String(entre(1, 28)).padStart(2, '0')}T00:00:00`,
      genero: pesado(['Femenino', 'Masculino', 'Otro'], [48, 48, 4]),
      estadoCivil: edad < 18 ? 'Soltero/a' : elegir(ESTADOS_CIVILES),
      nacionalidad: 'Argentina',
      provincia: 'Provincia de Ejemplo',
      localidad: 'Municipio de Ejemplo',
      direccion: `Calle ${elegir(CALLES)} ${entre(100, 2400)}`,
      telefono: `000-555-${String(entre(0, 9999)).padStart(4, '0')}`,
      email: `${sinTildes(nombre)}.${sinTildes(apellido)}${i}@ejemplo.test`,
      ocupacion: edad < 18 ? 'Estudiante' : edad >= 65 ? 'Jubilado/a' : elegir(OCUPACIONES),
      ingresos: edad < 18 ? 'Sin ingresos' : elegir(['Sin ingresos', 'Menos de un salario mínimo', 'Un salario mínimo', 'Más de un salario mínimo']),
      obrasocial: elegir(OBRAS),
      idfamilia: fam ? fam.idfamilia : null,
      idvivienda: sinVivienda ? null : viviendas.find((v) => v.idfamilia === fam!.idfamilia)!.idvivienda,
      noPoseeVivienda: sinVivienda,
      noPoseeDomicilio: false,
    })
  }

  // Beneficios asignados a cada persona (0 a 3).
  const beneficios_personas: Fila[] = []
  personas.forEach((p) => {
    const cantidad = pesado([0, 1, 2, 3], [3, 5, 3, 1])
    const elegidos = new Set<number>()
    while (elegidos.size < cantidad) elegidos.add(elegir(beneficios).id)
    elegidos.forEach((idbeneficio) =>
      beneficios_personas.push({ id: beneficios_personas.length + 1, idpersona: p.idpersona, idbeneficio }),
    )
  })

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
    grupofamiliar: familias,
    vivienda: viviendas,
    beneficios,
    beneficios_personas,
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
