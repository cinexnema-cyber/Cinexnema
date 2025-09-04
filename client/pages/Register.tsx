import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login-select", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-semibold text-blue-900 dark:text-blue-100">Página movida</h1>
        <p className="text-sm text-muted-foreground">Redirecionando para a página única de logins...</p>
        <Link to="/login-select" className="text-blue-600 hover:text-blue-800 underline font-medium">
          Ir para login
        </Link>
      </div>
    </div>
  );
}
