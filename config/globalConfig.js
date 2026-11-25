import { ref } from 'vue'
import { createDirectus, readSingleton, rest } from '@directus/sdk'

export const globalConfig = ref(null)
export const logoUrl = ref(null) // la demo no usa logo de organización

export async function fetchGlobalConfig() {
  if (globalConfig.value) return
  const cliente = createDirectus().with(rest())
  globalConfig.value = await cliente.request(
    readSingleton('configuracion', { fields: ['nombre_organizacion'] }),
  )
}
