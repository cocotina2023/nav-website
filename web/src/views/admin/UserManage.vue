<template>
  <div>
    <h2>用户管理</h2>

    <form @submit.prevent="addUser" class="form">
      <input v-model="newUser.username" placeholder="用户名" required />
      <input v-model="newUser.password" type="password" placeholder="密码" required />
      <button type="submit">添加</button>
    </form>

    <table>
      <thead>
        <tr><th>ID</th><th>用户名</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.username }}</td>
          <td>
            <button @click="resetPwd(u.id)">重置密码</button>
            <button @click="del(u.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api.js'

const users = ref([])
const newUser = ref({ username: '', password: '' })

async function loadUsers() {
  const res = await api.get('/users')
  users.value = res.data
}
onMounted(loadUsers)

async function addUser() {
  await api.post('/auth/register', newUser.value)
  newUser.value = { username: '', password: '' }
  loadUsers()
}

async function del(id) {
  await api.delete(`/users/${id}`)
  loadUsers()
}

async function resetPwd(id) {
  const pwd = prompt('请输入新密码：')
  if (!pwd) return
  await api.put(`/users/${id}/password`, { password: pwd })
  alert('密码已更新')
}
</script>

<style scoped>
@import './table-style.css';
</style>
