import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Admin from './views/Admin.vue';
import MenuManage from './views/admin/MenuManage.vue';
import CardManage from './views/admin/CardManage.vue';
import AdManage from './views/admin/AdManage.vue';
import FriendLinkManage from './views/admin/FriendLinkManage.vue';
import UserManage from './views/admin/UserManage.vue';

const routes = [
  { path: '/', component: Home },
  {
    path: '/admin',
    component: Admin,
    children: [
      { path: 'menu', component: MenuManage },
      { path: 'card', component: CardManage },
      { path: 'ad', component: AdManage },
      { path: 'friend', component: FriendLinkManage },
      { path: 'user', component: UserManage }
    ]
  }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
