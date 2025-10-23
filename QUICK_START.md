# Nav Website - 快速开始

## 🚀 5分钟快速启动指南

### 前置要求
- Node.js 18+ 
- npm 9+

### 第一步: 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd web
npm install
cd ..
```

### 第二步: 启动后端

```bash
npm start
```

你会看到:
```
✅ Server running at http://localhost:3000
✅ 已连接 SQLite 数据库
✅ 数据库表结构已初始化
✅ 默认管理员用户已创建: admin
🔑 默认密码: 123456
```

### 第三步: 启动前端（新终端窗口）

```bash
cd web
npm run dev
```

访问: http://localhost:5173

### 第四步: 登录管理后台

- 访问: http://localhost:5173/admin
- 用户名: `admin`
- 密码: `123456`

⚠️ **请立即修改密码!**

---

## 📖 详细文档

- **开发文档**: [README.dev.md](README.dev.md) - 完整的 API 文档、项目结构
- **变更日志**: [CHANGELOG.md](CHANGELOG.md) - 所有更新记录
- **修复总结**: [FIX_SUMMARY.md](FIX_SUMMARY.md) - 本次修复的详细说明
- **部署文档**: [README.md](README.md) - Docker Compose 部署

---

## ❓ 常见问题

**Q: 端口被占用怎么办?**
```bash
PORT=3001 npm start
```

**Q: 如何重置数据库?**
```bash
rm database/nav.db
npm start  # 会自动重新创建
```

**Q: 忘记密码怎么办?**
```bash
rm database/nav.db
npm start  # 重新创建，密码恢复为 123456
```

---

## 🎉 完成!

现在你可以:
- ✅ 访问首页查看导航卡片
- ✅ 登录管理后台
- ✅ 管理菜单、卡片、广告、友链
- ✅ 管理用户

享受使用吧! 🚀
