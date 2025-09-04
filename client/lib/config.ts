// Configurações de ambiente para XNEMA

export const config = {
  // URLs base
  production: {
    baseUrl: 'https://cinexnema.com',
    supabaseUrl: 'https://gardjxolnrykvxxtatdq.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcmRqeG9sbnJ5a3Z4eHRhdGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNzY3MjcsImV4cCI6MjA3MDk1MjcyN30.0qkhDmTyXsc8U63t1UTh5fV1UCOfzjH7Q0hO2GNj6sQ'
  },
  development: {
    baseUrl: window.location.origin,
    supabaseUrl: 'https://gardjxolnrykvxxtatdq.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcmRqeG9sbnJ5a3Z4eHRhdGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNzY3MjcsImV4cCI6MjA3MDk1MjcyN30.0qkhDmTyXsc8U63t1UTh5fV1UCOfzjH7Q0hO2GNj6sQ'
  }
};

// Detectar ambiente
export const isProduction = 
  window.location.hostname === 'cinexnema.com' || 
  window.location.hostname === 'www.cinexnema.com';

export const isDevelopment =
  window.location.hostname === 'localhost' ||
  window.location.hostname.includes('fly.dev') ||
  window.location.hostname.includes('vercel.app') ||
  window.location.hostname.includes('netlify.app') ||
  window.location.hostname.includes('127.0.0.1') ||
  window.location.port === '8080' ||
  window.location.port === '3000';

// Configuração atual baseada no ambiente
export const currentConfig = isProduction ? config.production : config.development;

// URLs específicas para redirecionamento
export const getRedirectUrls = () => {
  const baseUrl = currentConfig.baseUrl;
  
  return {
    emailConfirmed: `${baseUrl}/confirmed`,
    resetPassword: `${baseUrl}/reset-password`,
    login: `${baseUrl}/login`,
    register: `${baseUrl}/register`
  };
};

// Configurações para Supabase Auth
export const getSupabaseAuthConfig = () => {
  const redirectUrls = getRedirectUrls();
  
  return {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: redirectUrls.emailConfirmed, // Padrão para registro
    resetPasswordRedirectTo: redirectUrls.resetPassword
  };
};

// Debug info
console.log('🌍 Ambiente detectado:', {
  hostname: window.location.hostname,
  isProduction,
  isDevelopment,
  baseUrl: currentConfig.baseUrl,
  redirectUrls: getRedirectUrls()
});

export default currentConfig;
