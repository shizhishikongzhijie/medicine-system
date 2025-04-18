# 药品管理系统

![Semi Design 风格](https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/semi-bg.jpg)

## 项目简介

基于 Next.js 14 构建的现代药品管理系统，集成以下核心功能：

- 🧑⚕️ 药品全生命周期管理（CRUD）
- 📦 实时库存追踪与预警
- 🔐 JWT 鉴权与 RBAC 权限体系
- 📊 操作日志审计追踪
- 🔔 系统通知管理
- 🌓 主题切换功能

**技术栈**：  
Next.js 14 | TypeScript 5 | Redux Toolkit | Semi Design | MySQL | Redis | Axios | 

## 功能亮点

### 系统架构

![架构图](https://via.placeholder.com/800x400.png/007ACC/fff?text=System+Architecture)

### 核心模块

| 模块    | 技术实现                      | 关键特性             |
|-------|---------------------------|------------------|
| 认证授权  | JWT + Redis 会话管理          | 双Token自动刷新机制     |
| 权限管理  | RBAC 模型                   | 动态路由权限校验         |
| 数据持久化 | MySQL 关系型存储               | Sequelize ORM 管理 |
| 缓存加速  | Redis 热点数据缓存              | 自动缓存失效策略         |
| 状态管理  | Redux Toolkit + RTK Query | 自动生成API客户端       |
| UI组件库 | Semi Design 企业级组件库        | 深色/浅色主题适配        |

## 项目结构
```plaintext
.
├── src
│ ├── app/ # App Router 路由
│ ├── components/ # 可复用组件
│ │ ├── Page/ # 页面级组件
│ │ └── layout/ # 全局布局组件
│ ├── db/ # 数据库配置
│ ├── pages/api/ # API 路由
│ │ ├── auth/ # 认证相关
│ │ ├── medicine/ # 药品管理
│ │ └── stock/ # 库存管理
│ ├── reducer/ # Redux切片
│ ├── tools/ # 工具类
│ │ ├── axios/ # 封装请求实例
│ │ ├── jwt/ # Token处理
│ │ └── redis/ # 缓存管理
└───└── middleware.ts # 全局中间件
```

## 快速开始

### 环境准备

1. 安装依赖

   ```bash
      npm install
   ```

2. 配置环境变量
   cp .env.example .env.local
   `.env.local` 配置示例：
```ini
   DATABASE_URL=mysql://user:pass@localhost:3306/med_system
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_secure_secret
   NEXTAUTH_URL=http://localhost:3000
```


### 开发运行

```bash
npm run dev
```

### 生产构建

```bash
npm run build && npm start
```

