
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pedido, Produto } from '@/types/dashboard';

interface ProductChartProps {
  pedidos: Pedido[];
  produtos: Produto[];
}

export function ProductChart({ pedidos, produtos }: ProductChartProps) {
  // Contar vendas por produto
  const productSales = pedidos.reduce((acc, pedido) => {
    const produtosIds = pedido.produtos_vendidos.split(',').map(id => id.trim());
    produtosIds.forEach(produtoId => {
      if (!acc[produtoId]) {
        const produto = produtos.find(p => p.id_produto === produtoId);
        acc[produtoId] = {
          id: produtoId,
          name: produto?.nome_produto || `Produto ${produtoId}`,
          value: 0,
          quantity: 0
        };
      }
      acc[produtoId].value += pedido.valor_total / produtosIds.length; // Distribui o valor proporcionalmente
      acc[produtoId].quantity += 1;
    });
    return acc;
  }, {} as Record<string, { id: string; name: string; value: number; quantity: number }>);

  const data = Object.values(productSales)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 produtos

  return (
    <Card className="shadow-lg border-0 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Top Produtos por Faturamento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              stroke="#666"
              fontSize={12}
              width={120}
            />
            <Tooltip 
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#06b6d4"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
