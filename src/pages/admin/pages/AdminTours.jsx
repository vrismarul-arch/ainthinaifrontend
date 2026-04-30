import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  Space,
  Table,
  message,
  Row,
  Col,
  Popconfirm,
  Image,
  Select
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import API from "../../../api/api";
import AdminItinerary from "./AdminItinerary";

const { TextArea } = Input;

const AdminTours = () => {

  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState(null);

  const [categories, setCategories] = useState([]);

  const [features, setFeatures] = useState({
    amenities: [],
    activities: [],
    food: [],
    things_to_know: []
  });

  useEffect(() => {
    fetchTours();
    fetchFeatures();
    fetchCategories();
  }, []);

  const fetchTours = async () => {
    try {
      const { data } = await API.get("/api/tours");
      setTours(data || []);
    } catch {
      message.error("Failed to load tours");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/api/categories");
      setCategories(data || []);
    } catch {
      message.error("Failed to load categories");
    }
  };

  const fetchFeatures = async () => {
    try {
      const types = ["amenities", "activities", "food", "things_to_know"];
      const res = await Promise.all(types.map(t => API.get(`/api/features/${t}`)));

      setFeatures({
        amenities: res[0]?.data || [],
        activities: res[1]?.data || [],
        food: res[2]?.data || [],
        things_to_know: res[3]?.data || []
      });

    } catch {
      message.error("Failed to load features");
    }
  };

  const normFile = (e) => Array.isArray(e) ? e : e?.fileList;

  const safeIds = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map(v => (typeof v === "object" ? v.id : v));
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.map(v => (typeof v === "object" ? v.id : v))
        : [];
    } catch {
      return [];
    }
  };

  const parseGallery = (value) => {
    if (!value) return [];
    try {
      const arr = typeof value === "string" ? JSON.parse(value) : value;
      return arr.map((url, i) => ({
        uid: `-${i}`,
        name: `gallery-${i}.png`,
        status: "done",
        url
      }));
    } catch {
      return [];
    }
  };

  const handleEdit = (record) => {

    const mainImageList = record.main_image ? [{
      uid: "-1",
      name: "main.png",
      status: "done",
      url: record.main_image
    }] : [];

    form.setFieldsValue({
      ...record,
      category_id: record.category_id,
      amenities: safeIds(record.amenities),
      activities: safeIds(record.activities),
      food: safeIds(record.food),
      things_to_know: safeIds(record.things_to_know),
      main_image: mainImageList,
      gallery_images: parseGallery(record.gallery_images)
    });

    setEditingId(record.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/tours/${id}`);
      message.success("Deleted");
      fetchTours();
    } catch {
      message.error("Delete failed");
    }
  };

  const openItinerary = (id) => {
    setSelectedTourId(id);
    setItineraryOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const fd = new FormData();

      Object.keys(values).forEach(k => {
        if (k === "main_image" || k === "gallery_images") return;

        if (Array.isArray(values[k])) {
          fd.append(k, JSON.stringify(values[k]));
        } else {
          fd.append(k, values[k] ?? "");
        }
      });

      if (values.main_image?.[0]?.originFileObj) {
        fd.append("main_image", values.main_image[0].originFileObj);
      }

      values.gallery_images?.forEach(f => {
        if (f.originFileObj) {
          fd.append("gallery_images", f.originFileObj);
        }
      });

      if (editingId) {
        await API.put(`/api/tours/${editingId}`, fd);
      } else {
        await API.post("/api/tours/create", fd);
      }

      message.success("Saved successfully");

      setOpen(false);
      setEditingId(null);
      form.resetFields();
      fetchTours();

    } catch (err) {
      console.error(err);
      message.error("Save error");
    } finally {
      setLoading(false);
    }
  };

const getOptions = (list) =>
    list.map(item => ({
      value: item.id,
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {item.image && (
            <img
              src={item.image}
              alt=""
              style={{ width: 22, height: 22, borderRadius: 4 }}
            />
          )}
          {item.title}
        </div>
      )
    }));

  const columns = [
    {
      title: "Image",
      dataIndex: "main_image",
      render: img => img ? <Image src={img} width={60} /> : "No Image"
    },
    { title: "Title", dataIndex: "title" },
    { title: "Place", dataIndex: "place" },
    {
      title: "Category",
      render: (_, r) => categories.find(c => c.id === r.category_id)?.name || "-"
    },
 {
  title: "Action",
  render: (_, r) => (
    <Space>

      {/* Edit */}
      <Button
        icon={<EditOutlined />}
        onClick={() => handleEdit(r)}
      />

      {/* Itinerary */}
      <Button
        type="dashed"
        onClick={() => openItinerary(r.id)}
      >
        Itinerary
      </Button>

      {/* Delete */}
      <Popconfirm
        title="Delete?"
        onConfirm={() => handleDelete(r.id)}
      >
        <Button icon={<DeleteOutlined />} danger />
      </Popconfirm>

    </Space>
  )
}

  ];

  return (
    <div style={{ padding: 24 }}>

      <Button type="primary" icon={<PlusOutlined />} onClick={() => {
        setEditingId(null);
        form.resetFields();
        setOpen(true);
      }} className="book-btn">
        Create Tour
      </Button>

      <Table dataSource={tours} columns={columns} rowKey="id" style={{ marginTop: 20 }} />

      <Drawer title={editingId ? "Edit Tour" : "Create Tour"} open={open} onClose={() => setOpen(false)} width={720}>
        <Form layout="vertical" form={form}>

          {/* CATEGORY */}
          <Form.Item name="category_id" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select category">
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="place" label="Place">
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="adult_price" label="Adult Price">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="child_price" label="Child Price">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="amenities" label="Amenities">
            <Select mode="multiple" options={getOptions(features.amenities)} />
          </Form.Item>

          <Form.Item name="activities" label="Activities">
            <Select mode="multiple" options={getOptions(features.activities)} />
          </Form.Item>

          <Form.Item name="food" label="Food">
            <Select mode="multiple" options={getOptions(features.food)} />
          </Form.Item>

          <Form.Item name="things_to_know" label="Things To Know">
            <Select mode="multiple" options={getOptions(features.things_to_know)} />
          </Form.Item>
<Row gutter={16}>
  <Col span={12}>
    <Form.Item name="state" label="State">
      <Input placeholder="Tamil Nadu" />
    </Form.Item>
  </Col>

  <Col span={12}>
    <Form.Item name="district" label="District">
      <Input placeholder="Coimbatore" />
    </Form.Item>
  </Col>
</Row>

<Form.Item name="location" label="Location (Google Maps Link)">
  <Input placeholder="https://maps.google.com/..." />
</Form.Item>  
          <Form.Item name="main_image" label="Main Image" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
              <PlusOutlined />
            </Upload>
          </Form.Item>

          <Form.Item name="gallery_images" label="Gallery" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload listType="picture-card" multiple beforeUpload={() => false}>
              <PlusOutlined />
            </Upload>
          </Form.Item>

          <Button type="primary" loading={loading} onClick={handleSubmit} block>
            Save
          </Button>

        </Form>
      </Drawer>

      <AdminItinerary open={itineraryOpen} onClose={() => setItineraryOpen(false)} tourId={selectedTourId} />

    </div>
  );
};

export default AdminTours;