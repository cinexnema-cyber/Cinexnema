import React, { useState, useCallback } from 'react';
import { useLanguage, languages, Language } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

// Error boundary component for the language selector
class LanguageSelectorErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('LanguageSelector error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Button variant="ghost" size="sm" className="h-9 px-3 gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">PT</span>
        </Button>
      );
    }

    return this.props.children;
  }
}

function LanguageSelectorContent() {
  const [isOpen, setIsOpen] = useState(false);

  // Safe hook usage with try-catch
  let languageData;
  try {
    languageData = useLanguage();
  } catch (error) {
    console.error('useLanguage hook error:', error);
    // Fallback to default values
    languageData = {
      language: 'pt' as Language,
      setLanguage: () => {},
      isChanging: false
    };
  }

  const { language, setLanguage, isChanging } = languageData;
  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageChange = useCallback((langCode: Language) => {
    try {
      setLanguage(langCode);
      setIsOpen(false);

      // Provide immediate visual feedback
      const event = new CustomEvent('languageChanged', {
        detail: { language: langCode }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Language change error:', error);
    }
  }, [setLanguage]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-9 px-3 gap-2 text-sm font-medium hover:bg-xnema-surface transition-all duration-200 ${
            isChanging ? 'scale-105 bg-xnema-orange/20' : ''
          }`}
        >
          <span className="text-lg">{currentLanguage?.flag || '🇧🇷'}</span>
          <span className="hidden sm:inline">{currentLanguage?.name || 'Português'}</span>
          <span className="sr-only">Selecionar idioma</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as Language)}
            className={`
              flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition-all duration-200
              ${language === lang.code
                ? 'bg-xnema-orange text-white shadow-sm'
                : 'hover:bg-xnema-surface hover:scale-105'
              }
            `}
          >
            <span className="text-lg flex-shrink-0">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-xs opacity-75">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LanguageSelector() {
  return (
    <LanguageSelectorErrorBoundary>
      <LanguageSelectorContent />
    </LanguageSelectorErrorBoundary>
  );
}
