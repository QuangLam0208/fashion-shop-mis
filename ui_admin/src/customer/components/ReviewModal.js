import React, { useState } from 'react';
import { Modal, Rate, Input, Upload, Button, message, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { uploadService } from '../services/uploadService';
import { reviewService } from '../services/reviewService';

const { Text } = Typography;
const { TextArea } = Input;

const ReviewModal = ({ open, onClose, onSuccess, orderItem }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState(false); // Validate sao (AC-FE-US40-01)

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      const res = await uploadService.uploadImage(file);
      onSuccess({ url: res }, file);
    } catch (error) {
      onError(error);
      message.error('Upload ảnh thất bại!');
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const handleSubmit = async () => {
    if (rating === 0) {
      setRatingError(true);
      return;
    }
    setRatingError(false);
    setSubmitting(true);

    const imageUrls = fileList.map(f => f.response?.url || f.url).filter(Boolean);

    try {
      await reviewService.submit({
        productId: orderItem.productId,
        orderItemId: orderItem.orderItemId,
        rating,
        comment,
        imageUrls
      });
      message.success('Gửi đánh giá thành công!');
      onSuccess(orderItem.orderItemId); // Gọi callback để update UI live state
      onClose();
      // Reset form
      setRating(0); setComment(''); setFileList([]);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Viết đánh giá sản phẩm"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Rate 
          value={rating} 
          onChange={(val) => { setRating(val); setRatingError(false); }} 
          style={{ fontSize: 32, color: '#fadb14' }} 
        />
        {/* Lỗi bắt buộc (AC-FE-US40-01) */}
        {ratingError && <div style={{ color: 'red', marginTop: 8, fontWeight: 500 }}>Vui lòng chọn số điểm đánh giá</div>}
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Text strong>Nhận xét của bạn:</Text>
        <TextArea 
          rows={4} 
          value={comment} 
          onChange={e => setComment(e.target.value)} 
          placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm (chất liệu, màu sắc, form dáng...)" 
          style={{ marginTop: 8 }} 
        />
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Text strong>Hình ảnh đính kèm (Tối đa 5 ảnh):</Text>
        <Upload
          listType="picture-card"
          fileList={fileList}
          customRequest={customUpload}
          onChange={handleUploadChange}
          onRemove={(file) => setFileList(prev => prev.filter(f => f.uid !== file.uid))}
          style={{ marginTop: 8 }}
        >
          {fileList.length >= 5 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
        </Upload>
      </div>

      <Button 
        type="primary" 
        block 
        size="large" 
        onClick={handleSubmit} 
        loading={submitting} 
        disabled={rating === 0 || fileList.some(f => f.status === 'uploading')} 
        style={{ background: '#1a1a1a' }}
      >
        Gửi đánh giá
      </Button>
    </Modal>
  );
};

export default ReviewModal;