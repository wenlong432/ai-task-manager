import { create } from "zustand";

export interface AuthUser {
  name: string;
  email: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => void;
  logout: () => void;
}

const getNameFromEmail = (email: string): string => {
  const [localPart] = email.split("@");
  const normalized = localPart?.trim();
  return normalized || "User";
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: ({ email }) =>
    set({
      user: {
        name: getNameFromEmail(email),
        email: email.trim(),
      },
      isAuthenticated: true,
    }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));
