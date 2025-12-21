import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from '@koa/bodyparser';
import serve from 'koa-static';
import mount from 'koa-mount'; 
import adRoutes from './routes/adRoutes.js'; 
import { envConfig } from './config/env';
import path from 'path';
import fs from 'fs';

const app = new Koa();

// ------ 静态资源服务 ------
// 访问 http://localhost:3000/uploads/xxx.mp4 -> 映射到本地 uploads/xxx.mp4
app.use(mount(envConfig.upload.urlPrefix, serve(envConfig.upload.absolutePath)));
app.use(mount(envConfig.upload.tempUrlPrefix, serve(envConfig.upload.tempAbsolutePath)));

// ------ 通用中间件 ------
app.use(cors());
app.use(bodyParser());

// ------ 注册路由 ------
app.use(adRoutes.routes()).use(adRoutes.allowedMethods());

const staticPath = path.join(__dirname, '../public'); // 根据你的实际目录调整路径
app.use(serve(staticPath));

// 处理 SPA 页面刷新 (History Fallback)
// 只有 React Router 前端路由需要这步，防止刷新页面报 404
app.use(async (ctx, next) => {
  // 如果前面的中间件（API和静态资源）都没处理这个请求
  // 并且请求的不是 /api 开头的（说明不是数据接口）
  if (ctx.status === 404 && !ctx.path.startsWith('/api')) {
    // 无论用户请求 /ads 还是 /login，统统返回 index.html
    // 让前端 React 代码自己去解析路由
    ctx.type = 'html';
    ctx.body = fs.createReadStream(path.join(staticPath, 'index.html'));
  }
});

// // 兜底路由，当前端访问根路径时返回一个简单的 JSON
// app.use(async (ctx, next) => {
//   if (ctx.path === '/' && ctx.method === 'GET') {
//     ctx.body = { message: 'Mini Ad Wall API is running' };
//   } else {
//     await next();
//   }
// });

export default app;
