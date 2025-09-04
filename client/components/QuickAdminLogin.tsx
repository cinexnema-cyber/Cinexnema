import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, LogIn, User, Crown, CreditCard } from 'lucide-react';

export function QuickAdminLogin() {
  const { user, logout, isAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const adminXHR = (email: string, password: string) =>
    new Promise<any>((resolve) => {
      const qs = new URLSearchParams({ email, password }).toString();
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `/api/admin/login?${qs}`, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          try {
            const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            resolve({ ok: xhr.status >= 200 && xhr.status < 300, data });
          } catch {
            resolve({ ok: false, data: {} });
          }
        }
      };
      xhr.send();
    });

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      const creds = [
        { email: 'cinexnema@gmail.com', password: 'I30C77T$IiD' },
        { email: 'eliteeaglesupplements@gmail.com', password: 'I30C77T$IiD' },
      ];
      // Try first, then second
      let result: any = await adminXHR(creds[0].email, creds[0].password);
      if (!result.ok || !result.data?.success) {
        result = await adminXHR(creds[1].email, creds[1].password);
      }
      if (result.ok && result.data?.success && result.data?.token) {
        localStorage.setItem('xnema_token', result.data.token);
        localStorage.setItem('xnema_user', JSON.stringify(result.data.user));
        localStorage.setItem('xnema_admin_override', 'true');
        setUser(result.data.user);
        navigate('/admin-dashboard');
      } else {
        console.error('❌ Admin login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (isAuthenticated && user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Logged In
          </CardTitle>
          <CardDescription>
            Welcome back, {user.name || user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Role:</span>
            <Badge className="capitalize">{user.role}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Status:</span>
            <Badge variant={user.assinante ? "default" : "secondary"}>
              {user.assinante ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => handleNavigation('/creator-portal')}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Crown className="w-4 h-4 mr-1" />
              Creator
            </Button>
            
            <Button 
              onClick={() => handleNavigation('/admin-dashboard')}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Shield className="w-4 h-4 mr-1" />
              Admin
            </Button>
            
            <Button 
              onClick={() => handleNavigation('/subscriber-dashboard')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Subscriber
            </Button>
            
            <Button 
              onClick={() => handleNavigation('/auth-debug')}
              size="sm"
              variant="outline"
            >
              Debug
            </Button>
          </div>

          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Quick Admin Access
        </CardTitle>
        <CardDescription>
          Login as administrator for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          This will log you in as:
          <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
            Emails: cinexnema@gmail.com, eliteeaglesupplements@gmail.com<br/>
            Role: Admin<br/>
            Access: All features
          </div>
        </div>

        <Button 
          onClick={handleAdminLogin}
          disabled={loading}
          className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
        >
          <LogIn className="w-4 h-4 mr-2" />
          {loading ? 'Logging in...' : 'Login as Admin'}
        </Button>

        <div className="text-center">
          <Button 
            onClick={() => navigate('/auth-debug')}
            variant="link"
            size="sm"
            className="text-xs"
          >
            Debug Authentication
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick access floating button for development
export function QuickAccessButton() {
  const [showPanel, setShowPanel] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors z-50 flex items-center justify-center"
        title="Quick Admin Access"
      >
        <Shield className="w-6 h-6" />
      </button>

      {showPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <button
              onClick={() => setShowPanel(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs"
            >
              ×
            </button>
            <QuickAdminLogin />
          </div>
        </div>
      )}
    </>
  );
}

export default QuickAdminLogin;
