import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Users,
  Shield,
  Headphones,
  FileText,
  Briefcase,
  Award,
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Enviar mensagem para cinexnema@gmail.com via API
      const response = await fetch('/api/contact/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          category: formData.category
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Mensagem enviada com sucesso! Nossa equipe retornará o mais breve possível.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: ''
        });
      } else {
        alert('Erro ao enviar mensagem: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }

    // Simular envio do formulário
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "",
      message: "",
    });

    setIsSubmitting(false);
    alert("Mensagem enviada com sucesso! Retornaremos em breve.");
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Geral",
      value: "cinexnema@gmail.com",
      description: "Para dúvidas gerais e suporte",
    },
    {
      icon: Phone,
      title: "Telefone",
      value: "+55 (15) 99763-6161",
      description: "WhatsApp 24h",
    },
    {
      icon: MapPin,
      title: "Endereço",
      value: "São Paulo, SP - Brasil",
      description: "Sede da XNEMA Streaming",
    },
    {
      icon: Clock,
      title: "Horário de Atendimento",
      value: "09:00 - 18:00",
      description: "Segunda a Sexta-feira",
    },
  ];

  const supportCategories = [
    {
      icon: Headphones,
      title: "Suporte Técnico",
      email: "cinexnema@gmail.com",
      description: "Problemas com streaming, login ou app",
    },
    {
      icon: FileText,
      title: "Billing & Assinaturas",
      email: "cinexnema@gmail.com",
      description: "Dúvidas sobre pagamentos e planos",
    },
    {
      icon: Briefcase,
      title: "Parcerias",
      email: "cinexnema@gmail.com",
      description: "Oportunidades de negócio e colaboração",
    },
    {
      icon: Award,
      title: "Criadores",
      email: "cinexnema@gmail.com",
      description: "Submissão de conteúdo e criação",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-xnema-dark to-xnema-surface">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <Badge className="bg-xnema-orange text-black text-lg px-4 py-2 mb-6">
              Fale Conosco
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Estamos Aqui para
              <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                {" "}
                Ajudar
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
              Tem alguma dúvida, sugestão ou precisa de suporte? Nossa equipe
              está pronta para oferecer a melhor experiência possível na XNEMA.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Formas de <span className="text-xnema-orange">Contato</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <Card
                  key={index}
                  className="bg-xnema-surface border-gray-700 text-center"
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                      <method.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {method.title}
                    </h3>
                    <p className="text-xnema-orange font-medium mb-2">
                      {method.value}
                    </p>
                    <p className="text-sm text-gray-400">
                      {method.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Support Categories */}
        <section className="py-16 bg-xnema-surface">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Categorias de <span className="text-xnema-orange">Suporte</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportCategories.map((category, index) => (
                <Card key={index} className="bg-xnema-dark border-gray-700">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-400 mb-3">
                      {category.description}
                    </p>
                    <a
                      href={`mailto:${category.email}`}
                      className="text-xnema-orange hover:underline text-sm"
                    >
                      {category.email}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form */}
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Envie uma <span className="text-xnema-orange">Mensagem</span>
                </h2>
                <p className="text-gray-300 mb-8">
                  Preencha o formulário ao lado e nossa equipe retornará o mais
                  breve possível.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">
                        Nome Completo
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="bg-xnema-surface border-gray-700 text-white"
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="bg-xnema-surface border-gray-700 text-white"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-white">
                      Categoria
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="bg-xnema-surface border-gray-700 text-white">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent className="bg-xnema-surface border-gray-700">
                        <SelectItem value="support">Suporte Técnico</SelectItem>
                        <SelectItem value="billing">
                          Billing & Assinaturas
                        </SelectItem>
                        <SelectItem value="partnership">Parcerias</SelectItem>
                        <SelectItem value="creator">Criadores</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-white">
                      Assunto
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      className="bg-xnema-surface border-gray-700 text-white"
                      placeholder="Resumo da sua mensagem"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-white">
                      Mensagem
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      className="bg-xnema-surface border-gray-700 text-white min-h-32"
                      placeholder="Descreva sua dúvida ou solicitação em detalhes..."
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* FAQ Quick Links */}
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  Perguntas{" "}
                  <span className="text-xnema-orange">Frequentes</span>
                </h3>

                <div className="space-y-4">
                  <Card className="bg-xnema-surface border-gray-700">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2 text-xnema-orange" />
                        Como funciona a assinatura?
                      </h4>
                      <p className="text-sm text-gray-400">
                        Nossa assinatura dá acesso total a todo catálogo por R$
                        19,90/mês, com 7 dias grátis para novos usuários.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-xnema-surface border-gray-700">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-xnema-orange" />
                        Posso compartilhar minha conta?
                      </h4>
                      <p className="text-sm text-gray-400">
                        Cada conta permite até 4 perfis e 2 streams simultâneos
                        para toda a família.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-xnema-surface border-gray-700">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-xnema-orange" />
                        Como cancelo minha assinatura?
                      </h4>
                      <p className="text-sm text-gray-400">
                        Você pode cancelar a qualquer momento nas configurações
                        da sua conta ou entrando em contato conosco.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-xnema-surface border-gray-700">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-xnema-orange" />
                        Como submeter conteúdo?
                      </h4>
                      <p className="text-sm text-gray-400">
                        Criadores podem submeter propostas através do portal de
                        criadores ou enviando email para criadores@xnema.com.br
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-br from-xnema-orange/10 to-xnema-purple/10 rounded-lg border border-xnema-orange/20">
                  <h4 className="font-semibold mb-2 text-xnema-orange">
                    Suporte Urgente
                  </h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Para questões críticas relacionadas a pagamentos ou
                    problemas técnicos graves:
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-xnema-orange" />
                    <span className="text-white font-medium">
                      +55 (15) 99763-6161
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
