import { Empty, Spin } from 'antd'; // 引入 Spin 组件
import MainLayout from '@/layouts/MainLayout';
import { AdCard, AdModal, VideoModal } from '@/components';
import { useAdList } from './useAdList';
import styles from './AdList.module.scss';

const AdList = () => {
  // 1. 解构新增的 isLoading
  const { ads, isLoading, modal, videoModal, actions } = useAdList();

  // 2. 封装内容渲染逻辑
  const renderContent = () => {
    // 如果正在首次加载，显示居中的 Loading
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div>正在加载广告数据</div>
        </div>
      );
    }

    // 如果没有数据
    if (ads.length === 0) {
      return (
        <Empty 
          description="暂无广告，快去创建第一条吧！" 
          className={styles.emptyState} 
        />
      );
    }

    // 渲染列表
    return (
      <div className={styles.grid}>
        {ads.map((ad) => (
          <AdCard
            key={ad.id}
            ad={ad}
            onEdit={actions.onEdit}
            onCopy={actions.onCopy}
            onDelete={actions.onDelete}
            onClick={actions.onClick}
          />
        ))}
      </div>
    );
  };

  return (
    <MainLayout onAddClick={actions.onAdd}>
      {/* 广告内容 */}
      {renderContent()}
      {/* 表单 */}
      <AdModal
        title={modal.title}
        open={modal.isOpen}
        onCancel={modal.close}
        onSubmit={modal.submit}
        initialValues={modal.initialValues}
        confirmLoading={modal.isSubmitting} // 3. 传入提交 loading 状态
      />
      {/* [新增] 视频播放弹窗 */}
      <VideoModal 
        ad={videoModal.ad}
        onClose={videoModal.close}
      />
    </MainLayout>
  );
};

export default AdList;