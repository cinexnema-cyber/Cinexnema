import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, User, Star, Save, ArrowLeft, Camera, Sparkles } from "lucide-react";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    username: user?.username || ''
  });

  const [creatorData, setCreatorData] = useState({
    fullName: '',
    whatsapp: '',
    portfolio: '',
    contentDescription: '',
    experience: '',
    motivation: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simular update - aqui você integraria com o backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simular envio de proposta
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Proposta de criador enviada com sucesso! Analisaremos em breve.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError('Erro ao enviar proposta');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string, isCreator = false) => {
    if (isCreator) {
      setCreatorData(prev => ({ ...prev, [field]: value }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-xnema-orange rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Editar Perfil</h1>
                <p className="text-muted-foreground">
                  Gerencie suas informações e configurações de conta
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
              <AlertDescription className="text-green-700 dark:text-green-300">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="creator">Torne-se Criador</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
            </TabsList>

            {/* Aba Perfil */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações básicas de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Nome de Exibição</Label>
                        <Input
                          id="displayName"
                          value={profileData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          placeholder="Seu nome para exibição"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Nome de Usuário</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          placeholder="@seunome"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="seu@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Conte um pouco sobre você..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Alterações
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Torne-se Criador */}
            <TabsContent value="creator">
              <Card className="border-xnema-purple">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xnema-purple">
                    <Star className="w-5 h-5" />
                    Torne-se um Criador XNEMA
                  </CardTitle>
                  <CardDescription>
                    Junte-se à nossa comunidade de criadores e comece a monetizar seu conteúdo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Benefícios */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-xnema-purple/10 to-xnema-orange/10 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-xnema-purple" />
                      Benefícios de ser um Criador XNEMA
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <p className="flex items-center gap-2">
                        ✨ <span>Monetização do seu conteúdo</span>
                      </p>
                      <p className="flex items-center gap-2">
                        💰 <span>Comissões competitivas</span>
                      </p>
                      <p className="flex items-center gap-2">
                        🎬 <span>Ferramentas de criação</span>
                      </p>
                      <p className="flex items-center gap-2">
                        📊 <span>Analytics detalhados</span>
                      </p>
                      <p className="flex items-center gap-2">
                        🤝 <span>Suporte dedicado</span>
                      </p>
                      <p className="flex items-center gap-2">
                        🌟 <span>Destaque na plataforma</span>
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreatorApplication} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo</Label>
                        <Input
                          id="fullName"
                          value={creatorData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value, true)}
                          placeholder="Seu nome completo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          value={creatorData.whatsapp}
                          onChange={(e) => handleInputChange('whatsapp', e.target.value, true)}
                          placeholder="(11) 99999-9999"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portfolio">Portfolio / Site</Label>
                      <Input
                        id="portfolio"
                        type="url"
                        value={creatorData.portfolio}
                        onChange={(e) => handleInputChange('portfolio', e.target.value, true)}
                        placeholder="https://seuportfolio.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Experiência</Label>
                      <Textarea
                        id="experience"
                        value={creatorData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value, true)}
                        placeholder="Conte sobre sua experiência com criação de conteúdo..."
                        className="min-h-[80px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contentDescription">Tipo de Conteúdo</Label>
                      <Textarea
                        id="contentDescription"
                        value={creatorData.contentDescription}
                        onChange={(e) => handleInputChange('contentDescription', e.target.value, true)}
                        placeholder="Que tipo de conteúdo você planeja criar? (filmes, séries, documentários, etc.)"
                        className="min-h-[80px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivation">Motivação</Label>
                      <Textarea
                        id="motivation"
                        value={creatorData.motivation}
                        onChange={(e) => handleInputChange('motivation', e.target.value, true)}
                        placeholder="Por que você quer se tornar um criador XNEMA?"
                        className="min-h-[80px]"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Button type="submit" disabled={loading} className="bg-xnema-purple hover:bg-xnema-purple/90">
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Enviando Proposta...
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4 mr-2" />
                            Enviar Proposta
                          </>
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Analisaremos sua proposta em até 48 horas
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Segurança */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Segurança e Privacidade
                  </CardTitle>
                  <CardDescription>
                    Configurações de segurança da sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Alterar Senha</h4>
                        <p className="text-sm text-muted-foreground">
                          Atualize sua senha de acesso
                        </p>
                      </div>
                      <Button variant="outline">Alterar</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Autenticação em Duas Etapas</h4>
                        <p className="text-sm text-muted-foreground">
                          Adicione uma camada extra de segurança
                        </p>
                      </div>
                      <Button variant="outline">Configurar</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Sessões Ativas</h4>
                        <p className="text-sm text-muted-foreground">
                          Gerencie seus dispositivos conectados
                        </p>
                      </div>
                      <Button variant="outline">Ver Sessões</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
