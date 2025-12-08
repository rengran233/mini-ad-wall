import { useEffect, useRef, useState } from 'react';
import { Modal, Button } from 'antd';
import { ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Ad } from '@/types';
import styles from './VideoModal.module.scss'; // 稍后定义样式

interface VideoModalProps {
  ad: Ad | null; // 如果为 null，说明没打开
  onClose: () => void;
}

const VideoModal = ({ ad, onClose }: VideoModalProps) => {
  // [新增] 是否显示结算层
  const [showEndCard, setShowEndCard] = useState(false);

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
    // 播放结束，不跳转，而是显示结算层
    setShowEndCard(true);
    // 退出全屏 (如果浏览器允许 JS 退出)
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // 跳转落地页
  const handleJump = () => {
    if (!ad) return;
    window.open(ad.url, '_blank');
    onClose();
  };

  // 重播视频
  const handleReplay = () => {
    setShowEndCard(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
    <Modal
      open={!!ad}
      onCancel={onClose}
      footer={null} // 不需要默认的底部按钮
      destroyOnHidden // 关闭时销毁 DOM，停止播放
      centered
      width={800} // 大屏体验
      className={styles.modal} // 自定义样式去黑边
    >

      {ad && (
        <div className={styles.container}>
          <video
            ref={videoRef}
            src={ad.video}
            controls={!showEndCard} // 显示结算层时隐藏原生控件
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

          {/* [新增] 结算遮罩层 */}
          {showEndCard && (
            <div className={styles.endCardOverlay}>
              <div className={styles.content}>
                <h3>了解更多信息？</h3>
                <div className={styles.buttons}>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleReplay}
                    size="large"
                    ghost // 透明幽灵按钮
                  >
                    重播
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<ArrowRightOutlined />} 
                    onClick={handleJump}
                    size="large"
                  >
                    立即查看
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default VideoModal;