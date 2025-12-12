import { Modal, Button } from 'antd';
import { ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Ad } from '@/types';
import { useVideoModal } from './useVideoModal';
import styles from './VideoModal.module.scss'; // 稍后定义样式

interface VideoModalProps {
  ad: Ad | null; // 如果为 null，说明没打开
  onClose: () => void;
}

const VideoModal = ({ ad, onClose }: VideoModalProps) => {
  const { videoRef, showEndCard, handlers, currentSrc } = useVideoModal(ad, onClose);

  return (
    <Modal
      open={!!ad}
      onCancel={onClose}
      footer={null} // 不需要默认的底部按钮
      destroyOnHidden // 关闭时销毁 DOM，停止播放
      centered
      width={800} // 大屏
      className={styles.modal} // 自定义样式去黑边
    >

      {ad && (
        <div className={styles.container}>
          <video
            ref={videoRef}
            src={currentSrc}
            controls={!showEndCard} // 显示结算层时隐藏原生控件
            className={styles.video}
            onEnded={handlers.onEnded}
          />

          {/* 添加一个悬浮按钮，允许用户提前跳转 */}
          <Button 
            type="primary" 
            shape="round" 
            icon={<ArrowRightOutlined />} 
            className={styles.jumpBtn}
            onClick={handlers.onJump}
          >
            访问落地页
          </Button>

          {/* 结算遮罩层 */}
          {showEndCard && (
            <div className={styles.endCardOverlay}>
              <div className={styles.content}>
                <h3>了解更多信息？</h3>
                <div className={styles.buttons}>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handlers.onReplay}
                    size="large"
                    ghost // 透明幽灵按钮
                  >
                    重播
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<ArrowRightOutlined />} 
                    onClick={handlers.onJump}
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