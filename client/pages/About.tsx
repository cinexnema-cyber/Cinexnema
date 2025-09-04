import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Play,
  Users,
  Award,
  Globe,
  Heart,
  Star,
  Camera,
  Film,
  Trophy,
  Target,
  Lightbulb,
  Crown,
  Video,
  MessageCircle,
} from "lucide-react";

export default function About() {
  const stats = [
    { label: "Conteúdo Original", value: "15+", icon: Film },
    { label: "Usuários Ativos", value: "100K+", icon: Users },
    { label: "Horas de Conteúdo", value: "500+", icon: Play },
    { label: "Prêmios Recebidos", value: "12", icon: Trophy },
  ];

  const values = [
    {
      icon: Heart,
      title: "Paixão pelo Cinema",
      description:
        "Acreditamos no poder transformador das histórias e no impacto emocional do audiovisual de qualidade.",
    },
    {
      icon: Star,
      title: "Excelência Criativa",
      description:
        "Buscamos sempre a mais alta qualidade em produção, roteiro, direção e performance artística.",
    },
    {
      icon: Globe,
      title: "Cultura Brasileira",
      description:
        "Valorizamos e promovemos a riqueza cultural do Brasil através de narrativas autênticas e diversas.",
    },
    {
      icon: Target,
      title: "Inovação Tecnológica",
      description:
        "Utilizamos as mais modernas tecnologias para oferecer a melhor experiência de streaming.",
    },
  ];

  const team = [
    {
      name: "Carlos Mendes",
      role: "CEO & Fundador",
      description:
        "Visionário com mais de 15 anos na indústria audiovisual brasileira.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
    },
    {
      name: "Marina Silva",
      role: "Diretora de Conteúdo",
      description:
        "Especialista em produção executiva e desenvolvimento de séries originais.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1d0?w=300&h=300&fit=crop",
    },
    {
      name: "Roberto Santos",
      role: "Diretor de Tecnologia",
      description:
        "Expert em plataformas de streaming e experiência do usuário.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    },
    {
      name: "Ana Costa",
      role: "Diretora de Marketing",
      description:
        "Estrategista digital focada em crescimento e engajamento de audiência.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
    },
  ];

  const milestones = [
    {
      year: "2022",
      title: "Fundação da XNEMA",
      description:
        "Início da jornada com o sonho de revolucionar o streaming brasileiro.",
    },
    {
      year: "2023",
      title: "Primeira Produção Original",
      description:
        "Lançamento de 'Between Heaven and Hell', nossa série de estreia.",
    },
    {
      year: "2024",
      title: "Expansão do Catálogo",
      description:
        "Adicição de 10+ novas produções originais ao nosso portfólio.",
    },
    {
      year: "2025",
      title: "Reconhecimento Internacional",
      description:
        "Primeiros prêmios internacionais e expansão para novos mercados.",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Hero Section */}
        <section className="relative py-20">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1489599433202-4b02d48ad6bd?w=1920&h=1080&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-xnema-dark via-xnema-dark/90 to-xnema-dark" />

          <div className="relative max-w-4xl mx-auto px-8 text-center">
            <Badge className="bg-xnema-orange text-black text-lg px-4 py-2 mb-6">
              Sobre a XNEMA
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Redefinindo o
              <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                {" "}
                Streaming
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
              Somos uma plataforma de streaming dedicada a criar e distribuir
              conteúdo audiovisual de alta qualidade. Nossa missão é contar
              histórias que conectam, inspiram e celebram a diversidade
              cultural.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                asChild
              >
                <Link to="/catalog">
                  <div className="flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Explorar Conteúdo
                  </div>
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link to="/register">
                  <div className="flex items-center">
                    <Crown className="w-5 h-5 mr-2" />
                    Assinar Agora
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-xnema-surface">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-xnema-orange mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Nossa <span className="text-xnema-orange">Missão</span>
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Acreditamos que há histórias únicas e poderosas para contar.
                  Nossa missão é criar uma plataforma onde produtores, diretores
                  e artistas possam compartilhar suas visões com o mundo,
                  oferecendo conteúdo original de qualidade cinematográfica.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  Queremos ser o lar digital da criatividade, proporcionando uma
                  experiência de streaming premium que valoriza a cultura e
                  talentos artísticos.
                </p>

                <div className="flex items-center gap-4">
                  <Lightbulb className="w-6 h-6 text-xnema-orange" />
                  <span className="text-lg font-semibold">
                    Inovação em cada projeto
                  </span>
                </div>
              </div>

              <div className="relative">
                <div
                  className="h-96 bg-cover bg-center rounded-2xl"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&h=400&fit=crop')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-xnema-surface">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-4xl font-bold text-center mb-16">
              Nossos <span className="text-xnema-orange">Valores</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="bg-xnema-dark border-gray-700 text-center"
                >
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-4xl font-bold text-center mb-16">
              Nossa <span className="text-xnema-orange">Equipe</span>
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card
                  key={index}
                  className="bg-xnema-surface border-gray-700 text-center"
                >
                  <CardContent className="p-6">
                    <div
                      className="w-24 h-24 mx-auto mb-4 bg-cover bg-center rounded-full"
                      style={{ backgroundImage: `url(${member.image})` }}
                    />
                    <h3 className="text-xl font-semibold mb-2">
                      {member.name}
                    </h3>
                    <p className="text-xnema-orange font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-300">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Nossa Equipe Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="text-4xl font-bold text-center mb-4">
              Nossa <span className="text-xnema-orange">Equipe</span>
            </h2>
            <p className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
              Profissionais dedicados trabalhando juntos para entregar a melhor experiência de streaming do Brasil
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Nossa equipe de desenvolvimento trabalha incansavelmente para entregar a melhor experiência de streaming,
                  utilizando tecnologias de ponta e as melhores práticas da indústria.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-xnema-purple to-xnema-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Produção de Conteúdo</h3>
                <p className="text-muted-foreground">
                  Especialistas em audiovisual dedicados a criar conteúdo original de alta qualidade,
                  sempre buscando inovação e excelência narrativa para nossos assinantes.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Suporte & Atendimento</h3>
                <p className="text-muted-foreground">
                  Nossa equipe de atendimento está sempre pronta para ajudar,
                  garantindo que você tenha a melhor experiência possível na plataforma XNEMA.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-xnema-surface">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="text-4xl font-bold text-center mb-16">
              Nossa <span className="text-xnema-orange">Jornada</span>
            </h2>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center text-white font-bold">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold">
                        {milestone.title}
                      </h3>
                      <Badge variant="secondary">{milestone.year}</Badge>
                    </div>
                    <p className="text-gray-300">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Junte-se à Nossa{" "}
              <span className="text-xnema-orange">Comunidade</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Faça parte da revolução do streaming. Assine hoje e tenha acesso a
              todo nosso catálogo de conteúdo original e exclusivo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-xnema-orange hover:bg-xnema-orange/90 text-black"
                asChild
              >
                <Link to="/pricing">
                  <div className="flex items-center">
                    <Crown className="w-5 h-5 mr-2" />
                    Ver Planos
                  </div>
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link to="/catalog">
                  <div className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Explorar Catálogo
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
