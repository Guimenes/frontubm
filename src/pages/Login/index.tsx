import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authService, LoginData } from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Limpar erro quando o usuário começar a digitar
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return; // Prevenir múltiplas submissões

    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login(formData as LoginData);

      if (response.success && response.data) {
        console.log("Login realizado com sucesso:", response.data);

        // Usar o contexto de autenticação
        const expiresAt = response.data.expiresAt
          ? new Date(response.data.expiresAt)
          : undefined;
        login(response.data.user, response.data.token, expiresAt);

        // Redirecionar para a página principal
        navigate("/");
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setError("Erro interno do servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/fundo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          imageRendering: "crisp-edges",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/60 via-white/60 to-rose-50/60 dark:from-zinc-900/60 dark:via-zinc-800/60 dark:to-slate-900/60 background-animate"></div>
        <div className="w-full max-w-md bg-card-light dark:bg-card-dark rounded-xl shadow-2xl p-8 z-10">
          <Link
            to="/"
            className="absolute top-4 left-4 flex items-center text-sm font-medium text-subtext-light dark:text-subtext-dark hover:text-primary dark:hover:text-rose-400 transition-colors"
          >
            <span className="material-icons text-lg mr-1">arrow_back</span>
            Voltar para Home
          </Link>
          <div className="text-center">
            <div className="inline-block p-3 bg-rose-100 dark:bg-rose-900/50 rounded-full mb-4">
              <img alt="logo" className="w-12 h-12" src="/images/logo.png" />
            </div>
            <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">
              Fazer Login
            </h1>
            <p className="text-subtext-light dark:text-subtext-dark mt-2">
              Sistema administrativo de atividades do seminário
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 p-3 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            <div>
              <label
                className="text-sm font-medium text-subtext-light dark:text-subtext-dark"
                htmlFor="email"
              >
                E-mail
              </label>
              <div className="mt-1 relative">
                <span className="material-icons absolute inset-y-0 left-0 flex items-center pl-3 text-subtext-light dark:text-subtext-dark">
                  email
                </span>
                <input
                  autoComplete="email"
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  id="email"
                  name="email"
                  placeholder="seu@email.com"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label
                className="text-sm font-medium text-subtext-light dark:text-subtext-dark"
                htmlFor="senha"
              >
                Senha
              </label>
              <div className="mt-1 relative">
                <span className="material-icons absolute inset-y-0 left-0 flex items-center pl-3 text-subtext-light dark:text-subtext-dark">
                  lock
                </span>
                <input
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  id="senha"
                  name="senha"
                  placeholder="********"
                  required
                  type="password"
                  value={formData.senha}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-zinc-600 rounded"
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  className="ml-2 block text-sm text-subtext-light dark:text-subtext-dark"
                  htmlFor="remember-me"
                >
                  Lembrar-me
                </label>
              </div>
              <div className="text-sm">
                <a
                  className="font-medium text-primary hover:text-rose-700 dark:hover:text-rose-400"
                  href="#"
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>
            <div>
              <button
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
