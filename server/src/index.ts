import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from '@koa/bodyparser';
import cors from '@koa/cors';

const app = new Koa();
const router = new Router();

// 中间件配置
app.use(cors()); // 允许跨域
app.use(bodyParser()); // 解析 JSON Body

// 测试路由
router.get('/', async (ctx) => {
  ctx.body = {
    message: 'Mini Ad Wall Backend is running!',
    status: 'ok',
    timestamp: Date.now()
  };
});

// 注册路由
app.use(router.routes()).use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});