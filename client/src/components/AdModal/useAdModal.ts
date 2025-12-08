import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import type { UploadProps } from 'antd';
import { adApi } from '@/api/ads';
import type { AdFormData } from '@/types';

// 从 UploadProps 中提取 customRequest 的参数类型
type UploadRequestOption = Parameters<NonNullable<UploadProps['customRequest']>>[0];

export const useAdModal = (
  open: boolean, 
  initialValues: AdFormData | null | undefined, 
  onSubmit: (values: AdFormData) => void
  ) => {
  const [form] = Form.useForm();

  // react query管理状态
  const uploadMutation = useMutation({
    mutationFn: adApi.uploadFile,
    onSuccess: (url) => {
      form.setFieldValue('video', url);
      message.success('视频上传成功');
    },
    onError: () => {
      message.error('视频上传失败，请重试');
    },
  });

  // 监听打开状态并重置/填充表单
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);


  const handleUploadVideo = (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;
    
    uploadMutation.mutate(file as File, {
      onSuccess: (url) => onSuccess?.(url),
      onError: (err) => onError?.(err),
    });
  };

  // 处理提交逻辑
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      // 注意：这里不再重置表单，因为父组件可能会在提交成功后关闭弹窗，
      // 或者在提交失败时保留数据。重置逻辑交给 useEffect(open) 处理更安全。
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  return {
    form,
    handleOk,
    upload: {
      loading: uploadMutation.inPending,
      handleUpload: handleUploadVideo,
    }
  };
};