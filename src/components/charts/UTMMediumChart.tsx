
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pedido } from '@/types/dashboard';

interface UTMMediumChartProps {
  pedidos: Pedido[];
}

export function UTMMediumChart({ pedidos }: UTMMediumChartProps) {
  // Agrupar vendas por utm_medium
  const mediumData = pedidos.reduce((acc, pedido) => {
    const medium = pedido.utm_medium || 'Direto';
    if (!acc[medium]) {
      acc[medium] = { name: medium, value: 0, orders: 0 };
    }
    acc[medium].value += pedido.valor_total;
    acc[medium].orders += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number; orders: number }>);

  const data = Object.values(mediumData)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 mediums

  return (
    <Card className="shadow-lg border-0 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Vendas por Mídia (UTM Medium)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#666"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
            />
            <Tooltip 
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
              labelFormatter={(label) => `Mídia: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
