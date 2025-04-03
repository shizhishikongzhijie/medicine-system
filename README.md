# 药品管理系统

这是一个使用 [Next.js](https://nextjs.org) 框架构建的项目，旨在帮助用户管理药品信息。

## 功能

- 用户登录和注册
- 药品信息的增删改查
- 库存管理
- 通知和日志系统

## 开始使用

首先，运行开发服务器：

```bash
npm run dev
# 或者
yarn dev
# 或者
pnpm dev
# 或者
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 来查看项目。

通过修改 `app/page.tsx` 文件，您可以开始编辑页面。保存文件后，页面将自动更新。

## 项目结构

项目包含以下主要目录和文件：

- `src/app`: 包含应用程序的所有页面和布局组件。
- `src/component`: 包含应用程序中使用的所有可复用组件。
- `src/db`: 包含数据库相关的配置和操作。
- `src/middleware.ts`: 包含中间件配置，用于处理请求和响应。
- `src/pages/api`: 包含所有 API 路由。
- `src/reducer`: 包含 Redux 状态管理相关的切片。
- `src/store.tsx`: 包含 Redux 状态管理的配置和创建 Redux 存储。
- `src/tools`: 包含各种工具函数，如 Axios 配置、JWT 处理、日志记录等。

## 学习更多

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的功能和 API。
- [学习 Next.js](https://nextjs.org/learn) - 一个交互式的 Next.js 教程。

您还可以查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js) - 您的反馈和贡献是受欢迎的！

## 部署

最简单的部署 Next.js 应用程序的方式是使用 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 由 Next.js 的创建者提供。

查看我们的 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 以获取更多详细信息。

## 注意

请确保在使用本项目时遵守所有适用的法律法规，并确保用户数据的隐私和安全。

---

## 详细说明

### 项目结构

项目的文件和目录结构如下：

- `.env`: 环境变量文件。
- `next.config.mjs`: Next.js 的配置文件。
- `package.json` 和 `package-lock.json`: 包含项目的依赖和脚本。
- `public`: 包含静态文件，如图片、样式表等。
- `src`: 包含应用程序的源代码。
    - `app`: 包含页面组件和全局样式。
    - `component`: 包含可复用的 UI 组件。
    - `db`: 包含数据库操作。
    - `middleware.ts`: 包含中间件逻辑，用于请求处理。
    - `pages/api`: 包含 API 路由。
    - `reducer`: 包含 Redux 状态管理切片。
    - `store.tsx`: 包含 Redux 存储。
    - `tools`: 包含工具函数。
- `tsconfig.json`: TypeScript 配置文件。

### 核心功能

- **用户管理**: 用户可以登录和注册。中间件会检查用户的访问权限，并根据需要重定向用户。
- **药品管理**: 用户可以添加、更新、删除和查看药品信息。
- **库存管理**: 用户可以管理药品的库存，包括上传和更新库存信息。
- **通知系统**: 用户可以查看系统通知。
- **日志系统**: 记录用户的操作日志。

### 中间件

中间件用于检查用户的 IP 地址和 cookies 中的令牌，以确保用户有权访问特定的路由。如果用户没有权限，中间件将重定向用户到登录页面。

### API 路由

API 路由用于处理与药品、库存、通知等相关的请求。

### 状态管理

使用 Redux 进行状态管理，包含主题和用户相关的切片。

### 工具函数

包含 Axios 配置、JWT 处理、日志记录等工具函数，以简化开发过程。

## 结论

本项目是一个功能完善的药品管理系统，适用于需要管理药品信息和库存的用户。通过 Next.js 框架，项目提供了快速、可靠且安全的服务。