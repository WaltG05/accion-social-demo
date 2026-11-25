// Reemplazo de '@directus/sdk' para la demo. Expone las mismas funciones que usa
// la aplicación (readItems, createItem, ...) pero trabaja sobre los datos ficticios locales.
import { PK, RELACIONES, UNO_A_MUCHOS, coleccion, guardar, siguienteId, singleton } from './store'

type Fila = Record<string, any>
type Consulta = {
  fields?: string[]
  filter?: Record<string, any>
  sort?: string | string[]
  limit?: number
  search?: string
}
type Orden = { op: string; [k: string]: any }

// ---------- Constructores de operaciones ----------
export const readItems = (col: string, q: Consulta = {}): Orden => ({ op: 'readItems', col, q })
export const readItem = (col: string, id: any, q: Consulta = {}): Orden => ({ op: 'readItem', col, id, q })
export const createItem = (col: string, data: Fila, q: Consulta = {}): Orden => ({ op: 'createItem', col, data, q })
export const updateItem = (col: string, id: any, data: Fila, q: Consulta = {}): Orden => ({ op: 'updateItem', col, id, data, q })
export const createItems = (col: string, data: Fila[], q: Consulta = {}): Orden => ({ op: 'createItems', col, data, q })
export const deleteItems = (col: string, ids: any[]): Orden => ({ op: 'deleteItems', col, ids })
export const deleteItem = (col: string, id: any): Orden => ({ op: 'deleteItem', col, id })
export const readSingleton = (col: string, q: Consulta = {}): Orden => ({ op: 'readSingleton', col, q })
export const readMe = (_q: Consulta = {}): Orden => ({ op: 'readMe' })
export const readUsers = (q: Consulta = {}): Orden => ({ op: 'readItems', col: 'directus_users', q })
// En la demo no se guardan contraseñas: se descartan antes de almacenar el usuario.
const sinClave = (d: Fila): Fila => { const { password, ...resto } = d; return resto }
export const createUser = (data: Fila): Orden => ({ op: 'createItem', col: 'directus_users', data: { ...sinClave(data), last_access: null }, q: {} })
export const updateUser = (id: any, data: Fila): Orden => ({ op: 'updateItem', col: 'directus_users', id, data: sinClave(data), q: {} })
export const deleteUser = (id: any): Orden => ({ op: 'deleteItem', col: 'directus_users', id })
export const readRoles = (q: Consulta = {}): Orden => ({ op: 'readItems', col: 'directus_roles', q })
export const updateSingleton = (col: string, data: Fila): Orden => ({ op: 'updateSingleton', col, data })
export const refresh = () => ({})
export const uploadFiles = (form: FormData): Orden => ({ op: 'uploadFiles', form })

// ---------- Filtros ----------
function valorEn(fila: Fila, campo: string, col: string): any {
  const rel = RELACIONES[col]?.[campo]
  if (rel) return fila[campo] // el valor crudo (clave foránea)
  return fila[campo]
}

function comparar(valor: any, cond: Fila): boolean {
  return Object.entries(cond).every(([op, ref]) => {
    switch (op) {
      case '_eq': return valor == ref
      case '_neq': return valor != ref
      case '_gt': return valor > ref
      case '_gte': return valor >= ref
      case '_lt': return valor < ref
      case '_lte': return valor <= ref
      case '_in': return Array.isArray(ref) && ref.some((r) => r == valor)
      case '_nin': return Array.isArray(ref) && !ref.some((r) => r == valor)
      case '_null': return (valor == null) === !!ref
      case '_nnull': return (valor != null) === !!ref
      case '_contains': return String(valor ?? '').includes(String(ref))
      case '_icontains': return String(valor ?? '').toLowerCase().includes(String(ref).toLowerCase())
      case '_between': return valor >= ref[0] && valor <= ref[1]
      default: return true
    }
  })
}

function cumple(fila: Fila, filtro: Fila | undefined, col: string): boolean {
  if (!filtro) return true
  return Object.entries(filtro).every(([clave, cond]) => {
    if (clave === '_and') return (cond as Fila[]).every((c) => cumple(fila, c, col))
    if (clave === '_or') return (cond as Fila[]).some((c) => cumple(fila, c, col))
    const rel = RELACIONES[col]?.[clave]
    const esOperador = cond && typeof cond === 'object' && Object.keys(cond).every((k) => k.startsWith('_'))
    if (rel && !esOperador) {
      const destino = coleccion(rel[0]).find((f) => f[rel[1]] == fila[clave])
      return destino ? cumple(destino, cond, rel[0]) : false
    }
    return esOperador ? comparar(valorEn(fila, clave, col), cond) : valorEn(fila, clave, col) == cond
  })
}

// ---------- Campos y relaciones ----------
function expandir(fila: Fila, col: string, fields?: string[]): Fila {
  if (!fields || fields.length === 0 || (fields.length === 1 && fields[0] === '*')) {
    return { ...fila }
  }
  const salida: Fila = {}
  const pedirTodo = fields.includes('*')
  if (pedirTodo) Object.assign(salida, fila)
  for (const f of fields) {
    if (f === '*') continue
    if (f.includes('.')) {
      const [campo, resto] = [f.split('.')[0], f.split('.').slice(1).join('.')]
      const rel = RELACIONES[col]?.[campo]
      const hijos = UNO_A_MUCHOS[col]?.[campo]
      if (rel) {
        const destino = coleccion(rel[0]).find((x) => x[rel[1]] == fila[campo])
        const parte = destino ? expandir(destino, rel[0], resto === '*' ? ['*'] : [resto]) : null
        // Varios subcampos de la misma relación (p. ej. 'rel.a' y 'rel.b') se fusionan.
        salida[campo] = parte && salida[campo] && typeof salida[campo] === 'object' ? { ...salida[campo], ...parte } : parte
      } else if (hijos) {
        const pk = PK[col] || 'id'
        salida[campo] = coleccion(hijos[0])
          .filter((h) => h[hijos[1]] == fila[pk])
          .map((h) => expandir(h, hijos[0], [resto]))
      }
    } else {
      salida[f] = fila[f]
    }
  }
  return salida
}

// ---------- Orden ----------
function ordenar(filas: Fila[], sort?: string | string[]): Fila[] {
  const criterios = (Array.isArray(sort) ? sort : sort ? [sort] : []).map((s) => ({
    campo: s.replace(/^-/, ''),
    dir: s.startsWith('-') ? -1 : 1,
  }))
  if (!criterios.length) return filas
  return [...filas].sort((a, b) => {
    for (const { campo, dir } of criterios) {
      const x = a[campo], y = b[campo]
      if (x == y) continue
      if (x == null) return 1
      if (y == null) return -1
      return (x < y ? -1 : 1) * dir
    }
    return 0
  })
}

// ---------- Ejecución ----------
function ejecutar(o: Orden): any {
  const q: Consulta = o.q || {}
  switch (o.op) {
    case 'readItems': {
      let filas = coleccion(o.col).filter((f) => cumple(f, q.filter, o.col))
      if (q.search) {
        const s = q.search.toLowerCase()
        filas = filas.filter((f) => Object.values(f).some((v) => String(v ?? '').toLowerCase().includes(s)))
      }
      filas = ordenar(filas, q.sort)
      if (q.limit && q.limit > 0) filas = filas.slice(0, q.limit)
      return filas.map((f) => expandir(f, o.col, q.fields))
    }
    case 'readItem': {
      const fila = coleccion(o.col).find((f) => f[PK[o.col] || 'id'] == o.id)
      if (!fila) throw new Error('No encontrado')
      return expandir(fila, o.col, q.fields)
    }
    case 'createItem':
    case 'createItems': {
      const pk = PK[o.col] || 'id'
      if (Array.isArray(o.data)) {
        const creadas = o.data.map((d: Fila) => {
          const n = { ...d, [pk]: d[pk] ?? siguienteId(o.col) }
          coleccion(o.col).push(n)
          return n
        })
        guardar()
        return creadas.map((n: Fila) => expandir(n, o.col, q.fields))
      }
      const nueva = { ...o.data, [pk]: o.data[pk] ?? siguienteId(o.col) }
      coleccion(o.col).push(nueva)
      guardar()
      return expandir(nueva, o.col, q.fields)
    }
    case 'updateItem': {
      const fila = coleccion(o.col).find((f) => f[PK[o.col] || 'id'] == o.id)
      if (!fila) throw new Error('No encontrado')
      Object.assign(fila, o.data)
      guardar()
      return expandir(fila, o.col, q.fields)
    }
    case 'deleteItems': {
      const lista = coleccion(o.col)
      const pk = PK[o.col] || 'id'
      for (const id of o.ids) {
        const i = lista.findIndex((f) => f[pk] == id)
        if (i >= 0) lista.splice(i, 1)
      }
      guardar()
      return null
    }
    case 'deleteItem': {
      const lista = coleccion(o.col)
      for (const id of Array.isArray(o.id) ? o.id : [o.id]) {
        const i = lista.findIndex((f) => f[PK[o.col] || 'id'] == id)
        if (i >= 0) lista.splice(i, 1)
      }
      guardar()
      return null
    }
    case 'updateSingleton': {
      const actual = singleton(o.col)
      Object.assign(actual, o.data)
      guardar()
      return actual
    }
    case 'readSingleton':
      return { ...singleton(o.col) }
    case 'readMe':
      return { id: 'demo', first_name: 'Admin', last_name: 'Demo', role: { name: 'Administrator' } }
    case 'uploadFiles': {
      // En la demo los archivos no se guardan: se devuelven identificadores ficticios.
      const archivos: File[] = []
      o.form.forEach((v: any) => { if (v instanceof File) archivos.push(v) })
      return archivos.map((a, i) => ({ id: `demo-archivo-${Date.now()}-${i}`, filename_download: a.name }))
    }
  }
  throw new Error(`Operación no soportada en la demo: ${o.op}`)
}

// ---------- Cliente ----------
function crearCliente(): any {
  const cliente: any = {
    with: () => cliente,
    // Pequeña demora, como en una red real: también evita que los avisos de "guardando..." se pisen.
    request: async (o: Orden) => {
      await new Promise((r) => setTimeout(r, 120))
      return ejecutar(o)
    },
    login: async () => ({ access_token: 'demo', refresh_token: 'demo' }),
    logout: async () => {},
    auth: { logout: async () => {} },
    setToken: () => {},
  }
  return cliente
}

export const createDirectus = (_url?: string) => crearCliente()
export const rest = () => ({})
export const staticToken = (_t?: string) => ({})
export const authentication = (_m?: string) => ({})
