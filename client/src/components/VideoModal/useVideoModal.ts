import { useState, useEffect, useRef } from 'react';
import type { Ad } from '@/types';

export const useVideoModal = (ad: Ad | null, onClose: () => void) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showEndCard, setShowEndCard] = useState(false);
  // 当前播放的视频 URL
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);

  // 1. 监听广告变化，重置状态并自动播放
  useEffect(() => {
    if (ad) {
      setShowEndCard(false);

      // 随机逻辑
      let src = '';
      if (Array.isArray(ad.video) && ad.video.length > 0) {
        const randomIndex = Math.floor(Math.random() * ad.video.length);
        src = ad.video[randomIndex];
      } else if (typeof ad.video === 'string') {
        src = ad.video;
      }
      setCurrentSrc(src);
      
      // 稍微延迟一点播放，确保 Modal 动画完成且 DOM 已挂载
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {
            // 自动播放被拦截时的兜底策略：静音播放
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [ad]);

  // 2. 视频结束处理
  const handleEnded = () => {
    setShowEndCard(true);
    // 退出全屏 (如果处于全屏状态)
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // 3. 跳转逻辑
  const handleJump = () => {
    if (!ad) return;
    window.open(ad.url, '_blank');
    onClose();
  };

  // 4. 重播逻辑
  const handleReplay = () => {
    setShowEndCard(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return {
    videoRef,
    showEndCard,
    currentSrc,
    handlers: {
      onEnded: handleEnded,
      onJump: handleJump,
      onReplay: handleReplay,
    },
  };
};