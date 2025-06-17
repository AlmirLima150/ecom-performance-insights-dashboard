
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pedido, Produto } from '@/types/dashboard';

interface ProductChartProps {
  pedidos: Pedido[];
  produtos: Produto[];
}

export function ProductChart({ pedidos, produtos }: ProductChartProps) {
  // Contar vendas por produto baseado no campo produtos_vendidos
  const productSales = pedidos.reduce((acc, pedido) => {
    if (pedido.produtos_vendidos) {
      // Dividir os produtos vendidos por vírgula e processar cada um
      const produtosList = pedido.produtos_vendidos.split(',').map(p => p.trim()).filter(p => p);
      
      produtosList.forEach(produtoNome => {
        if (!acc[produtoNome]) {
          acc[produtoNome] = {
            name: produtoNome,
            value: 0,
            quantity: 0
          };
        }
        // Distribui o valor proporcionalmente entre os produtos do pedido
        // Corrigindo valores que estavam em centavos
        acc[produtoNome].value += (pedido.valor_total / 100) / produtosList.length;
        acc[produtoNome].quantity += 1;
      });
    }
    return acc;
  }, {} as Record<string, { name: string; value: number; quantity: number }>);

  const data = Object.values(productSales)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 produtos
    .map((item, index) => ({
      ...item,
      id: `product-${index}`, // Adicionar ID único para evitar conflito de keys
      shortName: item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name
    }));

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
              tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            />
            <YAxis 
              type="category"
              dataKey="shortName" 
              stroke="#666"
              fontSize={11}
              width={150}
            />
            <Tooltip 
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
              labelFormatter={(label, payload) => {
                const fullName = payload?.[0]?.payload?.name || label;
                return `Produto: ${fullName}`;
              }}
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
