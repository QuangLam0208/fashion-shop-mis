import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import './index.css';
import App from './App';

const theme = {
  token: {
    colorPrimary: '#6366f1',
    colorLink: '#6366f1',
    borderRadius: 8,
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f0f2f5',
  },
  components: {
    Menu: {
      darkItemBg: '#0f172a',
      darkSubMenuItemBg: '#1e293b',
      darkItemSelectedBg: '#6366f1',
    },
    Layout: {
      siderBg: '#0f172a',
      headerBg: '#ffffff',
      headerHeight: 64,
    },
    Table: { borderRadius: 12 },
    Button: { borderRadius: 8 },
    Input: { borderRadius: 8 },
    Select: { borderRadius: 8 },
    Card: { borderRadius: 12 },
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider theme={theme} locale={viVN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
