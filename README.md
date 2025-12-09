# Mini Ad Wall (极简广告墙)

## 1\. 项目简介

本项目为字节跳动前端训练营的课题作业。目标是实现一个极简版的广告平台，支持广告的展示、创建、编辑、投放、竞价排序等核心功能。

项目采用前后端分离架构，前端负责交互与展示，后端提供RESTful API及数据持久化服务，数据存储使用本地SQLite。

## 2. 核心功能

*   **竞价排名系统**: 基于出价与热度的加权算法自动排序。
*   **服务端驱动UI**: 广告创建表单由后端 Schema 动态下发，前端根据配置自动渲染组件（支持 Input, TextArea, VideoUpload 等）。
*   **视频素材管理**:
    *   支持视频文件上传与预览。
    *   **智能删除策略**: 采用引用计数机制，防止删除广告时误删被其他副本共享的视频文件。
    *   沉浸式视频播放体验（结算卡片）。
*   **高效数据同步**: 使用**React Query**存储服务端数据，实现服务端状态的自动缓存、去重与后台更新。

## 3\. 技术选型

### 前端 (Client)

  * **核心框架**: React 18 + TypeScript
  * **构建工具**: Vite
  * **UI 组件库**: Ant Design
  * **状态管理**: **TanStack Query (React Query)** - 处理服务端状态
  * **样式方案**: CSS Modules + SCSS
  * **HTTP 请求**: Axios
  * **路由**: React Router

### 后端 (Server)

  * **运行时**: Node.js
  * **Web 框架**: Koa 2
  * **数据库**: SQLite (本地文件数据库)
  * **ORM**: Prisma 5 (提供类型安全的数据库操作)
  * **文件处理**: `@koa/multer` (上传) + `koa-static` (静态资源托管)
  * **开发工具**: tsx (运行TS)

## 4\. 目录结构
```text
.
├── client/                 # 前端项目
│   ├── src/
│   │   ├── api/            # API接口封装
│   │   ├── components/     # 通用组件
│   │   ├── layouts/        # 布局组件 (MainLayout)
│   │   ├── pages/          # 页面组件 (AdList)
│   │   └── types/          # TS类型定义
│   └── ...
├── server/                 # 后端项目
│   ├── prisma/             # 数据库模型与迁移文件
│   ├── src/
│   │   ├── config/         # 环境配置
│   │   ├── constants/      # 常量 (表单Schema定义)
│   │   ├── controllers/    # 业务逻辑控制器
│   │   └── routes/         # 路由定义
│   └── uploads/            # [可自动生成]视频文件存储目录
└── ...
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