import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Auto-login with token
      handleTokenLogin(token);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handleTokenLogin = async (token: string) => {
    try {
      setLoading(true);
      
      const { user, error: loginError } = await AuthService.loginFromToken(token);
      
      if (loginError) {
        setError(`Falha no login automático: ${loginError}`);
        setLoading(false);
        return;
      }
      
      if (!user) {
        setError('Token inválido ou expirado');
        setLoading(false);
        return;
      }

      // Set user in context
      setUser(user);
      setSuccess(true);
      setLoading(false);

      // Store token for future requests (in production, use the proper JWT)
      localStorage.setItem('authToken', token);
      
      // Redirect based on user type after 2 seconds
      setTimeout(() => {
        if (user.assinante && user.role === 'subscriber') {
          navigate('/subscriber-dashboard');
        } else if (user.role === 'user') {
          navigate('/user-dashboard');
        } else {
          navigate('/dashboard'); // Let Dashboard router handle it
        }
      }, 2000);

    } catch (error) {
      setError('Erro inesperado no login automático');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-xnema-dark via-xnema-surface to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-xnema-orange">
            Bem-vindo ao XNEMA!
          </CardTitle>
          <CardDescription>
            Sua conta premium está sendo configurada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-xnema-orange" />
              <span>Fazendo login automático...</span>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Login realizado com sucesso! Redirecionando para a plataforma...
              </AlertDescription>
            </Alert>
          )}
          
          {!loading && !success && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Parabéns! Sua conta XNEMA foi criada com sucesso.
              </p>
              <p className="text-sm text-muted-foreground">
                Você agora tem acesso a todo o conteúdo premium da plataforma.
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Ir para a Plataforma
              </Button>
            </div>
          )}
          
          {error && (
            <div className="text-center">
              <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                Fazer Login Manual
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
