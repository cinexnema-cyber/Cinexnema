import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload, UserRole } from "@shared/auth";

interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
  userRole?: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET || "xnema-secret-key-2024";

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token de acesso requerido" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Trust JWT and attach minimal user context (DB lookups handled elsewhere)
    req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido" });
  }
};

export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: "Permissão insuficiente" });
    }

    next();
  };
};

export const requireAdmin = requireRole("admin");
export const requireSubscriber = requireRole("subscriber");
export const requireCreator = requireRole("creator");
export const requireSubscriberOrCreator = requireRole([
  "subscriber",
  "creator",
]);

export const generateToken = (
  userId: string,
  email: string,
  role: UserRole,
): string => {
  const payload: TokenPayload = {
    userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  return jwt.sign(payload, JWT_SECRET);
};

// Generate token specifically for email confirmation links (24h expiry)
export const generateEmailConfirmationToken = (
  userId: string,
  email: string,
  role: UserRole,
): string => {
  const payload: TokenPayload = {
    userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours for email confirmation
  };

  return jwt.sign(payload, JWT_SECRET);
};

export type { AuthenticatedRequest };
