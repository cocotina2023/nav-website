<template>
  <div>
    <h2>菜单管理</h2>
    <form @submit.prevent="addMenu">
      <input v-model="newMenu.name" placeholder="菜单名" required />
      <input v-model="newMenu.icon" placeholder="图标URL" />
      <input v-model.number="newMenu.order_index" placeholder="排序" type="number" />
      <button type="submit">添加</button>
    </form>

    <table>
      <thead><tr><th>ID</th><th>名称</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="m in menus" :key="m.id">
          <td>{{ m.id }}</td>
          <td>{{ m.name }}</td>
          <td><button @click="del(m.id)">删除</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api.js'

const menus = ref([])
const newMenu = ref({ name: '', icon: '', order_index: 0 })

async function loadMenus() {
  const res = await api.get('/menus')
  menus.value = res.data
}
onMounted(loadMenus)

async function addMenu() {
  await api.post('/menus', newMenu.value)
  newMenu.value = { name: '', icon: '', order_index: 0 }
  loadMenus()
}
async function del(id) {
  await api.delete(`/menus/${id}`)
  loadMenus()
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
td, th {
  border: 1px solid #ccc;
  padding: 8px;
}
</style>
