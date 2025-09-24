// state/AuthContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginUser, signupUser } from "../service/api.Service"; // your API calls

type AuthUser = { id: string; email: string; name?: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ On first load — don’t restore from localStorage, just finish loading
  useEffect(() => {
    setLoading(false);
  }, []);

  // ✅ LOGIN
  const login = useCallback(async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    const { token: tkn, user: usr } = res;

    // ❌ no localStorage persistence here
    setToken(tkn);
    setUser(usr);
  }, []);

  // ✅ SIGNUP
  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await signupUser({ name, email, password });
      const { token: tkn, user: usr } = res;

      // ❌ no localStorage persistence here
      setToken(tkn);
      setUser(usr);
    },
    []
  );

  // ✅ LOGOUT
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
      setUser,
    }),
    [user, token, loading, login, signup, logout, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
