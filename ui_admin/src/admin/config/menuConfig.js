import {
  DashboardOutlined, ShoppingOutlined, AppstoreOutlined,
  OrderedListOutlined, RollbackOutlined, UserOutlined,
  TagOutlined,
} from '@ant-design/icons';

export const MENU_ITEMS = [
  { key: '/admin/dashboard',  icon: <DashboardOutlined />,    label: 'Dashboard'      },
  { key: '/admin/products',   icon: <ShoppingOutlined />,     label: 'Sản phẩm'       },
  { key: '/admin/categories', icon: <AppstoreOutlined />,     label: 'Danh mục'       },
  { key: '/admin/orders',     icon: <OrderedListOutlined />,  label: 'Đơn hàng'       },
  { key: '/admin/returns',    icon: <RollbackOutlined />,     label: 'Trả hàng'       },
  { key: '/admin/users',      icon: <UserOutlined />,         label: 'Khách hàng'     },
  { key: '/admin/coupons',    icon: <TagOutlined />,          label: 'Khuyến mãi'     },
];