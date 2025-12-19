# List管理服务

一个简单的Node.js服务，用于管理list的增删改查操作。

## 🌟 重要提示：云部署（推荐）

**想要服务24小时在线，即使电脑关机也能访问？**

👉 **查看 [DEPLOY.md](./DEPLOY.md) 获取详细的云部署指南**

**快速推荐：**
- 🥇 **Railway** - 国内访问最稳定，支持文件写入，推荐首选 ⭐
- 🥈 **Render** - 稳定可靠，免费套餐可用
- 🥉 **Vercel** - 简单快速，但国内访问可能不稳定

> ⚠️ **如果遇到网络连接问题**（如 `ENOTFOUND api.vercel.com`），请查看 [网络问题解决方案.md](./网络问题解决方案.md)

部署后服务会一直运行，无需本地启动项目！

---

## 功能特性

- ✅ 存储和管理一个字符串数组list
- ✅ 获取整个list
- ✅ 添加元素到list
- ✅ 更新list中的元素
- ✅ 删除list中的元素
- ✅ 替换整个list
- ✅ 数据持久化存储（JSON文件）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

服务默认运行在 `http://localhost:3000`

## API接口说明

### 1. 获取list
**GET** `/api/list`

**响应示例：**
```json
{
  "success": true,
  "data": ["xxx", "www"],
  "message": "获取list成功"
}
```

### 2. 添加元素到list
**POST** `/api/list`

**请求体：**
```json
{
  "item": "新元素"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": ["xxx", "www", "新元素"],
  "message": "添加元素成功"
}
```

### 3. 更新指定索引的元素
**PUT** `/api/list/:index`

**示例：** `PUT /api/list/0`

**请求体：**
```json
{
  "item": "更新后的元素"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": ["更新后的元素", "www"],
  "message": "更新元素成功"
}
```

### 4. 删除指定索引的元素
**DELETE** `/api/list/:index`

**示例：** `DELETE /api/list/0`

**响应示例：**
```json
{
  "success": true,
  "data": ["www"],
  "deletedItem": "xxx",
  "message": "删除元素成功"
}
```

### 5. 替换整个list
**PUT** `/api/list`

**请求体：**
```json
{
  "list": ["新元素1", "新元素2", "新元素3"]
}
```

**响应示例：**
```json
{
  "success": true,
  "data": ["新元素1", "新元素2", "新元素3"],
  "message": "替换list成功"
}
```

## 使用示例

### 使用curl命令

```bash
# 获取list
curl http://localhost:3000/api/list

# 添加元素
curl -X POST http://localhost:3000/api/list \
  -H "Content-Type: application/json" \
  -d '{"item":"新元素"}'

# 更新索引0的元素
curl -X PUT http://localhost:3000/api/list/0 \
  -H "Content-Type: application/json" \
  -d '{"item":"更新后的元素"}'

# 删除索引0的元素
curl -X DELETE http://localhost:3000/api/list/0

# 替换整个list
curl -X PUT http://localhost:3000/api/list \
  -H "Content-Type: application/json" \
  -d '{"list":["元素1","元素2"]}'
```

### 使用JavaScript (fetch)

```javascript
// 获取list
fetch('http://localhost:3000/api/list')
  .then(res => res.json())
  .then(data => console.log(data));

// 添加元素
fetch('http://localhost:3000/api/list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ item: '新元素' })
})
  .then(res => res.json())
  .then(data => console.log(data));

// 更新元素
fetch('http://localhost:3000/api/list/0', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ item: '更新后的元素' })
})
  .then(res => res.json())
  .then(data => console.log(data));

// 删除元素
fetch('http://localhost:3000/api/list/0', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## 部署到外网访问

> ⚠️ **重要**：如果希望服务24小时在线，即使电脑关机也能访问，请查看 **[DEPLOY.md](./DEPLOY.md)** 获取详细的云部署指南！

### 方法1：使用云服务平台（推荐，24小时在线）

#### 1.1 使用Vercel部署（免费）

1. 安装Vercel CLI：
```bash
npm install -g vercel
```

2. 在项目根目录创建 `vercel.json`：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

3. 部署：
```bash
vercel
```

#### 1.2 使用Railway部署（免费）

1. 访问 [Railway.app](https://railway.app)
2. 使用GitHub账号登录
3. 点击"New Project" -> "Deploy from GitHub repo"
4. 选择你的仓库
5. Railway会自动检测Node.js项目并部署

#### 1.3 使用Render部署（免费）

1. 访问 [Render.com](https://render.com)
2. 注册账号并连接GitHub
3. 点击"New" -> "Web Service"
4. 选择你的仓库
5. 设置：
   - Build Command: `npm install`
   - Start Command: `npm start`
6. 点击"Create Web Service"

### 方法2：使用自己的服务器

#### 2.1 使用PM2管理进程（推荐）

1. 安装PM2：
```bash
npm install -g pm2
```

2. 启动服务：
```bash
pm2 start server.js --name list-manager
```

3. 设置开机自启：
```bash
pm2 startup
pm2 save
```

4. 查看服务状态：
```bash
pm2 status
pm2 logs list-manager
```

#### 2.2 配置Nginx反向代理

编辑Nginx配置文件（通常在 `/etc/nginx/sites-available/default`）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

重启Nginx：
```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### 2.3 配置防火墙

如果使用云服务器，需要开放端口：

```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

#### 2.4 使用环境变量配置端口

在服务器上设置环境变量：

```bash
export PORT=3000
```

或者创建 `.env` 文件：
```
PORT=3000
```

### 方法3：使用Docker部署

1. 创建 `Dockerfile`：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

2. 构建和运行：
```bash
docker build -t list-manager .
docker run -d -p 3000:3000 --name list-manager list-manager
```

## 注意事项

1. **数据持久化**：数据存储在 `data.json` 文件中，确保该文件有写入权限
2. **安全性**：生产环境建议添加：
   - 身份验证（JWT）
   - 请求频率限制
   - HTTPS加密
   - 输入验证和清理
3. **备份**：定期备份 `data.json` 文件
4. **日志**：生产环境建议添加日志记录功能

## 技术栈

- Node.js
- Express.js
- CORS（跨域支持）

## 许可证

ISC

