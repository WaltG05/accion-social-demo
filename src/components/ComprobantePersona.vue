<template>
    <div class="container-ticket">
        <div id="ticket-content">
            <div class="header-ticket">
                <h2>Accion Social</h2>
            </div>
            <div class="body-header-ticket">
                <h3>Reporte de {{ reporte.tipoOperacion }}</h3>
                <div class="info-reporte">
                    <p>Fecha: {{ reporte.fecha }}</p>
                    <p>Usuario: {{ reporte.usuario }}</p>
                </div>
                <p>Persona: {{ reporte.persona }}</p>
            </div>
            <div class="body-ticket">
                <p v-if="reporte.tipoOperacion === 'Alta'">Datos registrados:</p>
                <p v-else>Datos modificados:</p>
                <ul>
                    <li v-for="(valor, clave) in reporte.datos" :key="clave">
                        {{ clave }}: {{ valor }}
                    </li>
                </ul>

                <p>Código {{ reporte.codigo }}</p>
            </div>
            <p class="footer-ticket">Reporte generado automáticamente</p>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  reporte: {
    type: Object,
    required: true,
    default: () => ({
      tipoOperacion: 'Alta',
      fecha: new Date().toLocaleString(),
      usuario: 'Admin',
      persona: 'Juan Perez',
      codigo: 'REP-000000',
      datos: {
        'Nombre': 'Juan',
        'Apellido': 'Perez',
        'DNI': '12345678'
      }
    })
  }
});
</script>

<style scoped>
.container-ticket {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.header-ticket {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2.5rem;
    margin-top: 1rem;
    text-transform: uppercase;
    border-bottom: 1px solid #bdbcbc;
}

.header-logo {
    width: 10rem;
    height: auto;
    margin-bottom: 12px;
}
.body-header-ticket h3 {
    text-transform: uppercase;
}

.body-header-ticket {
    margin-top: 10px;
    margin-bottom: 20px;
}
.info-reporte {
    margin-top: 10px;
    margin-bottom: 10px;
}
.body-ticket p:nth-child(1) {
    margin-bottom: 10px;
    font-weight: bold;
}
.body-ticket p:nth-child(3) {
    margin-top: 15px;
}
.body-ticket {
    border-bottom: 1px solid #bdbcbc;
    padding-bottom: 15px;
}
.footer-ticket {
    font-size: 12px;
    margin-top: 5px;
    color: #555454f5;
}
</style>