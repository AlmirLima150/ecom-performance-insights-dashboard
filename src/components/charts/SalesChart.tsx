
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pedido } from '@/types/dashboard';

interface SalesChartProps {
  pedidos: Pedido[];
}

export function SalesChart({ pedidos }: SalesChartProps) {
  // Agrupar vendas por data
  const salesByDate = pedidos.reduce((acc, pedido) => {
    const date = new Date(pedido.data_pedido).toLocaleDateString('pt-BR');
    if (!acc[date]) {
      acc[date] = { date, value: 0, orders: 0 };
    }
    acc[date].value += pedido.valor_total;
    acc[date].orders += 1;
    return acc;
  }, {} as Record<string, { date: string; value: number; orders: number }>);

  const data = Object.values(salesByDate).sort((a, b) => 
    new Date(a.date.split('/').reverse().join('/')).getTime() - 
    new Date(b.date.split('/').reverse().join('/')).getTime()
  );

  return (
    <Card className="shadow-lg border-0 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Vendas ao Longo do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
            />
            <Tooltip 
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
              labelFormatter={(label) => `Data: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
