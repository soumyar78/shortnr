import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (name: string, username: string) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load initial state from localStorage if available
  const storedToken = localStorage.getItem('shortnr_token');
  const storedUser = localStorage.getItem('shortnr_user');
  
  let initialUser: User | null = null;
  if (storedUser) {
    try {
      initialUser = JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('shortnr_user');
    }
  }

  return {
    user: initialUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
    login: (user, token) => {
      localStorage.setItem('shortnr_token', token);
      localStorage.setItem('shortnr_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('shortnr_token');
      localStorage.removeItem('shortnr_user');
      set({ user: null, token: null, isAuthenticated: false });
    },
    updateUser: (name, username) => {
      set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, name, username };
        localStorage.setItem('shortnr_user', JSON.stringify(updated));
        return { user: updated };
      });
    }
  };
});
