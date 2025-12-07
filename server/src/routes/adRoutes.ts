import Router from '@koa/router';
import { AdController } from '../controllers/adController';

const router = new Router({ prefix: '/ads' }); // 所有路由前缀都是 /ads

// 定义 restful 路由
router.get('/', AdController.getAds);           // GET /ads
router.post('/', AdController.createAd);        // POST /ads
router.put('/:id', AdController.updateAd);      // PUT /ads/:id
router.delete('/:id', AdController.deleteAd);   // DELETE /ads/:id
router.post('/:id/click', AdController.clickAd); // POST /ads/:id/click

export default router;