import type { Context } from 'koa';
import { AD_FORM_SCHEMA } from '../constants/formSchema';
import { envConfig } from '../config/env';
import { AdService } from '../services/adService';

export const AdController = {
  // 获取表单 Schema
  async getFormSchema(ctx: Context) {
    ctx.body = { code: 0, data: AD_FORM_SCHEMA, message: 'Success' };
  },

  // 1. 获取广告列表
  async getAds(ctx: Context) {
    try {
      const ads = await AdService.getAdList();
      ctx.body = { code: 0, data: ads, message: 'Success' };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = { code: 500, message: 'Failed to fetch ads' };
    }
  },

  // 2. 创建广告
  async createAd(ctx: Context) {
    try {
      const body = ctx.request.body;
      // 基础校验
      if (!body.title || !body.content || !body.url || body.pricing === undefined) {
        ctx.status = 400;
        ctx.body = { code: 400, message: 'Missing required fields' };
        return;
      }

      const newAd = await AdService.createAd(body);
      ctx.body = { code: 0, data: newAd, message: 'Ad created successfully' };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = { code: 500, message: 'Failed to create ad' };
    }
  },

  // 3. 编辑广告
  async updateAd(ctx: Context) {
    try {
      const { id } = ctx.params;
      const body = ctx.request.body;
      const updatedAd = await AdService.updateAd(id, body);
      ctx.body = { code: 0, data: updatedAd, message: 'Ad updated successfully' };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = { code: 500, message: 'Failed to update ad' };
    }
  },

  // 4. 删除广告
  async deleteAd(ctx: Context) {
    try {
      const { id } = ctx.params;
      const success = await AdService.deleteAd(id);
      
      if (!success) {
        ctx.status = 404;
        ctx.body = { code: 404, message: 'Ad not found' };
        return;
      }

      ctx.body = { code: 0, message: 'Ad deleted successfully' };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = { code: 500, message: 'Failed to delete ad' };
    }
  },

  // 5. 点击广告
  async clickAd(ctx: Context) {
    try {
      const { id } = ctx.params;
      const updatedAd = await AdService.clickAd(id);
      ctx.body = { code: 0, data: updatedAd, message: 'Click count incremented' };
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = { code: 500, message: 'Failed to register click' };
    }
  },

  // 6. 上传文件 (保持在 Controller，因为它直接处理 HTTP 文件流响应)
  async uploadFile(ctx: Context) {
    const file = (ctx.request as any).file; 
    if (!file) {
      ctx.status = 400;
      ctx.body = { code: 400, message: 'No file uploaded' };
      return;
    }
    // 返回临时目录 URL
    const fileUrl = `${envConfig.baseUrl}${envConfig.upload.tempUrlPrefix}/${file.filename}`;
    ctx.body = { code: 0, data: { url: fileUrl }, message: 'Upload success' };
  },
};