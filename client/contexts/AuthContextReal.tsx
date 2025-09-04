import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isPremium: boolean;
  subscriptionStatus: string;
  subscriptionPlan?: string;
  assinante: boolean;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Verificar autenticação ao carregar
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("xnema_token");
      const storedUser = localStorage.getItem("xnema_user");

      // Se houver override de admin, confie no usuário salvo
      const adminOverride = localStorage.getItem("xnema_admin_override") === "true";
      if (adminOverride && storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u?.role === "admin") {
            setUser(u);
            return;
          }
        } catch {}
      }

      // Helper para parse seguro
      const safeParse = async (resp: Response) => {
        try {
          const t = await resp.text();
          return t ? JSON.parse(t) : {};
        } catch {
          return {} as any;
        }
      };

      // Testar rapidamente se o backend está disponível antes de chamar /api/auth/me
      const backendAvailable = await (async () => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 1500);
          const resp = await fetch("/api/ping", { signal: controller.signal });
          clearTimeout(timeout);
          return resp.ok;
        } catch {
          return false;
        }
      })();

      // Se houver token + user e backend disponível, valida no backend
      if (token && storedUser && backendAvailable) {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await safeParse(response);
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem("xnema_user", JSON.stringify(data.user));
            return;
          }
          logout();
          return;
        }
        // Falha de validação no backend: efetuar logout
        logout();
        return;
      }

      // Se backend indisponível, utilizar cache local imediatamente
      if (!backendAvailable && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          return;
        } catch {
          // Se o cache estiver corrompido, efetuar logout
          logout();
          return;
        }
      }

      // Se não houver token mas existir usuário salvo, usar direto
      if (!token) {
        const su = localStorage.getItem("xnema_user");
        if (su) {
          try {
            setUser(JSON.parse(su));
            return;
          } catch {
            logout();
          }
        }
      }
    } catch (error) {
      console.warn("Falha ao verificar autenticação, usando cache local");
      const su = localStorage.getItem("xnema_user");
      if (su) {
        try {
          setUser(JSON.parse(su));
        } catch {
          logout();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const safeParse = async (resp: Response) => {
        try {
          const t = await resp.text();
          return t ? JSON.parse(t) : {};
        } catch {
          return {} as any;
        }
      };

      const response = await fetch("/api/auth/login-subscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await safeParse(response);
      if (data && data.success && data.token && data.user) {
        localStorage.setItem("xnema_token", data.token);
        localStorage.setItem("xnema_user", JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem("xnema_token");
    localStorage.removeItem("xnema_user");
    localStorage.removeItem("xnema_admin_override");
    setUser(null);
  };

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export default AuthProvider;
