import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3 } from "lucide-react";

interface CategoryScore {
  category: string;
  score: number;
  total: number;
  evaluated: number;
}

interface ComplianceStackedBarProps {
  categoryScores: CategoryScore[];
  title?: string;
}

const STATUS_COLORS = {
  conforme: "#16a34a",      // green
  parcial: "#eab308",       // yellow
  naoConforme: "#dc2626",   // red
  naoAvaliado: "#94a3b8"    // gray
};

export const ComplianceStackedBar: React.FC<ComplianceStackedBarProps> = ({ 
  categoryScores, 
  title = "Status de Conformidade por Categoria" 
}) => {
  // Validar dados antes de processar
  const validScores = categoryScores?.filter(cat => cat && cat.category) || [];
  
  if (validScores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Nenhum requisito avaliado ainda</p>
            <p className="text-xs mt-1">Avalie os requisitos para ver o gráfico de conformidade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data to show status breakdown with safe division
  const chartData = validScores.map(cat => {
    const total = cat.total || 0;
    const evaluated = cat.evaluated || 0;
    const score = cat.score || 0;
    
    // Evitar divisão por zero
    const evaluatedPercent = total > 0 ? (evaluated / total) * 100 : 0;
    const conformePercent = Math.min(score, evaluatedPercent);
    const naoAvaliadoPercent = Math.max(100 - evaluatedPercent, 0);
    
    // Estimate partial/non-compliant from evaluated but not fully compliant
    const remainingEvaluated = Math.max(evaluatedPercent - conformePercent, 0);
    const parcialPercent = remainingEvaluated * 0.5;
    const naoConformePercent = remainingEvaluated * 0.5;

    const categoryName = String(cat.category || '');
    
    return {
      name: categoryName.length > 15 ? categoryName.substring(0, 15) + '...' : categoryName,
      fullName: categoryName,
      conforme: conformePercent,
      parcial: parcialPercent,
      naoConforme: naoConformePercent,
      naoAvaliado: naoAvaliadoPercent,
      total: total,
      evaluated: evaluated
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-lg">
          <p className="font-semibold mb-2">{data.fullName || '-'}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.conforme }} />
              <span>Conforme: {(data.conforme || 0).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.parcial }} />
              <span>Parcial: {(data.parcial || 0).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.naoConforme }} />
              <span>Não Conforme: {(data.naoConforme || 0).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.naoAvaliado }} />
              <span>Não Avaliado: {(data.naoAvaliado || 0).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.evaluated || 0}/{data.total || 0} requisitos avaliados
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              label={{ value: '%', position: 'insideRight' }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              width={95}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  conforme: 'Conforme',
                  parcial: 'Parcial',
                  naoConforme: 'Não Conforme',
                  naoAvaliado: 'Não Avaliado'
                };
                return labels[value] || value;
              }}
            />
            <Bar dataKey="conforme" stackId="a" fill={STATUS_COLORS.conforme} radius={[0, 0, 0, 0]} />
            <Bar dataKey="parcial" stackId="a" fill={STATUS_COLORS.parcial} radius={[0, 0, 0, 0]} />
            <Bar dataKey="naoConforme" stackId="a" fill={STATUS_COLORS.naoConforme} radius={[0, 0, 0, 0]} />
            <Bar dataKey="naoAvaliado" stackId="a" fill={STATUS_COLORS.naoAvaliado} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
