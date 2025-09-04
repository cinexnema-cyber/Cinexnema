import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextReal";
import { Button } from "@/components/ui/button";

interface Props {
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

const CTAButton: React.FC<Props> = ({ className = "", size = "lg" }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleClick = () => {
    if (isAuthenticated && user) {
      navigate("/payment-options");
    } else {
      navigate("/login");
    }
  };

  return (
    <Button size={size} className={className || "bg-blue-600 hover:bg-blue-700 text-white"} onClick={handleClick}>
      Começar Agora
    </Button>
  );
};

export default CTAButton;
