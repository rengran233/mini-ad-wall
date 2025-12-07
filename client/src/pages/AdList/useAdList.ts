import { useState } from 'react';
import { Modal, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adApi } from '@/api/ads';
import type { Ad, AdFormData } from '@/types';

export const useAdList = () => {
  const queryClient = useQueryClient();

  // --- 1. 查询数据 (替代 useAdStore.ads) ---
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['ads'], // 缓存的唯一 key
    queryFn: adApi.getAds,
  });

  // --- 2. 定义修改动作 (替代 useAdStore actions) ---
  
  // 通用的成功回调：刷新列表
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['ads'] });
  };

  const createMutation = useMutation({
    mutationFn: adApi.createAd,
    onSuccess: () => {
      message.success('创建成功');
      onSuccess();
      setIsModalOpen(false); // 关闭弹窗
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdFormData }) => adApi.updateAd(id, data),
    onSuccess: () => {
      message.success('更新成功');
      onSuccess();
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adApi.deleteAd,
    onSuccess: () => {
      message.success('删除成功');
      onSuccess();
    },
  });

  const clickMutation = useMutation({
    mutationFn: adApi.clickAd,
    onSuccess: () => {
      // 点击不提示 message，体验更好，但需要刷新列表(更新热度)
      onSuccess();
    },
  });

  // --- 3. 弹窗 UI 状态 (保持不变) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<AdFormData | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  // --- 4. 事件处理函数 (逻辑微调) ---

  const openAddModal = () => {
    setEditingId(null);
    setInitialValues(null);
    setModalTitle('新增广告');
    setIsModalOpen(true);
  };

  const openEditModal = (ad: Ad) => {
    setEditingId(ad.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, clicked, createdAt, ...formData } = ad;
    setInitialValues(formData);
    setModalTitle('编辑广告');
    setIsModalOpen(true);
  };

  const openCopyModal = (ad: Ad) => {
    setEditingId(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, clicked, createdAt, ...formData } = ad;
    setInitialValues({ ...formData, title: `${formData.title} (副本)` });
    setModalTitle('复制广告');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条广告吗？',
      onOk: () => deleteMutation.mutate(id), // 调用 mutation
    });
  };

  const handleAdClick = (id: string, url: string) => {
    clickMutation.mutate(id); // 调用 mutation
    window.open(url, '_blank');
  };

  const handleFormSubmit = (values: AdFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  // --- 5. 返回 ---
  return {
    ads, // 现在的数据来自后端
    isLoading, // 暴露加载状态
    modal: {
      isOpen: isModalOpen,
      title: modalTitle,
      initialValues,
      close: () => setIsModalOpen(false),
      submit: handleFormSubmit,
      isSubmitting: createMutation.isPending || updateMutation.isPending, // 暴露提交 loading
    },
    actions: {
      onAdd: openAddModal,
      onEdit: openEditModal,
      onCopy: openCopyModal,
      onDelete: handleDelete,
      onClick: handleAdClick,
    },
  };
};