import Router from '@koa/router';
import { AdController } from '../controllers/adController';
import multer from '@koa/multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = new Router({ prefix: '/ads' }); // 所有路由前缀都是 /ads

// 配置 Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 保存路径
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名: uuid + 原始后缀
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});
const upload = multer({ storage });

// 定义 restful 路由
router.get('/', AdController.getAds);           // GET /ads
router.post('/', AdController.createAd);        // POST /ads
router.put('/:id', AdController.updateAd);      // PUT /ads/:id
router.delete('/:id', AdController.deleteAd);   // DELETE /ads/:id
router.post('/:id/click', AdController.clickAd); // POST /ads/:id/click
router.post('/upload', upload.single('file'), AdController.uploadFile); // POST /ads/upload
router.get('/schema', AdController.getFormSchema); // [新增] GET /ads/schema

export default router;