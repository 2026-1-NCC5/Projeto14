import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importe o useNavigate
import { Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios"; // Importe o axios

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado para feedback de carregamento
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Faz a chamada para o seu backend na porta 3000
      const response = await axios.post("http://localhost:3000/api/login", {
        email,
        password,
      });

      // Se chegar aqui, o login foi um sucesso (Status 200)
      const { token, user } = response.data;

      // Salva o token no LocalStorage para manter a sessão
      localStorage.setItem("liderai_token", token);
      localStorage.setItem("liderai_user", JSON.stringify(user));

      // Agora sim, redireciona para o dashboard
      navigate("/dashboard");
    } catch (error: any) {
      // Se cair aqui, o login falhou (Status 401 ou 500)
      const message = error.response?.data?.error || "Erro ao conectar com o servidor.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
          <span className="text-primary-foreground text-2xl font-bold">L</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">LiderAI</h1>
        <p className="text-muted-foreground text-sm">Sistema de Gestão de Arrecadação</p>
      </div>

      <div className="w-full max-w-md bg-card rounded-2xl shadow-sm border border-border p-8">
        <h2 className="text-xl font-bold text-foreground text-center mb-1">Entrar na Plataforma</h2>
        <p className="text-muted-foreground text-sm text-center mb-6">Acesse sua conta para continuar</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="seu.email@fecap.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 rounded-lg"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm text-foreground">Lembrar de mim</label>
            </div>
            <Link to="#" className="text-sm text-primary hover:underline">Esqueceu a senha?</Link>
          </div>

          {/* Removi o <Link> daqui de dentro para o botão disparar o handleSubmit */}
          <Button 
            type="submit" 
            className="w-full rounded-lg h-11 mt-2" 
            size="lg"
            disabled={loading}
          >
            <LogIn className="h-4 w-4 mr-2" />
            {loading ? "Carregando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Não tem uma conta?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">Criar conta</Link>
        </p>
      </div>

      <p className="text-xs text-muted-foreground mt-8">© 2026 FECAP - Todos os direitos reservados</p>
    </div>
  );
};

export default Login;