// Inicializador da Plataforma Inteligente XNEMA

import { initializePaymentSystem, paymentRecognition } from './paymentRecognition';
import { initializeRecommendationSystem, recommendationEngine } from './smartRecommendations';

class SmartPlatform {
  private static instance: SmartPlatform;
  private initialized = false;

  static getInstance(): SmartPlatform {
    if (!SmartPlatform.instance) {
      SmartPlatform.instance = new SmartPlatform();
    }
    return SmartPlatform.instance;
  }

  // Inicializa toda a plataforma inteligente
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🚀 Inicializando XNEMA Smart Platform...');

    try {
      // 1. Sistema de Pagamentos
      console.log('💳 Inicializando sistema de pagamentos...');
      initializePaymentSystem();

      // 2. Sistema de Recomendações
      console.log('🤖 Inicializando sistema de recomendações...');
      initializeRecommendationSystem();

      // 3. Configurações de Performance
      console.log('⚡ Otimizando performance...');
      this.optimizePerformance();

      // 4. Configurações Responsivas
      console.log('📱 Configurando responsividade...');
      this.setupResponsiveFeatures();

      // 5. Sistema de Analytics
      console.log('📊 Inicializando analytics...');
      this.initializeAnalytics();

      // 6. Sistema de Notificações
      console.log('🔔 Configurando notificações...');
      await this.setupNotifications();

      // 7. Sistema de Cache Inteligente
      console.log('💾 Configurando cache inteligente...');
      this.setupIntelligentCaching();

      // 8. Detecção Automática de Dispositivo
      console.log('🖥️ Configurando detecção de dispositivo...');
      this.setupDeviceDetection();

      this.initialized = true;
      console.log('✅ XNEMA Smart Platform inicializada com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao inicializar plataforma:', error);
    }
  }

  // Otimizações de performance
  private optimizePerformance(): void {
    // Lazy loading para imagens
    this.setupLazyLoading();
    
    // Preload de conteúdo crítico
    this.preloadCriticalContent();
    
    // Service Worker para cache
    this.setupServiceWorker();
  }

  // Configurações responsivas inteligentes
  private setupResponsiveFeatures(): void {
    // Detecção de orientação
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.adjustLayoutForOrientation();
      }, 100);
    });

    // Detecção de resize
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.adjustLayoutForViewport();
      }, 250);
    });

    // Configurações específicas por dispositivo
    this.configureDeviceSpecificFeatures();
  }

  // Configurações específicas por tipo de dispositivo
  private configureDeviceSpecificFeatures(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;

    // Smart TV
    if (screenWidth >= 1920 || /smart-tv|tv/.test(userAgent)) {
      this.configureForTV();
    }
    // Mobile
    else if (/mobile|android|iphone/.test(userAgent) && screenWidth < 768) {
      this.configureForMobile();
    }
    // Tablet
    else if (/tablet|ipad/.test(userAgent) || (screenWidth >= 768 && screenWidth < 1024)) {
      this.configureForTablet();
    }
    // Desktop
    else {
      this.configureForDesktop();
    }
  }

  private configureForTV(): void {
    // Configurações para Smart TV
    document.body.classList.add('device-tv');
    
    // Interface otimizada para controle remoto
    this.setupTVNavigation();
    
    // Qualidade de vídeo automática em 4K
    this.setDefaultVideoQuality('4k');
    
    // UI elements maiores
    document.documentElement.style.fontSize = '1.2em';
  }

  private configureForMobile(): void {
    document.body.classList.add('device-mobile');
    
    // Touch gestures
    this.setupTouchGestures();
    
    // Qualidade automática baseada em conexão
    this.setupAdaptiveQuality();
    
    // Picture-in-picture para navegação
    this.setupPiPMode();
    
    // Modo economia de bateria
    this.setupBatterySaver();
  }

  private configureForTablet(): void {
    document.body.classList.add('device-tablet');
    
    // Interface híbrida touch/mouse
    this.setupHybridInput();
    
    // Layout adaptativo
    this.setupTabletLayout();
  }

  private configureForDesktop(): void {
    document.body.classList.add('device-desktop');
    
    // Atalhos de teclado
    this.setupKeyboardShortcuts();
    
    // Multi-monitor support
    this.setupMultiMonitorSupport();
    
    // Drag and drop
    this.setupDragAndDrop();
  }

  // Sistema de Analytics
  private initializeAnalytics(): void {
    // Mock analytics - em produção usar Google Analytics, etc.
    const analytics = {
      trackPageView: (page: string) => {
        console.log(`📊 Page view: ${page}`);
      },
      trackEvent: (category: string, action: string, label?: string) => {
        console.log(`📊 Event: ${category}/${action}${label ? `/${label}` : ''}`);
      },
      trackVideoWatch: (contentId: string, duration: number) => {
        console.log(`📊 Video watch: ${contentId} for ${duration}s`);
      }
    };

    // Disponibiliza globalmente
    (window as any).xnemaAnalytics = analytics;

    // Track inicial
    analytics.trackPageView(window.location.pathname);
  }

  // Sistema de Notificações
  private async setupNotifications(): Promise<void> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Service worker para notificações em background
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          
          // Configurar push notifications (em produção)
          console.log('🔔 Notificações configuradas');
        }
      }
    }

    // Notificações in-app
    this.setupInAppNotifications();
  }

  // Notificações dentro da aplicação
  private setupInAppNotifications(): void {
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'xnema-notifications';
    notificationContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(notificationContainer);

    // Sistema global de notificações
    (window as any).xnemaNotify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const notification = document.createElement('div');
      notification.className = `
        p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full
        ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
        text-white max-w-sm
      `;
      notification.textContent = message;

      notificationContainer.appendChild(notification);

      // Animate in
      setTimeout(() => {
        notification.classList.remove('translate-x-full');
      }, 100);

      // Auto remove
      setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 5000);
    };
  }

  // Cache inteligente
  private setupIntelligentCaching(): void {
    // Cache de imagens com intersection observer
    const imageCache = new Map<string, string>();

    const cacheImage = (url: string): Promise<string> => {
      if (imageCache.has(url)) {
        return Promise.resolve(imageCache.get(url)!);
      }

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          imageCache.set(url, url);
          resolve(url);
        };
        img.src = url;
      });
    };

    // Disponibiliza globalmente
    (window as any).xnemaCache = { cacheImage };

    // Preload de conteúdo baseado em comportamento do usuário
    this.setupPredictivePreloading();
  }

  // Preload preditivo
  private setupPredictivePreloading(): void {
    const preloadQueue = new Set<string>();
    
    // Preload baseado em hover
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !preloadQueue.has(link.href)) {
        preloadQueue.add(link.href);
        
        // Preload after delay
        setTimeout(() => {
          const linkTag = document.createElement('link');
          linkTag.rel = 'prefetch';
          linkTag.href = link.href;
          document.head.appendChild(linkTag);
        }, 200);
      }
    });
  }

  // Configurações específicas para TV
  private setupTVNavigation(): void {
    let currentFocus = 0;
    const focusableElements = () => 
      Array.from(document.querySelectorAll('[data-tv-focusable], button, a, input, select, textarea'))
        .filter(el => !el.hasAttribute('disabled')) as HTMLElement[];

    document.addEventListener('keydown', (e) => {
      const elements = focusableElements();
      if (elements.length === 0) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          currentFocus = Math.max(0, currentFocus - 1);
          elements[currentFocus]?.focus();
          break;
        
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          currentFocus = Math.min(elements.length - 1, currentFocus + 1);
          elements[currentFocus]?.focus();
          break;
        
        case 'Enter':
          e.preventDefault();
          elements[currentFocus]?.click();
          break;
      }
    });
  }

  // Touch gestures para mobile
  private setupTouchGestures(): void {
    let startX: number, startY: number;

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Detect swipe direction
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 50) {
          if (diffX > 0) {
            // Swipe left
            this.handleSwipeLeft();
          } else {
            // Swipe right
            this.handleSwipeRight();
          }
        }
      }
    });
  }

  private handleSwipeLeft(): void {
    // Navigate forward in video player or next content
    const event = new CustomEvent('xnema:swipe-left');
    document.dispatchEvent(event);
  }

  private handleSwipeRight(): void {
    // Navigate back or previous content
    const event = new CustomEvent('xnema:swipe-right');
    document.dispatchEvent(event);
  }

  // Lazy loading inteligente
  private setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      }, { threshold: 0.1 });

      // Observer para imagens futuras
      const observeNewImages = () => {
        document.querySelectorAll('img[data-src]').forEach((img) => {
          observer.observe(img);
        });
      };

      // Observa imagens iniciais
      observeNewImages();

      // Re-observa quando DOM muda
      const mutationObserver = new MutationObserver(observeNewImages);
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  // Outras funções auxiliares
  private preloadCriticalContent(): void {
    // Preload fonts, critical CSS, etc.
    const criticalResources = [
      '/fonts/main.woff2',
      '/css/critical.css'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.woff2') ? 'font' : 'style';
      if (link.as === 'font') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  private setupServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }
  }

  // Stubs para outras funções
  private adjustLayoutForOrientation(): void {
    const orientation = screen.orientation?.angle ?? 0;
    document.body.dataset.orientation = orientation === 0 || orientation === 180 ? 'portrait' : 'landscape';
  }

  private adjustLayoutForViewport(): void {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  private setDefaultVideoQuality(quality: string): void {
    localStorage.setItem('xnema-video-quality', quality);
  }

  private setupAdaptiveQuality(): void {
    // Adapt quality based on connection speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.setDefaultVideoQuality('480p');
      }
    }
  }

  private setupPiPMode(): void {
    // Picture-in-picture mode setup
    if ('pictureInPictureEnabled' in document) {
      (window as any).xnemaPiP = {
        enter: (video: HTMLVideoElement) => video.requestPictureInPicture(),
        exit: () => document.exitPictureInPicture()
      };
    }
  }

  private setupBatterySaver(): void {
    // Reduce animations and effects on low battery
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.2) {
          document.body.classList.add('battery-saver');
        }
      });
    }
  }

  private setupHybridInput(): void {
    // Detect touch and mouse for tablets
    let isTouch = false;
    
    document.addEventListener('touchstart', () => {
      isTouch = true;
      document.body.classList.add('touch-input');
    });
    
    document.addEventListener('mouseover', () => {
      if (!isTouch) {
        document.body.classList.add('mouse-input');
      }
    });
  }

  private setupTabletLayout(): void {
    // Adaptive layout for tablets
    const mediaQuery = window.matchMedia('(orientation: landscape)');
    const handleOrientationChange = (e: MediaQueryListEvent) => {
      document.body.classList.toggle('landscape-tablet', e.matches);
    };
    
    mediaQuery.addListener(handleOrientationChange);
    handleOrientationChange(mediaQuery);
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            // Focus search
            document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
            break;
        }
      }
      
      // Global shortcuts
      switch (e.key) {
        case ' ':
          if (e.target === document.body) {
            e.preventDefault();
            // Toggle video play/pause
            document.dispatchEvent(new CustomEvent('xnema:toggle-play'));
          }
          break;
      }
    });
  }

  private setupMultiMonitorSupport(): void {
    // Handle window positioning across monitors
    if ('getScreenDetails' in window) {
      // Modern Screen Capture API
      console.log('Multi-monitor support available');
    }
  }

  private setupDragAndDrop(): void {
    // Drag and drop for file uploads
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    
    document.addEventListener('drop', (e) => {
      e.preventDefault();
      // Handle dropped files
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        document.dispatchEvent(new CustomEvent('xnema:files-dropped', { detail: files }));
      }
    });
  }

  private setupDeviceDetection(): void {
    // Store device info globally
    const deviceInfo = {
      type: this.getDeviceType(),
      orientation: this.getOrientation(),
      connection: this.getConnectionInfo(),
      capabilities: this.getDeviceCapabilities()
    };

    (window as any).xnemaDevice = deviceInfo;
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;

    if (/smart-tv|tv/.test(userAgent) || screenWidth >= 1920) return 'tv';
    if (/mobile|android|iphone/.test(userAgent) && screenWidth < 768) return 'mobile';
    if (/tablet|ipad/.test(userAgent) || (screenWidth >= 768 && screenWidth < 1024)) return 'tablet';
    return 'desktop';
  }

  private getOrientation(): string {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  private getConnectionInfo(): any {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt
      };
    }
    return null;
  }

  private getDeviceCapabilities(): any {
    return {
      touchSupport: 'ontouchstart' in window,
      webGL: !!document.createElement('canvas').getContext('webgl'),
      webRTC: !!(navigator as any).mediaDevices?.getUserMedia,
      notifications: 'Notification' in window,
      serviceWorker: 'serviceWorker' in navigator,
      pictureInPicture: 'pictureInPictureEnabled' in document
    };
  }
}

// Exporta instância singleton
export const smartPlatform = SmartPlatform.getInstance();

// Auto-inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => smartPlatform.initialize());
} else {
  smartPlatform.initialize();
}

// Exporta funções utilitárias
export const initializeSmartPlatform = () => smartPlatform.initialize();
