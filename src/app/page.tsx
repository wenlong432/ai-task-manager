"use client";

import { Button, Checkbox, Form, Input, Modal, Select, Table, Tag, Typography, Popconfirm  } from "antd";
import type { TableProps } from "antd";
import { useMemo, useState } from "react";
import type { TodoItem, TodoPriority } from "../store/todoStore";
import { useTodoStore } from "../store/todoStore";

type TodoFormValues = {
  title: string;
  description: string;
  priority: TodoPriority;
};

const priorityColorMap: Record<TodoPriority, string> = {
  low: "blue",
  medium: "gold",
  high: "red",
};

export default function Home() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodoStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todoForm] = Form.useForm<TodoFormValues>();

  const handleOpenCreateModal = () => {
    setIsModalOpen(true);
  };

  const handleCancelCreateModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateTodo = async () => {
    const values = await todoForm.validateFields();

    addTodo({
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
    });

    todoForm.resetFields();
    setIsModalOpen(false);
  };

  const handleToggleTodo = (id: string) => {
    toggleTodo(id);
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
  };

  const columns: TableProps<TodoItem>["columns"] = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        ellipsis: true,
        render: (value: string) => (
          <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 1, tooltip: value }}>
            {value?.trim() ? value : "-"}
          </Typography.Paragraph>
        ),
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        render: (value: TodoPriority) => (
          <Tag color={priorityColorMap[value]}>
            {value.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: "Completed",
        key: "completed",
        align: "center",
        render: (_, record) => (
          <Checkbox checked={record.completed} onChange={() => handleToggleTodo(record.id)} />
        ),
      },
      {
        title: "Actions",
        key: "actions",
        align: "center",
        render: (_, record) => (
          <Popconfirm
            title="Are you sure to delete this todo?"
            onConfirm={() => handleDeleteTodo(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        ),
      },
    ],
    [handleDeleteTodo, handleToggleTodo],
  );

  return (
    <main style={{ margin: "0 auto", maxWidth: 1024, padding: "24px 16px" }}>
      <header
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Typography.Title level={2} style={{ margin: 0 }}>
          Todo App MVP
        </Typography.Title>
        <Button type="primary" onClick={handleOpenCreateModal}>
          Add Todo
        </Button>
      </header>

      <Table<TodoItem>
        rowKey="id"
        dataSource={todos}
        columns={columns}
        pagination={false}
        locale={{ emptyText: "No todos yet. Click 'Add Todo' to create one." }}
      />

      <Modal
        title="Create Todo"
        open={isModalOpen}
        onOk={handleCreateTodo}
        onCancel={handleCancelCreateModal}
        okText="Create"
        destroyOnHidden
      >
        <Form<TodoFormValues>
          form={todoForm}
          layout="vertical"
          initialValues={{ title: "", description: "", priority: "medium" }}
          preserve={false}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="e.g. Finish homepage MVP" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} placeholder="Optional details..." />
          </Form.Item>

          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: "Please select a priority" }]}
          >
            <Select
              options={[
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}
