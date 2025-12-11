import dotenv from 'dotenv';
import path from 'path';

// 加载 .env 文件
dotenv.config();

// 辅助函数：确保必要的环境变量存在
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const envConfig = {
  // 服务端口
  port: parseInt(getEnv('PORT', '3000'), 10),
  
  // 基础 URL
  baseUrl: getEnv('BASE_URL', 'http://localhost:3000'),
  
  // 上传目录配置
  upload: {
    // 正式目录
    // 目录名 (相对路径，用于 multer)
    dirName: getEnv('UPLOAD_DIR', 'uploads'),
    // 绝对路径 (用于 fs 操作)
    absolutePath: path.join(process.cwd(), getEnv('UPLOAD_DIR', 'uploads')),
    // URL 前缀 (用于访问)
    urlPrefix: '/uploads',

    // 临时目录 
    tempDirName: getEnv('TEMP_UPLOAD_DIR', 'temp_uploads'),
    tempAbsolutePath: path.join(process.cwd(), getEnv('TEMP_UPLOAD_DIR', 'temp_uploads')),
    tempUrlPrefix: '/temp_uploads'
  },
  
  // 数据库配置 (如果需要在代码中读取)
  db: {
    url: getEnv('DATABASE_URL')
  }
};