<template>
  <div>
    <h2>友情链接管理</h2>
    <form @submit.prevent="addFriend" class="form">
      <input v-model="newFriend.name" placeholder="网站名称" required />
      <input v-model="newFriend.url" placeholder="网址" required />
      <input v-model="newFriend.logo" placeholder="Logo URL" />
      <button type="submit">添加</button>
    </form>

    <table>
      <thead>
        <tr><th>ID</th><th>Logo</th><th>名称</th><th>链接</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="f in friends" :key="f.id">
          <td>{{ f.id }}</td>
          <td><img v-if="f.logo" :src="f.logo" width="50" /></td>
          <td>{{ f.name }}</td>
          <td><a :href="f.url" target="_blank">{{ f.url }}</a></td>
          <td><button @click="del(f.id)">删除</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api.js'

const friends = ref([])
const newFriend = ref({ name: '', url: '', logo: '' })

async function loadFriends() {
  const res = await api.get('/friend')
  friends.value = res.data
}
onMounted(loadFriends)

async function addFriend() {
  await api.post('/friend', newFriend.value)
  newFriend.value = { name: '', url: '', logo: '' }
  loadFriends()
}

async function del(id) {
  await api.delete(`/friend/${id}`)
  loadFriends()
}
</script>

<style scoped>
@import './table-style.css';
img {
  border-radius: 50%;
}
</style>
