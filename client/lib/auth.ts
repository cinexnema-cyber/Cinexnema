import { supabase } from "./supabase";
import { User } from "./supabase";
import { getRedirectUrls } from "./config";

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  bio?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private static lastRegisterAttempt = 0;
  // Request password reset
  static async requestPasswordReset(
    email: string,
  ): Promise<{ error: string | null }> {
    try {
      console.log("Requesting password reset for:", email);

      const redirectUrls = getRedirectUrls();
      console.log("🔗 Usando URL de reset:", redirectUrls.resetPassword);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrls.resetPassword,
      });

      if (error) {
        console.error("Password reset error:", error);
        return { error: error.message };
      }

      console.log("Password reset email sent successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Password reset error:", error);
      return { error: error.message || "Erro ao enviar email de recuperação" };
    }
  }

  // Update password
  static async updatePassword(
    newPassword: string,
  ): Promise<{ error: string | null }> {
    try {
      console.log("Updating password...");

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Password update error:", error);
        return { error: error.message };
      }

      console.log("Password updated successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Password update error:", error);
      return { error: error.message || "Erro ao atualizar senha" };
    }
  }

  // Verify password reset token
  static async verifyPasswordResetToken(
    accessToken: string,
    refreshToken: string,
  ): Promise<{ error: string | null }> {
    try {
      console.log("Verifying password reset token...");

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("Token verification error:", error);
        return { error: error.message };
      }

      console.log("Token verified successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Token verification error:", error);
      return { error: error.message || "Token inválido ou expirado" };
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        return { session: null, error: error.message };
      }

      return { session, error: null };
    } catch (error: any) {
      console.error("Session error:", error);
      return { session: null, error: error.message };
    }
  }

  // Logout from Supabase (duplicate method removed - using the one below)
  // Register new user
  static async register(
    userData: RegisterData,
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const now = Date.now();
      if (now - this.lastRegisterAttempt < 25000) {
        const wait = Math.ceil((25000 - (now - this.lastRegisterAttempt)) / 1000);
        return { user: null, error: `Aguarde ${wait}s antes de tentar novamente.` };
      }
      this.lastRegisterAttempt = now;

      // Test Supabase connection first
      console.log("Testing Supabase connection...");

      // First, create auth user in Supabase Auth
      console.log("Attempting to create auth user...");
      const redirectUrls = getRedirectUrls();
      console.log("🔗 Usando URL de confirmação:", redirectUrls.emailConfirmed);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrls.emailConfirmed,
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        const msg = String(authError.message || "");
        if (msg.includes("For security purposes") || msg.includes("only request this")) {
          return { user: null, error: "Muitas tentativas seguidas. Aguarde ~30 segundos e tente novamente." };
        }
        if (msg.includes("Too many requests")) {
          return { user: null, error: "Muitas tentativas. Tente novamente em alguns minutos." };
        }
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        console.error("No user returned from auth");
        return { user: null, error: "Falha ao criar usuário. Tente novamente em instantes." };
      }

      // Then create user profile in our CineXnema table
      const { data: userProfile, error: profileError } = await supabase
        .from("CineXnema")
        .insert([
          {
            user_id: authData.user.id,
            username: userData.username,
            email: userData.email,
            displayName: userData.displayName,
            bio: userData.bio || "",
            passwordHash: "", // Will be handled by Supabase auth
            subscriptionStatus: "inativo",
            subscriptionStart: new Date(),
            comissaoPercentual: 0,
          },
        ])
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, we should cleanup the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { user: null, error: profileError.message };
      }

      // Generate JWT token for email confirmation
      const confirmationToken = await this.generateConfirmationToken(
        authData.user.id,
        userData.email,
        "subscriber",
      );
      const confirmationLink = `${window.location.origin}/welcome?token=${confirmationToken}`;

      console.log("🔗 Link de confirmação gerado:", confirmationLink);
      console.log(
        "📧 Copie este link para acessar diretamente:",
        confirmationLink,
      );

      // Return user profile with Supabase Auth UUID (not table ID)
      return {
        user: {
          ...userProfile,
          id: authData.user.id, // Use Supabase Auth UUID instead of table ID
          confirmationLink,
        },
        error: null,
      };
    } catch (error: any) {
      const msg = String(error?.message || "");
      if (msg.includes("For security purposes") || msg.includes("only request this")) {
        return { user: null, error: "Muitas tentativas seguidas. Aguarde ~30 segundos e tente novamente." };
      }
      return { user: null, error: "Falha no cadastro. Tente novamente em instantes." };
    }
  }

  // Login user with enhanced validation
  static async login(
    loginData: LoginData,
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      console.log("🔐 Iniciando processo de login para:", loginData.email);

      // Validate input
      if (!loginData.email || !loginData.password) {
        return { user: null, error: "Email e senha são obrigatórios" };
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginData.email)) {
        return { user: null, error: "Formato de email inválido" };
      }

      // Attempt Supabase authentication
      console.log("🔍 Verificando credenciais no Supabase...");
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: loginData.email.toLowerCase().trim(),
          password: loginData.password,
        });

      if (authError) {
        console.error("❌ Erro de autenticação:", authError.message);

        // Provide user-friendly error messages
        if (authError.message.includes("Invalid login credentials")) {
          return { user: null, error: "Email ou senha incorretos" };
        }
        if (authError.message.includes("Email not confirmed")) {
          return {
            user: null,
            error: "Email não confirmado. Verifique sua caixa de entrada.",
          };
        }
        if (authError.message.includes("Too many requests")) {
          return {
            user: null,
            error:
              "Muitas tentativas de login. Tente novamente em alguns minutos.",
          };
        }

        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        console.error("❌ Nenhum usuário retornado após autenticação");
        return { user: null, error: "Falha na autenticação" };
      }

      console.log(
        "✅ Autenticação bem-sucedida, buscando perfil do usuário...",
      );

      // Get user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from("CineXnema")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (profileError) {
        console.error("❌ Erro ao buscar perfil:", profileError.message);

        // If profile doesn't exist, create one
        if (profileError.code === "PGRST116") {
          console.log("📝 Criando perfil de usuário...");
          const newProfile = {
            user_id: authData.user.id,
            email: authData.user.email,
            username: authData.user.email?.split("@")[0] || "usuario",
            displayName:
              authData.user.user_metadata?.display_name ||
              authData.user.email?.split("@")[0] ||
              "Usuário",
            bio: "",
            subscriptionStatus: "inativo" as const,
            comissaoPercentual: 0,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from("CineXnema")
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error("❌ Erro ao criar perfil:", createError.message);
            return { user: null, error: "Erro ao criar perfil do usuário" };
          }

          console.log("✅ Perfil criado com sucesso");
          return { user: createdProfile, error: null };
        }

        return { user: null, error: "Erro ao carregar perfil do usuário" };
      }

      console.log("✅ Login completo para usuário:", userProfile.displayName);
      return { user: userProfile, error: null };
    } catch (error: any) {
      console.error("💥 Erro inesperado no login:", error);
      return { user: null, error: "Erro interno do sistema. Tente novamente." };
    }
  }

  // Logout user
  static async logout(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: "Logout failed" };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{
    user: User | null;
    error: string | null;
  }> {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        return { user: null, error: authError?.message || "No user found" };
      }

      const { data: userProfile, error: profileError } = await supabase
        .from("CineXnema")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (profileError) {
        return { user: null, error: profileError.message };
      }

      return { user: userProfile, error: null };
    } catch (error) {
      return { user: null, error: "Failed to get current user" };
    }
  }

  // Request password reset (duplicate method removed - using the one above)

  // Reset password with token
  static async resetPassword(
    password: string,
  ): Promise<{ error: string | null }> {
    try {
      console.log("🔑 Iniciando reset de senha...");

      // Verificar se há uma sessão ativa
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.error("❌ Nenhuma sessão ativa encontrada para reset de senha");
        return { error: "Sessão de reset inválida. Solicite um novo link." };
      }

      console.log("✅ Sessão ativa encontrada, atualizando senha...");

      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("❌ Erro ao atualizar senha:", error);

        // Tipos específicos de erro
        if (error.message.includes('new password should be different')) {
          return { error: "A nova senha deve ser diferente da atual." };
        }
        if (error.message.includes('password')) {
          return { error: "Senha inválida. Verifique os critérios de segurança." };
        }

        return { error: error.message };
      }

      console.log("✅ Senha atualizada com sucesso no Supabase!");

      // Tentar atualizar também no banco de dados local se necessário
      if (data.user) {
        console.log("💾 Usuário atualizado:", {
          id: data.user.id,
          email: data.user.email,
          updated_at: data.user.updated_at,
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error("💥 Erro inesperado no reset de senha:", error);
      return {
        error: error.message || "Falha ao redefinir senha. Tente novamente.",
      };
    }
  }

  // Check if user has active subscription
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from("CineXnema")
        .select("subscriptionStatus, subscriptionStart")
        .eq("user_id", userId)
        .single();

      if (error || !user) return false;

      return user.subscriptionStatus === "ativo";
    } catch (error) {
      return false;
    }
  }

  // Create subscription
  static async createSubscription(
    userId: string,
    planType: "monthly" | "yearly",
  ): Promise<{ error: string | null }> {
    try {
      console.log("🔍 createSubscription called with:", {
        userId,
        planType,
        userIdType: typeof userId,
      });

      // Convert to string if needed
      const userIdString = String(userId);
      console.log("🔍 Converted userId to string:", userIdString);

      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userIdString)) {
        console.error(
          "❌ Invalid UUID format. Expected UUID, got:",
          userIdString,
        );
        console.error(
          "❌ This typically means the user ID is coming from the database table ID instead of Supabase Auth UUID",
        );
        return {
          error: `Invalid user ID format: ${userIdString}. Expected UUID format.`,
        };
      }

      console.log("✅ UUID validation passed for:", userIdString);

      const startDate = new Date();

      // First, check if user exists
      console.log("🔍 Checking if user exists in CineXnema table...");
      const { data: existingUser, error: checkError } = await supabase
        .from("CineXnema")
        .select("user_id, subscriptionStatus")
        .eq("user_id", userIdString)
        .single();

      if (checkError) {
        console.error("❌ Error checking user existence:", checkError);
        return { error: `User not found in database: ${checkError.message}` };
      }

      if (!existingUser) {
        console.error("❌ User not found in CineXnema table");
        return { error: "User profile not found. Please contact support." };
      }

      console.log("✅ User found:", existingUser);

      // Update user subscription status
      console.log("🔄 Updating user subscription status...");
      const { error: userError } = await supabase
        .from("CineXnema")
        .update({
          subscriptionStatus: "ativo",
          subscriptionStart: startDate,
        })
        .eq("user_id", userIdString);

      if (userError) {
        console.error("❌ User update error:", userError);
        console.error("❌ Error details:", JSON.stringify(userError, null, 2));
        return {
          error:
            userError.message || "Failed to update user subscription status",
        };
      }

      console.log("✅ User subscription status updated successfully");
      console.log(
        "✅ Subscription activated for user:",
        userIdString,
        "Plan:",
        planType,
      );
      return { error: null };
    } catch (error) {
      console.error("Unexpected error in createSubscription:", error);
      return { error: "Failed to create subscription" };
    }
  }

  // Generate confirmation token (simulated - in production, this would be done server-side)
  private static async generateConfirmationToken(
    userId: string,
    email: string,
    role: string,
  ): Promise<string> {
    // In a real implementation, this would call your backend to generate the JWT
    // For now, we'll create a simple token structure
    const payload = {
      userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    // In production, encode this properly with your JWT secret
    return btoa(JSON.stringify(payload));
  }

  // Validate and auto-login from token
  static async loginFromToken(
    token: string,
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      // Decode token (in production, verify with JWT library)
      const payload = JSON.parse(atob(token));

      // Check token expiry
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return { user: null, error: "Token expired" };
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from("CineXnema")
        .select("*")
        .eq("user_id", payload.userId)
        .single();

      if (profileError) {
        return { user: null, error: "Invalid token or user not found" };
      }

      return { user: userProfile, error: null };
    } catch (error) {
      return { user: null, error: "Invalid token format" };
    }
  }
}
