# LeanCloud 数据库配置指南

本项目已集成 LeanCloud 数据库，实现数据持久化存储。LeanCloud 是国内服务，访问稳定，且有免费层可用。

## 📋 为什么选择 LeanCloud？

- ✅ **国内服务**：访问稳定，速度快
- ✅ **免费层**：每天 10,000 次 API 请求，足够个人项目使用
- ✅ **持久化存储**：数据永久保存，不会丢失
- ✅ **简单易用**：REST API，集成方便

## 🚀 快速开始

### 1. 注册 LeanCloud 账号

访问 [LeanCloud 官网](https://leancloud.cn/) 注册账号（免费）

### 2. 创建应用

1. 登录后，点击「创建应用」
2. 填写应用名称（例如：`list-manager`）
3. 选择「开发版」（免费）
4. 点击「创建」

### 3. 获取应用凭证

1. 进入应用后，点击「设置」→「应用凭证」
2. 复制以下信息：
   - **App ID**（应用 ID）
   - **App Key**（应用 Key）
   - **服务器地址**（可选，默认使用国内节点 `https://leancloud.cn`）

### 4. 配置环境变量

#### 方式一：本地开发（使用 .env 文件）

在项目根目录创建 `.env` 文件：

```env
LEANCLOUD_APP_ID=你的AppID
LEANCLOUD_APP_KEY=你的AppKey
LEANCLOUD_SERVER_URL=https://leancloud.cn
```

**注意**：需要安装 `dotenv` 包来读取 `.env` 文件：

```bash
npm install dotenv
```

然后在 `server.js` 文件开头添加：

```javascript
require('dotenv').config();
```

#### 方式二：云平台部署（推荐）

##### 2.1 Netlify 环境变量配置

**步骤：**

1. **登录 Netlify 控制台**
   - 访问 [Netlify 官网](https://www.netlify.com/)
   - 使用 GitHub 账号登录

2. **进入站点设置**
   - 在 Netlify 控制台，选择你的站点
   - 点击左侧菜单的 **"Site settings"**（站点设置）

3. **配置环境变量**
   - 在设置页面，找到 **"Environment variables"**（环境变量）部分
   - 点击 **"Add variable"**（添加变量）按钮
   - 依次添加以下三个环境变量：

   **必需的环境变量：**
   - **Key**: `LEANCLOUD_APP_ID`
     **Value**: 你的 LeanCloud App ID
   
   - **Key**: `LEANCLOUD_APP_KEY`
     **Value**: 你的 LeanCloud App Key

   **可选的环境变量：**
   - **Key**: `LEANCLOUD_SERVER_URL`
     **Value**: `https://leancloud.cn`（默认值，通常不需要修改）

4. **保存并重新部署**
   - 添加完所有环境变量后，点击 **"Save"**（保存）
   - 环境变量会在下次部署时生效
   - 如果需要立即生效，可以点击 **"Trigger deploy"**（触发部署）→ **"Deploy site"**（部署站点）

**配置示例：**

```
LEANCLOUD_APP_ID=你的AppID
LEANCLOUD_APP_KEY=你的AppKey
LEANCLOUD_SERVER_URL=https://leancloud.cn
```

**注意事项：**
- ✅ 环境变量区分大小写，请确保变量名完全正确
- ✅ 不要在环境变量值前后添加引号
- ✅ 修改环境变量后需要重新部署才能生效
- ✅ 可以在不同环境（Production、Deploy previews、Branch deploys）中设置不同的环境变量

##### 2.2 其他云平台（Render、Railway、Vercel）

在云平台的环境变量设置中添加：

- `LEANCLOUD_APP_ID` = 你的 App ID
- `LEANCLOUD_APP_KEY` = 你的 App Key
- `LEANCLOUD_SERVER_URL` = `https://leancloud.cn`（可选）

### 5. 安装依赖并启动

```bash
npm install
npm start
```

## 📝 环境变量说明

| 变量名 | 说明 | 是否必需 | 默认值 |
|--------|------|----------|--------|
| `LEANCLOUD_APP_ID` | LeanCloud 应用 ID | ✅ 必需 | - |
| `LEANCLOUD_APP_KEY` | LeanCloud 应用 Key | ✅ 必需 | - |
| `LEANCLOUD_SERVER_URL` | LeanCloud 服务器地址 | ❌ 可选 | `https://leancloud.cn` |

## 🔄 数据存储方式

- **如果配置了 LeanCloud**：数据存储在 LeanCloud 数据库中（持久化）
- **如果未配置 LeanCloud**：数据存储在本地文件系统（`data.json`）

## ⚠️ 注意事项

1. **免费层限制**：
   - 每天 10,000 次 API 请求
   - 存储空间：2GB
   - 对于个人项目通常足够使用

2. **数据安全**：
   - 不要将 App ID 和 App Key 提交到代码仓库
   - 使用环境变量存储敏感信息

3. **数据迁移**：
   - 如果之前使用文件系统存储，配置 LeanCloud 后会自动使用数据库
   - 文件系统中的数据不会自动迁移，需要手动导入

## 🛠️ 故障排查

### 问题：数据库连接失败

**解决方案**：
1. 检查环境变量是否正确配置
2. 确认 App ID 和 App Key 是否正确
3. 检查网络连接是否正常

### 问题：数据读取失败

**解决方案**：
1. 检查 LeanCloud 控制台是否有错误日志
2. 确认应用是否已激活
3. 检查 API 请求次数是否超出限制

## 📚 更多信息

- [LeanCloud 官方文档](https://leancloud.cn/docs/)
- [Node.js SDK 文档](https://leancloud.cn/docs/leanstorage_guide-nodejs.html)
- [免费层说明](https://leancloud.cn/pricing.html)

