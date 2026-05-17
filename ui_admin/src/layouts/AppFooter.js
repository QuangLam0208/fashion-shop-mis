// ─────────────────────────────────────────────────────────────
//  layouts/AppFooter.js
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer } = Layout;
const { Text }   = Typography;

const AppFooter = () => (
  <Footer
    style={{
      textAlign:    'center',
      background:   '#fff',
      borderTop:    '1px solid #f0f0f0',
      padding:      '12px 24px',
      lineHeight:   1.5,
    }}
  >
    <Text type="secondary" style={{ fontSize: 12 }}>
      © 2025 <strong>Fashion Admin</strong> · v1.0.0 · Hệ thống quản trị bán lẻ thời trang
    </Text>
  </Footer>
);

export default AppFooter;
