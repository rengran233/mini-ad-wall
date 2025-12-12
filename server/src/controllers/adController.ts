import type { Context } from 'koa';
import prisma from '../db/index'; 
import { AD_FORM_SCHEMA } from '../constants/formSchema';
import fs from 'fs'; 
import path from 'path';
import { envConfig } from '../config/env';
import { calculateScore } from '../utils';

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

// [新增] 辅助函数：解析数据库中的 video 字段
// 兼容旧数据(纯字符串)和新数据(JSON数组字符串)
const parseVideoField = (videoField: string | null): string[] => {
  if (!videoField) return [];
  try {
    const parsed = JSON.parse(videoField);
    return Array.isArray(parsed) ? parsed : [videoField];
  } catch (e) {
    // 如果解析失败，说明是旧格式的单 URL 字符串
    return [videoField];
  }
};

export const AdController = {
  async getFormSchema(ctx: Context) {
    ctx.body = {
      code: 0,
      data: AD_FORM_SCHEMA, 
      message: 'Success'
    };
  },

  // ------ 操作数据库 ------
  // 1. 获取广告列表 (GET /ads)
  async getAds(ctx: Context) {
    try {
      // 从数据库查出所有广告
      const ads = await prisma.ad.findMany();
      
      // 在内存中进行竞价排序 (和前端逻辑保持一致)
      const sortedAds = ads.sort((a, b) => {
        const scoreA = calculateScore(a.pricing, a.clicked);
        const scoreB = calculateScore(b.pricing, b.clicked);
        return scoreB - scoreA; // 降序
      });

      // [修改] 格式化返回数据，将 video 字符串转为数组
      const formattedAds = sortedAds.map(ad => ({
        ...ad,
        video: parseVideoField(ad.video)
      }));

      ctx.body = {
        code: 0,
        data: formattedAds,
        message: 'Success'
      };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = { code: 500, message: 'Failed to fetch ads' };
    }
  },

  // 2. 创建广告 (POST /ads)
  async createAd(ctx: Context) {
    try {
      // Koa-bodyparser 会把数据解析到 ctx.request.body
      const body = ctx.request.body;

      // 简单校验
      if (!body.title || !body.content || !body.url || body.pricing === undefined) {
        ctx.status = 400;
        ctx.body = { code: 400, message: 'Missing required fields' };
        return;
      }

      // 处理视频文件移动
      // [修改] 接收数组，处理文件，存为 JSON 字符串
      // 前端传来的 body.video 应该是一个 URL 数组
      const videoList = Array.isArray(body.video) ? body.video : (body.video ? [body.video] : []);
      const finalVideoUrls = processVideoFiles(videoList);

      const newAd = await prisma.ad.create({
        data: {
          title: body.title,
          publisher: body.publisher || '匿名',
          content: body.content,
          url: body.url,
          pricing: parseFloat(body.pricing), // 确保是数字
          video: JSON.stringify(finalVideoUrls),
          clicked: 0,
        }
      });

      // 返回给前端时转回数组
      const responseData = { ...newAd, video: finalVideoUrls };

      ctx.body = {
        code: 0,
        data: responseData,
        message: 'Ad created successfully'
      };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = { code: 500, message: 'Failed to create ad' };
    }
  },

  // 3. 编辑广告 (PUT /ads/:id)
  async updateAd(ctx: Context) {
    try {
      const { id } = ctx.params;
      const body = ctx.request.body;

      // [修改] 处理视频列表
      let finalVideoJson = undefined;
      if (body.video !== undefined) {
        const videoList = Array.isArray(body.video) ? body.video : (body.video ? [body.video] : []);
        const finalVideoUrls = processVideoFiles(videoList);
        finalVideoJson = JSON.stringify(finalVideoUrls);
      }

      const updatedAd = await prisma.ad.update({
        where: { id },
        data: {
          title: body.title,
          publisher: body.publisher,
          content: body.content,
          url: body.url,
          pricing: body.pricing ? parseFloat(body.pricing) : undefined,
          video: finalVideoJson,
        }
      });

      // 增加解析逻辑
      const responseData = {
        ...updatedAd,
        video: parseVideoField(updatedAd.video)
      };

      ctx.body = {
        code: 0,
        data: responseData,
        message: 'Ad updated successfully'
      };
    } catch (error) {
      console.error(error);
      ctx.status = 500; // 这里的简单处理，如果是 id 不存在 prisma 会抛错
      ctx.body = { code: 500, message: 'Failed to update ad' };
    }
  },

  // 4. 删除广告 (DELETE /ads/:id)
  async deleteAd(ctx: Context) {
    try {
      const { id } = ctx.params;

      // ------ 先处理视频文件删除 ------
      // 查询广告信息，获取视频URL
      const ad = await prisma.ad.findUnique({
        where: { id }
      })

      if (!ad) {
        ctx.status = 404;
        ctx.body = { code: 404, message: 'Ad not found' };
        return;
      }

      // 智能删除逻辑：支持多视频引用计数
      const videosToDelete = parseVideoField(ad.video);

      if (videosToDelete.length > 0) {
        // 遍历当前广告的每个视频
        for (const videoUrl of videosToDelete) {
          // 查询数据库中，除了当前广告(id: { not: id })之外，
          // 是否还有其他广告的 video 字段包含这个 URL 字符串
          const usageCount = await prisma.ad.count({
            where: {
              id: { not: id }, // 排除自己
              video: { contains: videoUrl } // 模糊匹配 URL
            }
          });

          // 如果计数为 0，说明没有其他广告在使用这个视频，可以安全删除
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

      // 执行删除广告记录
      await prisma.ad.delete({ where: { id } });
      ctx.body = { code: 0, message: 'Ad deleted successfully' };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = {code: 500, message: 'Failed to delete ad' };
    }
  },

  // 5. 点击广告 (POST /ads/:id/click)
  async clickAd(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      // Prisma 原子操作：直接 +1，不仅原子安全，还能避免先查后改的麻烦
      const updatedAd = await prisma.ad.update({
        where: { id },
        data: {
          clicked: { increment: 1 }
        }
      });

      // 必须像 getAds 一样解析 video 字段，否则前端接收到的是 JSON 字符串
      const responseData = {
        ...updatedAd,
        video: parseVideoField(updatedAd.video)
      };

      ctx.body = {
        code: 0,
        data: responseData,
        message: 'Click count incremented'
      };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = { code: 500, message: 'Failed to register click' };
    }
  },

  async uploadFile(ctx: Context) {
    // @koa/multer 会把文件信息挂载到 ctx.request.file (注意是 file 不是 files，因为是 single)
    const file = (ctx.request as any).file; 
    if (!file) {
      ctx.status = 400;
      ctx.body = { code: 400, message: 'No file uploaded' };
      return;
    }

    // 返回临时URL
    const fileUrl = `${envConfig.baseUrl}${envConfig.upload.tempUrlPrefix}/${file.filename}`;
    
    ctx.body = {
      code: 0,
      data: { url: fileUrl },
      message: 'Upload success'
    };
  },
};