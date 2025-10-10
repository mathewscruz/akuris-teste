import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRadarChartData, RadarDataPoint } from "@/hooks/useRadarChartData";
import { useNavigate } from "react-router-dom";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

const CustomTooltip = ({ active, payload, navigate }: any) => {
  if (!active || !payload || !payload[0]) return null;

  const data: RadarDataPoint = payload[0].payload;
  
  const statusConfig = {
    excellent: { icon: CheckCircle2, color: "text-green-500", label: "Excelente", bgColor: "bg-green-500/10" },
    good: { icon: CheckCircle2, color: "text-blue-500", label: "Bom", bgColor: "bg-blue-500/10" },
    warning: { icon: AlertCircle, color: "text-yellow-500", label: "Atenção", bgColor: "bg-yellow-500/10" },
    critical: { icon: XCircle, color: "text-red-500", label: "Crítico", bgColor: "bg-red-500/10" }
  };

  const config = statusConfig[data.details.status];
  const StatusIcon = config.icon;

  const handleClick = () => {
    if (data.link) {
      navigate(data.link);
    }
  };

  return (
    <div 
      className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[250px] cursor-pointer hover:shadow-xl transition-shadow" 
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <StatusIcon className={`w-5 h-5 ${config.color}`} />
        <h3 className="font-semibold text-foreground">{data.subject}</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Score:</span>
          <span className="font-bold text-lg text-foreground">{data.score}%</span>
        </div>
        
        <Badge variant="outline" className={config.bgColor}>
          {config.label}
        </Badge>

        <div className="pt-2 border-t border-border space-y-1">
          {data.details.metrics.map((metric, idx) => (
            <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-primary"></span>
              {metric}
            </div>
          ))}
        </div>

        <div className="pt-2 text-xs text-primary font-medium">
          👉 Clique para ver detalhes
        </div>
      </div>
    </div>
  );
};

export const MultiDimensionalRadar = () => {
  const { data, isLoading } = useRadarChartData();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <CardTitle>Maturidade GRC</CardTitle>
        </div>
        <CardDescription>
          Visão consolidada de todos os módulos de governança, risco e compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--muted-foreground))"
              opacity={0.3}
            />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ 
                fill: 'hsl(var(--foreground))',
                fontSize: 12,
                fontWeight: 500
              }}
            />
            <PolarRadiusAxis 
              domain={[0, 100]} 
              tick={{ 
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10
              }}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={800}
              animationBegin={0}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} navigate={navigate} />} />
            <Legend
              iconType="circle"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                color: 'hsl(var(--foreground))'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-4 gap-2">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">80-100%: Excelente</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground">60-79%: Bom</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-muted-foreground">40-59%: Atenção</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">0-39%: Crítico</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
