import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContextReal";
import { getPaymentLink } from "@/utils/navigationUtils";

interface SubscribeButtonProps extends Omit<ButtonProps, "onClick"> {
  plan?: "monthly" | "yearly" | "creator";
  children?: React.ReactNode;
}

export default function SubscribeButton({
  plan = "monthly",
  children = "Assinar",
  className,
  size,
  variant,
  ...rest
}: SubscribeButtonProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleClick = () => {
    if (isAuthenticated && user) {
      const target = getPaymentLink(user as any, plan);
      navigate(target);
    } else {
      const redirectTarget = `/payments?plan=${plan}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
    }
  };

  return (
    <Button onClick={handleClick} className={className} size={size} variant={variant} {...rest}>
      {children}
    </Button>
  );
}
