import React, { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Upload,
  message,
  Space,
  Popconfirm
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import API from "../../../api/api";
import AdminItinerary from "./AdminItinerary";

const { TextArea } = Input;

const AdminAmenities = () => {
  const [activeTab, setActiveTab] = useState("amenities");
  const [open, setOpen] = useState(false);
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [data, setData] = useState([]);
  const [form] = Form.useForm();

  const fetchData = async (type) => {
    if (type === "itinerary") return;
    const res = await API.get(`/api/features/${type}`);
    setData(res.data);
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const normFile = (e) => e?.fileList;

  const handleSubmit = async () => {
    const values = await form.validateFields();

    let imageBase64 = null;

    if (values.image?.[0]?.originFileObj) {
      const file = values.image[0].originFileObj;

      imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
      });
    }

    if (editing) {
      await API.put(`/api/features/${editing.id}`, {
        title: values.title,
        description: values.description,
        imageBase64,
      });
      message.success("Updated");
    } else {
      await API.post("/api/features/create", {
        type: activeTab,
        title: values.title,
        description: values.description,
        imageBase64,
      });
      message.success("Created");
    }

    setEditing(null);
    setOpen(false);
    form.resetFields();
    fetchData(activeTab);
  };

  const handleDelete = async (id) => {
    await API.delete(`/api/features/${id}`);
    message.success("Deleted");
    fetchData(activeTab);
  };

  const handleEdit = (record) => {
    setEditing(record);
    setOpen(true);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
    });
  };

  const columns = [
    { title: "Title", dataIndex: "title" },
    { title: "Description", dataIndex: "description" },
    {
      title: "Image",
      dataIndex: "image",
      render: (img) => img ? <img src={img} width={60} /> : "-"
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { label: "Amenities", key: "amenities" },
          { label: "Activities", key: "activities" },
          { label: "Food", key: "food" },
          { label: "Things to Know", key: "things_to_know" },
          // { label: "Itinerary", key: "itinerary" }, // ⭐ NEW
        ]}
      />

      {/* ===== ITINERARY VIEW ===== */}
      {activeTab === "itinerary" ? (
        <>
          <Button type="primary" onClick={() => setItineraryOpen(true)}>
            Add Itinerary
          </Button>

          <AdminItinerary
            open={itineraryOpen}
            onClose={() => setItineraryOpen(false)}
          />
        </>
      ) : (
        <>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
            className="book-btn"
          >
            Add New
          </Button>

          <Table dataSource={data} columns={columns} rowKey="id" />

          <Drawer
            title={editing ? "Edit Item" : "Create Item"}
            open={open}
            onClose={() => {
              setOpen(false);
              setEditing(null);
            }}
            extra={
              <Button type="primary" onClick={handleSubmit}>
                Save
              </Button>
            }
          >
            <Form layout="vertical" form={form}>
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="image"
                label="Image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload beforeUpload={() => false} listType="picture-card" maxCount={1}>
                  <PlusOutlined />
                </Upload>
              </Form.Item>
            </Form>
          </Drawer>
        </>
      )}

    </div>
  );
};

export default AdminAmenities;
