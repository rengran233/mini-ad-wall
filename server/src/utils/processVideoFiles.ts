import path from 'path';
import fs from 'fs'; 
import { envConfig } from '../config/env';

// ------ 处理视频文件移动 ------
const processVideoFiles = (videoUrls: string[] | null | undefined): string[] | null | undefined => {
    if (!videoUrls || !Array.isArray(videoUrls)) return [];
  
    return videoUrls.map(videoUrl => {
      if (!videoUrl) return videoUrl;
      // 检查 URL 是否指向临时目录
      if (videoUrl.includes(envConfig.upload.tempUrlPrefix)) {
        try {
          // 从 URL 中提取文件名
          const fileName = path.basename(videoUrl);
          
          const tempPath = path.join(envConfig.upload.tempAbsolutePath, fileName);
          const finalPath = path.join(envConfig.upload.absolutePath, fileName);
    
          // 如果临时文件存在，移动它
          if (fs.existsSync(tempPath)) {
            // 移动文件 (renameSync 在同一分区下是原子操作，相当于 mv)
            fs.renameSync(tempPath, finalPath);
            console.log(`Moved file from temp to final: ${fileName}`);
            
            // 返回新的正式 URL
            return `${envConfig.baseUrl}${envConfig.upload.urlPrefix}/${fileName}`;
          }
        } catch (error) {
          console.error('Error moving video file:', error);
          // 如果移动失败，为了数据完整性，可能选择抛错或者保留原样
          // 这里选择保留原样，虽然文件可能还在临时目录，但至少不会崩
        }
      }
      // 如果已经是正式目录的 URL，或者不是本站 URL，直接返回
      return videoUrl;
    })
  };

export default processVideoFiles;