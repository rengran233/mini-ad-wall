import type { Context } from 'koa';
import prisma from '../db/index'; 
import { AD_FORM_SCHEMA } from '../config/formSchema';

// 复用一下简单的排序算法逻辑
const calculateScore = (pricing: number, clicked: number): number => {
  return pricing + (pricing * clicked * 0.42);
};

export const AdController = {
  async getFormSchema(ctx: Context) {
    ctx.body = {
      code: 0,
      data: AD_FORM_SCHEMA, 
      message: 'Success'
    };
  },

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

      const newAd = await prisma.ad.create({
        data: {
          title: body.title,
          publisher: body.publisher || '匿名',
          content: body.content,
          url: body.url,
          pricing: parseFloat(body.pricing), // 确保是数字
          video: body.video,
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

      const updatedAd = await prisma.ad.update({
        where: { id },
        data: {
          title: body.title,
          publisher: body.publisher,
          content: body.content,
          url: body.url,
          pricing: body.pricing ? parseFloat(body.pricing) : undefined,
          video: body.video,
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

    // 返回可访问的 URL
    const fileUrl = `http://localhost:3000/uploads/${file.filename}`;
    
    ctx.body = {
      code: 0,
      data: { url: fileUrl },
      message: 'Upload success'
    };
  },
};