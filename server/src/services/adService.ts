import prisma from '../db/index';
import { calculateScore, parseVideoField, processVideoFiles } from '../utils';
import { envConfig } from '../config/env';
import fs from 'fs';
import path from 'path';

export const AdService = {
  /**
   * 获取广告列表（包含排序和格式化）
   */
  async getAdList() {
    const ads = await prisma.ad.findMany();
    
    // 1. 竞价排序
    const sortedAds = ads.sort((a, b) => {
      const scoreA = calculateScore(a.pricing, a.clicked);
      const scoreB = calculateScore(b.pricing, b.clicked);
      return scoreB - scoreA;
    });

    // 2. 格式化数据 (JSON string -> Array)
    return sortedAds.map(ad => ({
      ...ad,
      video: parseVideoField(ad.video)
    }));
  },

  /**
   * 创建广告
   */
  async createAd(data: any) {
    // 1. 处理视频文件移动 (Temp -> Uploads)
    const videoList = Array.isArray(data.video) ? data.video : (data.video ? [data.video] : []);
    const finalVideoUrls = processVideoFiles(videoList);

    // 2. 创建数据库记录
    const newAd = await prisma.ad.create({
      data: {
        title: data.title,
        publisher: data.publisher || '匿名',
        content: data.content,
        url: data.url,
        pricing: parseFloat(data.pricing),
        video: JSON.stringify(finalVideoUrls), // 存为 JSON 字符串
        clicked: 0,
      }
    });

    // 3. 返回格式化后的数据
    return { ...newAd, video: finalVideoUrls };
  },

  /**
   * 更新广告
   */
  async updateAd(id: string, data: any) {
    let finalVideoJson = undefined;
    
    // 如果更新了视频字段
    if (data.video !== undefined) {
      const videoList = Array.isArray(data.video) ? data.video : (data.video ? [data.video] : []);
      const finalVideoUrls = processVideoFiles(videoList);
      finalVideoJson = JSON.stringify(finalVideoUrls);
    }

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        title: data.title,
        publisher: data.publisher,
        content: data.content,
        url: data.url,
        pricing: data.pricing ? parseFloat(data.pricing) : undefined,
        video: finalVideoJson,
      }
    });

    return { ...updatedAd, video: parseVideoField(updatedAd.video) };
  },

  /**
   * 删除广告（包含文件清理）
   */
  async deleteAd(id: string) {
    const ad = await prisma.ad.findUnique({ where: { id } });
    if (!ad) return false;

    // 检查引用计数并删除文件
    const videosToDelete = parseVideoField(ad.video);
    if (videosToDelete.length > 0) {
      for (const videoUrl of videosToDelete) {
        // 检查其他广告是否在使用此视频
        const usageCount = await prisma.ad.count({
          where: { 
            id: { not: id }, 
            video: { contains: videoUrl } 
          }
        });

        if (usageCount === 0) {
          try {
            const fileName = path.basename(videoUrl);
            const filePath = path.join(envConfig.upload.absolutePath, fileName);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted video file: ${filePath}`);
            }
          } catch (err) {
            console.error('Failed to delete video file:', err);
          }
        }
      }
    }

    await prisma.ad.delete({ where: { id } });
    return true;
  },

  /**
   * 点击广告
   */
  async clickAd(id: string) {
    const updatedAd = await prisma.ad.update({
      where: { id },
      data: { clicked: { increment: 1 } }
    });
    return { ...updatedAd, video: parseVideoField(updatedAd.video) };
  }
};