# Nav Website - 开发文档

本文档提供开发环境的搭建和使用指南。

## 📋 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [API接口](#api接口)
- [常见问题](#常见问题)

## 🔧 环境要求

- Node.js >= 18.x
- npm >= 9.x

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd web
npm install
cd ..
```

### 2. 启动开发环境

**后端 (端口 3000):**

```bash
npm run dev
```

或使用 Node.js 自带的 watch 模式：

```bash
npm start
```

**前端 (端口 5173):**

```bash
cd web
npm run dev
```

访问: http://localhost:5173

### 3. 默认账号

- 用户名: `admin`
- 密码: `123456`

**⚠️ 请在首次登录后立即修改密码!**

## 📁 项目结构

```
nav-website/
├── app.js                 # Express 应用入口
├── config.js              # 配置文件
├── db.js                  # 数据库连接和初始化
├── package.json           # 后端依赖
├── middleware/            # 中间件
│   └── auth.js           # JWT 认证中间件
├── routes/               # 路由
│   ├── auth.js          # 认证路由 (登录/注册)
│   ├── menu.js          # 菜单管理
│   ├── card.js          # 卡片管理
│   ├── ad.js            # 广告管理
│   ├── friend.js        # 友链管理
│   └── user.js          # 用户管理
├── database/            # 数据库
│   ├── schema.sql      # 数据库结构
│   ├── init.js         # 初始化脚本
│   └── nav.db          # SQLite 数据库文件
├── uploads/            # 上传文件目录
└── web/                # 前端项目 (Vue 3 + Vite)
    ├── src/
    │   ├── api.js            # API 封装
    │   ├── main.js           # 入口文件
    │   ├── router.js         # 路由配置
    │   ├── App.vue           # 根组件
    │   ├── style.css         # 全局样式
    │   ├── components/       # 组件
    │   │   ├── MenuBar.vue  # 菜单栏
    │   │   └── CardGrid.vue # 卡片网格
    │   └── views/           # 页面
    │       ├── Home.vue     # 首页
    │       ├── Admin.vue    # 管理后台
    │       └── admin/       # 管理页面
    └── package.json         # 前端依赖
```

## 🔌 API接口

### 认证接口

**POST /api/auth/register** - 注册
```json
{
  "username": "user",
  "password": "password123"
}
```

**POST /api/auth/login** - 登录
```json
{
  "username": "admin",
  "password": "123456"
}
```

返回:
```json
{
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 需要认证的接口

所有 POST、PUT、DELETE 操作都需要在请求头中携带 JWT Token:

```
Authorization: Bearer <token>
```

### 菜单接口

- `GET /api/menu` - 获取所有菜单
- `POST /api/menu` - 创建菜单 (需认证)
- `PUT /api/menu/:id` - 更新菜单 (需认证)
- `DELETE /api/menu/:id` - 删除菜单 (需认证)

### 卡片接口

- `GET /api/card?menu_id=1` - 获取卡片（可按菜单过滤）
- `POST /api/card` - 创建卡片 (需认证)
- `PUT /api/card/:id` - 更新卡片 (需认证)
- `DELETE /api/card/:id` - 删除卡片 (需认证)

### 广告接口

- `GET /api/ad` - 获取广告列表
- `POST /api/ad` - 添加广告 (需认证)
- `PUT /api/ad/:id` - 更新广告 (需认证)
- `DELETE /api/ad/:id` - 删除广告 (需认证)

### 友链接口

- `GET /api/friend` - 获取友链列表
- `POST /api/friend` - 添加友链 (需认证)
- `PUT /api/friend/:id` - 更新友链 (需认证)
- `DELETE /api/friend/:id` - 删除友链 (需认证)

### 用户接口

- `GET /api/user` - 获取所有用户 (需认证)
- `PUT /api/user/:id/password` - 修改密码 (需认证)
- `DELETE /api/user/:id` - 删除用户 (需认证)

## 🗄️ 数据库

项目使用 SQLite 数据库，位于 `database/nav.db`。

### 表结构

- **users** - 用户表
- **menus** - 菜单表
- **cards** - 卡片表
- **ads** - 广告表
- **friends** - 友链表

### 重新初始化数据库

如果需要重新初始化数据库：

```bash
# 删除现有数据库
rm database/nav.db

# 重启应用，数据库会自动创建并初始化
npm start
```

或使用初始化脚本：

```bash
npm run init:db
```

## ⚠️ 常见问题

### 1. 数据库连接失败

确保 `database/` 目录存在且有写入权限：

```bash
mkdir -p database
chmod 755 database
```

### 2. 端口已被占用

修改 `.env` 文件或设置环境变量：

```bash
PORT=3001 npm start
```

### 3. CORS 错误

确保前端的 API 代理配置正确（`web/vite.config.mjs`）：

```javascript
proxy: {
  '/api': 'http://localhost:3000'
}
```

### 4. 认证失败

- 检查 JWT Token 是否在请求头中正确设置
- Token 有效期为 7 天，过期需要重新登录
- 确保使用 `Bearer <token>` 格式

## 🏗️ 构建生产版本

### 构建前端

```bash
cd web
npm run build
```

构建结果在 `web/dist` 目录。

### 生产模式运行

```bash
NODE_ENV=production PORT=4500 npm start
```

生产模式下，后端会自动服务前端静态文件。

## 🐳 Docker 部署

参考主 [README.md](README.md) 文件。

## 📝 开发规范

### 代码风格

- 使用 ES6+ 语法
- 使用 async/await 处理异步操作
- 函数和变量使用驼峰命名
- 添加必要的注释

### 提交规范

```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链更新
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

MIT License
