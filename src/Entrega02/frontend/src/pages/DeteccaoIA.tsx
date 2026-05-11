import { Camera, Play, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DeteccaoIA = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Identificação por IA</h1>
          <p className="text-muted-foreground text-sm">Sistema de detecção de alimentos via webcam</p>
        </div>
        <Button className="rounded-lg">
          <Play className="h-4 w-4 mr-2" />
          Iniciar Detecção
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Feed da Webcam</span>
              </div>
              <div className="aspect-video bg-darker-green rounded-lg flex flex-col items-center justify-center">
                <Camera className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground/60 text-sm">Clique em "Iniciar Detecção" para começar</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4">Resumo da Sessão</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-secondary rounded-lg p-3">
                  <span className="text-sm text-foreground">Itens Detectados</span>
                  <span className="text-lg font-bold text-primary">0</span>
                </div>
                <div className="flex items-center justify-between bg-secondary rounded-lg p-3">
                  <span className="text-sm text-foreground">Confiança Média</span>
                  <span className="text-lg font-bold text-primary">0%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4">Itens Identificados</h3>
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-sm">Nenhum item detectado ainda</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeteccaoIA;
