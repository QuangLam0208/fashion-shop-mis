import {
  DashboardOutlined, ShoppingOutlined, AppstoreOutlined,
  OrderedListOutlined, RollbackOutlined, UserOutlined,
  TagOutlined,
} from '@ant-design/icons';

export const MENU_ITEMS = [
  { key: '/admin/dashboard',  icon: <DashboardOutlined />,    label: 'Dashboard',   path: '/admin/dashboard'      },
  { key: '/admin/products',   icon: <ShoppingOutlined />,     label: 'Sản phẩm',    path: '/admin/products'       },
  { key: '/admin/categories', icon: <AppstoreOutlined />,     label: 'Danh mục',    path: '/admin/categories'     },
  { key: '/admin/orders',     icon: <OrderedListOutlined />,  label: 'Đơn hàng',    path: '/admin/orders'         },
  { key: '/admin/returns',    icon: <RollbackOutlined />,     label: 'Trả hàng',    path: '/admin/returns'        },
  { key: '/admin/users',      icon: <UserOutlined />,         label: 'Khách hàng',  path: '/admin/users'          },
  { key: '/admin/coupons',    icon: <TagOutlined />,          label: 'Khuyến mãi',  path: '/admin/coupons'        },
];