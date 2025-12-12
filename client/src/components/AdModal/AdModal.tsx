import { Upload, Button, Modal, Form, Input, InputNumber, Spin } from 'antd';
import { LoadingOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { AdFormData, FormFieldConfig } from '@/types';
import { useAdModal } from './useAdModal';
import styles from './AdModal.module.scss';

interface AdModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: AdFormData) => void;
  initialValues?: AdFormData | null;
  title: string;
  confirmLoading?: boolean; // 新增属性
}

const AdModal = (props: AdModalProps) => {
  // 解构出 confirmLoading
  const { open, onCancel, onSubmit, initialValues, title, confirmLoading } = props;
  // 从 Hook 获取逻辑与状态
  const { form, handleOk, upload, schema } = useAdModal(open, initialValues, onSubmit);

  // 动态组件渲染器
  const renderFormItem = (field: FormFieldConfig) => {
    const commonProps = { ...field.props };

    switch (field.component) {
      case 'Input':
        return <Input {...commonProps} />;
      case 'TextArea':
        return <Input.TextArea {...commonProps} />;
      case 'InputNumber':
        return <InputNumber {...commonProps} />;
      case 'VideoUpload':
        // 视频上传比较特殊，逻辑较重，这里保留之前的 JSX 结构，但由配置触发
        return (
          <div className={styles.uploadContainer}>
            <Form.Item
              name="video_file"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              rules={field.rules}
            >
              <Upload
                listType='picture'
                multiple={commonProps.multiple}
                maxCount={commonProps.maxCount}
                accept="video/*"
                customRequest={upload.handleUpload}
                onRemove={(file) => {
                  const currentVideos = form.getFieldValue('video') || [];
                  const urlToRemove = file.url || (file.response as string);
                  const newVideos = currentVideos.filter((v: string) => v !== urlToRemove);
                  form.setFieldValue('video', newVideos);
               }}
               // [可选] 如果你想点击列表项时弹窗播放视频
               onPreview={(file) => {
                 const url = file.url || (file.response as string);
                 if (url) {
                   window.open(url, '_blank');
                 }
               }}
              >
                <Button 
                  icon={upload.loading ? <LoadingOutlined /> : <UploadOutlined />}
                  disabled={upload.loading}
                >
                  {upload.loading ? '上传中...' : '上传视频'}
                </Button>
              </Upload>
            </Form.Item>
            {/* 隐藏字段存储 URL */}
            <Form.Item name={field.name} noStyle hidden rules={field.rules}>
              <Input />
            </Form.Item>
          </div>
        );

      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="提交"
      cancelText="取消"
      confirmLoading={confirmLoading} // 绑定给 Antd Modal
    >
      {schema.loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>
      ) : (
        <Form form={form} layout="vertical" name="ad_form">
          {schema.data.map((field) => {
            // 如果是 VideoUpload，外层 Form.Item 不绑定 name，防止捕获原生 file input 的 onChange 事件
            const isVideo = field.component === 'VideoUpload';

            return(
              <Form.Item
                key={field.name}
                name={isVideo ? undefined : field.name}
                label={field.label}
                rules={isVideo ? undefined : field.rules}
              >
                {renderFormItem(field)}
              </Form.Item>
            )
          })}
        </Form>
      )}
    </Modal>
  );
};

export default AdModal;