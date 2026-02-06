# Neo-Finance 部署指南

## 📋 部署前准备

### 系统要求

- Node.js 18+
- Docker & Docker Compose (用于容器化部署)
- Nginx (用于生产环境)

### 依赖安装

```bash
npm install
```

## 🚀 本地开发

### H5 开发

```bash
npm run dev:h5
```

访问: `http://localhost:5173`

### 微信小程序开发

```bash
npm run dev:mp-weixin
```

使用微信开发者工具打开 `dist/dev/mp-weixin` 目录

### App 开发

```bash
npm run dev:app
```

使用 HBuilderX 打开项目进行 App 开发

## 🏗️ 生产构建

### H5 构建

```bash
npm run build:h5
```

构建产物位于: `dist/build/h5/`

### 微信小程序构建

```bash
npm run build:mp-weixin
```

构建产物位于: `dist/build/mp-weixin/`

## 🐳 Docker 部署

### 方法一: Docker Compose (推荐)

1. 构建并启动服务:

```bash
docker-compose up -d
```

2. 访问应用:

```
http://localhost:8080
```

3. 查看日志:

```bash
docker-compose logs -f
```

4. 停止服务:

```bash
docker-compose down
```

### 方法二: Docker 手动部署

1. 构建镜像:

```bash
docker build -t neo-finance:latest .
```

2. 运行容器:

```bash
docker run -d -p 8080:80 --name neo-finance neo-finance:latest
```

3. 停止并删除容器:

```bash
docker stop neo-finance
docker rm neo-finance
```

## 🌐 Nginx 手动部署

### 1. 构建项目

```bash
npm run build:h5
```

### 2. 复制文件到 Nginx 目录

```bash
# Linux/Mac
sudo cp -r dist/build/h5/* /usr/share/nginx/html/

# Windows (PowerShell)
Copy-Item -Path "dist\build\h5\*" -Destination "C:\nginx\html\" -Recurse -Force
```

### 3. 配置 Nginx

将项目中的 `nginx.conf` 内容复制到 Nginx 配置文件:

**Linux/Mac:**

```bash
sudo nano /etc/nginx/conf.d/neo-finance.conf
```

**Windows:**
编辑 `C:\nginx\conf\nginx.conf` 或创建新的配置文件

### 4. 测试配置

```bash
# Linux/Mac
sudo nginx -t

# Windows
nginx -t
```

### 5. 重启 Nginx

```bash
# Linux/Mac
sudo systemctl restart nginx

# Windows
nginx -s reload
```

### 6. 访问应用

```
http://your-domain.com
```

## 🔧 生产环境优化

### 1. 启用 HTTPS

在 Nginx 配置中添加 SSL 证书:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # ... 其他配置
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. CDN 配置

将静态资源上传到 CDN，修改 `vite.config.ts`:

```typescript
export default defineConfig({
  base: 'https://your-cdn.com/neo-finance/'
  // ... 其他配置
})
```

### 3. 环境变量

创建 `.env.production`:

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_TITLE=Neo-Finance
```

## 📱 小程序部署

### 微信小程序

1. 构建小程序:

```bash
npm run build:mp-weixin
```

2. 使用微信开发者工具打开 `dist/build/mp-weixin`

3. 配置小程序 AppID (在 `manifest.json` 中)

4. 上传代码并提交审核

## 🔍 故障排查

### 问题1: 路由404错误

**原因:** Nginx 未配置 history 模式支持
**解决:** 确保 nginx.conf 中有 `try_files $uri $uri/ /index.html;`

### 问题2: 静态资源加载失败

**原因:** 路径配置错误
**解决:** 检查 `vite.config.ts` 中的 `base` 配置

### 问题3: 主题不生效

**原因:** CSS 文件未正确加载
**解决:** 确保 `theme.css` 在 `index.html` 中正确引入

### 问题4: Docker 构建失败

**原因:** 依赖安装失败或内存不足
**解决:**

- 增加 Docker 内存限制
- 使用 `npm ci` 代替 `npm install`
- 使用淘宝镜像: `npm config set registry https://registry.npmmirror.com`

## 📊 性能监控

### 使用 Nginx 日志分析

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 使用 Docker 监控

```bash
# 查看容器状态
docker stats neo-finance

# 查看容器日志
docker logs -f neo-finance
```

## 🔐 安全建议

1. **启用 HTTPS**: 使用 Let's Encrypt 免费 SSL 证书
2. **设置防火墙**: 只开放必要端口 (80, 443)
3. **定期更新**: 保持依赖包和系统更新
4. **备份数据**: 定期备份用户数据
5. **限流防护**: 配置 Nginx 限流规则

## 📞 技术支持

如遇问题，请提交 Issue 或联系开发团队。
