import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
  userRole?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "xnema-secret-key-2024";

/**
 * Middleware para rotas protegidas por função
 * Uso: authRole(['creator']) ou authRole(['subscriber', 'premium'])
 */
export function authRole(roles: string[] | string) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token de acesso requerido",
        });
      }

      // Verify and decode token
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Verify user still exists and get latest data
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      // Normalize roles to array
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        console.log(
          `❌ Acesso negado: ${user.email} (${user.role}) tentou acessar rota que requer: ${allowedRoles.join(", ")}`,
        );
        return res.status(403).json({
          success: false,
          message: "Acesso negado para esta função",
        });
      }

      // Special checks for specific roles
      if (user.role === "creator") {
        const creatorStatus = user.creatorProfile?.status || "pending";

        // Allow login but may restrict some features if not approved
        if (creatorStatus === "rejected") {
          return res.status(403).json({
            success: false,
            message: "Conta de criador foi rejeitada",
          });
        }

        // Log if creator is still pending (for monitoring)
        if (creatorStatus === "pending") {
          console.log(
            `⏳ Criador com status pendente acessando: ${req.originalUrl}`,
          );
        }
      }

      if (user.role === "subscriber" || user.role === "premium") {
        // Additional checks for subscriber status could go here
        console.log(
          `👤 Assinante acessando: ${req.originalUrl} - Premium: ${user.isPremium}`,
        );
      }

      // Add user info to request
      req.user = user;
      req.userId = user._id.toString();
      req.userRole = user.role;

      console.log(
        `✅ Acesso autorizado: ${user.email} (${user.role}) → ${req.originalUrl}`,
      );
      next();
    } catch (error) {
      console.error("❌ Erro na autenticação:", error);
      return res.status(403).json({
        success: false,
        message: "Token inválido",
      });
    }
  };
}

/**
 * Middleware específicos para cada role
 */
export const authSubscriber = authRole(["subscriber", "premium"]);
export const authCreator = authRole(["creator"]);
export const authAdmin = authRole(["admin"]);
export const authSubscriberOrCreator = authRole([
  "subscriber",
  "premium",
  "creator",
]);
export const authPremiumOnly = authRole(["premium"]); // Apenas assinantes premium

/**
 * Middleware para verificar se o usuário é premium (para conteúdo restrito)
 */
export function requirePremium(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  return authRole(["premium"])(req, res, (error?: any) => {
    if (error) return next(error);

    // Additional premium checks
    const user = req.user;
    const active = user.isPremium && user.subscriptionStatus === "active";
    const nextBilling = user.subscription?.nextBilling || user.subscription?.endDate || user.subscription?.next_billing;
    const notExpired = nextBilling ? new Date(nextBilling).getTime() > Date.now() : true;
    if (!active || !notExpired) {
      return res.status(403).json({
        success: false,
        message: !active ? "Acesso restrito a assinantes premium ativos" : "Assinatura expirada - renove para continuar",
        requiresUpgrade: true,
      });
    }

    next();
  });
}

/**
 * Middleware para verificar se o criador está aprovado
 */
export function requireApprovedCreator(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  return authRole(["creator"])(req, res, (error?: any) => {
    if (error) return next(error);

    const user = req.user;
    const creatorStatus = user.creatorProfile?.status || "pending";

    if (creatorStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Acesso restrito a criadores aprovados",
        creatorStatus,
        requiresApproval: true,
      });
    }

    next();
  });
}

/**
 * Middleware flexível que permite diferentes níveis de acesso
 */
export function flexibleAuth(options: {
  allowRoles: string[];
  requirePremium?: boolean;
  requireApprovedCreator?: boolean;
}) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    return authRole(options.allowRoles)(req, res, (error?: any) => {
      if (error) return next(error);

      const user = req.user;

      // Check premium requirement
      if (options.requirePremium && user.role === "subscriber") {
        const active = user.isPremium && user.subscriptionStatus === "active";
        const nextBilling = user.subscription?.nextBilling || user.subscription?.endDate || user.subscription?.next_billing;
        const notExpired = nextBilling ? new Date(nextBilling).getTime() > Date.now() : true;
        if (!active || !notExpired) {
          return res.status(403).json({
            success: false,
            message: !active ? "Conteúdo exclusivo para assinantes premium" : "Assinatura expirada - renove para continuar",
            requiresUpgrade: true,
          });
        }
      }

      // Check creator approval requirement
      if (options.requireApprovedCreator && user.role === "creator") {
        const creatorStatus = user.creatorProfile?.status || "pending";
        if (creatorStatus !== "approved") {
          return res.status(403).json({
            success: false,
            message: "Funcionalidade restrita a criadores aprovados",
            creatorStatus,
            requiresApproval: true,
          });
        }
      }

      next();
    });
  };
}

export type { AuthenticatedRequest };
