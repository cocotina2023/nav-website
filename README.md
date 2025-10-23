# 🚀 Nav Website

一个开箱即用的导航网站平台，提供后台管理、链接卡片、广告与友链配置，适合部署在个人或企业服务器上。该项目基于 Node.js + Express + SQLite，前端使用 Vue3（Vite），通过 RESTful API 进行交互。

---

## 1. 环境要求

请确保服务器已安装：

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

验证命令：

```bash
docker -v
docker compose version
```

---

## 2. 镜像获取

1. 首次发布后，请在 GitHub Packages 中打开 [ghcr.io/cocotina2023/nav-website](https://github.com/users/cocotina2023/packages/container/package/nav-website)，并在 **Package settings** 中将可见性设置为 **Public**，以便匿名拉取镜像。
2. 若之前已登录 GHCR，请执行 `docker logout ghcr.io` 确保使用匿名身份。
3. 拉取最新镜像：

   ```bash
   docker pull ghcr.io/cocotina2023/nav-website:latest
   ```

---

## 3. 快速启动（Docker Compose）

1. 在部署目录（例如 `/opt/nav-website/`）创建 `docker-compose.yml`：

```yaml
version: '3'

services:
  nav-website:
    image: ghcr.io/cocotina2023/nav-website:latest
    container_name: nav-website
    ports:
      - "4500:4500"                        # 主机端口:容器端口
    environment:
      - NODE_ENV=production                # 运行模式
      - PORT=4500                          # 容器内部 Node.js 监听端口
      - ADMIN_USERNAME=admin               # 默认管理员账号
      - ADMIN_PASSWORD=123456              # 默认管理员密码
      - JWT_SECRET=replace-with-strong-secret # JWT 签名密钥
      - CORS_ORIGIN=*                      # 允许访问 API 的来源
    volumes:
      - ./database:/app/database           # 持久化 SQLite 数据库
      - ./uploads:/app/uploads             # 持久化上传文件
    restart: unless-stopped                # 异常退出自动重启
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4500/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

> ⚠️ 首次部署前，请确保主机上的 `database/` 与 `uploads/` 目录已存在并具备读写权限，例如：
>
> ```bash
> mkdir -p database uploads
> chmod -R 775 database uploads
> ```
>
> 应用启动后会自动初始化数据库结构、默认管理员账号以及示例菜单/卡片数据，方便快速验证部署。

2. 一键启动服务：

```bash
docker compose up -d
```

3. 查看容器状态与日志：

```bash
docker compose ps
docker compose logs -f
```

4. 访问服务：

| 类型 | 地址 |
| ---- | ---- |
| 前端页面 | http://localhost:4500 |
| 后端接口 | http://localhost:4500/api |

若部署在云服务器，请替换为公网 IP 或域名。

> 默认管理员账号：`admin`，默认密码：`123456`。首次登录后请立即修改密码。

---

## 4. 健康检查接口

服务提供 `GET /api/health` 用于健康检查，典型响应：

```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": {
    "status": "connected",
    "path": "/app/database/nav.db",
    "tables": {
      "menus": 3,
      "cards": 12,
      "ads": 1,
      "friends": 2,
      "users": 1
    }
  }
}
```

该接口被 `docker-compose` 的 `healthcheck` 使用，可用于负载均衡或监控探活；`database` 字段展示了数据库文件路径及各业务表的记录数量，便于排查初始化问题。

---

## 5. 生产部署建议

### 5.1 使用 Nginx 反向代理

在主机上安装 Nginx，并创建站点配置（以 `/etc/nginx/conf.d/nav-website.conf` 为例）：

```nginx
server {
    listen 80;
    server_name nav.example.com;

    location / {
        proxy_pass http://127.0.0.1:4500;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/health {
        proxy_pass http://127.0.0.1:4500/api/health;
    }
}
```

启用配置后运行 `nginx -t && systemctl reload nginx` 使其生效。

### 5.2 启用 HTTPS（推荐）

1. 准备好解析到服务器的域名（如 `nav.example.com`）。
2. 使用 [Certbot](https://certbot.eff.org/) 或其他 ACME 客户端申请证书：

   ```bash
   sudo certbot --nginx -d nav.example.com
   ```

3. Certbot 会自动更新 Nginx 配置与证书续期任务。确认 `https://nav.example.com` 可正常访问。

### 5.3 配置 CORS

后端默认允许所有来源访问。如需限制来源，可在容器中设置 `CORS_ORIGIN`（单一来源）或 `CORS_ORIGINS`（逗号分隔多个来源）环境变量：

```yaml
environment:
  - CORS_ORIGIN=https://nav.example.com            # 单个来源示例
  # - CORS_ORIGINS=https://nav.example.com,https://admin.example.com  # 多个来源示例
```

设置后仅允许指定来源访问 API，其余来源会被拒绝。

---

## 6. 环境变量说明

| 变量名 | 默认值 | 说明 |
| ------ | ------ | ---- |
| `NODE_ENV` | `development` | Node.js 运行模式，生产环境请设置为 `production`。 |
| `PORT` | `3000` | 后端监听端口，Docker 镜像中默认为 4500。 |
| `ADMIN_USERNAME` | `admin` | 默认创建的管理员用户名。 |
| `ADMIN_PASSWORD` | `123456` | 默认创建的管理员密码。首次登录后请修改。 |
| `JWT_SECRET` | `mysecretkey` | JWT 签名密钥，生产环境务必改为复杂随机值。 |
| `DB_PATH` / `DATABASE_URL` | `./database/nav.db` | 自定义 SQLite 数据库文件路径，支持 `sqlite:///绝对路径/nav.db` 格式。 |
| `CORS_ORIGIN` | *(未设置)* | 允许的单一来源，设置为 `*` 表示不限制，生产环境建议改为实际域名。 |
| `CORS_ORIGINS` | *(未设置)* | 允许访问 API 的域名列表，支持多个逗号分隔，同样支持 `*` 表示不限制。 |

> 如需自定义数据库存储路径，可修改镜像内 `/app/database` 挂载目录。

---

## 7. 数据持久化

| 主机目录 | 容器目录 | 说明 |
| ------- | ------- | ---- |
| `./database` | `/app/database` | SQLite 数据库文件（`nav.db`）。 |
| `./uploads` | `/app/uploads` | 上传的图片、图标等资源。 |

删除或更新容器不会影响挂载目录中的数据。

---

## 8. 常见问题与排查

1. **端口被占用**：确保主机 4500 端口空闲，或修改 `docker-compose.yml` 中的端口映射。
2. **跨域请求被拒绝**：确认前端访问域名已配置在 `CORS_ORIGIN` 或 `CORS_ORIGINS` 中，并重新启动容器。
3. **数据目录权限不足**：确保部署目录下的 `database/` 与 `uploads/` 对 Docker 进程可写（例如执行 `chmod -R 775 database uploads`），否则会出现初始化失败或静态资源无法保存。
4. **容器健康检查失败**：使用 `docker compose logs nav-website` 查看日志，确认 `/api/health` 是否返回 200。
5. **Nginx 502 错误**：确认容器正在运行且代理地址与端口配置正确。
6. **管理员密码忘记**：删除 `database/nav.db` 后重新启动容器会重新初始化数据库与默认账号（注意会清空数据）。

---

## 9. 更新 & 维护

- 更新镜像：`docker compose pull && docker compose up -d`
- 查看运行状态：`docker compose ps`
- 查看实时日志：`docker compose logs -f`
- 停止并移除容器：`docker compose down`
- 连同数据一起清理：`docker compose down -v`

---

如有问题，欢迎提交 Issue 或 PR。祝部署愉快！
