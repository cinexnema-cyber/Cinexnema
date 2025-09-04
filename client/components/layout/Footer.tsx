import { Link } from "react-router-dom";
import { Instagram, Mail, MessageCircle, Crown } from "lucide-react";

export function Footer() {
  const handleInstagramClick = () => {
    window.open(
      "https://www.instagram.com/betweenheavenandhell2025/",
      "_blank",
    );
  };

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5515997636161", "_blank");
  };

  const handleEmailClick = () => {
    window.open("mailto:cinexnema@gmail.com", "_blank");
  };

  return (
    <footer className="bg-xnema-surface border-t border-xnema-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">X</span>
              </div>
              <span className="text-2xl font-bold text-foreground">XNEMA</span>
            </Link>
            <p className="text-muted-foreground mb-6">
              A nova era do streaming brasileiro. Conteúdo exclusivo, qualidade
              premium.
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleInstagramClick}
                className="w-10 h-10 bg-xnema-border rounded-full flex items-center justify-center hover:bg-xnema-orange transition-colors group"
              >
                <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-black" />
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="w-10 h-10 bg-xnema-border rounded-full flex items-center justify-center hover:bg-xnema-orange transition-colors group"
              >
                <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-black" />
              </button>
              <button
                onClick={handleEmailClick}
                className="w-10 h-10 bg-xnema-border rounded-full flex items-center justify-center hover:bg-xnema-orange transition-colors group"
              >
                <Mail className="w-5 h-5 text-muted-foreground group-hover:text-black" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Navegação
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/catalog"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                <Link
                  to="/series"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Séries
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Categorias
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Planos
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Suporte
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  to="/creators"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Área do Criador
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Minha Conta
                </Link>
              </li>
              <li>
                <button
                  onClick={handleWhatsAppClick}
                  className="text-muted-foreground hover:text-xnema-orange transition-colors text-left"
                >
                  WhatsApp
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/creator-terms"
                  className="text-muted-foreground hover:text-xnema-orange transition-colors"
                >
                  Termos para Criadores
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-xnema-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-muted-foreground text-sm">
              © 2025 XNEMA. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Crown className="w-4 h-4 text-xnema-orange" />
                <span>Streaming Premium</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
