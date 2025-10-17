# 🚀 Nav Website — Docker Compose 部署指南

一个轻量级导航网站平台，支持后台管理、链接卡片、广告与友链配置。  
使用 Docker Compose 一键部署，快速运行在任何服务器上。

---

## ⚙️ 一、环境要求

请确保服务器已安装：

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

验证命令：

```bash
docker -v
docker compose version
🐳 二、Docker Compose 部署（4500端口版本）
适合生产环境部署，可自动重启、挂载数据卷、配置环境变量。

1️⃣ 创建 docker-compose.yml
在部署目录（如 /opt/nav-website/）创建：

yaml
复制代码
````
version: '3'

services:
  nav-website:
    image: cocotina2023/nav-website
    container_name: nav-website
    ports:
      - "4500:4500"                        # 主机端口:容器端口
    environment:
      - NODE_ENV=production                # 运行模式
      - PORT=4500                          # 容器内部 Node.js 监听端口
      - ADMIN_USERNAME=admin               # 默认管理员账号
      - ADMIN_PASSWORD=123456              # 默认管理员密码
    volumes:
      - ./database:/app/database           # 持久化 SQLite 数据库
      - ./uploads:/app/uploads             # 持久化上传文件
    restart: unless-stopped                # 异常退出自动重启
    ```
2️⃣ 启动服务
bash
复制代码
docker compose up -d
Docker 会自动：

拉取镜像 cocotina2023/nav-website

创建挂载目录

后台启动容器

3️⃣ 查看容器状态
bash
复制代码
docker compose ps
示例输出：

nginx
复制代码
NAME           STATUS          PORTS
nav-website    Up              0.0.0.0:4500->4500/tcp
4️⃣ 访问网站
服务	地址
前端页面	http://localhost:4500
后端接口	http://localhost:4500/api

如果是服务器部署，请访问：

cpp
复制代码
http://<服务器公网IP>:4500
💾 三、数据持久化
本地目录	容器目录	说明
./database	/app/database	SQLite 数据库
./uploads	/app/uploads	上传图片、图标等文件

删除容器不会丢失数据。

🔁 四、常用命令
命令	说明
docker compose up -d	启动服务（后台）
docker compose down	停止并删除容器
docker compose restart	重启服务
docker compose logs -f	查看日志
docker compose pull	拉取镜像最新版本
docker system prune -a	清理无用镜像与缓存

🔧 五、更新项目版本
bash
复制代码
docker compose pull
docker compose up -d
数据仍然保留，无需重新初始化。

🧹 六、清理（可选）
bash
复制代码
docker compose down -v
清理所有容器及挂载卷（如有需要）。

✅ 七、部署完成！
访问：

arduino
复制代码
http://localhost:4500
或服务器公网 IP：

cpp
复制代码
http://<你的服务器IP>:4500
即可打开导航网站 🎉

📦 项目信息
镜像名称：cocotina2023/nav-website

默认管理员账号：admin

默认密码：123456

数据库：SQLite（默认存储于 /app/database/nav.db）

❤️ 作者
cocotina2023
GitHub：https://github.com/cocotina2023/nav-website

yaml
复制代码

---

我已经把端口、挂载卷、环境变量、更新和访问说明都完整写好了，  
可以直接作为项目根目录的 `README.md` 使用。


