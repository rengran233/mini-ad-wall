import fs from 'fs';
import app from './app'; 
import { envConfig } from './config/env';

// ------ 环境准备 ------
// 确保上传目录存在
if (!fs.existsSync(envConfig.upload.absolutePath)) {
    console.log(`Creating upload directory: ${envConfig.upload.absolutePath}`);
    fs.mkdirSync(envConfig.upload.absolutePath);
}

// 确保临时目录存在
if (!fs.existsSync(envConfig.upload.tempAbsolutePath)) {
    console.log(`Creating temp upload directory: ${envConfig.upload.tempAbsolutePath}`);
    fs.mkdirSync(envConfig.upload.tempAbsolutePath);
}

// ------ 启动服务 ------
const PORT = process.env.PORT || envConfig.port;
app.listen(PORT, () => {
    console.log(`🚀 Server running at ${envConfig.baseUrl}`);
    console.log(`- Uploads: ${envConfig.baseUrl}${envConfig.upload.urlPrefix}/`);
    console.log(`- API:     ${envConfig.baseUrl}/ads`);
});
