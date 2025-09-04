import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ProtectedContent } from "@/components/ProtectedContent";
import { useContentAccess } from "@/hooks/useContentAccess";
import {
  Play,
  Crown,
  Star,
  Calendar,
  Users,
  Instagram,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function BetweenHeavenHell() {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const { hasAccess } = useContentAccess();

  const seriesInfo = {
    title: "Between Heaven and Hell",
    description:
      "Uma saga épica que explora os limites entre o bem e o mal, onde anjos e demônios coexistem em um mundo moderno. Acompanhe a jornada de personagens complexos enquanto enfrentam dilemas morais que questionam a própria natureza da humanidade.",
    genre: "Drama Sobrenatural",
    rating: 4.9,
    seasons: 7,
    totalEpisodes: 84, // 7 seasons * 12 episodes
    releaseYear: 2025,
    cast: ["Alexandra Stone", "Marcus Rivera", "Elena Vasquez", "David Chen"],
    director: "Roberto Silva",
  };

  const seasons = Array.from({ length: 7 }, (_, i) => ({
    number: i + 1,
    episodes: Array.from({ length: 12 }, (_, j) => ({
      number: j + 1,
      title: `Episódio ${j + 1}`,
      duration: "45-52 min",
      description: `Descrição do episódio ${j + 1} da temporada ${i + 1}`,
    })),
  }));

  const handleInstagramClick = () => {
    window.open(
      "https://www.instagram.com/betweenheavenandhell2025/",
      "_blank",
    );
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=800')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />

          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-xnema-orange text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <Crown className="w-4 h-4" />
                  <span>SÉRIE EXCLUSIVA</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-xnema-orange fill-current" />
                  <span className="text-lg font-semibold text-foreground">
                    {seriesInfo.rating}
                  </span>
                </div>
              </div>

              <h1 className="text-6xl lg:text-8xl font-bold text-foreground mb-6 leading-tight">
                Between Heaven{" "}
                <span className="text-transparent bg-gradient-to-r from-xnema-orange to-xnema-purple bg-clip-text">
                  and Hell
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl">
                {seriesInfo.description}
              </p>

              <div className="flex items-center space-x-8 mb-8 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-xnema-orange" />
                  <span>{seriesInfo.releaseYear}</span>
                </div>
                <span>{seriesInfo.seasons} Temporadas</span>
                <span>{seriesInfo.totalEpisodes} Episódios</span>
                <span>{seriesInfo.genre}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold text-lg px-8 py-4"
                  asChild
                >
                  <Link to="/subscribe">
                    <div className="flex items-center space-x-2">
                      <Play className="w-5 h-5" />
                      <span>Assinar para Assistir</span>
                    </div>
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-xnema-purple text-xnema-purple hover:bg-xnema-purple hover:text-black font-semibold text-lg px-8 py-4"
                  onClick={handleInstagramClick}
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  Seguir no Instagram
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Series Details */}
        <section className="py-20 bg-xnema-surface">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Cast & Crew */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Elenco Principal
                </h2>
                <div className="space-y-3">
                  {seriesInfo.cast.map((actor, index) => (
                    <div key={index} className="text-muted-foreground">
                      {actor}
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-foreground mt-8 mb-4">
                  Direção
                </h3>
                <div className="text-muted-foreground">
                  {seriesInfo.director}
                </div>
              </div>

              {/* Synopsis */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Sinopse
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Em um mundo onde as fronteiras entre o céu e o inferno se
                  tornam cada vez mais tênues, "Between Heaven and Hell" nos
                  leva a uma jornada extraordinária através de sete temporadas
                  repletas de mistério, drama e elementos sobrenaturais.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  A série acompanha um grupo de personagens únicos que descobrem
                  estar no centro de uma batalha milenar entre forças angelicais
                  e demoníacas. Cada temporada revela novas camadas desta
                  mitologia complexa, explorando temas profundos sobre
                  moralidade, redenção e o que realmente define nossa
                  humanidade.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Com produção de alta qualidade e efeitos visuais
                  impressionantes, esta é uma série que promete redefinir o
                  gênero sobrenatural na televisão brasileira.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trailer */}
        <section className="py-20 bg-xnema-surface">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Trailer Oficial
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Assista ao trailer oficial e mergulhe no universo de Between
                Heaven and Hell
              </p>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-8">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/-KmVyIbsV0Y"
                  title="Between Heaven and Hell - Trailer Oficial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold"
                  asChild
                >
                  <Link to="/subscribe">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-5 h-5" />
                      <span>Assinar para Assistir</span>
                    </div>
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-xnema-purple text-xnema-purple hover:bg-xnema-purple hover:text-black font-semibold"
                  onClick={() =>
                    window.open("https://youtu.be/-KmVyIbsV0Y", "_blank")
                  }
                >
                  Assistir no YouTube
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Episodes */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              Temporadas e Episódios
            </h2>

            {hasAccess ? (
              <>
                {/* Season Selector */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                  {seasons.map((season) => (
                    <Button
                      key={season.number}
                      variant={
                        selectedSeason === season.number ? "default" : "outline"
                      }
                      className={
                        selectedSeason === season.number
                          ? "bg-xnema-orange text-black"
                          : ""
                      }
                      onClick={() => setSelectedSeason(season.number)}
                    >
                      Temporada {season.number}
                    </Button>
                  ))}
                </div>

                {/* Episodes Grid */}
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold text-foreground mb-8">
                    Temporada {selectedSeason} - 12 Episódios
                  </h3>

                  <div className="grid gap-4">
                    {seasons[selectedSeason - 1].episodes.map((episode) => (
                      <div
                        key={episode.number}
                        className="bg-xnema-surface rounded-lg p-6 hover:bg-background transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="text-2xl font-bold text-xnema-orange">
                                {episode.number.toString().padStart(2, "0")}
                              </span>
                              <h4 className="text-lg font-semibold text-foreground">
                                {episode.title}
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {episode.duration}
                              </span>
                            </div>
                            <p className="text-muted-foreground">
                              {episode.description}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-xnema-orange hover:bg-xnema-orange/90 text-black ml-4"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Assistir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <ProtectedContent
                requiresSubscription={true}
                title="Temporadas Completas - Between Heaven and Hell"
                description="Acesse todas as 7 temporadas (84 episódios) desta série exclusiva XNEMA com sua assinatura premium."
                showPreview={false}
              >
                <div></div>
              </ProtectedContent>
            )}
          </div>
        </section>

        {/* Social Media */}
        <section className="py-20 bg-gradient-to-r from-xnema-orange to-xnema-purple">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-black mb-6">
              Acompanhe Between Heaven and Hell
            </h2>
            <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
              Siga nosso Instagram oficial para bastidores exclusivos, novidades
              e conteúdo especial da série.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="bg-black text-white hover:bg-gray-900 border-black font-semibold text-lg px-8 py-4"
              onClick={handleInstagramClick}
            >
              <Instagram className="w-5 h-5 mr-2" />
              @betweenheavenandhell2025
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
