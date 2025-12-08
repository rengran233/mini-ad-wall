import { useEffect, useRef } from 'react';
import { Modal, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import type { Ad } from '@/types';
import styles from './VideoModal.module.scss'; // 稍后定义样式

interface VideoModalProps {
  ad: Ad | null; // 如果为 null，说明没打开
  onClose: () => void;
}

const VideoModal = ({ ad, onClose }: VideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // 当弹窗打开时，自动播放
  useEffect(() => {
    if (ad && videoRef.current) {
      videoRef.current.play().catch(() => {
        // 自动播放失败（浏览器策略），静音重试
        videoRef.current!.muted = true;
        videoRef.current!.play();
      });
    }
  }, [ad]);

  const handleEnded = () => {
    if (!ad) return;
    // 播放结束，直接跳转
    window.open(ad.url, '_blank');
    onClose();
  };

  const handleJump = () => {
    if (!ad) return;
    window.open(ad.url, '_blank');
    onClose();
  };

  return (
    <Modal
      open={!!ad}
      onCancel={onClose}
      footer={null} // 不需要默认的底部按钮
      destroyOnClose // 关闭时销毁 DOM，停止播放
      centered
      width={800} // 大屏体验
      className={styles.modal} // 自定义样式去黑边
    >
      {ad && (
        <div className={styles.container}>
          <video
            ref={videoRef}
            src={ad.video}
            controls
            className={styles.video}
            onEnded={handleEnded}
          />
          {/* 添加一个悬浮按钮，允许用户提前跳转 */}
          <Button 
            type="primary" 
            shape="round" 
            icon={<ArrowRightOutlined />} 
            className={styles.jumpBtn}
            onClick={handleJump}
          >
            访问落地页
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default VideoModal;