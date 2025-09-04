import { useState } from "react";
import { X, AlertTriangle, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestPlatformBanner() {
  const [isVisible, setIsVisible] = useState(true);

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5515997636161", "_blank");
  };

  const handleEmailClick = () => {
    window.open("mailto:cinexnema@gmail.com", "_blank");
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-3 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="font-semibold text-sm sm:text-base">
              🧪 PLATAFORMA EM TESTE
            </span>
            <span className="text-xs sm:text-sm opacity-90">
              Recursos limitados • Em breve: criação de contas liberada •
              Lançamento em breve
            </span>
            <span className="text-xs sm:text-sm opacity-90 font-medium">
              Já disponível para negociações com criadores
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWhatsAppClick}
            className="text-white hover:bg-white/10 px-3 py-1 h-auto text-xs sm:text-sm"
          >
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            WhatsApp
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleEmailClick}
            className="text-white hover:bg-white/10 px-3 py-1 h-auto text-xs sm:text-sm"
          >
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Email
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-white/10 p-2 h-auto ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
