// src/admin/pages/categories/CategoryListPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Tooltip, message, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader   from '../../components/PageHeader';
import ActionBar    from '../../components/ActionBar';
import SearchBar    from '../../components/SearchBar';
import ConfirmModal from '../../components/ConfirmModal';
import { adminCategoryService } from '../../services/categoryService';

// Import Component Modal vừa tạo
import CategoryFormModal from './CategoryFormModal';

const CategoryListPage = () => {
  const [parents,      setParents]      = useState([]); 
  const [loading,      setLoading]      = useState(false);
  const [searchLoad,   setSearchLoad]   = useState(false);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoad,   setDeleteLoad]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const treeData = await adminCategoryService.getAll();
      
      const cleanParents = treeData
        .filter(c => !c.parentId && !c.parent_id)
        .map(({ children, ...rest }) => ({
          ...rest,
          subCategories: children 
        }));

      setParents(cleanParents);
    } catch {
      message.error('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = async (values) => {
    const keyword = typeof values === 'object' ? values.keyword : values;
    if (!keyword || !keyword.trim()) { 
      load(); 
      return; 
    }

    setSearchLoad(true);
    try {
      const response = await adminCategoryService.search(keyword.trim());
      
      let results = [];
      if (Array.isArray(response)) {
        results = response;
      } else if (response?.data && Array.isArray(response.data)) {
        results = response.data;
      } else if (response && (response.id || response.category_id)) {
        results = [response]; 
      }

      const cleanResults = results.map((item) => {
        const { children, ...rest } = item;
        return { ...rest, subCategories: children };
      });

      setParents(cleanResults);
    } catch (err) {
      message.error('Tìm kiếm thất bại, vui lòng kiểm tra lại');
    } finally {
      setSearchLoad(false);
    }
  };

  const openAdd = (parentRow = null) => {
    // Nếu bấm "Thêm con", truyền parentId mồi vào editItem
    setEditItem(parentRow ? { parentId: parentRow.id } : null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditItem(row);
    setModalOpen(true);
  };

  // AC-FE-03: Delete flow
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoad(true);
    try {
      const idToDelete = deleteTarget.id ?? deleteTarget.category_id;
      await adminCategoryService.delete(idToDelete);
      message.success('Đã xoá danh mục thành công');
      setDeleteTarget(null);
      await load(); // Reload list ngay lập tức
    } catch (err) {
      // AC-FE-05: Error handling
      message.error(err.response?.data?.message || 'Xoá thất bại.');
    } finally {
      setDeleteLoad(false);
    }
  };
  
  const parentOpts = parents.map(c => ({ label: c.name, value: c.id }));

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
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setDeleteTarget(row)} />
      </Tooltip>
    </Space>
  );

  const parentColumns = [
    { title: 'Tên danh mục', dataIndex: 'name' },
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
    { title: 'Hành động', key: 'action', width: 180, render: (_, row) => actionButtons(row, false) },
  ];

  const childColumns = [
    { title: 'Tên danh mục', dataIndex: 'name' },
    { title: 'Hành động', key: 'action', width: 100, render: (_, row) => actionButtons(row, true) },
  ];

  const expandedRowRender = (parentRow) => {
    const children = parentRow.subCategories ?? []; 
    if (!children.length) {
      return <div style={{ padding: '8px 16px', color: '#94a3b8' }}>Chưa có danh mục con</div>;
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

      {/* COMPONENT MODAL FORM (TÁCH RIÊNG) */}
      <CategoryFormModal 
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={load}
        editItem={editItem}
        parentOpts={parentOpts}
      />

      {/* AC-FE-02: Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xoá danh mục"
        content={
          <span>
            Bạn có chắc muốn xoá <strong>"{deleteTarget?.name}"</strong>?<br />
            <span style={{ color: '#ef4444', fontSize: 12 }}>
              ⚠️ Deleting this category will remove all products within it.
            </span>
          </span>
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoad}
        danger={true}
      />
    </div>
  );
};

export default CategoryListPage;