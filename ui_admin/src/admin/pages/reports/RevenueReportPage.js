import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Button, Table, Typography, Space, message, Spin, Tag } from 'antd';
import { DownloadOutlined, ReloadOutlined, DollarCircleOutlined, ShopOutlined, GlobalOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { adminRevenueService } from '../../services/revenueService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const RevenueReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState(null);
  
  // Mặc định lấy từ đầu tháng đến hiện tại
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('day')]);

  const fetchReport = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return message.warning('Vui lòng chọn khoảng thời gian hợp lệ!');
    }
    
    // Format ngày chuẩn để gửi xuống Backend (YYYY-MM-DD)
    const startDate = dateRange[0].format('YYYY-MM-DD');
    const endDate = dateRange[1].format('YYYY-MM-DD');

    setLoading(true);
    try {
      const res = await adminRevenueService.getReport(startDate, endDate);
      setData(res?.data || res);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể tải báo cáo doanh thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, []);

  // Xử lý tải file CSV (AC-US44-03 & AC-FE-US44-01)
  const handleExportCSV = async () => {
    if (!data || !data.orders || data.orders.length === 0) {
      return message.warning('Không có dữ liệu trong khoảng thời gian này để xuất báo cáo!');
    }

    const startDate = dateRange[0].format('YYYY-MM-DD');
    const endDate = dateRange[1].format('YYYY-MM-DD');
    
    setExporting(true);
    try {
      const blob = await adminRevenueService.exportCSV(startDate, endDate);
      
      // Tạo đường dẫn ảo (Object URL) để trình duyệt tự động tải xuống
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bao_Cao_Doanh_Thu_${startDate}_den_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Tải báo cáo CSV thành công!');
    } catch (error) {
      message.error('Lỗi khi xuất file báo cáo!');
    } finally {
      setExporting(false);
    }
  };

  // Cấu hình Cột bảng Đơn hàng (OrderSummaryDTO)
  const orderColumns = [
    { title: 'Mã đơn', dataIndex: 'orderId', key: 'orderId', render: val => <strong>#{val}</strong> },
    { title: 'Ngày giao dịch', dataIndex: 'orderDate', key: 'orderDate', render: val => formatDateTime(val) },
    { 
      title: 'Kênh bán', 
      dataIndex: 'orderType', 
      key: 'orderType',
      render: type => (
        <Tag color={type === 'OFFLINE' ? 'magenta' : 'blue'}>
          {type === 'OFFLINE' ? 'TẠI QUẦY (POS)' : 'TRỰC TUYẾN'}
        </Tag>
      )
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: val => <Tag color="green">{val}</Tag> },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', align: 'right', render: val => <strong style={{ color: '#e53935' }}>{formatCurrency(val)}</strong> },
  ];

  // Bảng phụ: Cấu hình Cột chi tiết Sản phẩm (OrderItemDTO)
  const expandedRowRender = (record) => {
    const itemColumns = [
      { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'productName' },
      { title: 'Phân loại', key: 'variant', render: (_, r) => `${r.color || ''} ${r.size ? `- ${r.size}` : ''}` },
      { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
      { title: 'Đơn giá', dataIndex: 'price', align: 'right', render: val => formatCurrency(val) },
    ];
    return <Table columns={itemColumns} dataSource={record.items || []} rowKey="orderItemId" pagination={false} size="small" />;
  };

  return (
    <div>
      <PageHeader title="Báo cáo Doanh thu" />

      {/* Bộ Lọc & Nút Xuất Báo Cáo */}
      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <span style={{ fontWeight: 600 }}>Kỳ báo cáo:</span>
              <RangePicker 
                value={dateRange} 
                onChange={(dates) => setDateRange(dates)} 
                format="DD/MM/YYYY"
                allowClear={false}
              />
              <Button type="primary" icon={<ReloadOutlined />} onClick={fetchReport} loading={loading}>
                Thống kê
              </Button>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleExportCSV} 
              loading={exporting}
              style={{ background: '#10b981', borderColor: '#10b981' }} // Màu xanh lục
            >
              Xuất báo cáo CSV
            </Button>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
      ) : (
        <>
          {/* 3 Thẻ Đồ họa (AC-US44) */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={8}>
              <StatCard 
                title="Doanh thu Trực tuyến (Online)" 
                value={formatCurrency(data?.onlineRevenue || 0)} 
                icon={<GlobalOutlined style={{ color: '#1677ff' }} />} 
              />
            </Col>
            <Col xs={24} md={8}>
              <StatCard 
                title="Doanh thu Tại quầy (Offline)" 
                value={formatCurrency(data?.offlineRevenue || 0)} 
                icon={<ShopOutlined style={{ color: '#eb2f96' }} />} 
              />
            </Col>
            <Col xs={24} md={8}>
              <StatCard 
                title="Tổng Doanh thu (Kết hợp)" 
                value={formatCurrency((data?.onlineRevenue || 0) + (data?.offlineRevenue || 0))} 
                icon={<DollarCircleOutlined style={{ color: '#52c41a' }} />} 
              />
            </Col>
          </Row>

          {/* Bảng Chi tiết */}
          <Card title={`Danh sách giao dịch (${data?.totalOrders || 0} đơn hàng)`} style={{ borderRadius: 8 }}>
            <Table 
              columns={orderColumns} 
              dataSource={data?.orders || []} 
              rowKey="orderId"
              expandable={{ expandedRowRender }} // Cho phép bấm nút [+] để xem chi tiết sp trong đơn
              pagination={{ pageSize: 20 }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default RevenueReportPage;