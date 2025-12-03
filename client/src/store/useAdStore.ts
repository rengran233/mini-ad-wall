// src/store/useAdStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Ad, AdFormData } from '@/types';
import { sortAds } from '@/utils/ranking';

interface AdState {
  ads: Ad[];
  
  // Actions
  addAd: (adData: AdFormData) => void;
  updateAd: (id: string, adData: AdFormData) => void;
  deleteAd: (id: string) => void;
  incrementClick: (id: string) => void;
}

export const useAdStore = create<AdState>()(
  persist(
    (set) => ({
      ads: [],

      addAd: (adData) => set((state) => {
        const newAd: Ad = {
          ...adData,
          id: crypto.randomUUID(), // 生成唯一ID
          clicked: 0,
          createdAt: Date.now(),
        };
        // 新增后立即排序
        return { ads: sortAds([newAd, ...state.ads]) };
      }),

      updateAd: (id, adData) => set((state) => {
        const updatedAds = state.ads.map((ad) => 
          ad.id === id ? { ...ad, ...adData } : ad
        );
        // 修改出价可能影响排序，需重新排序
        return { ads: sortAds(updatedAds) };
      }),

      deleteAd: (id) => set((state) => ({
        ads: state.ads.filter((ad) => ad.id !== id)
      })),

      incrementClick: (id) => set((state) => {
        const updatedAds = state.ads.map((ad) => 
          ad.id === id ? { ...ad, clicked: ad.clicked + 1 } : ad
        );
        // 点击数变化会影响分数，必须重新排序 [cite: 47, 77]
        return { ads: sortAds(updatedAds) };
      }),
    }),
    {
      name: 'mini-ad-storage', // localStorage 中的 key 名称
      storage: createJSONStorage(() => localStorage), // 显式指定存储介质
    }
  )
);