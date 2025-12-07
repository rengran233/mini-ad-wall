import { useEffect } from 'react';
import { Form } from 'antd';
import type { AdFormData } from '@/types';

export const useAdModal = (
  open: boolean, 
  initialValues: AdFormData | null | undefined, 
  onSubmit: (values: AdFormData) => void
) => {
  const [form] = Form.useForm();

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

  return {
    form,
    handleOk
  };
};