import type { ReactNode } from 'react';
import { Layout, Button, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styles from './MainLayout.module.scss';

const { Header, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
  onAddClick: () => void;
}

const MainLayout = ({ children, onAddClick }: MainLayoutProps) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.logo}>Mini Ad Wall</div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={onAddClick}
        >
          新增广告
        </Button>
      </Header>
      <Content className={styles.content}>
        <div 
          className={styles.innerContent}
          style={{ background: colorBgContainer }}
        >
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout;