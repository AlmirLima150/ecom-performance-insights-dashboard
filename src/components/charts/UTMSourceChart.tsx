
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pedido } from '@/types/dashboard';

interface UTMSourceChartProps {
  pedidos: Pedido[];
}

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#84cc16'];

export function UTMSourceChart({ pedidos }: UTMSourceChartProps) {
  // Agrupar vendas por utm_source
  const sourceData = pedidos.reduce((acc, pedido) => {
    const source = pedido.utm_source || 'Direto';
    if (!acc[source]) {
      acc[source] = { name: source, value: 0, orders: 0 };
    }
    acc[source].value += pedido.valor_total;
    acc[source].orders += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number; orders: number }>);

  const data = Object.values(sourceData)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 sources

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">
            Faturamento: R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-600">Pedidos: {data.orders}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-0 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Vendas por Origem (UTM Source)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
