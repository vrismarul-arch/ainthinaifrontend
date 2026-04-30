import React, { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  Popconfirm,
  message,
  Drawer,
  Upload,
  Form,
  Image
} from "antd";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import API from "../../../api/api";

const AdminCategories = () => {

  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/api/categories");

      console.log("API response:", res.data);

      // SAFE handling for any backend response shape
      const dataArray =
        Array.isArray(res.data)
          ? res.data
          : res.data.categories || res.data.data || [];

      setCategories(dataArray);

    } catch {
      message.error("Load failed");
    }
  };

  const normFile = (e) => Array.isArray(e) ? e : e?.fileList;

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record) => {

    const fileList = record.image ? [{
      uid: "-1",
      name: "image.png",
      status: "done",
      url: record.image
    }] : [];

    form.setFieldsValue({
      name: record.name,
      image: fileList
    });

    setEditingId(record.id);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {

      const values = await form.validateFields();

      const fd = new FormData();
      fd.append("name", values.name);

      if (values.image?.[0]?.originFileObj) {
        fd.append("image", values.image[0].originFileObj);
      }

      if (editingId) {
        await API.put(`/api/categories/${editingId}`, fd);
        message.success("Updated");
      } else {
        await API.post("/api/categories", fd);
        message.success("Created");
      }

      setOpen(false);
      fetchCategories();

    } catch {
      message.error("Save failed");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await API.delete(`/api/categories/${id}`);
      message.success("Deleted");
      fetchCategories();
    } catch {
      message.error("Delete failed");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      render: img => img ? <Image src={img} width={60} /> : "-"
    },
    { title: "Name", dataIndex: "name" },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)} className="book-btn" />
          <Popconfirm title="Delete?" onConfirm={() => deleteCategory(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card
      title="Manage Categories"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} className="book-btn">
          Add Category
        </Button>
      }
    >

      <Table
        dataSource={Array.isArray(categories) ? categories : []}
        columns={columns}
        rowKey="id"
      />

      <Drawer
        title={editingId ? "Edit Category" : "Create Category"}
        open={open}
        onClose={() => setOpen(false)}
        width={400}
      >
        <Form layout="vertical" form={form}>

          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="image"
            label="Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
              + Upload
            </Upload>
          </Form.Item>

          <Button type="primary" block onClick={handleSubmit} className="book-btn">
            Save
          </Button>

        </Form>
      </Drawer>

    </Card>
  );
};

export default AdminCategories;