
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
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const mesAno = `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[mesAno]) {
      acc[mesAno] = { 
        name: mesAno, 
        value: 0, 
        orders: 0,
        sortKey: sortKey
      };
    }
    
    // Corrigindo valores que estavam em centavos
    acc[mesAno].value += pedido.valor_total / 100;
    acc[mesAno].orders += 1;
    
    return acc;
  }, {} as Record<string, { name: string; value: number; orders: number; sortKey: string }>);

  // Ordenar por data (ano-mês)
  const data = Object.values(salesByMonth)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey, ...rest }) => rest);

  console.log('Dados de vendas por mês:', data);

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
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
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
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
