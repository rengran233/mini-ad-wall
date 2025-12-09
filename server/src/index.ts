import fs from 'fs';
import path from 'path';
import app from './app'; // 导入配置好的 app

const PORT = 3000;

// ------ 环境准备 ------
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  console.log(`Creating upload directory: ${UPLOAD_DIR}`);
  fs.mkdirSync(UPLOAD_DIR);
}

// ------ 启动服务 ------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`- Uploads: http://localhost:${PORT}/uploads/`);
  console.log(`- API:     http://localhost:${PORT}/ads`);
});
