// src/types/index.ts

/**
 * 广告核心数据结构
 * 对应文档中的"广告列表"及 CRUD 操作对象
 */
export interface Ad {
    /** 唯一标识 (UUID) */
    id: string;
    
    /** 广告标题 */
    title: string;
    
    /** 发布者信息 (如: 字节广告君) */
    publisher: string;
    
    /** 广告推广文案 */
    content: string;
    
    /** 落地页 URL */
    url: string;
    
    /** 出价 (用户愿意支付的费用) */
    pricing: number;
    
    /** 热度 (被点击的次数) */
    clicked: number;
    
    /** 创建时间 (用于默认排序或展示) */
    createdAt: number;
  }
  
  /**
   * 创建/编辑广告时的表单数据结构
   * (通常不需要 id, clicked, createdAt)
   */
  export type AdFormData = Omit<Ad, 'id' | 'clicked' | 'createdAt'>;