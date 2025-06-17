
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
        const [pedidosRes, clientesRes, produtosRes] = await Promise.all([
          fetch(DATA_URLS.pedidos),
          fetch(DATA_URLS.clientes),
          fetch(DATA_URLS.produtos)
        ]);

        if (!pedidosRes.ok || !clientesRes.ok || !produtosRes.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const [pedidosData, clientesData, produtosData] = await Promise.all([
          pedidosRes.json(),
          clientesRes.json(),
          produtosRes.json()
        ]);

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
    return pedidos.filter(pedido => {
      // Filtro de data
      if (filters.dateRange.from && filters.dateRange.to) {
        const pedidoDate = new Date(pedido.data_pedido);
        if (pedidoDate < filters.dateRange.from || pedidoDate > filters.dateRange.to) {
          return false;
        }
      }

      // Filtro de produto
      if (filters.produto && !pedido.produtos_vendidos.includes(filters.produto)) {
        return false;
      }

      // Filtro de cidade
      if (filters.cidade) {
        const cliente = clientes.find(c => c.id_cliente === pedido.id_cliente);
        if (!cliente || cliente.cidade !== filters.cidade) {
          return false;
        }
      }

      // Filtro de canal
      if (filters.canal && pedido.utm_source !== filters.canal) {
        return false;
      }

      // Filtro de status
      if (filters.status && pedido.status !== filters.status) {
        return false;
      }

      return true;
    });
  };

  const calculateKPIs = (filteredPedidos: Pedido[]): KPIs => {
    const faturamentoTotal = filteredPedidos.reduce((sum, p) => sum + p.valor_total, 0);
    const totalPedidos = filteredPedidos.length;
    const ticketMedio = totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0;
    const uniqueClients = new Set(filteredPedidos.map(p => p.id_cliente));
    const totalClientes = uniqueClients.size;
    const produtosVendidos = filteredPedidos.reduce((sum, p) => sum + p.quantidade_itens, 0);
    
    // Calcular custos baseado nos produtos vendidos
    let custoTotal = 0;
    filteredPedidos.forEach(pedido => {
      const produtosIds = pedido.produtos_vendidos.split(',').map(id => id.trim());
      produtosIds.forEach(produtoId => {
        const produto = produtos.find(p => p.id_produto === produtoId);
        if (produto) {
          custoTotal += produto.preco_custo;
        }
      });
    });

    const margem = faturamentoTotal > 0 ? ((faturamentoTotal - custoTotal) / faturamentoTotal) * 100 : 0;
    const roas = custoTotal > 0 ? faturamentoTotal / custoTotal : 0;
    const roi = custoTotal > 0 ? ((faturamentoTotal - custoTotal) / custoTotal) * 100 : 0;

    return {
      faturamentoTotal,
      totalPedidos,
      ticketMedio,
      totalClientes,
      produtosVendidos,
      margem,
      roas,
      roi
    };
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
