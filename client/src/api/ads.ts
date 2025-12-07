import axios from 'axios';
import type { Ad, AdFormData } from '@/types';

// 配置基础实例
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // 后端地址
  headers: {
    'Content-Type': 'application/json',
  },
});

// 定义后端返回的标准结构 (根据 Controller 的定义)
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export const adApi = {
  // 1. 获取列表
  getAds: async () => {
    const res = await apiClient.get<ApiResponse<Ad[]>>('/ads');
    return res.data.data;
  },

  // 2. 创建广告
  createAd: async (data: AdFormData) => {
    const res = await apiClient.post<ApiResponse<Ad>>('/ads', data);
    return res.data.data;
  },

  // 3. 编辑广告
  updateAd: async (id: string, data: AdFormData) => {
    const res = await apiClient.put<ApiResponse<Ad>>(`/ads/${id}`, data);
    return res.data.data;
  },

  // 4. 删除广告
  deleteAd: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<null>>(`/ads/${id}`);
    return res.data;
  },

  // 5. 点击计费
  clickAd: async (id: string) => {
    const res = await apiClient.post<ApiResponse<Ad>>(`/ads/${id}/click`);
    return res.data.data;
  },

  // [新增] 上传文件
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // 注意：Content-Type 设为 multipart/form-data 通常由浏览器自动设置，但手动指定也行
    const res = await apiClient.post<{code: number, data: {url: string}}>('/ads/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.url;
  },
};