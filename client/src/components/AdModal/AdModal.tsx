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

  // 2. 动态组件渲染器
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
              noStyle
            >
              <Upload
                maxCount={1}
                accept="video/*"
                showUploadList={false}
                customRequest={upload.handleUpload}
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
            <Form.Item name={field.name} noStyle hidden>
              <Input />
            </Form.Item>
            
            {/* 预览区域 */}
            <Form.Item noStyle shouldUpdate={(prev, curr) => prev[field.name] !== curr[field.name]}>
              {({ getFieldValue, setFieldValue }) => {
                const videoUrl = getFieldValue(field.name);
                return videoUrl ? (
                  <div className={styles.previewWrapper}>
                    <video src={videoUrl} controls className={styles.videoPlayer} />
                    <div className={styles.fileName}>当前视频: {videoUrl.split('/').pop()}</div>
                    {/* [新增] 删除按钮 */}
                    <Button 
                        type="link" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => setFieldValue(field.name, null)}
                      >
                        移除视频
                      </Button>
                  </div>
                ) : null;
              }}
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
          {schema.data.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={field.rules}
            >
              {renderFormItem(field)}
            </Form.Item>
          ))}
        </Form>
      )}
    </Modal>
  );
};

export default AdModal;