import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, Menu, Crown, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContextReal";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { XnemaLogo } from "@/components/XnemaLogo";
import SubscribeButton from "@/components/SubscribeButton";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-xnema-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <XnemaLogo size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/catalog"
            className="flex items-center space-x-1 text-foreground hover:text-xnema-orange transition-colors"
          >
            <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
            <span>{t("nav.home")}</span>
          </Link>
          <Link
            to="/series"
            className="flex items-center space-x-1 text-foreground hover:text-xnema-orange transition-colors"
          >
            <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
            <span>Séries</span>
          </Link>
          <Link
            to="/categories"
            className="flex items-center space-x-1 text-foreground hover:text-xnema-orange transition-colors"
          >
            <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
            <span>{t("nav.categories")}</span>
          </Link>
          <Link
            to="/about"
            className="flex items-center space-x-1 text-foreground hover:text-xnema-orange transition-colors"
          >
            <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
            <span>Sobre</span>
          </Link>
          <Link
            to="/contact"
            className="flex items-center space-x-1 text-foreground hover:text-xnema-orange transition-colors"
          >
            <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
            <span>Contato</span>
          </Link>


          {user?.role === "creator" && (
            <>
              <Link
                to="/video-upload"
                className="flex items-center space-x-1 text-foreground hover:text-xnema-orange transition-colors"
              >
                <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
                <span>Enviar Vídeo</span>
              </Link>
              <Link
                to="/creator/active-videos"
                className="flex items-center space-x-1 text-foreground hover:text-xnema-orange transition-colors"
              >
                <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
                <span>Vídeos Ativos</span>
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link
              to="/video-approval"
              className="flex items-center space-x-1 text-foreground hover:text-xnema-orange transition-colors"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Aprovação</span>
            </Link>
          )}
        </nav>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <LanguageSelector />
          {/* Search */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar filmes, séries..."
                className="pl-10 pr-4 py-2 w-64 bg-muted border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-xnema-orange"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {user ? (
              // Usuário logado
              <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
                <div className="hidden sm:flex flex-col items-end text-right leading-tight">
                  <p className="text-xs md:text-sm text-muted-foreground">Seja bem-vindo,</p>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="font-semibold text-foreground truncate max-w-[18ch] md:max-w-[24ch]" title={user.name}>{user.name}</span>
                    {user.assinante && (
                      <span className="hidden md:inline text-[10px] px-2 py-0.5 rounded-full border border-muted-foreground/30 text-muted-foreground">Premium</span>
                    )}
                  </div>
                </div>
                {user.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-6 px-2 text-[10px] leading-none"
                  >
                    <Link to="/admin-dashboard" className="px-0">ADM</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to={user.role === "admin" ? "/admin-dashboard" : user.role === "creator" ? "/creator-portal" : user.role === "subscriber" ? "/subscriber-dashboard" : "/smart-dashboard"}
                    className="text-foreground hover:text-xnema-orange"
                  >
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Painel</span>
                    </div>
                  </Link>
                </Button>
                {(user.role === "creator" || user.role === "admin") && (
                  <Button
                    asChild
                    size="sm"
                    className="px-3 h-8 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-[length:200%_200%] animate-gradient"
                  >
                    <Link to="/creator?tab=content" className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span className="hidden sm:inline">Creator</span>
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-foreground hover:text-xnema-orange"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            ) : (
              // Usuário não logado
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-6 px-2 text-[10px] leading-none"
                >
                  <Link to="/login/admin" className="px-0">ADM</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/login/subscriber"
                    className="text-foreground hover:text-xnema-orange"
                  >
                    {t("nav.login")}
                  </Link>
                </Button>
                <SubscribeButton
                  size="sm"
                  className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-medium"
                >
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4" />
                    <span>Assinar</span>
                  </div>
                </SubscribeButton>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-xnema-border bg-background/95 backdrop-blur">
          <nav className="flex flex-col space-y-4 p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar filmes, séries..."
                className="pl-10 pr-4 py-2 w-full bg-muted border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-xnema-orange"
              />
            </div>
            <Link
              to="/catalog"
              className="text-foreground hover:text-xnema-orange transition-colors py-2 flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
              <span>Catálogo</span>
            </Link>
            <Link
              to="/series"
              className="text-foreground hover:text-xnema-orange transition-colors py-2 flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
              <span>Séries</span>
            </Link>
            <Link
              to="/categories"
              className="text-foreground hover:text-xnema-orange transition-colors py-2 flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
              <span>Categorias</span>
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-xnema-orange transition-colors py-2 flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
              <span>Sobre Nós</span>
            </Link>
            <Link
              to="/contact"
              className="text-foreground hover:text-xnema-orange transition-colors py-2 flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-xnema-orange rounded-full"></div>
              <span>Contato</span>
            </Link>
            {!user && (
              <Link
                to="/pricing"
                className="text-foreground hover:text-xnema-orange transition-colors py-2 flex items-center space-x-2"
              >
                Planos
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
