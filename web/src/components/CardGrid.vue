<template>
  <div class="card-grid">
    <a v-for="c in cards" :key="c.id" :href="c.url" target="_blank" class="card">
      <img v-if="c.icon" :src="c.icon" alt="" />
      <h3>{{ c.title }}</h3>
    </a>
  </div>
</template>

<script setup>
defineProps({ cards: Array })
</script>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
  padding: 1rem;
}
.card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: black;
  text-decoration: none;
}
.card:hover {
  transform: scale(1.03);
  transition: 0.2s;
}
.card img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin-bottom: 8px;
}
</style>
