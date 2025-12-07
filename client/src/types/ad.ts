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
    video?: string; // 进阶任务2新增
    clicked: number;
    createdAt: number; // 前端使用 number (timestamp), 后端 prisma 返回可能是 string/Date，需注意转换
  }
  
  /**
   * 表单数据结构
   */
  export type AdFormData = Omit<Ad, 'id' | 'clicked' | 'createdAt'>;