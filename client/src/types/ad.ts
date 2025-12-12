/**
 * 广告核心数据结构
 */
export interface Ad {
    id: string;
    title: string;
    publisher: string;
    content: string;
    url: string;
    pricing: number;
    // video?: string;
    video?: string[]; // 支持多视频上传
    clicked: number;
    createdAt: number; // 前端使用 number (timestamp), 后端 prisma 返回可能是 string/Date，需注意转换
  }
  
  /**
   * 表单数据结构
   */
  export type AdFormData = Omit<Ad, 'id' | 'clicked' | 'createdAt'> & {
    // 辅助字段，用于 Upload 组件
    video_file?: any[]; 
  }