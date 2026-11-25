// Cliente simulado: en la demo no existe un servidor Directus.
import { ref } from 'vue'
import { createDirectus, rest } from '@directus/sdk'

export const directus = ref(createDirectus().with(rest()))
export const notificationInterval = { value: null }
export const refreshInterval = { value: null }
export const setRouter = () => {}
export const createClientWithToken = () => directus.value
export const createClientForAuth = () => directus.value
export const initializeDirectusClient = () => {}
