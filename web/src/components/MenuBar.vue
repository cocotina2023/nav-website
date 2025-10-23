<template>
  <nav class="menu-bar">
    <button v-for="m in menus" :key="m.id" @click="$emit('select', m.id)">
      <img :src="m.icon" v-if="m.icon" class="icon" /> {{ m.name }}
    </button>
  </nav>
</template>

<script setup>
defineProps({ menus: Array });
</script>

<style scoped>
.menu-bar {
  display: flex;
  flex-wrap: wrap;
  background: rgba(255,255,255,0.8);
  padding: 10px;
  border-radius: 8px;
  gap: 8px;
}
.menu-bar button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.menu-bar button:hover {
  background: #f0f0f0;
}
.icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>
