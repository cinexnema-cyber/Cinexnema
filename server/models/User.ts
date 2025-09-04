import bcrypt from "bcryptjs";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name?: string;
  nome?: string; // keep compatibility with existing code
  role: "admin" | "subscriber" | "creator" | string;
  isPremium?: boolean;
  subscriptionStatus?: string;
  assinante?: boolean;
  subscription?: any;
  watchHistory?: any[];
  creatorProfile?: {
    bio?: string;
    portfolio?: string;
    status?: string;
    totalVideos?: number;
    approvedVideos?: number;
    rejectedVideos?: number;
    totalViews?: number;
    monthlyEarnings?: number;
    affiliateEarnings?: number;
    referralCount?: number;
  };
  content?: {
    totalVideos?: number;
    totalViews?: number;
    totalEarnings?: number;
    monthlyEarnings?: number;
  };
}

// Simple in-memory store as a fallback when MongoDB is unavailable
const users: IUser[] = [];

function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  ).toUpperCase();
}

function isHash(value: string) {
  return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
}

function setByPath(obj: any, path: string, value: any) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function incByPath(obj: any, path: string, delta: number) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  const leaf = parts[parts.length - 1];
  cur[leaf] = (Number(cur[leaf]) || 0) + Number(delta);
}

function applyUpdate(source: IUser, update: any): IUser {
  const clone: IUser = JSON.parse(JSON.stringify(source));
  if (update && typeof update === "object") {
    if (update.$set && typeof update.$set === "object") {
      for (const k of Object.keys(update.$set)) {
        setByPath(clone as any, k, update.$set[k]);
      }
    }
    if (update.$inc && typeof update.$inc === "object") {
      for (const k of Object.keys(update.$inc)) {
        incByPath(clone as any, k, update.$inc[k]);
      }
    }
    // shallow merge for direct assignments
    for (const k of Object.keys(update)) {
      if (k !== "$set" && k !== "$inc") {
        (clone as any)[k] = (update as any)[k];
      }
    }
  }
  return clone;
}

class UserModel {
  _id: string;
  email: string;
  password: string;
  name?: string;
  nome?: string;
  role: IUser["role"];
  isPremium?: boolean;
  subscriptionStatus?: string;
  assinante?: boolean;
  subscription?: any;
  watchHistory?: any[];
  creatorProfile?: IUser["creatorProfile"];
  content?: IUser["content"];

  constructor(data: Partial<IUser> & { email: string; password: string; role?: IUser["role"] }) {
    this._id = genId();
    this.email = data.email.toLowerCase().trim();
    this.password = data.password;
    this.name = data.name;
    this.nome = data.nome ?? data.name;
    this.role = (data.role ?? "subscriber") as IUser["role"];
    this.isPremium = data.isPremium ?? false;
    this.subscriptionStatus = data.subscriptionStatus ?? "pending";
    this.assinante = data.assinante ?? false;
    this.subscription = data.subscription ?? null;
    this.watchHistory = data.watchHistory ?? [];
    this.creatorProfile = data.creatorProfile;
    this.content = data.content ?? { totalVideos: 0, totalViews: 0, totalEarnings: 0, monthlyEarnings: 0 };
  }

  async save() {
    if (!isHash(this.password)) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    const existsIdx = users.findIndex((u) => u.email === this.email);
    const record: IUser = {
      _id: this._id,
      email: this.email,
      password: this.password,
      name: this.name,
      nome: this.nome,
      role: this.role,
      isPremium: this.isPremium,
      subscriptionStatus: this.subscriptionStatus,
      assinante: this.assinante,
      subscription: this.subscription,
      watchHistory: this.watchHistory,
      creatorProfile: this.creatorProfile,
      content: this.content,
    };
    if (existsIdx >= 0) users[existsIdx] = record; else users.push(record);
    return this;
  }

  async comparePassword(candidate: string) {
    if (isHash(this.password)) return bcrypt.compare(candidate, this.password);
    return candidate === this.password;
  }

  toJSON() {
    const { password, ...rest } = this as any;
    return rest;
  }

  // Static-like helpers mimicking Mongoose API
  static async findOne(query: Partial<Record<string, any>>) {
    if (query.email) {
      const u = users.find((x) => x.email === String(query.email).toLowerCase().trim());
      return u ? UserModel.fromRecord(u) : null;
    }
    if ((query as any)._id) {
      const u = users.find((x) => x._id === String((query as any)._id));
      return u ? UserModel.fromRecord(u) : null;
    }
    return null;
  }

  static async countDocuments() {
    return users.length;
  }

  static async deleteMany(query: Partial<Record<string, any>>) {
    if (query.email) {
      const email = String(query.email).toLowerCase().trim();
      for (let i = users.length - 1; i >= 0; i--) {
        if (users[i].email === email) users.splice(i, 1);
      }
    } else {
      users.length = 0;
    }
    return { acknowledged: true, deletedCount: users.length };
  }

  static async findByIdAndUpdate(id: string, update: any, options?: { new?: boolean }) {
    const idx = users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    const current = users[idx];
    const merged = applyUpdate(current, update);
    users[idx] = merged;
    return options?.new ? UserModel.fromRecord(merged) : UserModel.fromRecord(current);
  }

  static find(query: Partial<Record<string, any>>, _projection?: any) {
    let results = users;
    if (query.email) {
      const email = String(query.email).toLowerCase().trim();
      results = users.filter((u) => u.email === email);
    }
    const mapped = results.map(UserModel.fromRecord);
    return {
      limit: async (n: number) => mapped.slice(0, n),
    } as any;
  }

  private static fromRecord(record: IUser) {
    const inst = new UserModel({
      email: record.email,
      password: record.password,
      role: record.role,
      name: record.name,
      nome: record.nome,
      isPremium: record.isPremium,
      subscriptionStatus: record.subscriptionStatus,
      assinante: record.assinante,
      subscription: record.subscription,
      watchHistory: record.watchHistory,
      creatorProfile: record.creatorProfile,
      content: record.content,
    });
    // Preserve original id and hashed password
    inst._id = record._id;
    inst.password = record.password;
    return inst;
  }
}

export const User = UserModel as any;
export default UserModel as any;
