import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Row, Col, message, Spin, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { adminProductService } from '../../services/productService';
import { adminCategoryService } from '../../services/categoryService';

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { label: 'Đang bán (ACTIVE)', value: 'ACTIVE' },
  { label: 'Ngừng bán (INACTIVE)', value: 'INACTIVE' },
  { label: 'Hết hàng (OUT_OF_STOCK)', value: 'OUT_OF_STOCK' },
  { label: 'Không còn kinh doanh (DISCONTINUED)', value: 'DISCONTINUED' },
];

const ProductFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // 🌟 THÊM STATE LƯU TRỮ BIẾN THỂ GỐC ĐỂ LẤY VARIANT_ID
  const [originalVariants, setOriginalVariants] = useState([]);

  // Load danh mục
  useEffect(() => {
    adminCategoryService.getAll().then(res => {
      const catList = Array.isArray(res) ? res : (res?.data || res?.content || []);
      setCategories(catList);
    }).catch(() => message.error('Không thể tải danh sách danh mục'));
  }, []);

  // Tải dữ liệu khi ở chế độ Edit
  useEffect(() => {
    if (isEditMode) {
      const fetchProductDetails = async () => {
        setLoading(true);
        try {
          const res = await adminProductService.getById(id);
          
          // LƯU LẠI MẢNG VARIANTS CŨ TỪ BACKEND
          setOriginalVariants(res.variants || []);
          
          form.setFieldsValue({
            name: res.name,
            price: res.price,
            categoryId: res.categoryId ?? res.category_id, 
            totalStock: res.totalStock ?? res.stock_quantity,
            status: res.status || 'ACTIVE',
            primaryImageUrl: res.primaryImageUrl || res.image,
            description: res.description,
          });
        } catch (error) {
          message.error('Không thể tải thông tin sản phẩm');
          navigate('/admin/products');
        } finally {
          setLoading(false);
        }
      };
      fetchProductDetails();
    } else {
      form.setFieldsValue({ status: 'ACTIVE', price: 0, totalStock: 0 });
    }
  }, [id, isEditMode, form, navigate]);

  // Xử lý Lưu dữ liệu
  const handleSave = async (values) => {
    setSaveLoading(true);
    try {
      // 1. LẤY THÔNG TIN CỦA VARIANT CŨ (Nếu đang sửa)
      const existingVariant = originalVariants.length > 0 ? originalVariants[0] : {};
      const currentVariantId = existingVariant.variantId ?? existingVariant.id;

      // 2. TẠO PAYLOAD KHỚP 100% VỚI CẤU TRÚC JSON YÊU CẦU
      const payload = {
        name: values.name,
        description: values.description || "",
        price: values.price,
        categoryId: values.categoryId,
        status: values.status || "ACTIVE",
        imageUrls: values.primaryImageUrl 
          ? [values.primaryImageUrl] 
          : ["https://placehold.co/600x600?text=No+Image"],
        variants: [
          {
            // Nếu có variantId (Update) thì truyền vào, không thì bỏ qua (Create)
            ...(currentVariantId ? { variantId: currentVariantId } : {}),
            size: existingVariant.size || "M", // Giữ nguyên size cũ hoặc gán mặc định
            color: existingVariant.color || "Đen", // Giữ nguyên màu cũ hoặc gán mặc định
            stockQuantity: values.totalStock
          }
        ]
      };

      // 3. GỌI API
      if (isEditMode) {
        await adminProductService.update(id, payload);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await adminProductService.create(payload);
        message.success('Thêm sản phẩm mới thành công!');
      }
      
      navigate('/admin/products'); 
      
    } catch (error) {
      console.error(error);
      const errorData = error?.response?.data;
      if (errorData?.errors) {
        const firstError = Object.values(errorData.errors)[0];
        message.error(`Lỗi: ${firstError}`);
      } else {
        message.error(errorData?.message || 'Thao tác thất bại, vui lòng thử lại');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const categoryOptions = categories.map(c => ({
    label: c.name,
    value: c.id ?? c.category_id
  }));

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <PageHeader 
        title={isEditMode ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'} 
        breadcrumbs={[
          { label: 'Sản phẩm', path: '/admin/products' },
          { label: isEditMode ? 'Chỉnh sửa' : 'Thêm mới' }
        ]} 
      />

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          {/* CỘT TRÁI: Thông tin cơ bản */}
          <Col xs={24} lg={16}>
            <Card title="Thông tin cơ bản" bordered={false} style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder="Ví dụ: Áo thun Polo thể thao" size="large" />
              </Form.Item>

              <Form.Item name="description" label="Mô tả chi tiết">
                <TextArea rows={6} placeholder="Nhập mô tả sản phẩm..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                    <InputNumber 
                      style={{ width: '100%' }} size="large"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      min={0} 
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="totalStock" label="Số lượng tồn kho" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                    <InputNumber style={{ width: '100%' }} size="large" min={0} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* CỘT PHẢI: Phân loại & Trạng thái */}
          <Col xs={24} lg={8}>
            <Card title="Phân loại" bordered={false} style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                <Select placeholder="Chọn danh mục..." size="large" options={categoryOptions} showSearch optionFilterProp="label" />
              </Form.Item>

              <Form.Item name="status" label="Trạng thái">
                <Select size="large" options={STATUS_OPTIONS} />
              </Form.Item>

              <Form.Item name="primaryImageUrl" label="Đường dẫn ảnh đại diện (URL)" extra="Nhập link ảnh (Ví dụ: https://...)">
                <Input placeholder="https://..." size="large" />
              </Form.Item>
            </Card>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" block loading={saveLoading}>
                  {isEditMode ? 'Lưu cập nhật' : 'Tạo sản phẩm'}
                </Button>
                <Button icon={<ArrowLeftOutlined />} size="large" block onClick={() => navigate('/admin/products')}>
                  Huỷ bỏ & Quay lại
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductFormPage;