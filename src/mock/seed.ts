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
  const TIPOS = ['Casa', 'Casa', 'Casa', 'Departamento', 'Otro']
  const TECHOS = ['Baldosa, membrana, pizarra o teja', 'Losa o carpeta a la vista', 'Chapa de metal', 'Chapa de metal', 'Chapa de cartón, caña o paja', 'Otro material']
  const PISOS = ['Cerámica, mosaico, madera', 'Carpeta o contrapiso', 'Carpeta o contrapiso', 'Tierra o ladrillo suelto', 'Otro material']
  const TENENCIAS = ['Propia', 'Alquilada', 'Cedida por trabajo', 'Prestada', 'Otra situación']
  const CALLES_ESTADO = ['Pavimentada', 'Ripio', 'Tierra', 'Tierra']
  // 15 viviendas para las primeras 15 familias; las últimas 3 familias quedan sin vivienda cargada.
  const viviendas: Fila[] = familias.slice(0, 15).map((f, i) => ({
    idvivienda: i + 1,
    direccion: `Calle ${elegir(CALLES)} ${entre(100, 2400)}, Barrio ${elegir(['Norte', 'Sur', 'Este', 'Oeste', 'Centro', 'Los Pinos'])}`,
    tipoVivienda: elegir(TIPOS),
    noPoseeVivienda: false,
    ambientes: entre(1, 5),
    habitantes: entre(1, 7),
    material_techo: elegir(TECHOS),
    material_piso: elegir(PISOS),
    tenencia: elegir(TENENCIAS),
    calle_estado: elegir(CALLES_ESTADO),
    localizacion: {
      type: 'Point',
      coordinates: [-60.5105 + (azar() - 0.5) * 0.04, -31.7455 + (azar() - 0.5) * 0.03],
    },
    idfamilia: f.idfamilia,
  }))

  const SERVICIOS = [
    ['Agua corriente', 'Red de agua potable'],
    ['Electricidad', 'Conexión domiciliaria a la red'],
    ['Gas natural', 'Red de gas'],
    ['Cloacas', 'Conexión a red cloacal'],
    ['Recolección de residuos', 'Servicio municipal'],
    ['Internet', 'Conexión fija'],
  ]
  const servicios: Fila[] = SERVICIOS.map(([nombreServicio, observaciones], i) => ({ id: i + 1, nombreServicio, observaciones }))
  const servicio_vivienda: Fila[] = []
  viviendas.forEach((v) => {
    servicios.forEach((sv) => {
      // Los servicios básicos son más probables que internet o gas.
      const prob = [0.9, 0.95, 0.5, 0.4, 0.85, 0.35][sv.id - 1]
      if (azar() < prob) servicio_vivienda.push({ id: servicio_vivienda.length + 1, vivienda: v.idvivienda, servicio: sv.id })
    })
  })

  const EVALUADORES = ['Rosario Pérez', 'Mauro Lencina', 'Silvana Ortiz', 'Hernán Ibáñez']
  const NECESIDADES = [
    'Reparación del techo.', 'Conexión segura a la red eléctrica.', 'Mejora del piso de la cocina.',
    'Instalación de un tanque de agua.', 'Ampliación de un ambiente.', 'Sin necesidades urgentes.',
  ]
  const condiciones_habitacionales: Fila[] = []
  viviendas.forEach((v) => {
    const cant = entre(1, 2)
    for (let k = 0; k < cant; k++) {
      const estado = pesado(['bueno', 'regular', 'critico'], [5, 4, 2])
      const dias = entre(5, 240)
      condiciones_habitacionales.push({
        id: condiciones_habitacionales.length + 1,
        idvivienda: v.idvivienda,
        estado,
        fecha_revision: new Date(Date.now() - dias * 24 * 3600 * 1000).toISOString().split('T')[0],
        evaluador: elegir(EVALUADORES),
        observaciones: estado === 'bueno' ? 'Vivienda en buen estado general.' : estado === 'regular' ? 'Presenta deterioros menores.' : 'Requiere intervención prioritaria.',
        agua_potable: azar() < 0.85 ? 'si' : 'no',
        electricidad: azar() < 0.95 ? 'si' : 'no',
        gas: azar() < 0.5 ? 'si' : 'no',
        cloacas: azar() < 0.45 ? 'si' : 'no',
        necesidades: estado === 'bueno' ? NECESIDADES[5] : elegir(NECESIDADES.slice(0, 5)),
      })
    }
  })

  // Programas y beneficios genéricos (ninguno corresponde a un programa real).
  const BENEFICIOS: [string, string, string, string, string][] = [
    ['Bolsón alimentario', 'Entrega mensual de alimentos no perecederos.', 'ayuda_emergencia', 'municipal', 'activo'],
    ['Subsidio de alquiler', 'Aporte económico para el pago de un alquiler.', 'vivienda_infraestructura', 'provincial', 'activo'],
    ['Medicamentos', 'Cobertura de medicación de uso crónico.', 'ayuda_emergencia', 'provincial', 'activo'],
    ['Kit escolar', 'Útiles y guardapolvo al inicio del ciclo lectivo.', 'becas_estudios', 'municipal', 'activo'],
    ['Materiales de construcción', 'Chapas, aberturas y materiales para refacciones.', 'vivienda_infraestructura', 'municipal', 'pausado'],
    ['Pensión municipal', 'Ayuda económica mensual para personas en situación vulnerable.', 'pensiones_jubilaciones', 'municipal', 'activo'],
    ['Capacitación laboral', 'Cursos de oficios con certificación.', 'empleo_capacitacion', 'provincial', 'activo'],
    ['Transporte social', 'Pasajes sin costo para trámites y atención médica.', 'otros', 'municipal', 'activo'],
    ['Asignación por hijo (ejemplo)', 'Prestación mensual por cada hijo a cargo.', 'asignaciones_familiares', 'nacional', 'activo'],
    ['Beca de estudios (ejemplo)', 'Apoyo económico para estudiantes de nivel medio y superior.', 'becas_estudios', 'nacional', 'activo'],
    ['Jubilación mínima (ejemplo)', 'Haber mínimo para personas jubiladas.', 'pensiones_jubilaciones', 'nacional', 'activo'],
  ]
  const beneficios: Fila[] = BENEFICIOS.map(([nombrebeneficio, descripcionCorta, categoria, tipo, estado], i) => ({
    id: i + 1, nombrebeneficio, descripcionCorta, categoria, tipo, estado,
  }))

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
      idvivienda: sinVivienda ? null : (viviendas.find((v) => v.idfamilia === fam!.idfamilia)?.idvivienda ?? null),
      noPoseeVivienda: sinVivienda || !viviendas.some((v) => v.idfamilia === fam!.idfamilia),
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
      ...(estado === 'resuelta'
        ? {
            fecha_resolucion: new Date(Math.min(ahora, t + entre(1, 40) * DIA)).toISOString(),
            calificacion_satisfaccion: pesado([3, 4, 5], [2, 4, 4]),
          }
        : {}),
    }
  })

  // Usuarios y roles del panel de administración (ficticios).
  const directus_roles: Fila[] = [
    { id: 'rol-admin', name: 'Administrator' },
    { id: 'rol-general', name: 'usuario_general' },
    { id: 'rol-lectura', name: 'visualizador' },
  ]
  const USUARIOS: [string, string, string, string][] = [
    ['Admin', 'Demo', 'rol-admin', 'active'],
    ['Rosario', 'Pérez', 'rol-general', 'active'],
    ['Mauro', 'Lencina', 'rol-general', 'active'],
    ['Silvana', 'Ortiz', 'rol-general', 'active'],
    ['Hernán', 'Ibáñez', 'rol-lectura', 'active'],
    ['Paula', 'Roldán', 'rol-lectura', 'suspended'],
  ]
  const directus_users: Fila[] = USUARIOS.map(([first_name, last_name, role, status], i) => ({
    id: `usuario-${i + 1}`,
    first_name,
    last_name,
    email: `${sinTildes(first_name)}.${sinTildes(last_name)}@ejemplo.test`,
    role,
    status,
    last_access: new Date(Date.now() - entre(0, 20) * 24 * 3600 * 1000 - entre(0, 12) * 3600 * 1000).toISOString(),
  }))

  // Registro de actividad ficticio (últimos días).
  const MENSAJES: [string, string][] = [
    ['INFO', 'Se ha iniciado sesión en el sistema.'],
    ['INFO', 'Una persona ha sido creada.'],
    ['INFO', 'Una persona ha sido actualizada.'],
    ['INFO', 'Se registró una nueva incidencia.'],
    ['INFO', 'Un programa ha sido ACTIVADO.'],
    ['INFO', 'Se actualizó una evaluación de condiciones habitacionales.'],
    ['WARNING', 'Se superó el tiempo límite de intervención en una incidencia urgente.'],
    ['ERROR', 'Ocurrió un error al guardar un registro (ejemplo).'],
  ]
  const logs: Fila[] = Array.from({ length: 30 }, (_, i) => {
    const [nivel, mensaje] = pesado(MENSAJES, [4, 3, 3, 4, 2, 2, 1, 1])
    return { id: i + 1, nivel, mensaje, fecha: new Date(Date.now() - i * 5 * 3600 * 1000 - entre(0, 3000) * 1000).toISOString().slice(0, 19) }
  })

  return {
    directus_roles,
    directus_users,
    categorias,
    personas,
    incidencias,
    grupofamiliar: familias,
    vivienda: viviendas,
    servicios,
    servicio_vivienda,
    condiciones_habitacionales,
    beneficios,
    beneficios_personas,
    logs,
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
