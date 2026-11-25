<script setup>
import compNav from './components/navbar.vue'
</script>

<template>
  <div id="app">
    <div class="demo-banner" role="note">
      Demo con datos ficticios. Recreación del sistema real: no contiene información de personas ni del cliente.
    </div>
    <compNav />
    <main>
      <router-view />
    </main>
    <footer class="demo-footer">
      Proyecto de práctica en equipo · Recreación con fines de portfolio · Datos inventados
    </footer>
  </div>
</template>

<style>
html,
body,
#app {
  min-height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;
}
.demo-banner {
  background: #fff3cd;
  color: #664d03;
  text-align: center;
  font-size: 0.85rem;
  padding: 0.4rem 1rem;
}
.demo-footer {
  background: #2c3e50;
  color: #cfd8dc;
  text-align: center;
  font-size: 0.8rem;
  padding: 0.9rem 1rem;
}
</style>
