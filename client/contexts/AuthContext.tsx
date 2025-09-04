import { AuthService } from "@/lib/auth";
import {
  AuthProvider as RealAuthProvider,
  useAuth as useAuthReal,
  type AuthUser as RealAuthUser,
} from "./AuthContextReal";

export type AuthUser = RealAuthUser;

export const AuthProvider = RealAuthProvider;

export const useAuth = () => {
  const ctx = useAuthReal();

  const register = async (userData: any) => {
    try {
      const { selectedPlan, ...registrationData } = userData || {};
      const { AuthService } = await import("@/lib/auth");
      const { user: authUser, error } = await AuthService.register(
        registrationData,
      );

      if (!error && authUser && selectedPlan) {
        const { AuthService } = await import("@/lib/auth");
        await AuthService.createSubscription(
          authUser.id || authUser.user_id,
          selectedPlan,
        );
      }

      if (error || !authUser) {
        const response = await fetch("/api/auth/register-subscriber", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userData.displayName || userData.username || userData.email?.split("@")[0],
            email: userData.email,
            password: userData.password,
            plan: selectedPlan || "monthly",
          }),
        });
        const safeParse = async (resp: Response) => {
          try {
            const t = await resp.text();
            return t ? JSON.parse(t) : {};
          } catch {
            return {} as any;
          }
        };
        const result = await safeParse(response);
        if (result && result.success && result.user) {
          const transformed: RealAuthUser = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name || result.user.email.split("@")[0],
            role: result.user.role || (result.user.assinante ? "subscriber" : "user"),
            isPremium: Boolean(result.user.assinante || result.user.isPremium),
            subscriptionStatus: result.user.subscriptionStatus || (result.user.assinante ? "active" : "pending"),
            subscriptionPlan: result.user.subscriptionPlan,
            assinante: Boolean(result.user.assinante || result.user.isPremium),
          } as RealAuthUser;
          ctx.setUser(transformed);
          localStorage.setItem("xnema_user", JSON.stringify(transformed));
          if (result.token) localStorage.setItem("xnema_token", result.token);
          return { success: true, user: transformed };
        }
        return { success: false, message: (result && result.message) || error || "Registration failed" };
      }

      const transformed: RealAuthUser = {
        id: authUser.id || authUser.user_id,
        email: authUser.email,
        name: authUser.displayName || authUser.email?.split("@")[0],
        role:
          authUser.subscriptionStatus === "ativo" ? "subscriber" : "user",
        isPremium: authUser.subscriptionStatus === "ativo",
        subscriptionStatus:
          authUser.subscriptionStatus === "ativo" ? "active" : "pending",
        subscriptionPlan: authUser.subscriptionPlan,
        assinante: authUser.subscriptionStatus === "ativo",
      } as any;

      ctx.setUser(transformed);
      localStorage.setItem("xnema_user", JSON.stringify(transformed));
      return { success: true, user: transformed };
    } catch (e) {
      console.error("Register error:", e);
      return { success: false, message: "Registration failed" };
    }
  };

  const hasActiveSubscription = async (): Promise<boolean> => {
    if (!ctx.user) return false;
    try {
      return await AuthService.hasActiveSubscription(ctx.user.id);
    } catch {
      return !!ctx.user.assinante;
    }
  };

  const updateUserRole = async (
    role: "user" | "admin" | "creator" | "subscriber",
  ): Promise<void> => {
    if (!ctx.user) throw new Error("Usuário não está logado");
    const updated = { ...ctx.user, role } as RealAuthUser;
    ctx.setUser(updated);
    localStorage.setItem("xnema_user", JSON.stringify(updated));
  };

  return {
    ...ctx,
    register,
    hasActiveSubscription,
    updateUserRole,
  } as typeof ctx & {
    register: (userData: any) => Promise<any>;
    hasActiveSubscription: () => Promise<boolean>;
    updateUserRole: (
      role: "user" | "admin" | "creator" | "subscriber",
    ) => Promise<void>;
  };
};

export default AuthProvider;
