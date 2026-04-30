import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Drawer,
  Select,
  TimePicker,
  message,
  Space,
  Divider,
  Row,
  Col,
  Popconfirm
} from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import API from "../../../api/api";

const { TextArea } = Input;
const periods = ["Morning", "Afternoon", "Evening", "Night"];

const normFile = (e) => Array.isArray(e) ? e : e?.fileList || [];

const AdminItinerary = ({ open, onClose, tourId }) => {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && tourId) fetchItinerary();
    else form.resetFields();
  }, [open, tourId]);

  const fetchItinerary = async () => {
    try {
      setLoading(true);

      const { data } = await API.get(`/api/itinerary/${tourId}`);

      if (!Array.isArray(data)) {
        form.setFieldsValue({ itinerary: [] });
        return;
      }

      const formatted = data.map((day, dayIndex) => ({
        day: day.day,
        activities: (day.activities || []).map((act, actIndex) => ({
          ...act,
          time: act.time ? dayjs(act.time, "hh:mm A") : null,
          images: (act.images || []).map((url, imgIndex) => ({
            uid: `existing-${dayIndex}-${actIndex}-${imgIndex}`,
            name: `image-${imgIndex}`,
            status: "done",
            url,
            thumbUrl: url
          }))
        }))
      }));

      form.setFieldsValue({ itinerary: formatted });

    } catch (err) {
      console.error(err);
      message.error("Failed to load itinerary");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const fd = new FormData();
      fd.append("tourId", tourId);

      const processed = (values.itinerary || []).map(day => ({
        ...day,
        activities: (day.activities || []).map(act => {
          const existingImages = (act.images || [])
            .filter(f => !f.originFileObj)
            .map(f => f.url);

          return {
            ...act,
            time: act.time ? act.time.format("hh:mm A") : null,
            images: existingImages
          };
        })
      }));

      fd.append("itinerary", JSON.stringify(processed));

      // Append new files
      values.itinerary?.forEach(day => {
        day.activities?.forEach(act => {
          act.images?.forEach(file => {
            if (file.originFileObj) {
              fd.append("files", file.originFileObj);
            }
          });
        });
      });

      await API.post("/api/itinerary/save", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      message.success("Itinerary updated successfully");
      onClose();

    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={<b>Manage Tour Itinerary</b>}
      width={720}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </Space>
      }
    >

      <Form layout="vertical" form={form} initialValues={{ itinerary: [] }}>

        <Form.List name="itinerary">
          {(days, { add, remove }) => (
            <>
              {days.map(({ key, name, ...restField }) => (
                <div key={key} style={dayCardStyle}>

                  <Row justify="space-between">
                    <Col>
                      <Form.Item
                        {...restField}
                        name={[name, "day"]}
                        label="Day Number"
                        rules={[{ required: true }]}
                      >
                        <Input type="number" style={{ width: 120 }} />
                      </Form.Item>
                    </Col>

                    <Col>
                      <Popconfirm title="Delete day?" onConfirm={() => remove(name)}>
                        <Button danger type="text" icon={<DeleteOutlined />}>
                          Remove
                        </Button>
                      </Popconfirm>
                    </Col>
                  </Row>

                  <Divider>Activities</Divider>

                  <Form.List name={[name, "activities"]}>
                    {(acts, { add: addAct, remove: removeAct }) => (
                      <>
                        {acts.map(({ key: k, name: n, ...restAct }) => (
                          <div key={k} style={activityCardStyle}>

                            <Row gutter={16}>
                              <Col span={10}>
                                <Form.Item {...restAct} name={[n, "period"]} label="Period">
                                  <Select>
                                    {periods.map(p => (
                                      <Select.Option key={p} value={p}>{p}</Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>

                              <Col span={10}>
                                <Form.Item {...restAct} name={[n, "time"]} label="Time">
                                  <TimePicker format="hh:mm A" use12Hours style={{ width: "100%" }} />
                                </Form.Item>
                              </Col>

                              <Col span={4}>
                                <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeAct(n)} />
                              </Col>
                            </Row>

                            <Form.Item {...restAct} name={[n, "title"]} label="Title">
                              <Input />
                            </Form.Item>

                            <Form.Item {...restAct} name={[n, "description"]} label="Description">
                              <TextArea rows={2} />
                            </Form.Item>

                            <Form.Item
                              {...restAct}
                              name={[n, "images"]}
                              label="Images"
                              valuePropName="fileList"
                              getValueFromEvent={normFile}
                            >
                              <Upload listType="picture-card" beforeUpload={() => false} multiple>
                                <PlusOutlined />
                              </Upload>
                            </Form.Item>

                          </div>
                        ))}

                        <Button type="dashed" block onClick={() => addAct()} icon={<PlusOutlined />}>
                          Add Activity
                        </Button>
                      </>
                    )}
                  </Form.List>

                </div>
              ))}

              <Button type="primary" ghost block onClick={() => add()} icon={<PlusOutlined />}>
                Add Day
              </Button>

            </>
          )}
        </Form.List>

      </Form>

    </Drawer>
  );
};

const dayCardStyle = {
  border: "1px solid #eee",
  padding: 20,
  marginBottom: 20,
  borderRadius: 10,
  background: "#fff"
};

const activityCardStyle = {
  background: "#fafafa",
  padding: 16,
  marginBottom: 16,
  borderRadius: 8,
  border: "1px dashed #ddd"
};

export default AdminItinerary;
