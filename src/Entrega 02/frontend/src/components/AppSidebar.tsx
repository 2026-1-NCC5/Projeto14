import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Brain, Trophy, History, LogOut, UserCog } from "lucide-react"; // UserCog importado
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Detecção IA", path: "/deteccao", icon: Brain },
  { title: "Ranking", path: "/ranking", icon: Trophy },
  { title: "Histórico", path: "/historico", icon: History },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Estados para armazenar os dados dinâmicos do usuário
  const [userName, setUserName] = useState("Usuário");
  const [userInitial, setUserInitial] = useState("-");
  const [userSubtext, setUserSubtext] = useState("Carregando...");
  const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar se é admin

  useEffect(() => {
    const savedUser = localStorage.getItem("liderai_user");
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      
      // Pega o primeiro nome para não quebrar o layout
      const firstName = parsedUser.name ? parsedUser.name.split(" ")[0] : "Usuário";
      
      setUserName(firstName);
      setUserInitial(firstName.charAt(0).toUpperCase()); // Pega a primeira letra e transforma em maiúscula

      // Define se mostra "Administrador", "Aluno" ou o nome do Grupo caso o backend já envie
      if (parsedUser.team_group) {
        setUserSubtext(parsedUser.team_group);
      } else {
        setUserSubtext(parsedUser.role === "admin" ? "Administrador" : "Aluno (Sem Grupo)");
      }

      // Libera a aba de administração se o cargo for admin
      if (parsedUser.role === "admin") {
        setIsAdmin(true);
      }
    }
  }, []);

  // Função para limpar a sessão ao sair
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("liderai_token");
    localStorage.removeItem("liderai_user");
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-52 bg-primary flex flex-col z-50 max-md:hidden">
      {/* Topo da Sidebar (Logo do LiderAI) */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">L</span>
        </div>
        <div>
          <h1 className="text-primary-foreground font-bold text-sm">LiderAI</h1>
          <p className="text-primary-foreground/70 text-xs">Gestão de Arrecadação</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary-foreground text-primary"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}

        {/* Link exclusivo para Administradores */}
        {isAdmin && (
          <>
            <div className="my-2 border-t border-primary-foreground/20" /> {/* Linha divisória */}
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === "/admin"
                  ? "bg-primary-foreground text-primary"
                  : "text-amber-300 hover:bg-primary-foreground/10 hover:text-amber-200"
              )}
            >
              <UserCog className="h-4 w-4" />
              Administração
            </Link>
          </>
        )}
      </nav>

      {/* Rodapé da Sidebar (Dados do Usuário) */}
      <div className="p-4 border-t border-primary-foreground/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            {/* Letra inicial dinâmica */}
            <span className="text-primary-foreground text-xs font-bold">{userInitial}</span>
          </div>
          <div>
            {/* Nome e Cargo/Grupo dinâmicos */}
            <p className="text-primary-foreground text-xs font-medium">{userName}</p>
            <p className="text-primary-foreground/60 text-[10px]">{userSubtext}</p>
          </div>
        </div>
        
        {/* Botão de Sair com a função de limpar cache */}
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-primary-foreground/70 text-xs hover:text-primary-foreground w-full text-left bg-transparent border-none cursor-pointer p-0"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;