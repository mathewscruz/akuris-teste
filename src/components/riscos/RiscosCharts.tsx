import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RiscosStats } from '@/hooks/useRiscosStats';

interface RiscosChartsProps {
  stats: RiscosStats | undefined;
}

export function RiscosCharts({ stats }: RiscosChartsProps) {
  if (!stats) return null;

  // Dados para gráfico de pizza - Distribuição por Nível
  const distribuicaoData = [
    { name: 'Críticos', value: stats.criticos, color: 'hsl(var(--destructive))' },
    { name: 'Altos', value: stats.altos, color: 'hsl(var(--warning))' },
    { name: 'Médios', value: stats.medios, color: 'hsl(var(--info))' },
    { name: 'Baixos', value: stats.baixos, color: 'hsl(var(--success))' }
  ].filter(item => item.value > 0);

  // Dados para gráfico de pizza - Status de Tratamentos
  const tratamentosData = [
    { name: 'Pendentes', value: stats.tratamentos_pendentes, color: 'hsl(var(--muted-foreground))' },
    { name: 'Em Andamento', value: stats.tratamentos_andamento, color: 'hsl(var(--info))' },
    { name: 'Concluídos', value: stats.tratamentos_concluidos, color: 'hsl(var(--success))' }
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Gráfico de Distribuição por Nível */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Distribuição por Nível</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={distribuicaoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {distribuicaoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Status de Tratamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Status de Tratamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {tratamentosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={tratamentosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tratamentosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              Nenhum tratamento cadastrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
