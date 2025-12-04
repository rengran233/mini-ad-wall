import { useState } from 'react';
import { Empty, message } from 'antd';
import { useAdStore } from '@/store/useAdStore';
import MainLayout from '@/layouts/MainLayout';
import AdCard from '@/components/AdCard';
import AdModal from '@/components/AdModal';
import type { Ad, AdFormData } from '@/types';

const AdList = () => {
  const { ads, addAd, updateAd, deleteAd, incrementClick } = useAdStore();
  
  // 弹窗状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // 如果有值，则是编辑模式
  const [initialValues, setInitialValues] = useState<AdFormData | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  // 1. 处理新增点击
  const handleAddClick = () => {
    setEditingId(null);
    setInitialValues(null);
    setModalTitle('新增广告');
    setIsModalOpen(true);
  };

  // 2. 处理编辑点击
  const handleEditClick = (ad: Ad) => {
    setEditingId(ad.id);
    const { id, clicked, createdAt, ...formData } = ad; // 排除不需要表单编辑的字段
    setInitialValues(formData);
    setModalTitle('编辑广告');
    setIsModalOpen(true);
  };

  // 3. 处理复制点击
  const handleCopyClick = (ad: Ad) => {
    setEditingId(null); // 复制视为新增，没有 ID
    const { id, clicked, createdAt, ...formData } = ad;
    setInitialValues({ ...formData, title: `${formData.title} (副本)` }); // 贴心地加个后缀
    setModalTitle('复制广告');
    setIsModalOpen(true);
  };

  // 4. 处理删除
  const handleDeleteClick = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条广告吗？',
      onOk: () => {
        deleteAd(id);
        message.success('删除成功');
      }
    });
  };

  // 5. 处理卡片点击（跳转 + 计费）
  const handleCardClick = (id: string, url: string) => {
    incrementClick(id);
    window.open(url, '_blank');
  };

  // 6. 处理表单提交
  const handleSubmit = (values: AdFormData) => {
    if (editingId) {
      updateAd(editingId, values);
      message.success('更新成功');
    } else {
      addAd(values);
      message.success('创建成功');
    }
    setIsModalOpen(false);
  };

  return (
    <MainLayout onAddClick={handleAddClick}>
      {ads.length === 0 ? (
        <Empty description="暂无广告，快去创建第一条吧！" style={{ marginTop: 100 }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {ads.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              onEdit={handleEditClick}
              onCopy={handleCopyClick}
              onDelete={handleDeleteClick}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

      <AdModal
        title={modalTitle}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialValues={initialValues}
      />
    </MainLayout>
  );
};

// 这里的 Modal 是为了 confirm 用的，需要从 antd 引入
import { Modal } from 'antd'; 

export default AdList;