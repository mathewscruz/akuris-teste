import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MatrizHeatmapProps {
  riscos: Array<{
    probabilidade_inicial?: string;
    impacto_inicial?: string;
    nivel_risco_inicial: string;
    nome: string;
  }>;
}

export function MatrizHeatmap({ riscos }: MatrizHeatmapProps) {
  // Criar matriz 5x5
  const matriz = Array.from({ length: 5 }, () => Array(5).fill(0));
  
  // Contar riscos em cada célula
  riscos.forEach(risco => {
    const prob = parseInt(risco.probabilidade_inicial || '0');
    const imp = parseInt(risco.impacto_inicial || '0');
    if (prob >= 1 && prob <= 5 && imp >= 1 && imp <= 5) {
      matriz[5 - imp][prob - 1]++;
    }
  });

  // Determinar cor baseada no nível de risco
  const getCellColor = (prob: number, imp: number) => {
    const score = prob * imp;
    if (score >= 20) return 'bg-destructive/80 hover:bg-destructive';
    if (score >= 12) return 'bg-warning/80 hover:bg-warning';
    if (score >= 6) return 'bg-info/80 hover:bg-info';
    return 'bg-success/80 hover:bg-success';
  };

  const getRiscosNaCelula = (prob: number, imp: number) => {
    return riscos.filter(r => 
      parseInt(r.probabilidade_inicial || '0') === prob && 
      parseInt(r.impacto_inicial || '0') === imp
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Matriz de Riscos (Heat Map)</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-1">
            {/* Labels do Impacto */}
            <div className="flex items-center gap-1">
              <div className="w-12 text-xs text-right font-medium text-muted-foreground">
                Impacto
              </div>
              <div className="flex-1" />
            </div>
            
            {matriz.map((row, impIndex) => {
              const impacto = 5 - impIndex;
              return (
                <div key={impIndex} className="flex items-center gap-1">
                  <div className="w-12 text-xs text-right font-medium text-muted-foreground">
                    {impacto}
                  </div>
                  {row.map((count, probIndex) => {
                    const probabilidade = probIndex + 1;
                    const riscosNaCelula = getRiscosNaCelula(probabilidade, impacto);
                    
                    return (
                      <Tooltip key={probIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "flex-1 h-12 rounded flex items-center justify-center cursor-pointer transition-colors",
                              getCellColor(probabilidade, impacto),
                              count === 0 && "opacity-30"
                            )}
                          >
                            <span className="text-white font-bold text-sm">
                              {count > 0 ? count : ''}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-semibold">
                              P:{probabilidade} x I:{impacto} = {probabilidade * impacto}
                            </p>
                            {riscosNaCelula.length > 0 ? (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Riscos:</p>
                                {riscosNaCelula.slice(0, 3).map((r, i) => (
                                  <p key={i} className="text-xs">• {r.nome}</p>
                                ))}
                                {riscosNaCelula.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{riscosNaCelula.length - 3} mais
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">Nenhum risco</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
            
            {/* Labels da Probabilidade */}
            <div className="flex items-center gap-1">
              <div className="w-12" />
              {[1, 2, 3, 4, 5].map((prob) => (
                <div key={prob} className="flex-1 text-xs text-center font-medium text-muted-foreground">
                  {prob}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-12" />
              <div className="flex-1 text-xs text-center font-medium text-muted-foreground">
                Probabilidade
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
