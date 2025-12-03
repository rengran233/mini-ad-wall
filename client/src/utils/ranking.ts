// src/utils/ranking.ts
import type { Ad } from '@/types';

/**
 * 计算广告竞价分数
 * 算法公式: 出价 + (出价 * 点击数 * 0.42)
 */
export const calculateScore = (pricing: number, clicked: number): number => {
  return pricing + (pricing * clicked * 0.42);
};

/**
 * 广告排序函数
 * 按照分数从高到低排序
 */
export const sortAds = (ads: Ad[]): Ad[] => {
  return [...ads].sort((a, b) => {
    const scoreA = calculateScore(a.pricing, a.clicked);
    const scoreB = calculateScore(b.pricing, b.clicked);
    return scoreB - scoreA; // 降序排列
  });
};