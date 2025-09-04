import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, CreditCard, Database, RefreshCw } from 'lucide-react';

export default function AuthDebug() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleTestLogin = async () => {
    const success = await login('cinexnema@gmail.com', 'I30C77T$Ii');
    if (success) {
      console.log('Test login successful');
    } else {
      console.error('Test login failed');
    }
  };

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Authentication Debug</h1>
          <p className="text-muted-foreground">Debug authentication state and user data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Authentication Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Is Loading:</span>
                <Badge variant={isLoading ? "secondary" : "outline"}>
                  {isLoading ? "Yes" : "No"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Is Authenticated:</span>
                <Badge variant={isAuthenticated ? "default" : "destructive"}>
                  {isAuthenticated ? "Yes" : "No"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>User Object:</span>
                <Badge variant={user ? "default" : "destructive"}>
                  {user ? "Present" : "Null"}
                </Badge>
              </div>

              <div className="pt-4 space-y-2">
                <Button onClick={handleTestLogin} className="w-full" size="sm">
                  Test Admin Login
                </Button>
                <Button onClick={logout} variant="outline" className="w-full" size="sm">
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Email:</span>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Name:</span>
                    <p className="text-sm text-muted-foreground">{user.name || user.displayName}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Role:</span>
                    <Badge className="ml-2">{user.role}</Badge>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Subscriber:</span>
                    <Badge variant={user.assinante ? "default" : "secondary"} className="ml-2">
                      {user.assinante ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Subscription Status:</span>
                    <Badge variant={user.subscriptionStatus === "ativo" ? "default" : "secondary"} className="ml-2">
                      {user.subscriptionStatus}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No user data available</p>
              )}
            </CardContent>
          </Card>

          {/* Local Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Local Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">xnema_user:</span>
                  <Badge variant={localStorage.getItem('xnema_user') ? "default" : "secondary"} className="ml-2">
                    {localStorage.getItem('xnema_user') ? "Present" : "Empty"}
                  </Badge>
                </div>
                
                <div>
                  <span className="text-sm font-medium">xnema_token:</span>
                  <Badge variant={localStorage.getItem('xnema_token') ? "default" : "secondary"} className="ml-2">
                    {localStorage.getItem('xnema_token') ? "Present" : "Empty"}
                  </Badge>
                </div>

                {localStorage.getItem('xnema_user') && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">View User Data</summary>
                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(JSON.parse(localStorage.getItem('xnema_user') || '{}'), null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Test Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => navigate('/creator-portal')} 
                variant="outline" 
                className="w-full"
                size="sm"
              >
                Test Creator Portal
              </Button>
              
              <Button 
                onClick={() => navigate('/admin-dashboard')} 
                variant="outline" 
                className="w-full"
                size="sm"
              >
                Test Admin Dashboard
              </Button>
              
              <Button 
                onClick={() => navigate('/subscriber-dashboard')} 
                variant="outline" 
                className="w-full"
                size="sm"
              >
                Test Subscriber Dashboard
              </Button>

              <Button 
                onClick={() => navigate('/between-heaven-hell')} 
                variant="outline" 
                className="w-full"
                size="sm"
              >
                Test Premium Content
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <Button onClick={() => navigate('/')} className="mr-4">
            Back to Home
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}
