<template>
  <nav class="menu-bar">
    <button v-for="m in menus" :key="m.id" @click="$emit('select', m)">
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
  border
