import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { FileText } from "lucide-react";

interface CategoryScore {
  category: string;
  score: number;
  total: number;
  evaluated: number;
}

interface PrivacyTreemapProps {
  categoryScores: CategoryScore[];
  title?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#16a34a"; // green
  if (score >= 60) return "#2563eb"; // blue
  if (score >= 40) return "#eab308"; // yellow
  if (score >= 20) return "#f97316"; // orange
  return "#dc2626"; // red
};

const CustomizedContent = (props: any) => {
  const { x, y, width, height, name, score, total } = props;
  
  // Validar props antes de renderizar - crítico para evitar erros
  if (name === undefined || name === null || score === undefined || total === undefined) {
    return null;
  }
  
  if (width < 60 || height < 40) return null;
  
  const displayName = String(name);
  const displayScore = Number(score) || 0;
  const displayTotal = Number(total) || 0;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: getScoreColor(displayScore),
          stroke: 'hsl(var(--background))',
          strokeWidth: 2,
          fillOpacity: 0.7,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 10}
        textAnchor="middle"
        fill="white"
        fontSize={12}
        fontWeight="600"
      >
        {displayName.length > 20 ? displayName.substring(0, 20) + '...' : displayName}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 8}
        textAnchor="middle"
        fill="white"
        fontSize={16}
        fontWeight="bold"
      >
        {displayScore.toFixed(0)}%
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 24}
        textAnchor="middle"
        fill="white"
        fontSize={10}
      >
        {displayTotal} itens
      </text>
    </g>
  );
};

export const PrivacyTreemap: React.FC<PrivacyTreemapProps> = ({ 
  categoryScores, 
  title = "Mapa de Conformidade por Capítulo" 
}) => {
  // Validar dados antes de processar
  const validScores = categoryScores?.filter(cat => cat && cat.category && cat.total > 0) || [];
  
  if (validScores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Nenhum requisito avaliado ainda</p>
            <p className="text-xs mt-1">Avalie os requisitos para ver o mapa de conformidade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = validScores.map((cat, index) => ({
    name: cat.category,
    size: Math.max(cat.total, 1), // Evitar size 0
    score: cat.score,
    total: cat.total,
    evaluated: cat.evaluated,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={data}
            dataKey="size"
            stroke="hsl(var(--background))"
            fill="hsl(var(--primary))"
            content={<CustomizedContent />}
          >
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: any, name: string, props: any) => {
                if (!props?.payload) return ['-', '-'];
                const payload = props.payload;
                return [
                  `${(payload.score || 0).toFixed(1)}% (${payload.evaluated || 0}/${payload.total || 0} avaliados)`,
                  payload.name || '-'
                ];
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
