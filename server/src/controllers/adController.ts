import type { Context } from 'koa';
import prisma from '../db/index'; 
import { AD_FORM_SCHEMA } from '../constants/formSchema';
import fs from 'fs'; 
import path from 'path';
import { envConfig } from '../config/env';

// 复用一下简单的排序算法逻辑
const calculateScore = (pricing: number, clicked: number): number => {
  return pricing + (pricing * clicked * 0.42);
};

// ------ 处理视频文件移动 ------
const processVideoFile = (videoUrl: string | null | undefined): string | null | undefined => {
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

      ctx.body = {
        code: 0,
        data: sortedAds,
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
      const finalVideoUrl = processVideoFile(body.video);

      const newAd = await prisma.ad.create({
        data: {
          title: body.title,
          publisher: body.publisher || '匿名',
          content: body.content,
          url: body.url,
          pricing: parseFloat(body.pricing), // 确保是数字
          video: finalVideoUrl,
          clicked: 0,
        }
      });

      ctx.body = {
        code: 0,
        data: newAd,
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

      // 处理视频文件移动 (如果用户上传了新视频)
      const finalVideoUrl = processVideoFile(body.video);

      const updatedAd = await prisma.ad.update({
        where: { id },
        data: {
          title: body.title,
          publisher: body.publisher,
          content: body.content,
          url: body.url,
          pricing: body.pricing ? parseFloat(body.pricing) : undefined,
          video: finalVideoUrl,
        }
      });

      ctx.body = {
        code: 0,
        data: updatedAd,
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

      if (ad.video) {
        try {
          // 关键步骤：查询数据库中是否还有其他广告使用了同一个视频 URL
          const usageCount = await prisma.ad.count({
            where: {
              video: ad.video,
              // 排除当前正在删除的这条广告 ID (虽然逻辑上 count 包含它就是 >=1，不包含就是 >=0，这里直接查总数更直观)
            }
          });

          // 只有当数据库中只有 1 条记录（也就是当前这条）使用该视频时，才物理删除文件
          // 如果 usageCount > 1，说明是副本，只删数据库记录，保留文件
          if (usageCount <= 1) {
            const fileName = ad.video.split('/').pop();
            if (fileName) {
              const filePath = path.join(process.cwd(), 'uploads', fileName);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Deleted video file: ${filePath}`);
              }
            }
          } else {
            console.log(`Skipped file deletion. Video is used by ${usageCount} ads.`);
          }
        } catch(err) {
          // 文件删除失败也不应该阻止数据库记录删除
          console.error('Failed to delete video file:', err);
        }
      }

      // ------ 删除数据库记录 ------
      await prisma.ad.delete({
        where: { id }
      });
      
      ctx.body = {
        code: 0,
        message: 'Ad deleted successfully'
      };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = { code: 500, message: 'Failed to delete ad' };
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

      ctx.body = {
        code: 0,
        data: updatedAd,
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