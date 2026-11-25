// Base de datos de la demo: vive en memoria y se guarda en el navegador (localStorage).
// No hay servidor ni datos reales: todo se genera en seed.ts.
import { generarDatos } from './seed'

type Fila = Record<string, any>
export type Datos = Record<string, Fila[]>

const CLAVE = 'accion-social-demo-v5'

// Clave primaria de cada colección (como en el sistema original).
export const PK: Record<string, string> = {
  personas: 'idpersona',
  incidencias: 'idincidencia',
  categorias: 'id',
  logs: 'id',
  grupofamiliar: 'idfamilia',
  vivienda: 'idvivienda',
  beneficios: 'id',
  beneficios_personas: 'id',
  servicios: 'id',
  servicio_vivienda: 'id',
  condiciones_habitacionales: 'id',
}

// Relaciones: campo -> [colección destino, clave primaria destino].
export const RELACIONES: Record<string, Record<string, [string, string]>> = {
  incidencias: {
    idpersona: ['personas', 'idpersona'],
    idcategoria: ['categorias', 'id'],
  },
  servicio_vivienda: {
    servicio: ['servicios', 'id'],
    vivienda: ['vivienda', 'idvivienda'],
  },
  condiciones_habitacionales: {
    idvivienda: ['vivienda', 'idvivienda'],
  },
}

// Relaciones uno-a-muchos: campo -> [colección hija, campo de la hija que apunta al padre].
export const UNO_A_MUCHOS: Record<string, Record<string, [string, string]>> = {
  vivienda: {
    servicios: ['servicio_vivienda', 'vivienda'],
  },
}

let datos: Datos | null = null

function cargar(): Datos {
  if (datos) return datos
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado) {
      datos = JSON.parse(guardado)
      return datos as Datos
    }
  } catch {
    /* sin almacenamiento: se trabaja solo en memoria */
  }
  datos = generarDatos()
  guardar()
  return datos
}

export function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos))
  } catch {
    /* ignorar: modo privado o almacenamiento lleno */
  }
}

export function restablecerDemo() {
  datos = generarDatos()
  guardar()
}

export function coleccion(nombre: string): Fila[] {
  const db = cargar()
  if (!db[nombre]) db[nombre] = []
  return db[nombre]
}

export function singleton(nombre: string): Fila {
  const db = cargar()
  return (db[`__${nombre}`] && db[`__${nombre}`][0]) || {}
}

export function siguienteId(nombre: string): number {
  const pk = PK[nombre] || 'id'
  return coleccion(nombre).reduce((max, f) => Math.max(max, Number(f[pk]) || 0), 0) + 1
}
