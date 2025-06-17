
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pedido } from '@/types/dashboard';

interface UTMCampaignChartProps {
  pedidos: Pedido[];
}

export function UTMCampaignChart({ pedidos }: UTMCampaignChartProps) {
  // Agrupar vendas por utm_campaign
  const campaignData = pedidos.reduce((acc, pedido) => {
    const campaign = pedido.utm_campaign || 'Sem campanha';
    if (!acc[campaign]) {
      acc[campaign] = { name: campaign, value: 0, orders: 0 };
    }
    // Corrigindo valores que estavam em centavos
    acc[campaign].value += pedido.valor_total / 100;
    acc[campaign].orders += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number; orders: number }>);

  const data = Object.values(campaignData)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 campaigns
    .map((item, index) => ({
      ...item,
      id: `campaign-${index}`,
      shortName: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name
    }));

  return (
    <Card className="shadow-lg border-0 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Vendas por Campanha (UTM Campaign)</CardTitle>
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
              width={120}
            />
            <Tooltip 
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
              labelFormatter={(label, payload) => {
                const fullName = payload?.[0]?.payload?.name || label;
                return `Campanha: ${fullName}`;
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
              fill="#8b5cf6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
