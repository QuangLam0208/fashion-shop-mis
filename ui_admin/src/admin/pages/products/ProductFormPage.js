import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Row, Col, message, Spin, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
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

  useEffect(() => {
    adminCategoryService.getAll().then(res => {
      const catList = Array.isArray(res) ? res : (res?.data || res?.content || []);
      setCategories(catList);
    }).catch(() => message.error('Không thể tải danh sách danh mục'));
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchProductDetails = async () => {
        setLoading(true);
        try {
          const res = await adminProductService.getById(id);
          
          const formVariants = (res.variants && res.variants.length > 0) 
            ? res.variants.map(v => ({
                variantId: v.variantId ?? v.id,
                size: v.size,
                color: v.color,
                stockQuantity: v.stockQuantity ?? v.stock_quantity
              }))
            : [{ size: '', color: '', stockQuantity: 0 }];

          let imageUrl = '';
          if (res.mainImage && !res.mainImage.includes('placeholder.png')) {
            imageUrl = res.mainImage;
          } else if (res.images && res.images.length > 0) {
            imageUrl = res.images[0].url || res.images[0];
          } else if (res.imageUrls && res.imageUrls.length > 0) {
            imageUrl = res.imageUrls[0];
          } else if (res.primaryImageUrl && !res.primaryImageUrl.includes('placeholder.png')) {
            imageUrl = res.primaryImageUrl;
          }

          const rawCatId = res.categoryId ?? res.category_id;
          const catIdValue = rawCatId ? Number(rawCatId) : undefined;

          form.setFieldsValue({
            name: res.name,
            price: res.price,
            categoryId: catIdValue, 
            status: res.status || 'ACTIVE',
            primaryImageUrl: imageUrl,
            description: res.description,
            variants: formVariants,
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
      form.setFieldsValue({ 
        status: 'ACTIVE', 
        price: 0,
        variants: [{ size: '', color: '', stockQuantity: 0 }] 
      });
    }
  }, [id, isEditMode, form, navigate]);

  // Xử lý Lưu dữ liệu
  const handleSave = async (values) => {
    if (!values.variants || values.variants.length === 0) {
      message.error('Phải có ít nhất một biến thể sản phẩm (variant).');
      return;
    }

    setSaveLoading(true);
    try {
      const payload = {
        name: values.name,
        description: values.description || "",
        price: values.price,
        categoryId: values.categoryId,
        status: values.status || "ACTIVE",
        imageUrls: values.primaryImageUrl ? [values.primaryImageUrl] : [], 
        variants: values.variants.map(v => ({
          ...(v.variantId ? { variantId: v.variantId } : {}), 
          size: v.size,
          color: v.color,
          stockQuantity: v.stockQuantity
        }))
      };

      if (isEditMode) {
        await adminProductService.update(id, payload);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await adminProductService.create(payload);
        message.success('Thêm sản phẩm mới thành công!');
      }
      
      navigate('/admin/products'); 
      
    } catch (error) {
      const errorData = error?.response?.data;
      if (errorData?.errors) {
        const firstError = Object.values(errorData.errors)[0];
        message.error(`Lỗi: ${firstError}`);
      } else {
        message.error(errorData?.message || 'Thao tác thất bại, vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const getCategoryOptions = () => {
    const options = [];
    categories.forEach(c => {
      options.push({ label: c.name, value: Number(c.id ?? c.category_id) });
      
      const children = c.children || c.subCategories || [];
      children.forEach(sub => {
        options.push({ label: `--- ${sub.name}`, value: Number(sub.id ?? sub.category_id) });
      });
    });
    return options;
  };

  const categoryOptions = getCategoryOptions();

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
          <Col xs={24} lg={16}>
            <Card title="Thông tin cơ bản" bordered={false} style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder="Ví dụ: Áo thun Polo thể thao" size="large" />
              </Form.Item>

              <Form.Item name="description" label="Mô tả chi tiết">
                <TextArea rows={4} placeholder="Nhập mô tả sản phẩm..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="price" label="Giá bán (VNĐ)" rules={[
                    { required: true, message: 'Vui lòng nhập giá' },
                    { type: 'number', min: 0, message: 'Giá không được âm' }
                  ]}>
                    <InputNumber 
                      style={{ width: '100%' }} size="large"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      min={0} 
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Phân loại biến thể (Size & Màu sắc)" bordered={false} style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <Form.List 
                name="variants"
                rules={[
                  {
                    validator: async (_, variants) => {
                      if (!variants || variants.length < 1) {
                        return Promise.reject(new Error('Phải có ít nhất một biến thể sản phẩm (variant)'));
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={16} align="middle" style={{ marginBottom: 8 }}>
                        <Form.Item {...restField} name={[name, 'variantId']} style={{ display: 'none' }}>
                          <Input />
                        </Form.Item>

                        <Col span={7}>
                          <Form.Item
                            {...restField}
                            name={[name, 'size']}
                            label={name === 0 ? "Kích cỡ" : ""}
                            rules={[{ required: true, message: 'Nhập kích cỡ' }]}
                          >
                            <Input placeholder="VD: S, M, XL..." size="large" />
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <Form.Item
                            {...restField}
                            name={[name, 'color']}
                            label={name === 0 ? "Màu sắc" : ""}
                            rules={[{ required: true, message: 'Nhập màu sắc' }]}
                          >
                            <Input placeholder="VD: Đen, Trắng..." size="large" />
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <Form.Item
                            {...restField}
                            name={[name, 'stockQuantity']}
                            label={name === 0 ? "Tồn kho" : ""}
                            rules={[
                              { required: true, message: 'Nhập số lượng' },
                              { type: 'number', min: 0, message: 'Tồn kho >= 0' }
                            ]}
                          >
                            <InputNumber placeholder="0" min={0} size="large" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={3} style={{ display: 'flex', alignItems: name === 0 ? 'center' : 'flex-start', marginTop: name === 0 ? 8 : 0 }}>
                          <Button type="text" danger icon={<MinusCircleOutlined style={{ fontSize: '20px' }} />} onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large">
                        Thêm biến thể
                      </Button>
                      <Form.ErrorList errors={errors} style={{ color: '#ff4d4f', marginTop: 8 }} />
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Phân loại" bordered={false} style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                <Select placeholder="Chọn danh mục..." size="large" options={categoryOptions} showSearch optionFilterProp="label" />
              </Form.Item>

              <Form.Item name="status" label="Trạng thái">
                <Select size="large" options={STATUS_OPTIONS} />
              </Form.Item>

              <Form.Item name="primaryImageUrl" label="Đường dẫn ảnh (URL)" extra="Bỏ trống nếu không có ảnh">
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