
import { useState, useEffect } from 'react';
import { Pedido, Cliente, Produto, KPIs, FilterState } from '@/types/dashboard';

const DATA_URLS = {
  pedidos: 'https://raw.githubusercontent.com/AlmirLima150/dados-para-dashboard/refs/heads/main/pedidos.json',
  clientes: 'https://raw.githubusercontent.com/AlmirLima150/dados-para-dashboard/refs/heads/main/clientes.json',
  produtos: 'https://raw.githubusercontent.com/AlmirLima150/dados-para-dashboard/refs/heads/main/produtos.json'
};

export const useEcommerceData = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Iniciando carregamento dos dados...');
        
        const [pedidosRes, clientesRes, produtosRes] = await Promise.all([
          fetch(DATA_URLS.pedidos),
          fetch(DATA_URLS.clientes),
          fetch(DATA_URLS.produtos)
        ]);

        if (!pedidosRes.ok || !clientesRes.ok || !produtosRes.ok) {
          throw new Error('Erro ao carregar dados das APIs');
        }

        const [pedidosData, clientesData, produtosData] = await Promise.all([
          pedidosRes.json(),
          clientesRes.json(),
          produtosRes.json()
        ]);

        console.log('Dados carregados:', {
          pedidos: pedidosData.length,
          clientes: clientesData.length,
          produtos: produtosData.length
        });

        setPedidos(pedidosData);
        setClientes(clientesData);
        setProdutos(produtosData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredPedidos = (filters: FilterState) => {
    console.log('Aplicando filtros:', filters);
    
    return pedidos.filter(pedido => {
      // Filtro de data
      if (filters.dateRange.from && filters.dateRange.to) {
        const pedidoDate = new Date(pedido.data_pedido);
        const fromDate = new Date(filters.dateRange.from);
        const toDate = new Date(filters.dateRange.to);
        
        if (pedidoDate < fromDate || pedidoDate > toDate) {
          return false;
        }
      }

      // Filtro de produto - verificar se o produto está na lista de produtos vendidos
      if (filters.produto) {
        const produtosVendidos = pedido.produtos_vendidos ? 
          pedido.produtos_vendidos.split(',').map(id => id.trim()) : [];
        
        const produtoEncontrado = produtosVendidos.some(produtoId => {
          const produto = produtos.find(p => p.id_produto === produtoId);
          return produto && produto.nome_produto.toLowerCase().includes(filters.produto.toLowerCase());
        });

        if (!produtoEncontrado) {
          return false;
        }
      }

      // Filtro de cidade - buscar cliente e verificar cidade
      if (filters.cidade) {
        const cliente = clientes.find(c => c.id_cliente === pedido.id_cliente);
        if (!cliente || !cliente.cidade || 
            !cliente.cidade.toLowerCase().includes(filters.cidade.toLowerCase())) {
          return false;
        }
      }

      // Filtro de canal (utm_source)
      if (filters.canal) {
        if (!pedido.utm_source || 
            !pedido.utm_source.toLowerCase().includes(filters.canal.toLowerCase())) {
          return false;
        }
      }

      // Filtro de status
      if (filters.status) {
        if (!pedido.status || 
            !pedido.status.toLowerCase().includes(filters.status.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  };

  const calculateKPIs = (filteredPedidos: Pedido[]): KPIs => {
    console.log('Calculando KPIs para', filteredPedidos.length, 'pedidos');
    
    const faturamentoTotal = filteredPedidos.reduce((sum, p) => sum + (p.valor_total || 0), 0);
    const totalPedidos = filteredPedidos.length;
    const ticketMedio = totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0;
    
    // Clientes únicos
    const uniqueClients = new Set(filteredPedidos.map(p => p.id_cliente));
    const totalClientes = uniqueClients.size;
    
    // Total de produtos vendidos
    const produtosVendidos = filteredPedidos.reduce((sum, p) => sum + (p.quantidade_itens || 0), 0);
    
    // Calcular custos baseado nos produtos vendidos
    let custoTotal = 0;
    filteredPedidos.forEach(pedido => {
      if (pedido.produtos_vendidos) {
        const produtosIds = pedido.produtos_vendidos.split(',').map(id => id.trim());
        produtosIds.forEach(produtoId => {
          const produto = produtos.find(p => p.id_produto === produtoId);
          if (produto && produto.preco_custo) {
            custoTotal += produto.preco_custo;
          }
        });
      }
    });

    // Calcular métricas
    const margem = faturamentoTotal > 0 ? ((faturamentoTotal - custoTotal) / faturamentoTotal) * 100 : 0;
    const roas = custoTotal > 0 ? faturamentoTotal / custoTotal : 0;
    const roi = custoTotal > 0 ? ((faturamentoTotal - custoTotal) / custoTotal) * 100 : 0;

    const kpis = {
      faturamentoTotal,
      totalPedidos,
      ticketMedio,
      totalClientes,
      produtosVendidos,
      margem,
      roas,
      roi
    };

    console.log('KPIs calculados:', kpis);
    return kpis;
  };

  return {
    pedidos,
    clientes,
    produtos,
    loading,
    error,
    getFilteredPedidos,
    calculateKPIs
  };
};
