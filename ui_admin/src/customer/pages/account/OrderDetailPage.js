import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Table, Space, Button, Modal, Input, message, Typography, Steps, Checkbox, Upload } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { customerOrderService } from '../../services/customerOrderService';
import { checkoutService } from '../../services/checkoutService';
import { customerReturnService } from '../../services/customerReturnService';
import { uploadService } from '../../services/uploadService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import { STATUS_COLORS, STATUS_MAP } from '../../../shared/constants';

const { Title, Text } = Typography;

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // States: Cancel Order
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);

  // States: Return Request (US-33)
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [selectedReturnItems, setSelectedReturnItems] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      let data = await customerOrderService.getOrderDetail(id);
      if (data && data.data) data = data.data;
      setOrder(data);
    } catch (error) {
      message.error('Không thể tải chi tiết đơn hàng');
      navigate('/account/orders');
    } finally {
      setLoading(false);
    }
  };

  const submitCancelOrder = async () => {
    if (!cancelReason.trim()) {
      message.warning('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }
    setCanceling(true);
    try {
      await customerOrderService.cancelOrder({ orderId: id, reason: cancelReason.trim() });
      message.success('Hủy đơn hàng thành công!');
      setCancelModalVisible(false);
      setOrder(prev => ({ ...prev, status: 'CANCELLED' }));
    } catch (error) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng');
    } finally {
      setCanceling(false);
    }
  };

  const handleRetryPayment = async () => {
    try {
      message.loading('Đang khởi tạo lại phiên thanh toán...', 0);
      const res = await checkoutService.retryMomoPayment(order.id || order.orderId);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Lỗi thanh toán lại');
    } finally {
      message.destroy();
    }
  };

  // ==========================================
  // XỬ LÝ RETURN REQUEST (US-33)
  // ==========================================
  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      const res = await uploadService.uploadImage(file);
      onSuccess(res, file);
    } catch (error) {
      onError(error);
      message.error('Upload ảnh thất bại!');
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const submitReturnRequest = async () => {
    // Validation
    if (selectedReturnItems.length === 0) return message.warning('Vui lòng chọn ít nhất 1 sản phẩm để trả hàng.');
    if (!returnReason.trim()) return message.warning('Vui lòng nhập lý do trả hàng.');
    
    // === ĐÃ SỬA LẠI LOGIC TRÍCH XUẤT ẢNH BAO PHỦ MỌI TRƯỜNG HỢP ===
    const uploadedUrls = fileList.map(f => {
      // 1. Nếu Backend trả về Object chứa key 'url'
      if (f.response && f.response.url) return f.response.url;
      // 2. Dự phòng nếu trả về key 'message'
      if (f.response && f.response.message) return f.response.message;
      // 3. Dự phòng nếu trả về trực tiếp 1 chuỗi string URL
      if (typeof f.response === 'string') return f.response;
      // 4. Nếu là ảnh đã có sẵn
      if (f.url) return f.url;
      
      return null;
    }).filter(Boolean); // Lọc sạch các giá trị rỗng/undefined
    
    if (uploadedUrls.length === 0) {
      return message.warning('Vui lòng chờ ảnh tải lên hoàn tất trước khi bấm Gửi, hoặc tải lại ảnh minh chứng.');
    }
    if (uploadedUrls.length > 10) {
      return message.error('Tối đa 10 ảnh minh họa'); 
    }

    setSubmittingReturn(true);
    // try {
    //   // Payload map ĐÚNG CHUẨN SubmitReturnRequestDTO
    //   const payload = {
    //     orderId: order.id || order.orderId,
    //     itemIds: selectedReturnItems,
    //     reason: returnReason.trim(),
    //     description: returnDescription.trim(),
    //     imageUrls: uploadedUrls // Mảng chứa các chuỗi (String) URL ảnh
    //   };

    //   await customerReturnService.submitReturnRequest(payload);
      
    //   // AC-FE-US33-02
    //   message.success('Return request submitted successfully. Please wait for Admin review.');
    //   setReturnModalVisible(false);
    //   navigate('/account/returns'); 
      
    // } catch (error) {
    //   // AC-FE-US33-03
    //   message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu trả hàng');
    // } finally {
    //   setSubmittingReturn(false);
    // }
    try {
      const payload = {
        orderId: order.id || order.orderId,
        itemIds: selectedReturnItems,
        reason: returnReason.trim(),
        description: returnDescription.trim(),
        imageUrls: uploadedUrls
      };

      await customerReturnService.submitReturnRequest(payload);
      
      // 1. Hiện thông báo thành công
      message.success('Return request submitted successfully. Please wait for Admin review.');
      
      // 2. Đóng Modal
      setReturnModalVisible(false);
      
      // 3. XÓA dòng navigate('/account/returns') đi
      // THAY BẰNG: Gọi lại hàm fetch để làm mới dữ liệu đơn hàng hiện tại
      fetchOrderDetail();
      
      // Reset lại form
      setReturnReason('');
      setReturnDescription('');
      setFileList([]);
      setSelectedReturnItems([]);
      
    } catch (error) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu trả hàng');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Xác định vị trí tiến trình giao hàng
  const getStepCurrent = (status) => {
    switch(status) {
      case 'PENDING_CONFIRMATION':
      case 'PENDING_PAYMENT': return 0;
      case 'CONFIRMED':
      case 'PROCESSING': return 1;
      case 'SHIPPING': return 2;
      case 'DELIVERED':
      case 'COMPLETED': return 3;
      default: return 0;
    }
  };

  if (loading || !order) return <div style={{ padding: 50, textAlign: 'center' }}>Đang tải chi tiết đơn hàng...</div>;

  const canCancel = order.status === 'PENDING_PAYMENT' || order.status === 'PENDING_CONFIRMATION';
  
  // Xác định các mặt hàng Đủ điều kiện Trả hàng
  const itemsList = order.items || order.orderItems || [];
  const eligibleReturnItems = itemsList.filter(
    item => (item.status === 'DELIVERED' || item.status === 'COMPLETED') && !item.returnRequestId
  );
  const canReturn = eligibleReturnItems.length > 0;

  const columns = [
    { title: 'Sản phẩm', key: 'product', render: (_, record) => (
        <Space>
          <img src={record.imageUrl || record.productImage || 'https://placehold.co/50x50?text=No+Image'} alt="img" style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover', border: '1px solid #eee' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.productName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              Phân loại: {record.color || 'N/A'} {record.size ? `/ ${record.size}` : ''}
            </div>
          </div>
        </Space>
      )
    },
    { title: 'Đơn giá', dataIndex: 'price', align: 'right', render: (price) => formatCurrency(price) },
    { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
    { title: 'Thành tiền', key: 'total', align: 'right', render: (_, record) => <strong style={{ color: '#e53935' }}>{formatCurrency(record.price * record.quantity)}</strong> }
  ];

  return (
    <Card 
      title={<Space><Button type="text" icon={<ArrowLeftOutlined />} onClick={() => window.history.back()} />Chi tiết đơn hàng #{order.id || order.orderId}</Space>} 
      bordered={false} 
      style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      extra={
        <Space>
          {canCancel && <Button danger onClick={() => setCancelModalVisible(true)}>Hủy đơn hàng</Button>}
          {canReturn && (
            <Button onClick={() => setReturnModalVisible(true)}>
              Yêu cầu Trả hàng / Hoàn tiền
            </Button>
          )}
          {order.status === 'PENDING_PAYMENT' && order.paymentMethod === 'MOMO' && (
            <Button type="primary" style={{ background: '#e11b8d', borderColor: '#e11b8d' }} onClick={handleRetryPayment}>
              Thanh toán ngay
            </Button>
          )}
        </Space>
      }
    >
      <div style={{ padding: '24px 24px 32px 24px', background: '#fafafa', borderRadius: 8, marginBottom: 24 }}>
        <Steps
          current={getStepCurrent(order.status)}
          status={order.status === 'CANCELLED' || order.status === 'PAYMENT_FAILED' ? 'error' : 'process'}
          items={[
            { title: 'Chờ xác nhận', description: 'Đã tiếp nhận đơn' },
            { title: 'Đang xử lý', description: 'Đang chuẩn bị hàng' },
            { title: 'Đang giao', description: 'Đang trên đường giao' },
            { title: 'Đã giao', description: 'Giao hàng thành công' },
          ]}
        />
      </div>

      <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Trạng thái">
           <Tag color={STATUS_COLORS[order.status] || 'blue'}>{STATUS_MAP[order.status] || order.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày đặt hàng">{formatDateTime(order.createdAt || order.orderDate)}</Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán"><Tag color="geekblue">{order.paymentMethod}</Tag></Descriptions.Item>
        <Descriptions.Item label="Địa chỉ giao hàng">{order.shippingAddress || order.address}</Descriptions.Item>
      </Descriptions>

      <Title level={5}>Sản phẩm đã đặt</Title>
      <Table columns={columns} dataSource={itemsList} rowKey={(record) => record.id || record.orderItemId} pagination={false} bordered />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <div style={{ width: 300 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
             <Text>Tổng tiền hàng:</Text>
             <Text>{formatCurrency(order.subtotalAmount || order.totalAmount)}</Text>
          </div>
          {order.couponCode && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
               <Text>Mã giảm giá ({order.couponCode}):</Text>
               <Text style={{ color: '#389e0d' }}>- {formatCurrency(order.discountAmount || order.discount || 0)}</Text>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 8, marginTop: 4 }}>
             <Title level={4} style={{ margin: 0 }}>Tổng thanh toán:</Title>
             <Title level={4} style={{ margin: 0, color: '#e53935' }}>{formatCurrency(order.totalAmount || order.finalAmount)}</Title>
          </div>
        </div>
      </div>

      {/* MODAL HỦY ĐƠN */}
      <Modal
        title="Xác nhận hủy đơn hàng"
        open={cancelModalVisible}
        onOk={submitCancelOrder}
        confirmLoading={canceling}
        onCancel={() => setCancelModalVisible(false)}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Lý do hủy đơn: <span style={{ color: 'red' }}>*</span></div>
          <Input.TextArea rows={3} placeholder="Vui lòng nhập lý do" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
        </div>
      </Modal>

      {/* MODAL TRẢ HÀNG (US-33) */}
      <Modal
        title="Yêu cầu Trả hàng / Hoàn tiền"
        open={returnModalVisible}
        onOk={submitReturnRequest}
        confirmLoading={submittingReturn}
        onCancel={() => setReturnModalVisible(false)}
        okText="Submit Request"
        cancelText="Hủy"
        width={600}
        // Vô hiệu hóa nút Submit khi đang tiến hành upload hình ảnh lên Cloudinary
        okButtonProps={{ disabled: submittingReturn || fileList.some(f => f.status === 'uploading') }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Sản phẩm cần trả: <span style={{ color: 'red' }}>*</span></div>
          <Checkbox.Group 
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}
            value={selectedReturnItems}
            onChange={setSelectedReturnItems}
          >
            {eligibleReturnItems.map(item => (
              <Checkbox key={item.orderItemId || item.id} value={item.orderItemId || item.id}>
                {item.productName} - Phân loại: {item.color} {item.size ? `/ ${item.size}` : ''} ({formatCurrency(item.price)})
              </Checkbox>
            ))}
          </Checkbox.Group>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Lý do trả hàng: <span style={{ color: 'red' }}>*</span></div>
          <Input 
            maxLength={255} 
            placeholder="VD: Sản phẩm bị rách chỉ, Giao sai màu..." 
            value={returnReason} 
            onChange={(e) => setReturnReason(e.target.value)} 
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Mô tả chi tiết:</div>
          <Input.TextArea 
            rows={3} 
            maxLength={1000} 
            placeholder="Nhập mô tả chi tiết lỗi sản phẩm để Admin dễ dàng xét duyệt..." 
            value={returnDescription} 
            onChange={(e) => setReturnDescription(e.target.value)} 
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Hình ảnh minh chứng (1 - 10 ảnh): <span style={{ color: 'red' }}>*</span></div>
          <Upload
            listType="picture-card"
            fileList={fileList}
            customRequest={customUpload}
            onChange={handleUploadChange}
            onRemove={(file) => {
              setFileList(prev => prev.filter(f => f.uid !== file.uid));
            }}
            beforeUpload={(file, newFileList) => {
              if (fileList.length + newFileList.length > 10) {
                message.error('Tối đa 10 ảnh minh họa'); // AC-FE-US33-01
                return Upload.LIST_IGNORE;
              }
              return true;
            }}
          >
            {fileList.length >= 10 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </div>
      </Modal>
    </Card>
  );
};

export default OrderDetailPage;