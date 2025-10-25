<template>
  <div>
    <h2>广告管理</h2>
    <form @submit.prevent="addAd" class="form">
      <input v-model="newAd.image" placeholder="图片URL" required />
      <input v-model="newAd.link" placeholder="跳转链接" required />
      <button type="submit">添加</button>
    </form>

    <table>
      <thead>
        <tr><th>ID</th><th>图片</th><th>链接</th><th>操作</th></tr>
      </thead>
      <tbody>
        <tr v-for="a in ads" :key="a.id">
          <td>{{ a.id }}</td>
          <td><img :src="a.image" alt="" width="80" /></td>
          <td><a :href="a.link" target="_blank">{{ a.link }}</a></td>
          <td><button @click="del(a.id)">删除</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api.js'

const ads = ref([])
const newAd = ref({ image: '', link: '' })

async function loadAds() {
  const res = await api.get('/ads')
  ads.value = res.data
}
onMounted(loadAds)

async function addAd() {
  await api.post('/ads', newAd.value)
  newAd.value = { image: '', link: '' }
  loadAds()
}

async function del(id) {
  await api.delete(`/ads/${id}`)
  loadAds()
}
</script>

<style scoped>
@import './table-style.css';
img {
  border-radius: 4px;
}
</style>

