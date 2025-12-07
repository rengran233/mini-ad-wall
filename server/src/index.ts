import Koa from 'koa';
import bodyParser from '@koa/bodyparser';
import cors from '@koa/cors';
import adRoutes from './routes/adRoutes.js'; // 引入路由
import serve from 'koa-static'; // [新增]
import mount from 'koa-mount'; 
import path from 'path';
import fs from 'fs';

// 确保上传目录存在
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const app = new Koa();

// 1. 中间件
// 访问 http://localhost:3000/uploads/xxx.mp4 -> 映射到本地 uploads/xxx.mp4
app.use(mount('/uploads', serve(UPLOAD_DIR)));
app.use(cors());
app.use(bodyParser());

// 2. 注册路由
app.use(adRoutes.routes()).use(adRoutes.allowedMethods());

// 3. 兜底路由 (可选，方便确认服务活着)
app.use(async (ctx, next) => {
  if (ctx.path === '/' && ctx.method === 'GET') {
    ctx.body = { message: 'Mini Ad Wall API is running' };
  } else {
    await next();
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});