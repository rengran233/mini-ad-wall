# Mini Ad Wall (极简广告墙)

## 1\. 项目简介

本项目是中国商业产品与技术-前端训练营的课题作业。目标是实现一个极简版的广告平台，支持广告的展示、创建、编辑、投放竞价排序等核心功能。

项目采用前后端分离架构，前端负责交互与展示，后端提供 RESTful API 及数据持久化服务。

## 2\. 技术选型

### 前端 (Client)

  * **核心框架**: React 18 + TypeScript
  * **构建工具**: Vite
  * **UI 组件库**: Ant Design v5
  * **状态管理**: Zustand (配合 Persist 中间件实现本地持久化兜底)
  * **样式方案**: CSS Modules + SCSS
  * **路由**: React Router v6 (规划中)

### 后端 (Server)

  * **运行时**: Node.js
  * **Web 框架**: Koa 2
  * **数据库**: SQLite (本地文件数据库)
  * **ORM**: Prisma 5 (提供类型安全的数据库操作)
  * **开发工具**: tsx (原生支持 TS 与 ESM 的运行工具)

## 3\. 目录结构

采用 Monorepo 风格管理：

```text
mini-ad-wall/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/     # 公共组件 (AdCard, AdModal)
│   │   ├── layouts/        # 通用布局
│   │   ├── pages/          # 页面视图 (AdList)
│   │   ├── store/          # Zustand 状态管理
│   │   ├── types/          # TS 类型定义
│   │   └── utils/          # 工具函数 (竞价算法)
│   └── ...
├── server/                 # 后端项目
│   ├── prisma/             # 数据库模型与迁移文件
│   ├── src/
│   │   ├── controllers/    # 业务逻辑层
│   │   ├── routes/         # 路由定义
│   │   └── db/             # 数据库连接实例
│   └── ...
└── README.md
```

## 4\. 快速开始

### 环境要求

  * Node.js \>= 18
  * npm 或 pnpm

### 启动步骤

**1. 初始化后端 (Server)**

```bash
cd server
npm install

# 数据库迁移 (生成 SQLite 文件)
npx prisma migrate dev --name init

# 启动开发服务 (端口 3000)
npm run dev
```

**2. 初始化前端 (Client)**

```bash
# 新开一个终端窗口
cd client
npm install

# 启动开发服务 (端口 5173)
npm run dev
```

访问浏览器 `http://localhost:5173` 即可查看项目。