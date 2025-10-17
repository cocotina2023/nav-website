<template>
  <div class="admin-layout">
    <aside>
      <router-link to="/admin/menu">菜单管理</router-link>
      <router-link to="/admin/card">卡片管理</router-link>
      <router-link to="/admin/ad">广告管理</router-link>
      <router-link to="/admin/friend">友链管理</router-link>
      <router-link to="/admin/user">用户管理</router-link>
    </aside>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}
aside {
  width: 200px;
  background: #343a40;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
aside a {
  color: white;
  margin-bottom: 10px;
  text-decoration: none;
}
aside a.router-link-exact-active {
  font-weight: bold;
}
main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>

