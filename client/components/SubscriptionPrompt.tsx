import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock, Play, Star } from 'lucide-react';

interface SubscriptionPromptProps {
  contentTitle?: string;
  contentType?: 'movie' | 'series' | 'episode';
  onClose?: () => void;
}

export function SubscriptionPrompt({ 
  contentTitle = "Conteúdo Premium", 
  contentType = "movie",
  onClose 
}: SubscriptionPromptProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
        
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <CardTitle className="text-2xl font-bold text-xnema-orange">
            Conteúdo Premium
          </CardTitle>
          <CardDescription>
            Para assistir "{contentTitle}" você precisa ter uma assinatura ativa
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Plano destaque */}
          <div className="bg-gradient-to-br from-xnema-orange/10 to-xnema-purple/10 border border-xnema-orange/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-xnema-orange" />
                <span className="font-semibold text-foreground">XNEMA Premium</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">R$ 19,90</div>
                <div className="text-sm text-muted-foreground">/mês</div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-xnema-orange" />
                <span>Acesso total à série "Between Heaven and Hell"</span>
              </div>
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-xnema-orange" />
                <span>Filmes e séries exclusivas XNEMA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-xnema-orange" />
                <span>Qualidade 4K sem anúncios</span>
              </div>
            </div>
            
            <div className="bg-green-500/20 text-green-400 text-center py-2 rounded-md text-sm font-medium">
              ✨ Primeiro mês GRÁTIS
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button 
              onClick={handleSubscribe} 
              className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black font-medium"
              size="lg"
            >
              <Crown className="w-4 h-4 mr-2" />
              Assinar e Assistir Agora
            </Button>
            
            <Button 
              onClick={handleLogin} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              Já sou assinante - Fazer login
            </Button>
            
            {onClose && (
              <Button 
                onClick={onClose} 
                variant="ghost" 
                className="w-full text-muted-foreground"
              >
                Voltar para navegação
              </Button>
            )}
          </div>

          <div className="text-center text-xs text-muted-foreground">
            ✓ Cancele quando quiser ✓ Sem compromisso ✓ Acesso imediato
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
