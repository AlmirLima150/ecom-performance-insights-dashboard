
import { useState, useEffect } from 'react';
import { Pedido, Cliente, Produto, KPIs, FilterState } from '@/types/dashboard';

const DATA_URLS = {
  pedidos: '/data/pedidos.json',
  clientes: '/data/clientes.json',
  produtos: '/data/produtos.json'
};

// Mapear dados dos JSONs para nossa estrutura
const mapPedidoData = (pedidoRaw: any): Pedido => ({
  data_pedido: pedidoRaw["Data do Pedido"],
  numero_pedido: pedidoRaw["Nº Pedido"],
  id_cliente: pedidoRaw["id_cliente"],
  nome_cliente: pedidoRaw["Cliente"],
  status: pedidoRaw["Status"],
  valor_total: parseFloat(pedidoRaw["Valor Total "] || "0"),
  quantidade_itens: parseInt(pedidoRaw["Qtd Itens"] || "0"),
  forma_pagamento: pedidoRaw["Forma de Pagamento"],
  cupom_usado: pedidoRaw["Cupom Usado"],
  utm_source: pedidoRaw["utm_source"],
  utm_medium: pedidoRaw["utm_medium"],
  utm_campaign: pedidoRaw["utm_campaign"],
  utm_content: pedidoRaw["utm_content"],
  utm_term: pedidoRaw["utm_term"],
  origem_url: pedidoRaw["origem"],
  produtos_vendidos: pedidoRaw["produto(s)"],
  categoria: pedidoRaw["categoria"]
});

const mapClienteData = (clienteRaw: any): Cliente => ({
  id_cliente: clienteRaw["ID do Cliente"],
  nome: clienteRaw["Nome"],
  email: clienteRaw["E-mail"],
  telefone: clienteRaw["Telefone"],
  data_nascimento: clienteRaw["Data de nascimento"],
  cidade: clienteRaw["Cidade"],
  estado: clienteRaw["Estado"],
  endereco_completo: clienteRaw["Endereço"]
});

const mapProdutoData = (produtoRaw: any): Produto => ({
  id_produto: produtoRaw["ID do Produto"],
  nome_produto: produtoRaw["Nome do Produto"],
  categoria: produtoRaw["Categoria"],
  preco: parseFloat(produtoRaw["Preço"] || "0"),
  preco_custo: parseFloat(produtoRaw["Preço de Custo"] || "0"),
  estoque: parseInt(produtoRaw["Estoque"] || "0")
});

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

        // Os dados vêm dentro de um array com um objeto que contém os arrays reais
        const pedidosMapeados = pedidosData[0].pedidos.map(mapPedidoData);
        const clientesMapeados = clientesData[0].clientes.map(mapClienteData);
        const produtosMapeados = produtosData[0].produtos.map(mapProdutoData);

        console.log('Dados mapeados:', {
          pedidos: pedidosMapeados.length,
          clientes: clientesMapeados.length,
          produtos: produtosMapeados.length
        });

        setPedidos(pedidosMapeados);
        setClientes(clientesMapeados);
        setProdutos(produtosMapeados);
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
    // ✅ CORREÇÃO: Filtro de data com comparação correta
    if (filters.dateRange.from && filters.dateRange.to) {
      const pedidoDate = new Date(pedido.data_pedido);
      const fromDate = new Date(filters.dateRange.from);
      const toDate = new Date(filters.dateRange.to);
      
      // Zerar as horas para comparação apenas de data
      pedidoDate.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999); // Final do dia
      
      if (pedidoDate < fromDate || pedidoDate > toDate) {
        return false;
      }
    }

    // Resto dos filtros permanece igual...
    if (filters.produto) {
      if (!pedido.produtos_vendidos || 
          !pedido.produtos_vendidos.toLowerCase().includes(filters.produto.toLowerCase())) {
        return false;
      }
    }

    if (filters.cidade) {
      const cliente = clientes.find(c => c.id_cliente === pedido.id_cliente);
      if (!cliente || !cliente.cidade || 
          !cliente.cidade.toLowerCase().includes(filters.cidade.toLowerCase())) {
        return false;
      }
    }

    if (filters.canal) {
      if (!pedido.utm_source || 
          !pedido.utm_source.toLowerCase().includes(filters.canal.toLowerCase())) {
        return false;
      }
    }

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
    
    // Calcular custos reais baseado nos produtos vendidos
    let custoTotal = 0;
    
    filteredPedidos.forEach(pedido => {
      if (pedido.produtos_vendidos) {
        const produtosList = pedido.produtos_vendidos.split(',').map(p => p.trim()).filter(p => p);
        
        produtosList.forEach(produtoNome => {
          const produto = produtos.find(p => 
            p.nome_produto.toLowerCase().includes(produtoNome.toLowerCase())
          );
          
          if (produto && produto.preco_custo) {
            // Distribui o custo proporcionalmente
            custoTotal += produto.preco_custo / produtosList.length;
          } else {
            // Fallback: assume 60% do valor como custo se não encontrar o produto
            custoTotal += (pedido.valor_total * 0.6) / produtosList.length;
          }
        });
      } else {
        // Fallback se não há produtos especificados
        custoTotal += pedido.valor_total * 0.6;
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
