/**
 * 广告核心数据结构
 * 对应文档中的"广告列表"及 CRUD 操作对象
 */
export interface Ad {
    id: string;
    title: string;
    publisher: string;
    content: string;
    // 落地页链接
    url: string;
    pricing: number;
    clicked: number;
    createdAt: number;
}
  
/**
 * 创建/编辑广告时的表单数据结构
 * (通常不需要 id, clicked, createdAt)
 */
export type AdFormData = Omit<Ad, 'id' | 'clicked' | 'createdAt'>;