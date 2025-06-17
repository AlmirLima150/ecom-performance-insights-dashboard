
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pedido } from '@/types/dashboard';

interface SalesChartProps {
  pedidos: Pedido[];
}

export function SalesChart({ pedidos }: SalesChartProps) {
  // Agrupar vendas por mês/ano
  const salesByMonth = pedidos.reduce((acc, pedido) => {
    const date = new Date(pedido.data_pedido);
    const monthYear = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = { 
        monthYear, 
        value: 0, 
        orders: 0,
        displayDate: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      };
    }
    acc[monthYear].value += pedido.valor_total;
    acc[monthYear].orders += 1;
    return acc;
  }, {} as Record<string, { monthYear: string; value: number; orders: number; displayDate: string }>);

  const data = Object.values(salesByMonth).sort((a, b) => {
    const [monthA, yearA] = a.monthYear.split('/').map(Number);
    const [monthB, yearB] = b.monthYear.split('/').map(Number);
    return new Date(yearA, monthA - 1).getTime() - new Date(yearB, monthB - 1).getTime();
  });

  return (
    <Card className="shadow-lg border-0 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Vendas por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayDate" 
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
              labelFormatter={(label) => `Período: ${label}`}
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
