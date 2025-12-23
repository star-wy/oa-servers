# Netlify 部署指南

本指南介绍如何在 Netlify 上部署本项目，并配置 LeanCloud 环境变量。

## 🚀 快速部署步骤

### 1. 准备代码仓库

确保你的代码已经推送到 GitHub：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 2. 在 Netlify 上创建站点

1. **访问 Netlify**
   - 打开 [Netlify 官网](https://www.netlify.com/)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击右上角 **"Add new site"** → **"Import an existing project"**
   - 选择 **"Deploy with GitHub"**
   - 如果没有连接 GitHub，先点击 **"Configure the Netlify app on GitHub"** 授权

3. **选择仓库**
   - 选择你的代码仓库
   - 点击 **"Next"**

4. **配置构建设置**
   - **Build command**: `npm install`（或留空，Netlify 会自动检测）
   - **Publish directory**: `.`（留空或使用根目录）
   - 点击 **"Deploy site"**

**重要说明：**
- 本项目已经配置为 Netlify Functions，Express 应用会自动包装为 serverless function
- 确保项目包含 `netlify/functions/server.js` 文件和 `netlify.toml` 配置文件
- 如果遇到 404 错误，请检查这些文件是否存在

5. **等待部署完成**
   - Netlify 会自动检测 Node.js 项目并部署
   - 部署完成后会显示一个 URL，例如：`https://your-project.netlify.app`

### 3. 配置 LeanCloud 环境变量

**重要：这是关键步骤！**

1. **进入站点设置**
   - 在 Netlify 控制台，选择你的站点
   - 点击左侧菜单的 **"Site settings"**（站点设置）

2. **打开环境变量配置**
   - 在设置页面，向下滚动找到 **"Environment variables"**（环境变量）部分
   - 点击 **"Add variable"**（添加变量）按钮

3. **添加必需的环境变量**

   添加以下三个环境变量：

   **变量 1：**
   - **Key**: `LEANCLOUD_APP_ID`
   - **Value**: 你的 LeanCloud App ID（从 LeanCloud 控制台获取）
   - **Scopes**: 选择 **"All scopes"**（所有环境）

   **变量 2：**
   - **Key**: `LEANCLOUD_APP_KEY`
   - **Value**: 你的 LeanCloud App Key（从 LeanCloud 控制台获取）
   - **Scopes**: 选择 **"All scopes"**（所有环境）

   **变量 3（可选）：**
   - **Key**: `LEANCLOUD_SERVER_URL`
   - **Value**: `https://leancloud.cn`（默认值，通常不需要修改）
   - **Scopes**: 选择 **"All scopes"**（所有环境）

4. **保存环境变量**
   - 每添加一个变量后，点击 **"Add variable"** 保存
   - 添加完所有变量后，所有变量会显示在列表中

5. **重新部署以应用环境变量**
   - 环境变量配置后，需要重新部署才能生效
   - 点击顶部菜单的 **"Deploys"**（部署）
   - 点击 **"Trigger deploy"**（触发部署）→ **"Deploy site"**（部署站点）
   - 或者直接推送代码到 GitHub，Netlify 会自动重新部署

### 4. 验证部署

部署完成后，测试 API 接口：

```bash
# 获取 list
curl https://your-project.netlify.app/api/list

# 添加元素
curl -X POST https://your-project.netlify.app/api/list \
  -H "Content-Type: application/json" \
  -d '{"id":"test","name":"测试"}'
```

## 📝 环境变量配置详细说明

### 必需的环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `LEANCLOUD_APP_ID` | LeanCloud 应用 ID | 在 LeanCloud 控制台 → 设置 → 应用凭证中获取 |
| `LEANCLOUD_APP_KEY` | LeanCloud 应用 Key | 在 LeanCloud 控制台 → 设置 → 应用凭证中获取 |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `LEANCLOUD_SERVER_URL` | LeanCloud 服务器地址 | `https://leancloud.cn` |

### 环境变量作用域（Scopes）

Netlify 允许为不同环境设置不同的环境变量：

- **Production**: 生产环境（主分支部署）
- **Deploy previews**: 预览环境（Pull Request 部署）
- **Branch deploys**: 分支部署（其他分支部署）

**建议**：对于 LeanCloud 配置，通常选择 **"All scopes"**（所有环境）即可。

## ⚠️ 注意事项

### 1. Netlify Functions 配置（已自动配置）

本项目已经配置为使用 Netlify Functions：

- ✅ Express 应用已包装为 Netlify Function（`netlify/functions/server.js`）
- ✅ 使用 `serverless-http` 将 Express 应用转换为 serverless function
- ✅ 所有请求会自动重定向到 `/.netlify/functions/server`
- ✅ 配置文件 `netlify.toml` 已正确设置

**如果遇到 404 错误，请检查：**
1. `netlify/functions/server.js` 文件是否存在
2. `netlify.toml` 配置是否正确
3. `package.json` 中是否包含 `serverless-http` 依赖
4. 部署日志中是否有错误信息

### 2. 环境变量生效时间

- 环境变量配置后，需要**重新部署**才能生效
- 修改环境变量不会自动触发部署，需要手动触发或推送代码

### 3. 数据持久化

- ✅ **推荐使用 LeanCloud**：数据存储在云端，持久化保存
- ❌ **不推荐使用文件系统**：Netlify Functions 的文件系统是只读的，无法持久化存储

### 4. 查看日志

如果遇到问题，可以查看部署日志：

1. 在 Netlify 控制台，点击 **"Deploys"**（部署）
2. 选择最新的部署记录
3. 查看 **"Deploy log"**（部署日志）和 **"Function logs"**（函数日志）

## 🔧 故障排查

### 问题：API 请求返回 404 ⚠️ 常见问题

**原因：**
Netlify 不能直接运行 Express 应用，需要将 Express 应用包装为 Netlify Function。

**解决方案：**

1. **检查必要文件是否存在**
   - ✅ `netlify/functions/server.js` - Netlify Function 包装文件
   - ✅ `netlify.toml` - Netlify 配置文件
   - ✅ `package.json` 中包含 `serverless-http` 依赖

2. **确认 netlify.toml 配置正确**
   ```toml
   [build]
     functions = "netlify/functions"
   
   [[redirects]]
     from = "/*"
     to = "/.netlify/functions/server"
     status = 200
   ```

3. **检查部署日志**
   - 在 Netlify 控制台 → "Deploys" → 选择最新部署
   - 查看 "Deploy log" 和 "Function logs"
   - 确认没有构建错误

4. **重新部署**
   - 如果文件都正确，尝试重新部署
   - 点击 "Deploys" → "Trigger deploy" → "Deploy site"

5. **验证 Function 是否创建**
   - 在 Netlify 控制台 → "Functions"
   - 应该能看到 `server` function
   - 如果看不到，说明构建失败或配置错误

### 问题：环境变量未生效

**解决方案：**
1. 确认环境变量名称拼写正确（区分大小写）
2. 确认已保存环境变量
3. 重新部署站点（环境变量修改后需要重新部署）

### 问题：LeanCloud 连接失败

**解决方案：**
1. 检查环境变量是否正确配置
2. 确认 App ID 和 App Key 是否正确
3. 查看 Netlify 函数日志，检查错误信息
4. 确认 LeanCloud 应用已激活

## 📚 相关文档

- [LeanCloud 配置指南](./LEANCLOUD_SETUP.md)
- [Netlify 官方文档](https://docs.netlify.com/)
- [Netlify Functions 文档](https://docs.netlify.com/functions/overview/)

## 💡 提示

- 如果遇到部署问题，可以查看 Netlify 的部署日志
- 建议先在本地测试环境变量配置，确认无误后再部署到 Netlify
- 可以使用 Netlify 的环境变量模板功能，为不同环境设置不同的配置

