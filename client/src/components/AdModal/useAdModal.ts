import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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

  // 获取表单配置Schema
  const { data: schema = [], isLoading: isSchemaLoading } = useQuery({
    queryKey: ['adFormSchema'],
    queryFn: adApi.getFormSchema,
    staleTime: 1000 * 60 * 60, // 缓存 1 小时
    enabled: open, // 只有打开弹窗时才请求
  });

  // react query管理状态
  const uploadMutation = useMutation({
    mutationFn: adApi.uploadFile,
    // onSuccess: (url) => {
    //   form.setFieldValue('video', url);
    //   message.success('视频上传成功');
    // },
    onError: () => {
      message.error('视频上传失败，请重试');
    },
  });

  // 监听打开状态并重置/填充表单
  useEffect(() => {
    if (open && !isSchemaLoading) {
      if (initialValues) {
        form.setFieldsValue(initialValues);

        // [修改] 处理回显：将 URL 数组转换为 Upload 组件需要的 fileList 格式
        const videoUrls = initialValues.video || [];
        const fileList = videoUrls.map((url, index) => ({
          uid: `-${index}`, // 负数 ID 防止冲突
          name: `视频 ${index + 1}`,
          status: 'done',
          url: url,
        }));

        form.setFieldsValue({
          ...initialValues,
          video_file: fileList, // 填充 Upload 组件
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form, isSchemaLoading]);


  const handleUploadVideo = (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;
    
    uploadMutation.mutate(file as File, {
      onSuccess: (url) => {
        // 更新fileList和hidden input
        onSuccess?.(url)

        // 获取当前的 video 列表
        const currentVideos = form.getFieldValue('video') || [];
        const newVideos = [...currentVideos, url];
        form.setFieldValue('video', newVideos);
        
        message.success('视频上传成功');
      },
      onError: (err) => onError?.(err),
    });
  };

  // 处理提交逻辑
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 移除辅助字段 video_file，只提交 video (URL数组)
      const { video_file, ...submitData } = values;
      onSubmit(submitData as AdFormData);
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  return {
    form,
    handleOk,
    upload: {
      loading: uploadMutation.isPending,
      handleUpload: handleUploadVideo,
    },
    // 返回 Schema 数据和加载状态
    schema: {
      data: schema,
      loading: isSchemaLoading,
    },
  };
};