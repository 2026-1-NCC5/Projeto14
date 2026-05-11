import { Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const teams = [
  { name: "Grupo 1", sessions: 12, items: 487, points: 1250, trending: true },
  { name: "Grupo 3", sessions: 11, items: 452, points: 1180, trending: true },
  { name: "Grupo 2", sessions: 10, items: 421, points: 1095, trending: false },
  { name: "Grupo 5", sessions: 9, items: 385, points: 980, trending: true },
  { name: "Grupo 4", sessions: 8, items: 342, points: 875, trending: false },
  { name: "Grupo 7", sessions: 7, items: 298, points: 790, trending: true },
  { name: "Grupo 6", sessions: 6, items: 265, points: 685, trending: false },
  { name: "Grupo 8", sessions: 5, items: 215, points: 540, trending: false },
];

const leader = teams[0];
const totalPoints = teams.reduce((s, t) => s + t.points, 0);

const getMedal = (i: number) => {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return `${i + 1}`;
};

const Ranking = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Placar de Equipes</h1>
        <p className="text-muted-foreground text-sm">Ranking de contribuições por equipe</p>
      </div>

      <Card className="bg-secondary">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Equipe Líder</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center relative">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">#1</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{leader.name}</h2>
              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                <span><strong className="text-foreground">{leader.points}</strong> Pontos</span>
                <span><strong className="text-foreground">{leader.items}</strong> Itens</span>
                <span><strong className="text-foreground">{leader.sessions}</strong> Sessões</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Ranking Completo</h3>
          <p className="text-xs text-muted-foreground mb-4">Classificação geral das equipes</p>
          <div className="space-y-2">
            {teams.map((team, i) => (
              <div key={team.name} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm">{getMedal(i)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{team.name}</span>
                      {team.trending && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">
                          <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> Subindo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{team.sessions} sessões · {team.items} itens</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{team.points}</p>
                  <p className="text-[10px] text-muted-foreground">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-sm text-muted-foreground">Total de Equipes</span>
            <p className="text-3xl font-bold text-foreground mt-1">{teams.length}</p>
            <p className="text-xs text-muted-foreground">equipes ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-sm text-muted-foreground">Total de Pontos</span>
            <p className="text-3xl font-bold text-foreground mt-1">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">pontos acumulados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-sm text-muted-foreground">Média de Pontos</span>
            <p className="text-3xl font-bold text-foreground mt-1">{Math.round(totalPoints / teams.length)}</p>
            <p className="text-xs text-muted-foreground">por equipe</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ranking;
