<template>
  <div>
    <MenuBar :menus="menus" @select="loadCards" />
    <CardGrid :cards="cards" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api.js'
import MenuBar from '../components/MenuBar.vue'
import CardGrid from '../components/CardGrid.vue'

const menus = ref([])
const cards = ref([])

onMounted(async () => {
  const res = await api.get('/menus')
  menus.value = res.data
  if (menus.value.length) loadCards(menus.value[0].id)
})

async function loadCards(menuId) {
  const res = await api.get('/cards', { params: { menu_id: menuId } })
  cards.value = res.data
}
</script>
