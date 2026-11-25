import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Con Vite, Leaflet no resuelve solo los íconos de los marcadores: se indican una vez para toda la app.
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

createApp(App).use(router).mount('#app')
