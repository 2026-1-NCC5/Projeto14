import { useState, useEffect } from "react";
import axios from "axios"; // ADICIONADO: Para ir buscar os dados ao backend
import { Package, Utensils, TrendingUp, Calendar, CheckCircle, Weight } from "lucide-react"; // ADICIONADO: Ícone Weight
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jan", items: 150 },
  { month: "Fev", items: 165 },
  { month: "Mar", items: 180 },
  { month: "Abr", items: 250 },
  { month: "Mai", items: 280 },
  { month: "Jun", items: 270 },
  { month: "Jul", items: 290 },
  { month: "Ago", items: 350 },
  { month: "Set", items: 380 },
  { month: "Out", items: 420 },
  { month: "Nov", items: 460 },
  { month: "Dez", items: 500 },
];

// ADICIONADO: Interface para tipar os dados que vêm do backend
interface SessionData {
  id: string;
  date: string;
  time: string;
  team: string;
  items: number;
  totalWeight: number;
}

const Dashboard = () => {
  const [userName, setUserName] = useState("Carregando...");
  const [userRole, setUserRole] = useState("");
  // ADICIONADO: Estado para armazenar as atividades reais
  const [recentActivity, setRecentActivity] = useState<SessionData[]>([]);

  useEffect(() => {
    // Busca os dados do usuário que foram salvos no momento do Login
    const savedUser = localStorage.getItem("liderai_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Pega apenas o primeiro nome para ficar mais limpo no layout
      const firstName = parsedUser.name.split(" ")[0]; 
      
      setUserName(firstName);
      setUserRole(parsedUser.role === 'admin' ? 'Administrador' : 'Aluno');
    }

    // ADICIONADO: Busca o histórico real do backend para as atividades recentes
    const fetchRecentActivity = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/historico");
        // Pegamos apenas as 4 sessões mais recentes para não encher a tela inicial
        setRecentActivity(response.data.slice(0, 4));
      } catch (error) {
        console.error("Erro ao buscar atividades recentes:", error);
      }
    };
    fetchRecentActivity();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        {/* Se você quisesse usar o nome aqui na parte central, bastaria colocar {userName} */}
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral da arrecadação de alimentos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Total Arrecadado</span>
              <Package className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">2.450</p>
            <p className="text-xs text-muted-foreground mt-1">itens arrecadados</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary font-medium">+12% este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Refeições Geradas</span>
              <Utensils className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">128</p>
            <p className="text-xs text-muted-foreground mt-1">refeições completas</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary font-medium">+8% este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Ação Rápida</span>
            </div>
            <Button className="w-full rounded-lg h-11" size="lg">
              Começar Nova Contagem
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">Inicie uma nova sessão de identificação</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Fluxo Mensal de Doações</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Acompanhamento de itens arrecadados por mês</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ab72" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ab72" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 15% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(192 10% 46%)" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(192 10% 46%)" }} />
                <Tooltip />
                <Area type="monotone" dataKey="items" stroke="#00ab72" strokeWidth={2} fill="url(#greenGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Atividade Recente</h3>
          <p className="text-xs text-muted-foreground mb-4">Últimas sessões de contagem realizadas</p>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
               <p className="text-sm text-center text-muted-foreground py-4">Nenhuma atividade registrada hoje.</p>
            ) : (
              recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.team}</p>
                      {/* Como removemos o Operador do histórico, vou mostrar a hora aqui para não ficar vazio */}
                      <p className="text-xs text-muted-foreground">{item.date} às {item.time}</p> 
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{item.items} itens</p>
                    <p className="text-xs font-medium text-muted-foreground flex items-center justify-end gap-1">
                      <Weight className="h-3 w-3" /> {Number(item.totalWeight).toFixed(2)} kg
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="outline" className="w-full mt-4 rounded-lg">
            Ver Histórico Completo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;