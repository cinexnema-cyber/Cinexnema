import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
// Database configuration removed - using only Supabase
import { handleDemo } from "./routes/demo";
import { login, register, validateToken } from "./routes/auth";
import { checkUserExists } from "./routes/check-user";
import {
  registerCreator,
  getPendingCreators,
  approveCreator,
  rejectCreator,
  getCreatorAnalytics,
  generateAffiliateLink,
} from "./routes/creator-registration";
import { authenticateToken, requireSubscriber } from "./middleware/auth";
import paymentsRouter from "./routes/payments";
import creatorRouter from "./routes/creator";
import {
  getSubscriptionPlans,
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  handleMercadoPagoWebhook,
} from "./routes/subscription";
import {
  createPayment,
  handleWebhook,
  getPaymentStatus,
  getUserPayments,
} from "./routes/mercado-pago";
import {
  getCreatorBlocks,
  calculateBlocks,
  checkUploadCapacity,
  purchaseBlocks,
  handleBlocksWebhook,
  getPurchaseHistory,
  addVideoToBlocks,
  removeVideoFromBlocks,
  getAllCreatorsBlocks,
} from "./routes/creator-blocks";
import {
  uploadContent,
  getCreatorContent,
  updateContentStatus,
  getPendingContent,
  recordView,
} from "./routes/content";
import {
  handleCreatorAnalytics,
  handleVideoAnalytics,
} from "./routes/analytics-creator";
import {
  getCreatorVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
} from "./routes/video-upload";
import {
  getPendingVideos,
  getAllVideos,
  approveVideo,
  rejectVideo,
  deleteVideoAdmin,
  getVideoForReview,
  getAdminStats,
} from "./routes/video-admin";
import {
  getCreatorLimits,
  updateCreatorLimits,
  restrictCreatorUpload,
  allowCreatorUpload,
  getAllCreatorsLimits,
  checkUploadCapacity as checkUploadCapacityLimits,
  updateAllGracePeriods,
} from "./routes/creator-limits";
// Mux webhook removed (migrated to api.video only)
import { createPreference as mpCreatePreference, handleWebhook as mpHandleWebhook, getPaymentStatus as mpGetPaymentStatus, testConfiguration as mpTestConfiguration, activateUser as mpActivateUser } from "./routes/mercadopago";
import { notifySupabasePaymentApproved } from "./routes/integrations";
import { checkDeviceAccess } from "./routes/device-access";
import { saveFamilyMembers, getFamilyMembers } from "./routes/family";
import { chat as aiChat } from "./routes/ai";
import { getCreatorVideosWithAnalytics } from "./routes/creator-videos";
import { getCreatorActiveApprovedVideos } from "./routes/creator-active-videos";
// MongoDB initialization removed - using Supabase only

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Database operations now handled by Supabase
  console.log("✅ Using Supabase for all database operations");

  // Serve uploaded files publicly (thumbnails, temp files, etc.)
  const uploadsDir = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsDir));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // AI chat route (requires auth)
  app.post("/api/ai/chat", authenticateToken, aiChat);

  // Creator videos + analytics (period filter)
  app.get("/api/creator/videos", authenticateToken, getCreatorVideosWithAnalytics);
  app.get("/api/creator/active-videos", authenticateToken, getCreatorActiveApprovedVideos);
  const { getCreatorMyVideos } = require("./routes/creator-my-videos");
  const { authCreator } = require("./middleware/authRole");
  app.get("/api/creator/my-videos", authCreator, getCreatorMyVideos);

  // Verificar status do banco de dados
  app.get("/api/admin/db-status", async (_req, res) => {
    try {
      const User = require("./models/User").default;
      const usersCount = await User.countDocuments();

      res.json({
        success: true,
        message: "Banco de dados conectado",
        usersCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Erro ao verificar banco:", error);
      res.status(500).json({
        success: false,
        message: "Erro de conexão com banco de dados",
        error: error.message,
      });
    }
  });

  // Criar usuários de teste route
  app.post("/api/admin/create-test-users", async (_req, res) => {
    try {
      const User = require("./models/User").default;

      // Verificar se usuários já existem
      const usersCount = await User.countDocuments();
      console.log(`📊 Usuários existentes: ${usersCount}`);

      const testUsers = [];

      // 1. Criar Assinante de teste
      const subscriberExists = await User.findOne({
        email: "assinante@teste.com",
      });
      if (!subscriberExists) {
        const subscriberUser = new User({
          email: "assinante@teste.com",
          password: "123456",
          nome: "Assinante Teste",
          role: "subscriber",
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
          subscriptionPlan: "monthly",
          subscriptionStart: new Date(),
          watchHistory: [],
        });
        await subscriberUser.save();
        testUsers.push({ email: "assinante@teste.com", role: "subscriber" });
        console.log("✅ Usuário Assinante criado");
      } else {
        console.log("ℹ�� Usuário Assinante já existe");
      }

      // 2. Criar Criador de teste
      const creatorExists = await User.findOne({ email: "criador@teste.com" });
      if (!creatorExists) {
        const creatorUser = new User({
          email: "criador@teste.com",
          password: "123456",
          nome: "Criador Teste",
          role: "creator",
          isPremium: false,
          subscriptionStatus: "pending",
          assinante: false,
          creatorProfile: {
            bio: "Criador de conteúdo de teste",
            portfolio: "https://portfolio-teste.com",
            status: "approved",
            totalVideos: 0,
            approvedVideos: 0,
            rejectedVideos: 0,
            totalViews: 0,
            monthlyEarnings: 0,
            affiliateEarnings: 0,
            referralCount: 0,
          },
        });
        await creatorUser.save();
        testUsers.push({ email: "criador@teste.com", role: "creator" });
        console.log("✅ Usuário Criador criado");
      } else {
        console.log("ℹ️ Usuário Criador já existe");
      }

      // 3. Criar Admin de teste
      const adminExists = await User.findOne({ email: "admin@teste.com" });
      if (!adminExists) {
        const adminUser = new User({
          email: "admin@teste.com",
          password: "123456",
          nome: "Admin Teste",
          role: "admin",
          isPremium: true,
          subscriptionStatus: "active",
          assinante: true,
        });
        await adminUser.save();
        testUsers.push({ email: "admin@teste.com", role: "admin" });
        console.log("✅ Usuário Admin criado");
      } else {
        console.log("ℹ️ Usuário Admin já existe");
      }

      const finalUsersCount = await User.countDocuments();

      res.json({
        success: true,
        message: "Usuários de teste criados com sucesso",
        usersCreated: testUsers,
        totalUsers: finalUsersCount,
        credentials: [
          {
            email: "assinante@teste.com",
            password: "123456",
            role: "subscriber",
          },
          { email: "criador@teste.com", password: "123456", role: "creator" },
          { email: "admin@teste.com", password: "123456", role: "admin" },
        ],
      });
    } catch (error) {
      console.error("❌ Erro ao criar usuários de teste:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Create test user route
  app.post("/api/admin/create-test-user", async (_req, res) => {
    try {
      const User = require("./models/User").default;

      // Delete existing test user if exists (both admin and subscriber)
      await User.deleteMany({ email: "cinexnema@gmail.com" });

      // Create new test subscriber user
      const testUser = new User({
        email: "cinexnema@gmail.com",
        password: "I30C77T$Ii", // Will be hashed automatically
        name: "CineXnema Test User",
        role: "subscriber",
        assinante: true, // Full access without payment
        subscription: {
          plan: "premium",
          status: "active",
          startDate: new Date(),
          nextBilling: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          paymentMethod: "test_account",
        },
        watchHistory: [],
      });

      const savedUser = await testUser.save();

      console.log("✅ Usuário de teste criado via API:");
      console.log("📧 Email: cinexnema@gmail.com");
      console.log("🔑 Senha: I30C77T$Ii");

      res.json({
        success: true,
        message: "Usuário de teste criado com sucesso",
        user: {
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.role,
          assinante: savedUser.assinante,
          subscription: savedUser.subscription,
        },
        loginInfo: {
          email: "cinexnema@gmail.com",
          password: "I30C77T$Ii",
          access: "Acesso completo sem pagamento",
        },
      });
    } catch (error) {
      console.error("❌ Erro ao criar usuário de teste:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Authentication routes - keep only user check
  app.post("/api/auth/check-user", checkUserExists);


  // New robust login system
  const {
    universalLogin,
    subscriberLogin,
    creatorLogin,
    createEmergencyUser,
    listAllUsers,
    initializeSystemUsers,
  } = require("./routes/login-system");


  // Supabase authentication system
  const {
    registerSubscriberSupabase,
    loginSubscriberSupabase,
    activateSubscriptionSupabase,
    getCurrentUserSupabase,
  } = require("./routes/auth-supabase");

  // Subscriber authentication routes
  app.post("/api/auth/register-subscriber", registerSubscriberSupabase);
  app.post("/api/auth/login-subscriber", loginSubscriberSupabase);
  app.post("/api/auth/activate-subscription", activateSubscriptionSupabase);
  const { authenticateTokenSupabase } = require("./middleware/auth-supabase");
  app.get("/api/auth/me", authenticateTokenSupabase, getCurrentUserSupabase);
  // Basic login (token + role)
  try {
    const { loginBasic } = require("./routes/auth-basic");
    app.post("/api/auth/login", loginBasic);
  } catch (e) {
    console.warn("⚠️ Basic login route not available:", (e as any)?.message || e);
  }

  // Payment system with Stripe (guarded for dev without env)
  if (process.env.STRIPE_SECRET_KEY) {
    const {
      createCheckoutSession,
      getSessionStatus,
      handleStripeWebhook,
      getPlans,
      cancelSubscription,
    } = require("./routes/payment-stripe");

    app.post("/api/payment/create-checkout-session", createCheckoutSession);
    app.get("/api/payment/session-status/:sessionId", getSessionStatus);
    app.post(
      "/api/payment/stripe-webhook",
      express.raw({ type: "application/json" }),
      handleStripeWebhook,
    );
    app.get("/api/payment/plans", getPlans);
    app.post("/api/payment/cancel-subscription", cancelSubscription);
  } else {
    console.warn("Stripe not configured. Payment routes are disabled in dev.");
    app.get("/api/payment/plans", (_req, res) => res.json({ success: true, plans: [] }));
    app.post("/api/payment/create-checkout-session", (_req, res) => res.status(501).json({ success: false, message: "Stripe not configured" }));
    app.get("/api/payment/session-status/:sessionId", (_req, res) => res.status(501).json({ success: false, message: "Stripe not configured" }));
    app.post("/api/payment/stripe-webhook", (_req, res) => res.status(501).json({ success: false, message: "Stripe not configured" }));
    app.post("/api/payment/cancel-subscription", (_req, res) => res.status(501).json({ success: false, message: "Stripe not configured" }));
  }

  // Content catalog system
  const {
    getCatalog,
    getContentById,
    recordWatch,
    getWatchHistory,
    getGenres,
    getFeaturedContent,
  } = require("./routes/content-catalog");

  // Trailers
  const { getPublicTrailers, getSubscriberVideos } = require("./routes/trailers");

  app.get("/api/content/catalog", authenticateToken, getCatalog);
  app.get("/api/content/featured", authenticateToken, getFeaturedContent);
  app.get("/api/content/genres", getGenres);
  app.get("/api/content/watch-history", authenticateToken, getWatchHistory);
  // Public trailers and subscriber full videos
  app.get("/api/videos/public", getPublicTrailers);
  app.get("/api/videos/subscriber", authenticateToken, requireSubscriber, getSubscriberVideos);
  // Alias for dashboard component
  app.get("/api/user/continue-watching", authenticateToken, getWatchHistory);
  app.get("/api/content/:id", authenticateToken, getContentById);
  app.post("/api/content/:id/watch", authenticateToken, recordWatch);

  // Recommendations system
  const {
    getPersonalizedRecommendations,
    getSimilarContent,
    getTrendingContent,
    rateContent,
  } = require("./routes/recommendations");

  app.get(
    "/api/recommendations/for-you",
    authenticateToken,
    getPersonalizedRecommendations,
  );
  app.get("/api/recommendations/similar/:contentId", getSimilarContent);
  app.get(
    "/api/recommendations/trending",
    authenticateToken,
    getTrendingContent,
  );
  app.post(
    "/api/recommendations/rate/:contentId",
    authenticateToken,
    rateContent,
  );

  // Creator login (keep existing)
  app.post("/api/auth/login-creator", creatorLogin);

  // Emergency and admin routes
  app.post("/api/admin/create-emergency-user", createEmergencyUser);
  app.get("/api/admin/list-users", listAllUsers);

  // Admin login routes for Iarima
  const {
    adminLogin,
    createAdminUsers,
    checkAdminStatus,
  } = require("./routes/admin-login");
  app.post("/api/admin/login", adminLogin);
  app.get("/api/admin/login", adminLogin);
  app.post("/api/admin/create-admins", createAdminUsers);
  app.get("/api/admin/create-admins", createAdminUsers);
  app.get("/api/admin/status", checkAdminStatus);

  // Initialize system users on startup
  setTimeout(async () => {
    await initializeSystemUsers();
  }, 2000); // Wait 2 seconds for DB connection

  // Creator registration routes
  app.post("/api/creators/register", registerCreator);
  app.get("/api/creators/pending", authenticateToken, getPendingCreators);
  app.post(
    "/api/creators/:creatorId/approve",
    authenticateToken,
    approveCreator,
  );
  app.post("/api/creators/:creatorId/reject", authenticateToken, rejectCreator);
  app.get("/api/creators/analytics", authenticateToken, getCreatorAnalytics);
  app.post(
    "/api/creators/affiliate-link",
    authenticateToken,
    generateAffiliateLink,
  );

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email é obrigatório",
        });
      }

      const User = require("./models/User").default;

      // Verificar se usuário existe
      const user = await User.findOne({ email: email.toLowerCase() });

      // Por segurança, sempre retornamos sucesso mesmo se o email não existir
      // Em produção, enviaria email real aqui
      console.log(`📧 Solicitação de recuperação de senha para: ${email}`);
      console.log(
        `✅ ${user ? "Usuário encontrado" : "Usu��rio não encontrado"} - Email de recuperação "enviado"`,
      );

      res.json({
        success: true,
        message:
          "Se o email existir, você receberá instruções para redefinir sua senha.",
      });
    } catch (error) {
      console.error("❌ Erro na recuperação de senha:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  });

  // Subscription routes
  app.get("/api/subscription/plans", getSubscriptionPlans);
  app.post(
    "/api/subscription/subscribe",
    authenticateToken,
    requireSubscriber,
    createSubscription,
  );
  app.post(
    "/api/subscription/cancel",
    authenticateToken,
    requireSubscriber,
    cancelSubscription,
  );
  app.get("/api/subscription/status", authenticateToken, getSubscriptionStatus);
  app.post("/api/webhook/mercadopago", handleMercadoPagoWebhook);

  // New Mercado Pago payment routes
  app.post("/api/mercadopago/create-preference", mpCreatePreference);
  app.post("/api/mercadopago/webhook", mpHandleWebhook);
  app.get("/api/mercadopago/payment/:paymentId", mpGetPaymentStatus);
  app.get("/api/mercadopago/test", mpTestConfiguration);
  app.post("/api/mercadopago/activate-user", mpActivateUser);
  app.post("/api/integrations/supabase/payment-approved", notifySupabasePaymentApproved);

  // Device access control
  app.post("/api/auth/check-device", checkDeviceAccess);
  try {
    const { listDevices, deleteDevice, addTrustedEmail } = require("./routes/devices");
    app.get("/api/devices", authenticateToken, listDevices);
    app.delete("/api/devices/:id", authenticateToken, deleteDevice);
    app.post("/api/devices/trusted", authenticateToken, addTrustedEmail);
  } catch (e) {
    console.warn("⚠️ Devices routes not available:", (e as any)?.message || e);
  }

  // Trusted emails (admin)
  try {
    const { listTrustedEmails, deleteTrustedEmail } = require("./routes/trusted-emails");
    const { authAdmin } = require("./middleware/authRole");
    app.get("/api/trusted_emails", authAdmin, listTrustedEmails);
    app.delete("/api/trusted_emails/:id", authAdmin, deleteTrustedEmail);
  } catch (e) {
    console.warn("⚠️ Trusted emails routes not available:", (e as any)?.message || e);
  }

  // Family members management
  app.post("/api/subscription/family-members", saveFamilyMembers);
  app.get("/api/subscription/family-members", getFamilyMembers);
  app.post("/api/payments/create", authenticateToken, createPayment);
  app.post("/api/payments/webhook", handleWebhook);
  app.get("/api/payments/status/:transactionId", getPaymentStatus);
  app.get("/api/payments/user/:userId", authenticateToken, getUserPayments);

  // Child accounts routes
  try {
    const { createChildAccount, childLogin, getChildVideos, emancipateChild, getMyChildAccounts, emancipateChildById, checkChildEmail } = require("./routes/child-accounts");
    app.post("/api/child_accounts", authenticateToken, createChildAccount);
    app.get("/api/child_accounts", authenticateToken, getMyChildAccounts);
    app.get("/api/child_accounts/check", checkChildEmail);
    app.post("/api/child_accounts/login", childLogin);
    app.get("/api/child_accounts/videos", getChildVideos);
    app.post("/api/child_accounts/emancipate", emancipateChild);
    app.post("/api/child_accounts/:id/emancipate", authenticateToken, emancipateChildById);
    app.post("/api/child_accounts/emancipate-email", authenticateToken, emancipateChildByEmail);
    // Alias with dash
    app.post("/api/child-accounts", authenticateToken, createChildAccount);
    app.get("/api/child-accounts", authenticateToken, getMyChildAccounts);
    app.get("/api/child-accounts/check", checkChildEmail);
    app.post("/api/child-accounts/login", childLogin);
    app.get("/api/child-accounts/videos", getChildVideos);
    app.post("/api/child-accounts/emancipate", emancipateChild);
    app.post("/api/child-accounts/:id/emancipate", authenticateToken, emancipateChildById);
    app.post("/api/child-accounts/emancipate-email", authenticateToken, emancipateChildByEmail);
  } catch (e) {
    console.warn("⚠️ Child accounts routes not available:", (e as any)?.message || e);
  }

  // Webhook retry routes
  const {
    processRetries,
    getWebhookLogs,
    retrySpecificWebhook,
  } = require("./routes/webhook-retry");
  app.post("/api/webhooks/process-retries", processRetries);
  app.get("/api/webhooks/logs", getWebhookLogs);
  app.post("/api/webhooks/retry/:webhookId", retrySpecificWebhook);

  // Video routes with movie/series support
  const {
    createVideo,
    getCreatorAccess,
    getCreatorVideos,
    getPendingVideos,
    approveVideo,
    rejectVideo,
    getVideoDetails,
    getVideoHistory,
  } = require("./routes/videos");

  // Creators routes (Supabase-based)
  const {
    getCreatorVideosSupabase,
    updateCreatorInfo,
    getCreatorReferral,
    getCreatorMetrics,
    acceptCreatorPolicy,
    getMyCreatorAnalytics,
  } = require("./routes/creators");
  app.post("/api/videos/create", authenticateToken, createVideo);
  app.get("/api/creator/access", authenticateToken, getCreatorAccess);
  app.get("/api/videos/creator/:creatorId", getCreatorVideos);
  app.get("/api/videos/pending-approval", authenticateToken, getPendingVideos);
  app.post("/api/videos/:videoId/approve", authenticateToken, approveVideo);
  app.post("/api/videos/:videoId/reject", authenticateToken, rejectVideo);
  // Legacy details endpoint moved to avoid conflict with creator video endpoint
  app.get("/api/videos-details/:videoId", getVideoDetails);
  // Video history
  app.get("/api/videos/:videoId/history", authenticateToken, getVideoHistory);

  // Protected routes examples using authRole middleware
  const {
    authRole,
    authSubscriber,
    authCreator,
    authAdmin,
    requirePremium,
    requireApprovedCreator,
  } = require("./middleware/authRole");

  // Creators (Supabase) endpoints
  app.get("/api/creators/:id/videos", getCreatorVideosSupabase);
  app.put("/api/creators/:id", updateCreatorInfo);
  app.get("/api/creators/:id/referral", getCreatorReferral);
  app.get("/api/creators/:id/metrics", getCreatorMetrics);
  app.post("/api/creators/:id/accept-policy", acceptCreatorPolicy);
  app.get("/api/creators/analytics", authenticateToken, getMyCreatorAnalytics);
  app.get("/api/creators/:id/public", getCreatorPublic);

  // Creator dashboard - only for creators
  app.get("/api/creator/dashboard", authCreator, async (req, res) => {
    res.json({
      success: true,
      message: "Bem-vindo, criador!",
      user: req.user,
    });
  });

  // Subscriber dashboard - only for subscribers/premium
  app.get("/api/subscriber/dashboard", authSubscriber, async (req, res) => {
    res.json({
      success: true,
      message: "Bem-vindo, assinante!",
      user: req.user,
      isPremium: req.user.isPremium,
    });
  });

  // Premium content - only for premium subscribers
  app.get("/api/content/premium", requirePremium, async (req, res) => {
    res.json({
      success: true,
      message: "Conteúdo premium desbloqueado!",
      content: "Este é um conteúdo exclusivo para assinantes premium",
    });
  });

  // Admin panel - only for admins
  app.get("/api/admin/panel", authAdmin, async (req, res) => {
    res.json({
      success: true,
      message: "Painel administrativo",
      user: req.user,
    });
  });

  // Approved creator features - only for approved creators
  app.get(
    "/api/creator/advanced-features",
    requireApprovedCreator,
    async (req, res) => {
      res.json({
        success: true,
        message: "Funcionalidades avançadas desbloqueadas!",
        features: [
          "analytics_advanced",
          "monetization_tools",
          "priority_support",
        ],
      });
    },
  );

  // Creator bank routes
  try {
    const { saveCreatorBank } = require("./routes/creator-bank");
    app.post("/api/creators/:creatorId/bank", authenticateToken, saveCreatorBank);
  } catch (e) {
    console.warn("⚠️ Creator bank routes not available:", (e as any)?.message || e);
  }

  // Creator blocks routes
  app.get(
    "/api/creator-blocks/:creatorId",
    authenticateToken,
    getCreatorBlocks,
  );
  app.post("/api/creator-blocks/calculate", calculateBlocks);
  app.post(
    "/api/creator-blocks/:creatorId/check-upload",
    authenticateToken,
    checkUploadCapacity,
  );
  app.post(
    "/api/creator-blocks/:creatorId/purchase",
    authenticateToken,
    purchaseBlocks,
  );
  app.post("/api/creator-blocks/webhook", handleBlocksWebhook);
  app.get(
    "/api/creator-blocks/:creatorId/purchases",
    authenticateToken,
    getPurchaseHistory,
  );
  app.post(
    "/api/creator-blocks/:creatorId/add-video",
    authenticateToken,
    addVideoToBlocks,
  );
  app.post(
    "/api/creator-blocks/:creatorId/remove-video",
    authenticateToken,
    removeVideoFromBlocks,
  );
  app.get("/api/admin/creator-blocks", authenticateToken, getAllCreatorsBlocks);

  // Video progress endpoints
  try {
    const { saveVideoProgress, getVideoProgress } = require("./routes/video-progress");
    app.post("/api/video-progress", saveVideoProgress);
    app.get("/api/video-progress", getVideoProgress);
    console.log("✅ Video progress endpoints loaded");
  } catch (error) {
    console.warn("⚠️ Video progress endpoints not available:", error.message);
  }

  // Pre-payment user registration (with limited access)
  app.post("/api/subscription/pre-register", async (req, res) => {
    try {
      const { email, name, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email e senha são obrigatórios",
        });
      }

      const User = require("./models/User").default;

      // Check if user already exists
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        return res.status(409).json({
          success: false,
          message: "Email já está em uso",
        });
      }

      // Create new user with limited access (before payment)
      const userData = {
        email: email.toLowerCase(),
        password: password,
        name: name || email.split("@")[0] || "Usuário XNEMA",
        role: "subscriber",
        assinante: false, // No access until payment
        subscription: {
          plan: "premium",
          status: "pending",
          startDate: new Date(),
          paymentMethod: "pending",
        },
        watchHistory: [],
      };

      user = new User(userData);
      await user.save();

      console.log("✅ Usuário pré-registrado (antes do pagamento):", email);

      res.json({
        success: true,
        message:
          "Usuário registrado! Complete o pagamento para ter acesso total.",
        user: user.toJSON(),
        requiresPayment: true,
      });
    } catch (error) {
      console.error("❌ Erro no pré-registro:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  });

  // Auto-register subscriber on payment confirmation
  app.post("/api/subscription/auto-register", async (req, res) => {
    try {
      const { email, paymentId, plan = "premium" } = req.body;

      if (!email || !paymentId) {
        return res.status(400).json({
          success: false,
          message: "Email e ID de pagamento são obrigatórios",
        });
      }

      const User = require("./models/User").default;

      // Check if user already exists
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Update existing user with subscription
        user.role = "subscriber";
        user.assinante = true;
        user.subscription = {
          plan: plan,
          status: "active",
          startDate: new Date(),
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          paymentMethod: "mercado_pago",
          mercadoPagoId: paymentId,
        };
        user.watchHistory = user.watchHistory || [];

        await user.save();

        console.log("✅ Usuário existente atualizado com assinatura:", email);
      } else {
        // Create new subscriber user
        const userData = {
          email: email.toLowerCase(),
          password: `temp_${Date.now()}_${Math.random().toString(36)}`, // Temporary password
          name: email.split("@")[0] || "Usuário XNEMA",
          role: "subscriber",
          assinante: true,
          subscription: {
            plan: plan,
            status: "active",
            startDate: new Date(),
            nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            paymentMethod: "mercado_pago",
            mercadoPagoId: paymentId,
          },
          watchHistory: [],
        };

        user = new User(userData);
        await user.save();

        console.log("✅ Novo usuário assinante criado automaticamente:", email);
      }

      res.json({
        success: true,
        message: "Usuário registrado/atualizado com sucesso",
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("��� Erro no registro automático:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  });

  // Content management routes
  app.post("/api/content/upload", authenticateToken, uploadContent);
  app.get("/api/content/creator", authenticateToken, getCreatorContent);
  app.put(
    "/api/content/:contentId/status",
    authenticateToken,
    updateContentStatus,
  );
  app.get("/api/content/pending", authenticateToken, getPendingContent);
  app.post("/api/content/:contentId/view", recordView);


  // api.video routes
  const { createVideo: apivideoCreate, uploadSource: apivideoUploadSource, apivideoUpload: apivideoMulter, getMyAnalytics: apivideoAnalytics } = require("./routes/apivideo");
  app.post("/api/apivideo/create", authenticateToken, apivideoCreate);
  app.post("/api/apivideo/upload/:videoId", authenticateToken, (req, res, next) => {
    apivideoMulter.single("file")(req as any, res as any, (err: any) => {
      if (err) return res.status(400).json({ success: false, message: String(err?.message || err) });
      next();
    });
  }, apivideoUploadSource);
  app.get("/api/apivideo/analytics/me", authenticateToken, apivideoAnalytics);

  // Image upload (thumbnail)
  const { thumbnailUpload, uploadThumbnail } = require("./routes/upload");
  app.post("/api/upload/thumbnail", authenticateToken, (req, res, next) => {
    thumbnailUpload.single("image")(req as any, res as any, (err: any) => {
      if (err) return res.status(400).json({ success: false, message: String(err?.message || err) });
      next();
    });
  }, uploadThumbnail);

  // api.video token management
  const { setUserApiVideoToken, setMyApiVideoToken } = require("./routes/apivideo-admin");
  app.post("/api/admin/users/:userId/apivideo-token", authenticateToken, setUserApiVideoToken);
  app.post("/api/apivideo/token", authenticateToken, setMyApiVideoToken);

  // Analytics routes for creators (Google Analytics integration)
  app.post("/api/analytics/creator-data", handleCreatorAnalytics);
  app.post("/api/analytics/video-data", handleVideoAnalytics);

  // Video upload routes for creators (Mux removed - using api.video only)
  app.get("/api/videos/creator", authenticateToken, getCreatorVideos);
  app.get("/api/videos/:videoId", authenticateToken, getVideoById);
  app.put("/api/videos/:videoId", authenticateToken, updateVideo);
  app.delete("/api/videos/:videoId", authenticateToken, deleteVideo);

  // Video admin routes
  app.get("/api/admin/videos/pending", authenticateToken, getPendingVideos);
  try {
    const { getPendingVideosSupabase, approveVideoSupabase, rejectVideoSupabase } = require("./routes/adminVideosSupabase");
    app.get("/api/admin/videos/pending-supa", authenticateToken, getPendingVideosSupabase);
    app.put("/api/admin/videos/:id/approve", authenticateToken, approveVideoSupabase);
    app.put("/api/admin/videos/:id/reject", authenticateToken, rejectVideoSupabase);
  } catch (e) {
    console.warn("⚠️ Admin videos Supabase routes not available:", (e as any)?.message || e);
  }
  app.get("/api/admin/videos", authenticateToken, getAllVideos);
  app.get(
    "/api/admin/videos/:videoId/review",
    authenticateToken,
    getVideoForReview,
  );
  app.post(
    "/api/admin/videos/:videoId/approve",
    authenticateToken,
    approveVideo,
  );
  app.post("/api/admin/videos/:videoId/reject", authenticateToken, rejectVideo);
  app.delete("/api/admin/videos/:videoId", authenticateToken, deleteVideoAdmin);
  app.get("/api/admin/stats", authenticateToken, getAdminStats);

  // Alias endpoints (compat) requested by admin spec
  app.get("/api/admin/pending-videos", authenticateToken, getPendingVideos);
  app.post("/api/admin/approve-video/:id", authenticateToken, (req, res) => {
    req.params.videoId = req.params.id;
    return approveVideo(req as any, res as any, () => {});
  });
  app.post("/api/admin/reject-video/:id", authenticateToken, (req, res) => {
    req.params.videoId = req.params.id;
    return rejectVideo(req as any, res as any, () => {});
  });

  // Creator limits routes
  app.get(
    "/api/creators/:creatorId/limits",
    authenticateToken,
    getCreatorLimits,
  );
  app.post(
    "/api/creators/:creatorId/check-upload",
    authenticateToken,
    checkUploadCapacityLimits,
  );
  app.get(
    "/api/admin/creators/limits",
    authenticateToken,
    getAllCreatorsLimits,
  );
  app.put(
    "/api/admin/creators/:creatorId/limits",
    authenticateToken,
    updateCreatorLimits,
  );
  app.post(
    "/api/admin/creators/:creatorId/restrict",
    authenticateToken,
    restrictCreatorUpload,
  );
  app.post(
    "/api/admin/creators/:creatorId/allow",
    authenticateToken,
    allowCreatorUpload,
  );
  app.post(
    "/api/admin/creators/update-grace-periods",
    authenticateToken,
    updateAllGracePeriods,
  );

  // Mux webhook removed (api.video only)

  // Protected routes (examples)
  app.get("/api/admin/users", authenticateToken, async (req, res) => {
    try {
      if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { getSupabaseAdmin } = require("./utils/supabaseClient");
      let users: any[] | null = null;
      try {
        const supabase = getSupabaseAdmin();
        const resp = await supabase
          .from("users")
          .select("id, email, name, role, is_premium, created_at")
          .order("created_at", { ascending: false });
        if (resp.error) throw resp.error;
        users = resp.data || [];
      } catch (e) {
        console.warn("Supabase unavailable, falling back to Mongo for /api/admin/users");
        try {
          const User = require("./models/User").default;
          const mongoUsers = await User.find({}, "_id email nome role isPremium createdAt").sort({ createdAt: -1 });
          users = mongoUsers.map((u: any) => ({
            id: String(u._id),
            email: u.email,
            name: u.nome,
            role: u.role,
            is_premium: !!u.isPremium,
            created_at: u.createdAt,
          }));
        } catch (merr) {
          console.error("Mongo fallback failed:", merr);
          users = [];
        }
      }

      const stats = {
        total: users?.length || 0,
        subscribers: users?.filter((u) => u.role === "subscriber").length || 0,
        creators: users?.filter((u) => u.role === "creator").length || 0,
        admins: users?.filter((u) => u.role === "admin").length || 0,
        activeSubscribers: users?.filter((u) => u.role === "subscriber" && u.is_premium).length || 0,
      };

      res.json({ success: true, users, stats, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("❌ Erro ao buscar usuários:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  // Creators full summary: users (role=creator) with videos and optional bank data
  app.get("/api/admin/creators-full", authenticateToken, async (req, res) => {
    try {
      if (req.userRole !== "admin") {
        return res.status(403).json({ success: false, message: "Acesso negado" });
      }

      let result: any[] = [];

      // Primary: Supabase aggregate from application tables
      try {
        const { getSupabaseAdmin } = require("./utils/supabaseClient");
        const sb = getSupabaseAdmin();

        const creatorsResp = await sb
          .from("users")
          .select("id, email, name, role, created_at")
          .eq("role", "creator");
        if (creatorsResp.error) throw creatorsResp.error;
        const creators = creatorsResp.data || [];
        const creatorIds = creators.map((c: any) => c.id);

        let videos: any[] = [];
        try {
          const vidsResp = await sb
            .from("videos")
            .select("id, title, status, creator_id, views, revenue_usd, created_at")
            .in("creator_id", creatorIds);
          if (vidsResp.error) throw vidsResp.error;
          videos = vidsResp.data || [];
        } catch (e) {
          console.warn("videos table not available or error fetching:", (e as any)?.message);
        }

        let bankRows: any[] = [];
        try {
          const bankResp = await sb
            .from("creator_bank_accounts")
            .select("creator_id, pix_key, pix_type, holder_name, cpf, bank_name, agency, account");
          if (bankResp.error) throw bankResp.error;
          bankRows = bankResp.data || [];
        } catch (e) {
          console.warn("creator_bank_accounts table not available:", (e as any)?.message);
        }

        const bankByCreator = bankRows.reduce((acc: any, b: any) => {
          acc[b.creator_id] = b;
          return acc;
        }, {});

        const byCreator: Record<string, any> = {};
        for (const v of videos) {
          const key = v.creator_id;
          if (!byCreator[key]) {
            byCreator[key] = { totalVideos: 0, totalViews: 0, totalRevenueUSD: 0, videos: [] as any[] };
          }
          byCreator[key].totalVideos += 1;
          byCreator[key].totalViews += Number(v.views || 0);
          byCreator[key].totalRevenueUSD += Number(v.revenue_usd || 0);
          byCreator[key].videos.push({
            id: v.id,
            title: v.title,
            status: v.status,
            views: v.views || 0,
            revenueUSD: v.revenue_usd || 0,
            createdAt: v.created_at,
          });
        }

        result = creators.map((c: any) => {
          const agg = byCreator[c.id] || { totalVideos: 0, totalViews: 0, totalRevenueUSD: 0, videos: [] };
          const bank = bankByCreator[c.id] || null;
          return {
            id: c.id,
            email: c.email,
            name: c.name || c.email?.split("@")[0],
            createdAt: c.created_at,
            totalVideos: agg.totalVideos,
            totalViews: agg.totalViews,
            totalRevenueUSD: agg.totalRevenueUSD,
            videos: agg.videos,
            bank,
          };
        });
      } catch (e) {
        console.warn("Supabase primary fetch failed for creators-full:", (e as any)?.message);
      }

      // Fallback: MongoDB creators if Supabase path failed or returned empty
      if (!result || result.length === 0) {
        try {
          const User = require("./models/User").default;
          const creators = await User.find({ role: "creator" }).sort({ createdAt: -1 }).lean();
          result = creators.map((c: any) => ({
            id: String(c._id),
            email: c.email,
            name: c.nome || c.email?.split("@")[0],
            createdAt: c.createdAt,
            totalVideos: (c.content?.totalVideos || c.creatorProfile?.totalVideos || 0),
            totalViews: (c.content?.totalViews || c.creatorProfile?.totalViews || 0),
            totalRevenueUSD: c.creatorProfile?.totalEarningsUSD || 0,
            videos: [],
            bank: null,
          }));
        } catch (merr) {
          console.error("Mongo fallback for creators-full failed:", merr);
        }
      }

      return res.json({ success: true, creators: result || [], total: (result || []).length });
    } catch (error) {
      console.error("❌ Erro ao buscar criadores:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar criadores" });
    }
  });

  // Admin: import Auth users from Supabase into public.users (upsert by email)
  app.post("/api/admin/import-supabase-users", authenticateToken, async (req, res) => {
    try {
      if (req.userRole !== "admin") {
        return res.status(403).json({ success: false, message: "Acesso negado" });
      }
      const { getSupabaseAdmin } = require("./utils/supabaseClient");
      const sb = getSupabaseAdmin();

      let page = 1;
      const perPage = 1000;
      let imported = 0;

      // paginate auth users
      // @ts-ignore - admin API available with service key
      let resp = await sb.auth.admin.listUsers({ page, perPage });
      while (true) {
        const users = resp?.data?.users || [];
        for (const au of users) {
          const email = (au.email || "").toLowerCase();
          if (!email) continue;
          const name = (au.user_metadata?.full_name || au.user_metadata?.name || email.split("@")[0]).toString();
          const role = (au.app_metadata?.role || au.user_metadata?.role || "subscriber").toString();
          const createdAt = au.created_at || new Date().toISOString();

          const up = await sb
            .from("users")
            .upsert(
              [{ email, name, role, created_at: createdAt }],
              { onConflict: "email" }
            )
            .select("id");
          if (up.error) {
            console.warn("upsert users error:", up.error.message);
          } else {
            imported += up.data?.length ? 1 : 0;
          }
        }
        // pagination
        if (!resp?.data?.users || resp.data.users.length < perPage) break;
        page += 1;
        // @ts-ignore
        resp = await sb.auth.admin.listUsers({ page, perPage });
      }

      return res.json({ success: true, imported });
    } catch (e: any) {
      console.error("❌ Import Supabase users failed:", e);
      return res.status(500).json({ success: false, message: "Falha ao importar usuários" });
    }
  });

  // Referral/Affiliate tracking routes
  try {
    const { trackView, trackSubscription, getCreatorReferralSummary } = require("./routes/referrals");
    app.get("/api/referrals/track-view", trackView);
    app.post("/api/referrals/track-subscription", trackSubscription);
    app.get("/api/creator/:creatorId/referrals/summary", getCreatorReferralSummary);
  } catch (e) {
    console.warn("Referrals routes not available:", (e as any)?.message);
  }

  // Debug route to show database status - using Supabase
  app.get("/api/debug/db-status", async (req, res) => {
    try {
      const { createClient } = require("@supabase/supabase-js");
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { count: userCount, error: countError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      const { data: recentUsers, error: usersError } = await supabase
        .from("users")
        .select("email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (countError || usersError) {
        throw countError || usersError;
      }

      res.json({
        success: true,
        database: {
          connected: true,
          host: "supabase",
          name: "postgres",
          totalUsers: userCount || 0,
          recentUsers: recentUsers || [],
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Erro no debug:", error);
      res.json({
        success: false,
        database: {
          connected: false,
          error: error.message,
          connectionInfo: "Using Supabase for all database operations",
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.get("/api/creator/analytics", authenticateToken, async (req, res) => {
    try {
      if (req.userRole !== "creator") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Mock analytics data
      const analytics = {
        totalViews: req.user.content?.totalViews || 0,
        totalEarnings: req.user.content?.totalEarnings || 0,
        monthlyViews: 450,
        monthlyEarnings: req.user.content?.monthlyEarnings || 0,
        topVideos: [
          { id: "1", title: "Vídeo Popular 1", views: 500, earnings: 25.5 },
          { id: "2", title: "Vídeo Popular 2", views: 300, earnings: 15.75 },
        ],
        viewsHistory: [
          { date: "2024-01-01", views: 100 },
          { date: "2024-01-02", views: 150 },
          { date: "2024-01-03", views: 200 },
        ],
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar analytics" });
    }
  });

  // Analytics routes (simplified version)
  try {
    const analyticsRouter = require("./routes/analytics-simple").default;
    app.use("/api/analytics", analyticsRouter);
    console.log("✅ Analytics routes (simplified) loaded");
  } catch (error) {
    console.warn("⚠️ Analytics routes not available:", error.message);
  }

  // Contact routes
  try {
    const contactRouter = require("./routes/contact").default;
    app.use("/api/contact", contactRouter);
    console.log("✅ Contact routes loaded");
  } catch (error) {
    console.warn("⚠️ Contact routes not available:", error.message);
  }

  // Usuarios routes (Supabase Auth Admin user creation)
  try {
    const usuariosRouter = require("./routes/usuarios").default;
    app.use("/api/usuarios", usuariosRouter);
    console.log("✅ Usuarios routes loaded");
  } catch (error) {
    console.warn("⚠️ Usuarios routes not available:", error.message);
  }

  return app;
}
