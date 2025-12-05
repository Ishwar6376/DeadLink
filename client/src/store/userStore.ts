import { create } from "zustand";

interface UserState {
  name: string;
  email: string;
  password: string;
  isLoggedIn: boolean;
}

interface UserActions {
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  login: () => void;
  logout: () => void;
}

type UserStore = UserState & UserActions;

export const userStore = create<UserStore>()((set) => ({
  name: "",
  email: "",
  password: "",
  isLoggedIn: false,

  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),

  login: () =>
    set((state) => ({
      isLoggedIn: state.email !== "" && state.password !== "",
    })),

  logout: () =>
    set({
      isLoggedIn: false,
    }),
}));
