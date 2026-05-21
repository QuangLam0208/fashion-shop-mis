import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tooltip, message, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader   from '../../components/PageHeader';
import ActionBar    from '../../components/ActionBar';
import SearchBar    from '../../components/SearchBar';
import ConfirmModal from '../../components/ConfirmModal';
import { adminCategoryService } from '../../services/categoryService';

const CategoryListPage = () => {
  const [parents,      setParents]      = useState([]); // danh mục cha (có children[])
  const [tree,         setTree]         = useState([]); // cây đầy đủ (có children[])
  const [loading,      setLoading]      = useState(false);
  const [searchLoad,   setSearchLoad]   = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  const [saveLoading,  setSaveLoading]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoad,   setDeleteLoad]   = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const treeData = await adminCategoryService.getAll();
      setTree(treeData);
      
      // ĐỔI TÊN TRƯỜNG 'children' THÀNH 'subCategories'
      const cleanParents = treeData
        .filter(c => !c.parentId && !c.parent_id)
        .map(({ children, ...rest }) => ({
          ...rest,
          subCategories: children // Đổi tên ở đây
        }));

      setParents(cleanParents);
    } catch {
      message.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Search (Xử lý gọi API) ──────────────────────────────────
  const handleSearch = async (values) => {
    const keyword = typeof values === 'object' ? values.keyword : values;

    if (!keyword || !keyword.trim()) { 
      load(); // Nếu ô tìm kiếm rỗng, load lại toàn bộ
      return; 
    }

    setSearchLoad(true);
    try {
      const response = await adminCategoryService.search(keyword.trim());
      
      // XỬ LÝ THÔNG MINH CHO NHIỀU ĐỊNH DẠNG API:
      let results = [];
      if (Array.isArray(response)) {
        results = response; // Trường hợp API trả về mảng [...] chuẩn
      } else if (response?.data && Array.isArray(response.data)) {
        results = response.data; // Trường hợp API trả về { data: [...] }
      } else if (response && (response.id || response.category_id)) {
        // TRƯỜNG HỢP CỦA BẠN: API trả về thẳng 1 Object { id: 1, ... }
        // Ta tự động bọc nó vào mảng để Ant Table hiểu được
        results = [response]; 
      }

      // Xử lý giấu thuộc tính 'children' để không bị lỗi xòe dòng
      const cleanResults = results.map((item) => {
        const { children, ...rest } = item;
        return {
          ...rest,
          subCategories: children 
        };
      });

      // Cập nhật lại state của Table
      setParents(cleanResults);

    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
      message.error('Tìm kiếm thất bại, vui lòng kiểm tra lại');
    } finally {
      setSearchLoad(false);
    }
  };

  // ── Modal Thêm / Sửa ─────────────────────────────────────
  const openAdd = (parentRow = null) => {
    setEditItem(null);
    form.resetFields();
    if (parentRow) form.setFieldsValue({ parentId: parentRow.id });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    form.setFieldsValue({ 
      name: row.name,
      parentId: row.parentId ?? null // Đọc parentId cũ điền vào form
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    let vals;
    try { vals = await form.validateFields(); } catch { return; }
    setSaveLoading(true);
    try {
      if (editItem) {
        await adminCategoryService.update(editItem.id, { 
          name: vals.name, 
          parentId: vals.parentId ?? null 
        });
        message.success('Cập nhật thành công');
      } else {
        await adminCategoryService.create({ name: vals.name, parentId: vals.parentId ?? null });
        message.success('Thêm danh mục thành công');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await adminCategoryService.delete(categoryId);
      message.success('Đã xoá danh mục');
      await load(); // Load lại data
    } catch (err) {
      message.error(err.response?.data?.message || 'Xoá thất bại — danh mục đang được dùng');
    }
  };

  // ── Options danh mục cha cho Select ──────────────────────
  const parentOpts = parents.map(c => ({ label: c.name, value: c.id }));

  // ── Columns ───────────────────────────────────────────────
  const actionButtons = (row, isChild = false) => (
    <Space>
      <Tooltip title="Sửa">
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)} />
      </Tooltip>
      {!isChild && (
        <Button size="small" type="dashed" onClick={() => openAdd(row)}>
          + Thêm con
        </Button>
      )}
      <Tooltip title="Xoá">
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(row.id)} />
      </Tooltip>
    </Space>
  );

  const parentColumns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
    },
    {
      title: 'Số danh mục con',
      dataIndex: 'childCount',
      align: 'center',
      width: 150,
      render: count => (
        <Tag color="blue" style={{ marginLeft: 8, fontSize: 11, fontWeight: 600 }}>
          {count} danh mục con
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, row) => actionButtons(row, false),
    },
  ];

  const childColumns = [
    { title: 'Tên danh mục', dataIndex: 'name' },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, row) => actionButtons(row, true),
    },
  ];

  // ── expandedRowRender: bảng con ───────────────────────────
  const expandedRowRender = (parentRow) => {
    // ĐỌC TỪ 'subCategories' THAY VÌ 'children'
    const children = parentRow.subCategories ?? []; 
    
    if (!children.length) {
      return (
        <div style={{ padding: '8px 16px', color: '#94a3b8' }}>
          Chưa có danh mục con
        </div>
      );
    }
    return (
      <Table
        dataSource={children}
        columns={childColumns}
        rowKey={r => r.id ?? r.category_id}
        pagination={false}
        size="small"
        showHeader={false}
        style={{ marginLeft: 8 }}
      />
    );
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div>
      <PageHeader title="Quản lý Danh mục" breadcrumbs={[{ label: 'Danh mục' }]} />

      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <SearchBar
            fields={[{ name: 'keyword', type: 'input', placeholder: 'Tìm theo tên danh mục...' }]}
            onSearch={handleSearch}
            onReset={load}
            loading={searchLoad}
          />
          <ActionBar onAdd={() => openAdd()} addLabel="Thêm danh mục" showExport={false} />
        </div>

        <Table
          dataSource={parents}
          columns={parentColumns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15, showTotal: t => `Tổng ${t} danh mục` }}
          expandable={{
            expandedRowRender,
            rowExpandable: () => true,
          }}
        />
      </div>

      {/* Modal Thêm / Sửa */}
      <Modal
        open={modalOpen}
        title={editItem ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editItem ? 'Lưu' : 'Thêm'}
        cancelText="Huỷ"
        confirmLoading={saveLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Ví dụ: Áo Phông" maxLength={100} showCount />
          </Form.Item>

          {!editItem && (
            <Form.Item name="parentId" label="Danh mục cha (tuỳ chọn)"
              extra="Để trống nếu đây là danh mục cấp cao nhất">
              <Select
                placeholder="— Cấp cao nhất —"
                allowClear
                options={parentOpts}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          )}

          {editItem && (
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              * Chỉ có thể thay đổi tên. Danh mục cha không thể chỉnh sửa.
            </div>
          )}
        </Form>
      </Modal>

      {/* Modal Xác nhận xoá */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Xoá danh mục"
        content={
          <span>
            Bạn có chắc muốn xoá <strong>"{deleteTarget?.name}"</strong>?<br />
            <span style={{ color: '#ef4444', fontSize: 12 }}>
              ⚠️ Danh mục đang có sản phẩm hoặc danh mục con sẽ không thể xoá.
            </span>
          </span>
        }
        onOk={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoad}
      />
    </div>
  );
};

export default CategoryListPage;