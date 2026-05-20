import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Modal, Form, Select, Tooltip, message, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader   from '../../components/PageHeader';
import ActionBar    from '../../components/ActionBar';
import ConfirmModal from '../../components/ConfirmModal';
import { adminCategoryService } from '../../services/categoryService';

const CategoryListPage = () => {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem,  setEditItem]    = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [form] = Form.useForm();

  const load = async () => { setLoading(true); try { const r = await adminCategoryService.getAll(); setData(r); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const openAdd  = ()    => { setEditItem(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (row) => { setEditItem(row);  form.setFieldsValue({ name: row.name, parent_id: row.parent_id }); setModalOpen(true); };

  const handleSave = async () => {
    const vals = await form.validateFields();
    try {
      if (editItem) await adminCategoryService.update(editItem.category_id, vals);
      else          await adminCategoryService.create(vals);
      message.success(editItem ? 'Cập nhật thành công' : 'Thêm danh mục thành công');
      setModalOpen(false); load();
    } catch { message.error('Thao tác thất bại'); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await adminCategoryService.delete(deleteTarget.category_id); message.success('Đã xoá danh mục'); setDeleteTarget(null); load(); }
    catch { message.error('Xoá thất bại'); }
    finally { setDeleteLoading(false); }
  };

  const parentOpts = data.filter(c => !c.parent_id).map(c => ({ label: c.name, value: c.category_id }));

  const columns = [
    { title: 'Tên danh mục', dataIndex: 'name', render: (n, r) => <span style={{ fontWeight: r.parent_id ? 400 : 600 }}>{n}</span> },
    { title: 'Danh mục cha', dataIndex: 'parent_name', render: n => n ? <Tag color="blue">{n}</Tag> : <span style={{ color:'#94a3b8' }}>— Cấp cao nhất —</span> },
    {
      title: 'Thao tác', key:'action', width:100,
      render: (_, r) => (
        <Space>
          <Tooltip title="Sửa"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
          <Tooltip title="Xoá"><Button size="small" danger icon={<DeleteOutlined />} onClick={() => setDeleteTarget(r)} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Quản lý Danh mục" breadcrumbs={[{ label:'Danh mục' }]} />
      <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
          <ActionBar onAdd={openAdd} addLabel="Thêm danh mục" showExport={false} />
        </div>
        <Table dataSource={data} columns={columns} rowKey="category_id" loading={loading} size="middle"
          pagination={{ pageSize:15, showTotal: t => `Tổng ${t} danh mục` }}
        />
      </div>

      <Modal open={modalOpen} title={editItem ? 'Sửa danh mục' : 'Thêm danh mục'} onOk={handleSave} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Huỷ">
        <Form form={form} layout="vertical" style={{ marginTop:16 }}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required:true, message:'Vui lòng nhập tên' }]}>
            <Input placeholder="Ví dụ: Áo Phông" />
          </Form.Item>
          <Form.Item name="parent_id" label="Danh mục cha (tuỳ chọn)">
            <Select placeholder="Không có (cấp cao nhất)" allowClear options={parentOpts} />
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} title="Xoá danh mục"
        content={`Bạn có chắc muốn xoá danh mục "${deleteTarget?.name}"?`}
        onOk={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
    </div>
  );
};
export default CategoryListPage;
