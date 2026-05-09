import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("aluno");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("As senhas não coincidem.");
    if (!terms) return alert("Aceite os termos para continuar.");

    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/register", {
        fullName: name,
        email,
        role,
        password
      });
      alert("Cadastro realizado! O administrador alocará seu grupo em breve.");
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro no cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-sm border p-8">
        <h2 className="text-xl font-bold text-center mb-6">Criar Nova Conta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">E-mail Institucional</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="seu.email@fecap.br" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de Conta</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select onValueChange={setRole} defaultValue="aluno">
                <SelectTrigger className="pl-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluno">Aluno</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Confirmar Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" required />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" checked={terms} onCheckedChange={(v) => setTerms(!!v)} />
            <label htmlFor="terms" className="text-sm cursor-pointer">Aceito os termos de uso</label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processando..." : "Finalizar Cadastro"}
          </Button>
        </form>
        <p className="text-center text-sm mt-6">Já tem conta? <Link to="/" className="text-primary hover:underline">Login</Link></p>
      </div>
    </div>
  );
};
export default Register;