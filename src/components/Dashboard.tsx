
import { useState, useMemo } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './Sidebar';
import { Filters } from './Filters';
import { KPICard } from './KPICard';
import { SalesChart } from './charts/SalesChart';
import { ProductChart } from './charts/ProductChart';
import { PaymentChart } from './charts/PaymentChart';
import { OrdersTable } from './tables/OrdersTable';
import { useEcommerceData } from '@/hooks/useEcommerceData';
import { FilterState } from '@/types/dashboard';
import { 
  CircleDollarSignIcon, 
  ListIcon, 
  CalendarIcon,
  CirclePercentIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function Dashboard() {
  const { pedidos, clientes, produtos, loading, error, getFilteredPedidos, calculateKPIs } = useEcommerceData();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: null, to: null },
    produto: '',
    cidade: '',
    canal: '',
    status: ''
  });

  const filteredPedidos = useMemo(() => getFilteredPedidos(filters), [pedidos, filters, getFilteredPedidos]);
  const kpis = useMemo(() => calculateKPIs(filteredPedidos), [filteredPedidos, calculateKPIs]);

  // Extrair opções para filtros baseado nos dados reais
  const filterOptions = useMemo(() => {
    console.log('Extraindo opções de filtro...');
    
    const produtosSet = new Set<string>();
    const cidadesSet = new Set<string>();
    const canaisSet = new Set<string>();
    const statusSet = new Set<string>();

    // Extrair produtos únicos dos pedidos
    pedidos.forEach(pedido => {
      if (pedido.produtos_vendidos) {
        const produtosList = pedido.produtos_vendidos.split(',').map(p => p.trim());
        produtosList.forEach(produto => {
          if (produto) {
            produtosSet.add(produto);
          }
        });
      }
    });

    // Extrair cidades únicas dos clientes
    clientes.forEach(cliente => {
      if (cliente.cidade) {
        cidadesSet.add(cliente.cidade);
      }
    });

    // Extrair canais e status únicos dos pedidos
    pedidos.forEach(pedido => {
      if (pedido.utm_source) {
        canaisSet.add(pedido.utm_source);
      }
      if (pedido.status) {
        statusSet.add(pedido.status);
      }
    });

    const options = {
      produtos: Array.from(produtosSet).sort(),
      cidades: Array.from(cidadesSet).sort(),
      canais: Array.from(canaisSet).sort(),
      statusOptions: Array.from(statusSet).sort()
    };

    console.log('Opções de filtro extraídas:', options);
    return options;
  }, [pedidos, clientes, produtos]);

  const exportToCSV = () => {
    const csvContent = [
      'Numero Pedido,Data,Cliente,Status,Valor,Pagamento,UTM Source,UTM Medium,UTM Campaign',
      ...filteredPedidos.map(p => 
        `${p.numero_pedido || ''},${p.data_pedido || ''},${p.nome_cliente || ''},${p.status || ''},${p.valor_total || ''},${p.forma_pagamento || ''},${p.utm_source || ''},${p.utm_medium || ''},${p.utm_campaign || ''}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pedidos-dashboard.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Exportação concluída",
      description: "Os dados foram exportados para CSV com sucesso.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando Dashboard</h2>
          <p className="text-gray-600">Processando dados do e-commerce...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-3 mx-auto mb-4 w-fit">
            <CircleDollarSignIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="bg-white border border-gray-200 hover:bg-gray-50" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard E-commerce</h1>
                <p className="text-gray-600">Análise de performance e insights de vendas</p>
              </div>
            </div>
            <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
              Exportar CSV
            </Button>
          </div>

          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <Filters 
                filters={filters}
                onFiltersChange={setFilters}
                produtos={filterOptions.produtos}
                cidades={filterOptions.cidades}
                canais={filterOptions.canais}
                statusOptions={filterOptions.statusOptions}
              />

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                  title="Faturamento Total"
                  value={`R$ ${kpis.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  icon={<CircleDollarSignIcon className="h-6 w-6 text-blue-600" />}
                  className="bg-gradient-to-r from-blue-50 to-blue-100"
                />
                <KPICard
                  title="Total de Pedidos"
                  value={kpis.totalPedidos.toLocaleString('pt-BR')}
                  icon={<ListIcon className="h-6 w-6 text-green-600" />}
                  className="bg-gradient-to-r from-green-50 to-green-100"
                />
                <KPICard
                  title="Ticket Médio"
                  value={`R$ ${kpis.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  icon={<CalendarIcon className="h-6 w-6 text-purple-600" />}
                  className="bg-gradient-to-r from-purple-50 to-purple-100"
                />
                <KPICard
                  title="Margem"
                  value={`${kpis.margem.toFixed(1)}%`}
                  subtitle={`ROI: ${kpis.roi.toFixed(1)}%`}
                  icon={<CirclePercentIcon className="h-6 w-6 text-orange-600" />}
                  className="bg-gradient-to-r from-orange-50 to-orange-100"
                />
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart pedidos={filteredPedidos} />
                <ProductChart pedidos={filteredPedidos} produtos={produtos} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PaymentChart pedidos={filteredPedidos} />
                <div className="bg-white p-6 rounded-lg shadow-lg border-0 animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Clientes</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de Clientes:</span>
                      <span className="font-semibold">{kpis.totalClientes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Produtos Vendidos:</span>
                      <span className="font-semibold">{kpis.produtosVendidos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROAS:</span>
                      <span className="font-semibold">{kpis.roas.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'pedidos' && (
            <div className="space-y-6">
              <Filters 
                filters={filters}
                onFiltersChange={setFilters}
                produtos={filterOptions.produtos}
                cidades={filterOptions.cidades}
                canais={filterOptions.canais}
                statusOptions={filterOptions.statusOptions}
              />
              <OrdersTable pedidos={filteredPedidos} />
            </div>
          )}

          {/* Outras seções podem ser implementadas aqui */}
        </main>
      </div>
    </SidebarProvider>
  );
}
