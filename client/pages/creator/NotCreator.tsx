import { useNavigate } from "react-router-dom";

export default function NotCreator() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">⚠️ Acesso Negado</h1>
        <p className="mb-4">Você não é um criador ainda. Cadastre-se para acessar esta área.</p>
        <button
          onClick={() => navigate("/register/creator")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Quero me tornar um criador
        </button>
      </div>
    </div>
  );
}
