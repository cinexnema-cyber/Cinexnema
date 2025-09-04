import { createClient } from '@supabase/supabase-js';

// Read env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Helper for consistent error objects
const notConfiguredMessage =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable these features.';

function buildThenableResponse<T = any>() {
  const result = { data: null as T | null, error: new Error(notConfiguredMessage) } as any;
  const promise = Promise.resolve(result);
  const thenable: any = {
    then: (...args: any[]) => (promise as any).then(...args),
    catch: (...args: any[]) => (promise as any).catch(...args),
    finally: (...args: any[]) => (promise as any).finally(...args),
    // Common filter/transform chainers just return the same thenable to allow chaining
    eq: () => thenable,
    neq: () => thenable,
    gt: () => thenable,
    gte: () => thenable,
    lt: () => thenable,
    lte: () => thenable,
    like: () => thenable,
    ilike: () => thenable,
    contains: () => thenable,
    containedBy: () => thenable,
    overlaps: () => thenable,
    in: () => thenable,
    is: () => thenable,
    order: () => thenable,
    limit: () => thenable,
    range: () => thenable,
    select: () => thenable,
    // Supabase often ends chains with .single() which should return a Promise
    single: () => promise,
  };
  return thenable;
}

function createSupabaseMissingClient() {
  const client: any = {
    from: () => {
      // Return a query builder-like thenable
      return buildThenableResponse();
    },
    rpc: () => Promise.resolve({ data: null, error: new Error(notConfiguredMessage) }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: new Error(notConfiguredMessage) }),
        download: () => Promise.resolve({ data: null, error: new Error(notConfiguredMessage) }),
        getPublicUrl: () => ({ data: { publicUrl: '' }, error: new Error(notConfiguredMessage) }),
      }),
    },
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error(notConfiguredMessage) }),
      getSession: async () => ({ data: { session: null }, error: new Error(notConfiguredMessage) }),
      setSession: async () => ({ data: { session: null, user: null }, error: new Error(notConfiguredMessage) }),
      resetPasswordForEmail: async () => ({ data: null, error: new Error(notConfiguredMessage) }),
      updateUser: async () => ({ data: null, error: new Error(notConfiguredMessage) }),
      signUp: async () => ({ data: { user: null, session: null }, error: new Error(notConfiguredMessage) }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error(notConfiguredMessage) }),
      signInWithOtp: async () => ({ data: { user: null, session: null }, error: new Error(notConfiguredMessage) }),
      signOut: async () => ({ error: new Error(notConfiguredMessage) }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
        error: null,
      }),
      admin: {
        deleteUser: async () => ({ data: null, error: new Error(notConfiguredMessage) }),
      },
    },
  };
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ ' + notConfiguredMessage);
  }
  return client;
}

// Export a working client when configured, otherwise a safe stub
export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : createSupabaseMissingClient();

export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured) return false;
  try {
    const { data, error } = await supabase.from('CineXnema').select('count').limit(1);
    if (error) {
      console.warn('Supabase connection test failed:', error.message);
      return false;
    }
    // eslint-disable-next-line no-console
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.warn('⚠️ Supabase connection error:', error);
    return false;
  }
};

export interface User {
  id?: string; // Supabase Auth UUID
  user_id: string; // Database table UUID
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  passwordHash?: string;
  subscriptionStatus: 'ativo' | 'inativo';
  subscriptionStart?: Date;
  subscriptionPlan?: 'monthly' | 'yearly';
  comissaoPercentual: number;
  confirmationLink?: string; // For email confirmation
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'trial';
  plan_type: 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}
