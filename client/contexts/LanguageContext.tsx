import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    'nav.home': 'Início',
    'nav.catalog': 'Catálogo',
    'nav.categories': 'Categorias',
    'nav.subscription': 'Assinatura',
    'nav.login': 'Entrar',
    'nav.register': 'Cadastrar',
    'hero.title': 'Bem-vindo ao XNEMA',
    'hero.subtitle': 'Sua plataforma de streaming premium',
    'subscription.title': 'Assine Agora',
    'subscription.monthly': 'Mensal',
    'subscription.yearly': 'Anual',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.confirmPassword': 'Confirmar Senha',
    'auth.username': 'Nome de Usuário',
    'auth.displayName': 'Nome de Exibição',
    'auth.forgotPassword': 'Esqueceu a senha?',
    'auth.resetPassword': 'Redefinir Senha',
    'auth.subscribeNow': 'Assine Agora',
    'content.premiumOnly': 'Conteúdo Premium - Assinatura Necessária',
    'content.subscribe': 'Faça sua assinatura para acessar este conteúdo',
    'footer.copyright': '© 2024 XNEMA. Todos os direitos reservados.',
  },
  en: {
    'nav.home': 'Home',
    'nav.catalog': 'Catalog',
    'nav.categories': 'Categories',
    'nav.subscription': 'Subscription',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'hero.title': 'Welcome to XNEMA',
    'hero.subtitle': 'Your premium streaming platform',
    'subscription.title': 'Subscribe Now',
    'subscription.monthly': 'Monthly',
    'subscription.yearly': 'Yearly',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.username': 'Username',
    'auth.displayName': 'Display Name',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.resetPassword': 'Reset Password',
    'auth.subscribeNow': 'Subscribe Now',
    'content.premiumOnly': 'Premium Content - Subscription Required',
    'content.subscribe': 'Subscribe to access this content',
    'footer.copyright': '© 2024 XNEMA. All rights reserved.',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.catalog': 'Catálogo',
    'nav.categories': 'Categorías',
    'nav.subscription': 'Suscripción',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'hero.title': 'Bienvenido a XNEMA',
    'hero.subtitle': 'Tu plataforma de streaming premium',
    'subscription.title': 'Suscríbete Ahora',
    'subscription.monthly': 'Mensual',
    'subscription.yearly': 'Anual',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.username': 'Nombre de Usuario',
    'auth.displayName': 'Nombre para Mostrar',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.resetPassword': 'Restablecer Contraseña',
    'auth.subscribeNow': 'Suscríbete Ahora',
    'content.premiumOnly': 'Contenido Premium - Suscripción Requerida',
    'content.subscribe': 'Suscríbete para acceder a este contenido',
    'footer.copyright': '© 2024 XNEMA. Todos los derechos reservados.',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.catalog': 'Catalogue',
    'nav.categories': 'Catégories',
    'nav.subscription': 'Abonnement',
    'nav.login': 'Connexion',
    'nav.register': "S'inscrire",
    'hero.title': 'Bienvenue sur XNEMA',
    'hero.subtitle': 'Votre plateforme de streaming premium',
    'subscription.title': "S'abonner Maintenant",
    'subscription.monthly': 'Mensuel',
    'subscription.yearly': 'Annuel',
    'auth.email': 'Email',
    'auth.password': 'Mot de Passe',
    'auth.confirmPassword': 'Confirmer le Mot de Passe',
    'auth.username': "Nom d'Utilisateur",
    'auth.displayName': "Nom d'Affichage",
    'auth.forgotPassword': 'Mot de passe oublié?',
    'auth.resetPassword': 'Réinitialiser le Mot de Passe',
    'auth.subscribeNow': "S'abonner Maintenant",
    'content.premiumOnly': 'Contenu Premium - Abonnement Requis',
    'content.subscribe': "S'abonner pour accéder à ce contenu",
    'footer.copyright': '© 2024 XNEMA. Tous droits réservés.',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.catalog': 'Katalog',
    'nav.categories': 'Kategorien',
    'nav.subscription': 'Abonnement',
    'nav.login': 'Anmelden',
    'nav.register': 'Registrieren',
    'hero.title': 'Willkommen bei XNEMA',
    'hero.subtitle': 'Ihre Premium-Streaming-Plattform',
    'subscription.title': 'Jetzt Abonnieren',
    'subscription.monthly': 'Monatlich',
    'subscription.yearly': 'Jährlich',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.confirmPassword': 'Passwort Bestätigen',
    'auth.username': 'Benutzername',
    'auth.displayName': 'Anzeigename',
    'auth.forgotPassword': 'Passwort vergessen?',
    'auth.resetPassword': 'Passwort Zurücksetzen',
    'auth.subscribeNow': 'Jetzt Abonnieren',
    'content.premiumOnly': 'Premium-Inhalt - Abonnement Erforderlich',
    'content.subscribe': 'Abonnieren Sie, um auf diesen Inhalt zuzugreifen',
    'footer.copyright': '© 2024 XNEMA. Alle Rechte vorbehalten.',
  },
  it: {
    'nav.home': 'Home',
    'nav.catalog': 'Catalogo',
    'nav.categories': 'Categorie',
    'nav.subscription': 'Abbonamento',
    'nav.login': 'Accedi',
    'nav.register': 'Registrati',
    'hero.title': 'Benvenuto su XNEMA',
    'hero.subtitle': 'La tua piattaforma di streaming premium',
    'subscription.title': 'Abbonati Ora',
    'subscription.monthly': 'Mensile',
    'subscription.yearly': 'Annuale',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Conferma Password',
    'auth.username': 'Nome Utente',
    'auth.displayName': 'Nome Visualizzato',
    'auth.forgotPassword': 'Password dimenticata?',
    'auth.resetPassword': 'Reimposta Password',
    'auth.subscribeNow': 'Abbonati Ora',
    'content.premiumOnly': 'Contenuto Premium - Abbonamento Richiesto',
    'content.subscribe': 'Abbonati per accedere a questo contenuto',
    'footer.copyright': '© 2024 XNEMA. Tutti i diritti riservati.',
  },
  zh: {
    'nav.home': '首页',
    'nav.catalog': '目录',
    'nav.categories': '分类',
    'nav.subscription': '订阅',
    'nav.login': '登录',
    'nav.register': '注册',
    'hero.title': '欢迎来到 XNEMA',
    'hero.subtitle': '您的高级流媒体平台',
    'subscription.title': '立即订阅',
    'subscription.monthly': '月度',
    'subscription.yearly': '年度',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.username': '用户名',
    'auth.displayName': '显示名称',
    'auth.forgotPassword': '忘记密码？',
    'auth.resetPassword': '重置密码',
    'auth.subscribeNow': '立即订阅',
    'content.premiumOnly': '高级内容 - 需要订阅',
    'content.subscribe': '订阅以访问此内容',
    'footer.copyright': '© 2024 XNEMA. 版权所有。',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.catalog': 'カタログ',
    'nav.categories': 'カテゴリー',
    'nav.subscription': 'サブスクリプション',
    'nav.login': 'ログイン',
    'nav.register': '登録',
    'hero.title': 'XNEMAへようこそ',
    'hero.subtitle': 'あなたのプレミアムストリーミ���グプラットフォーム',
    'subscription.title': '今すぐ購読',
    'subscription.monthly': '月額',
    'subscription.yearly': '年額',
    'auth.email': 'メール',
    'auth.password': 'パスワード',
    'auth.confirmPassword': 'パスワード確認',
    'auth.username': 'ユーザー名',
    'auth.displayName': '表示名',
    'auth.forgotPassword': 'パスワードを忘れましたか？',
    'auth.resetPassword': 'パスワードリセット',
    'auth.subscribeNow': '今すぐ購読',
    'content.premiumOnly': 'プレミアムコンテンツ - サブスクリプション必須',
    'content.subscribe': 'このコンテンツにアクセスするには購読してください',
    'footer.copyright': '© 2024 XNEMA. 全著作権所有。',
  },
};

export const languages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
] as const;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('xnema-language');
      return (saved as Language) || 'pt';
    } catch (error) {
      console.warn('Failed to read language from localStorage:', error);
      return 'pt';
    }
  });
  const [isChanging, setIsChanging] = useState(false);

  const setLanguage = (lang: Language) => {
    if (lang === language) return; // No change needed

    try {
      setIsChanging(true);
      setLanguageState(lang);
      localStorage.setItem('xnema-language', lang);
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }

    // Brief visual feedback for instant switching
    setTimeout(() => {
      setIsChanging(false);
    }, 150);
  };

  const t = (key: string): string => {
    return translations[language]?.[key as keyof typeof translations[typeof language]] || key;
  };

  useEffect(() => {
    try {
      // Update document language immediately
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;

        // Update meta tag if exists
        const metaLang = document.querySelector('meta[http-equiv="Content-Language"]');
        if (metaLang) {
          metaLang.setAttribute('content', language);
        } else {
          // Create meta tag if it doesn't exist
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', 'Content-Language');
          meta.setAttribute('content', language);
          document.head.appendChild(meta);
        }

        // Update page title with language indicator
        const currentTitle = document.title;
        const languageNames = {
          pt: 'PT',
          en: 'EN',
          es: 'ES',
          fr: 'FR',
          de: 'DE',
          it: 'IT',
          zh: '中文',
          ja: '日本語'
        };

        // Remove any existing language indicator from title
        const cleanTitle = currentTitle.replace(/ \([A-Z]{2}|中文|日本語\)$/, '');
        document.title = `${cleanTitle} (${languageNames[language]})`;
      }
    } catch (error) {
      console.warn('Failed to update document language settings:', error);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isChanging }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    console.error('useLanguage must be used within a LanguageProvider');
    // Return fallback values instead of throwing
    return {
      language: 'pt' as Language,
      setLanguage: () => {},
      t: (key: string) => key,
      isChanging: false
    };
  }
  return context;
}
