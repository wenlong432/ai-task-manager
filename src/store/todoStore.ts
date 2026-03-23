import { create } from "zustand";

export type TodoPriority = "low" | "medium" | "high";

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: TodoPriority;
}

type AddTodoPayload = Omit<TodoItem, "id" | "completed">;
type UpdateTodoPayload = Omit<TodoItem, "id" | "completed">;

export interface TodoStore {
  todos: TodoItem[];
  addTodo: (payload: AddTodoPayload) => void;
  updateTodo: (id: string, payload: UpdateTodoPayload) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

const generateTodoId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  addTodo: (payload) =>
    set((state) => ({
      todos: [
        ...state.todos,
        {
          id: generateTodoId(),
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          completed: false,
        },
      ],
    })),
  updateTodo: (id, payload) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title: payload.title,
              description: payload.description,
              priority: payload.priority,
            }
          : todo,
      ),
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    })),
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),
}));
