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
  const [isUploading, setIsUploading] = useState(false);

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

  // 3. [新增] 视频上传逻辑
  // 这个函数将作为 props 传给 UI，UI 不需要知道它是怎么上传的
  const handleUploadVideo = async (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;
    setIsUploading(true);

    try {
      // 调用 API
      const url = await adApi.uploadFile(file as File);
      
      // 逻辑副作用：上传成功后，自动把 URL 填入表单的 'video' 字段
      form.setFieldValue('video', url);
      
      // 通知 UI 上传组件完成
      onSuccess?.(url);
      message.success('视频上传成功');
    } catch (err) {
      onError?.(err as Error);
      message.error('视频上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    form,
    handleOk,
    upload: {
      loading: isUploading,
      handleUpload: handleUploadVideo,
    }
  };
};