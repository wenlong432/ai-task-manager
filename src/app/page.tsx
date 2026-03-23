"use client";

import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
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

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);

    update();
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }

    // Safari/旧浏览器兼容：使用 addListener/removeListener
    // eslint-disable-next-line deprecation/deprecation
    mql.addListener(update);
    // eslint-disable-next-line deprecation/deprecation
    return () => mql.removeListener(update);
  }, [query]);

  return matches;
};

export default function Home() {
  const router = useRouter();
  const { todos, addTodo, updateTodo, toggleTodo, deleteTodo } = useTodoStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [todoForm] = Form.useForm<TodoFormValues>();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const filteredTodos = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return todos;
    }

    return todos.filter((todo) => {
      const title = todo.title.toLowerCase();
      const description = todo.description.toLowerCase();
      return title.includes(keyword) || description.includes(keyword);
    });
  }, [searchKeyword, todos]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const handleOpenCreateModal = () => {
    setEditingTodoId(null);
    setIsModalOpen(true);
  };

  const handleCancelCreateModal = () => {
    setEditingTodoId(null);
    setIsModalOpen(false);
  };

  const handleSubmitTodo = async () => {
    const values = await todoForm.validateFields();
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
    };

    if (editingTodoId) {
      updateTodo(editingTodoId, payload);
    } else {
      addTodo(payload);
    }

    setEditingTodoId(null);
    todoForm.resetFields();
    setIsModalOpen(false);
  };

  const handleToggleTodo = (id: string) => {
    toggleTodo(id);
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
  };

  const handleOpenEditModal = (id: string) => {
    const todo = todos.find((item) => item.id === id);
    if (!todo) {
      return;
    }

    setEditingTodoId(todo.id);
    setIsModalOpen(true);
  };

  const handleModalAfterOpenChange = (open: boolean) => {
    if (!open) {
      return;
    }

    if (editingTodoId) {
      const editingTodo = todos.find((item) => item.id === editingTodoId);
      if (editingTodo) {
        todoForm.setFieldsValue({
          title: editingTodo.title,
          description: editingTodo.description,
          priority: editingTodo.priority,
        });
      }
      return;
    }

    todoForm.resetFields();
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
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
          <Space>
            <Button onClick={() => handleOpenEditModal(record.id)}>Edit</Button>
            <Popconfirm
              title="Are you sure to delete this todo?"
              onConfirm={() => handleDeleteTodo(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDeleteTodo, handleToggleTodo, handleOpenEditModal],
  );

  if (!isAuthenticated) {
    return null;
  }

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
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Input.Search
            placeholder="Search by title or description"
            allowClear
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            style={{ width: 260 }}
          />
          <Typography.Text>{`欢迎, ${user?.name ?? "User"}`}</Typography.Text>
          <Button onClick={handleLogout}>Logout</Button>
          <Button type="primary" onClick={handleOpenCreateModal}>
            Add Todo
          </Button>
        </div>
      </header>

      {isMobile ? (
        <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
          {filteredTodos.length === 0 ? (
            <Typography.Text type="secondary">
              No matching todos found.
            </Typography.Text>
          ) : (
            filteredTodos.map((todo) => (
              <Card
                key={todo.id}
                size="small"
                title={todo.title}
                extra={<Tag color={priorityColorMap[todo.priority]}>{todo.priority.toUpperCase()}</Tag>}
              >
                <Typography.Paragraph
                  ellipsis={{ rows: 2, tooltip: todo.description }}
                  style={{ marginBottom: 12 }}
                >
                  {todo.description?.trim() ? todo.description : "-"}
                </Typography.Paragraph>

                <Space orientation="vertical" size="small" style={{ width: "100%" }}>
                  <Checkbox checked={todo.completed} onChange={() => handleToggleTodo(todo.id)}>
                    Completed
                  </Checkbox>

                  <Button onClick={() => handleOpenEditModal(todo.id)} block>
                    Edit
                  </Button>

                  <Popconfirm
                    title="Are you sure to delete this todo?"
                    onConfirm={() => handleDeleteTodo(todo.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger block>
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              </Card>
            ))
          )}
        </Space>
      ) : (
        <Table<TodoItem>
          rowKey="id"
          dataSource={filteredTodos}
          columns={columns}
          pagination={false}
          locale={{
            emptyText: searchKeyword
              ? "No matching todos found."
              : "No todos yet. Click 'Add Todo' to create one.",
          }}
        />
      )}

      <Modal
        title={editingTodoId ? "Edit Todo" : "Create Todo"}
        open={isModalOpen}
        afterOpenChange={handleModalAfterOpenChange}
        onOk={handleSubmitTodo}
        onCancel={handleCancelCreateModal}
        okText={editingTodoId ? "Update" : "Create"}
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
