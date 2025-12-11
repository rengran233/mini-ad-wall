import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from '@koa/bodyparser';
import serve from 'koa-static';
import mount from 'koa-mount'; 
import adRoutes from './routes/adRoutes.js'; 
import { envConfig } from './config/env';

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

// 兜底路由，当前端访问根路径时返回一个简单的 JSON
app.use(async (ctx, next) => {
  if (ctx.path === '/' && ctx.method === 'GET') {
    ctx.body = { message: 'Mini Ad Wall API is running' };
  } else {
    await next();
  }
});

export default app;
