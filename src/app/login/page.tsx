"use client";

import { Button, Card, Form, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (values: LoginFormValues) => {
    login({
      email: values.email.trim(),
      password: values.password,
    });
    router.push("/");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Login
        </Typography.Title>

        <Form<LoginFormValues> layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Any password is accepted" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Sign In
          </Button>
        </Form>
      </Card>
    </main>
  );
}
