# 云部署指南 - 无需本地运行，24小时在线

本指南提供多种**免费**云部署方案，部署后服务会一直运行，即使你的电脑关机也能访问。

> ⚠️ **如果遇到网络连接问题**（如 `ENOTFOUND api.vercel.com`），请查看 [网络问题解决方案.md](./网络问题解决方案.md)

## 🚀 推荐方案（按简单程度排序）

### 方案1：Railway（推荐，国内稳定）⭐

**强烈推荐！国内访问最稳定！**

**优点：**
- 国内访问稳定，无需特殊配置
- 免费额度充足（每月$5免费额度）
- 支持文件写入（Vercel文件系统只读）
- 自动部署（GitHub推送自动部署）
- 简单易用，网页操作即可

**步骤：**

1. **注册账号**
   - 访问 https://railway.app
   - 点击 "Login" 使用GitHub账号登录

2. **创建项目**
   - 登录后点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 如果没有连接GitHub，先点击 "Connect GitHub" 授权

3. **选择仓库**
   - 如果代码已在GitHub，选择你的仓库
   - 如果代码在本地，先推送到GitHub：
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/你的用户名/你的仓库名.git
     git push -u origin main
     ```

4. **自动部署**
   - Railway会自动检测Node.js项目
   - 自动安装依赖并启动服务
   - 等待部署完成（约1-2分钟）

5. **获取访问地址**
   - 部署完成后，点击项目
   - 在 "Settings" -> "Networking" 中可以看到公网URL
   - 或者点击 "Generate Domain" 生成一个域名

6. **测试接口**
   ```bash
   curl https://your-project.up.railway.app/api/list
   ```

**自动部署设置：**
- Railway默认会在你推送代码到GitHub时自动重新部署
- 无需手动操作，非常方便

---

### 方案2：Vercel（如果网络正常）⭐

**优点：**
- 部署最简单，几分钟搞定
- 完全免费
- 自动HTTPS
- 全球CDN加速
- 支持自定义域名

**步骤：**

1. **注册账号**
   - 访问 https://vercel.com
   - 使用GitHub账号登录（推荐）或邮箱注册

2. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **登录Vercel**
   ```bash
   vercel login
   ```

4. **部署项目**
   ```bash
   # 在项目目录下运行
   vercel
   ```
   
   按提示操作：
   - 是否要部署到现有项目？选择 `N`（首次部署）
   - 项目名称：直接回车（使用默认名称）
   - 目录：直接回车（使用当前目录）
   - 是否覆盖设置：直接回车

5. **完成！**
   - 部署完成后会显示一个URL，例如：`https://your-project.vercel.app`
   - 这个URL就是你的服务地址，可以立即访问

6. **测试接口**
   ```bash
   curl https://your-project.vercel.app/api/list
   ```

**后续更新：**
- 推送代码到GitHub，Vercel会自动重新部署
- 或手动点击 "Redeploy" 按钮
- 或运行 `vercel` 命令（如果网络正常）

**如果无法访问Vercel：**
- 使用Railway（方案1），国内访问更稳定

---

### 方案3：Render（免费，稳定）⭐

**优点：**
- 免费额度充足（每月$5免费额度）
- 支持数据库
- 自动部署（GitHub推送自动部署）
- 简单易用

**步骤：**

1. **注册账号**
   - 访问 https://railway.app
   - 点击 "Login" 使用GitHub账号登录

2. **创建项目**
   - 登录后点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 如果没有连接GitHub，先点击 "Connect GitHub" 授权

3. **选择仓库**
   - 如果代码已在GitHub，选择你的仓库
   - 如果代码在本地，先推送到GitHub：
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/你的用户名/你的仓库名.git
     git push -u origin main
     ```

4. **自动部署**
   - Railway会自动检测Node.js项目
   - 自动安装依赖并启动服务
   - 等待部署完成（约1-2分钟）

5. **获取访问地址**
   - 部署完成后，点击项目
   - 在 "Settings" -> "Networking" 中可以看到公网URL
   - 或者点击 "Generate Domain" 生成一个域名

6. **测试接口**
   ```bash
   curl https://your-project.up.railway.app/api/list
   ```

**自动部署设置：**
- Railway默认会在你推送代码到GitHub时自动重新部署
- 无需手动操作，非常方便

---

### 方案3：Render（免费，稳定）⭐

**优点：**
- 免费套餐稳定
- 自动HTTPS
- 支持自定义域名
- 简单配置

**步骤：**

1. **注册账号**
   - 访问 https://render.com
   - 使用GitHub账号登录

2. **创建Web服务**
   - 点击 "New" -> "Web Service"
   - 连接你的GitHub仓库（如果没有，先推送代码到GitHub）

3. **配置服务**
   - **Name**: 输入服务名称（如：list-manager）
   - **Region**: 选择离你最近的区域（如：Singapore）
   - **Branch**: 选择 `main` 或 `master`
   - **Root Directory**: 留空（使用根目录）
   - **Environment**: 选择 `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成（约2-3分钟）

5. **获取访问地址**
   - 部署完成后，会显示一个URL，例如：`https://list-manager.onrender.com`
   - 这就是你的服务地址

6. **测试接口**
   ```bash
   curl https://list-manager.onrender.com/api/list
   ```

**注意事项：**
- Render免费版在15分钟无访问后会休眠
- 首次访问需要等待几秒唤醒服务
- 如果经常使用，建议升级到付费版或使用其他平台

---

### 方案5：Fly.io（免费，性能好）

**优点：**
- 免费额度充足
- 全球多区域部署
- 性能优秀

**步骤：**

1. **注册账号**
   - 访问 https://fly.io
   - 注册账号

2. **安装Fly CLI**
   ```bash
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

3. **登录**
   ```bash
   fly auth login
   ```

4. **初始化项目**
   ```bash
   fly launch
   ```
   
   按提示操作：
   - App name: 输入应用名称
   - Region: 选择区域（如：hkg）
   - 其他选项直接回车使用默认值

5. **部署**
   ```bash
   fly deploy
   ```

6. **获取访问地址**
   ```bash
   fly open
   ```

---

### 方案6：Replit（在线IDE + 部署）

**优点：**
- 在线编辑代码
- 一键部署
- 完全免费

**步骤：**

1. **访问 Replit**
   - 访问 https://replit.com
   - 使用GitHub账号登录

2. **创建Repl**
   - 点击 "Create Repl"
   - 选择 "Node.js" 模板
   - 输入项目名称

3. **上传代码**
   - 将所有项目文件上传到Repl
   - 或使用Git导入

4. **运行**
   - 点击 "Run" 按钮
   - Replit会自动启动服务并提供URL

5. **部署为Web应用**
   - 点击右上角 "Deploy" 按钮
   - 选择 "Deploy as Web App"
   - 完成部署

---

## 📊 各平台对比

| 平台 | 免费额度 | 部署难度 | 休眠机制 | 国内访问 | 推荐度 |
|------|---------|---------|---------|---------|--------|
| Railway | $5/月 | ⭐⭐⭐⭐ 简单 | 无 | ✅ 稳定 | ⭐⭐⭐⭐⭐ |
| Vercel | 无限 | ⭐⭐⭐⭐⭐ 最简单 | 无 | ⚠️ 不稳定 | ⭐⭐⭐⭐ |
| Render | 无限 | ⭐⭐⭐⭐ 简单 | 15分钟休眠 | ✅ 稳定 | ⭐⭐⭐⭐ |
| Fly.io | 充足 | ⭐⭐⭐ 中等 | 无 | ✅ 稳定 | ⭐⭐⭐⭐ |
| Replit | 无限 | ⭐⭐⭐⭐ 简单 | 无 | ✅ 稳定 | ⭐⭐⭐ |

## 🎯 快速选择建议

- **国内用户**：首选 **Railway**，访问最稳定 ⭐
- **完全新手**：选择 **Railway** 或 **Render**，简单稳定
- **需要自动部署**：选择 **Railway**，GitHub推送自动部署
- **需要稳定服务**：选择 **Railway** 或 **Render**
- **预算有限**：所有平台都有免费套餐，按需选择

## ✅ 部署后验证

部署完成后，使用以下命令测试：

```bash
# 替换为你的实际URL
BASE_URL="https://your-project.vercel.app"

# 获取list
curl $BASE_URL/api/list

# 添加元素
curl -X POST $BASE_URL/api/list \
  -H "Content-Type: application/json" \
  -d '{"item":"测试元素"}'

# 再次获取list验证
curl $BASE_URL/api/list
```

## 🔧 常见问题

### Q: 部署后数据会丢失吗？
A: 不会。数据存储在 `data.json` 文件中，会随代码一起部署。但某些平台（如Vercel）的文件系统是只读的，需要改用数据库。如果需要持久化存储，建议使用Railway配合数据库。

### Q: 如何更新代码？
A: 
- **Vercel**: 运行 `vercel` 命令
- **Railway**: 推送代码到GitHub，自动部署
- **Render**: 推送代码到GitHub，自动部署

### Q: 可以自定义域名吗？
A: 可以。各平台都支持自定义域名，在项目设置中配置即可。

### Q: 哪个平台最快？
A: Vercel有全球CDN，通常最快。Railway和Fly.io也很快。

## 📝 注意事项

1. **数据持久化**：如果使用Vercel，文件系统是只读的，写入操作会失败。建议：
   - 使用Railway + 数据库
   - 或使用Vercel + 外部数据库服务（如MongoDB Atlas免费版）

2. **环境变量**：如果需要配置环境变量，在各平台的设置中添加即可。

3. **日志查看**：各平台都提供日志查看功能，方便调试。

---

**推荐流程：**
1. **首选 Railway**（国内访问最稳定，支持文件写入）
2. 如果Railway不可用，使用 **Render**（同样稳定）
3. 如果网络正常，可以尝试 **Vercel**（但文件系统只读）

**重要提示：**
- 如果遇到网络连接问题，优先使用 **Railway**
- Railway支持文件写入，更适合需要数据持久化的应用
- 查看 [网络问题解决方案.md](./网络问题解决方案.md) 获取更多帮助

祝你部署顺利！🎉

