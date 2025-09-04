/**
 * Shared authentication interfaces and types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser extends User {
  role: "admin";
  permissions: AdminPermission[];
}

export interface SubscriberUser extends User {
  role: "subscriber";
  assinante?: boolean; // For compatibility with user.assinante === true check
  subscription: {
    plan: "basic" | "intermediate" | "premium";
    status: "active" | "inactive" | "pending" | "cancelled";
    startDate: string;
    nextBilling?: string;
    paymentMethod?: string;
    mercadoPagoId?: string;
  };
  watchHistory: string[];
}

export interface CreatorUser extends User {
  role: "creator";
  profile: {
    bio?: string;
    portfolio?: string;
    approvedAt?: string;
    status: "pending" | "approved" | "rejected";
  };
  content: {
    totalVideos: number;
    totalViews: number;
    totalEarnings: number;
    monthlyEarnings: number;
  };
}

export type UserRole = "admin" | "subscriber" | "creator";

export type AdminPermission =
  | "manage_users"
  | "manage_content"
  | "approve_creators"
  | "view_analytics"
  | "manage_payments";

// Authentication request/response interfaces
export interface LoginRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: "subscriber" | "creator";
  // Creator-specific fields
  bio?: string;
  portfolio?: string;
  // Subscriber-specific fields
  paymentMethod?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}

// JWT Token payload
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Content management
export interface VideoContent {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  status: "pending" | "approved" | "rejected";
  url?: string;
  thumbnailUrl?: string;
  views: number;
  earnings: number;
  uploadDate: string;
  approvedDate?: string;
  approvedBy?: string;
}

// Analytics data
export interface CreatorAnalytics {
  totalViews: number;
  totalEarnings: number;
  monthlyViews: number;
  monthlyEarnings: number;
  topVideos: Array<{
    id: string;
    title: string;
    views: number;
    earnings: number;
  }>;
  viewsHistory: Array<{
    date: string;
    views: number;
  }>;
}

// Subscription management
export interface SubscriptionRequest {
  email: string;
  plan: "basic" | "premium";
  paymentMethodId: string;
}

export interface CancelSubscriptionRequest {
  userId: string;
  reason?: string;
}
