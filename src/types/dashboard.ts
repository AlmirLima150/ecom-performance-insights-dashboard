
export interface Pedido {
  data_pedido: string;
  numero_pedido: string;
  id_cliente: string;
  nome_cliente: string;
  status: string;
  valor_total: number;
  quantidade_itens: number;
  forma_pagamento: string;
  cupom_usado?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  origem_url?: string;
  produtos_vendidos?: string;
  categoria?: string;
}

export interface Cliente {
  id_cliente: string;
  nome: string;
  email: string;
  telefone?: string;
  data_nascimento?: string;
  cidade?: string;
  estado?: string;
  endereco_completo?: string;
}

export interface Produto {
  id_produto: string;
  nome_produto: string;
  categoria?: string;
  preco: number;
  preco_custo?: number;
  estoque?: number;
}

export interface KPIs {
  faturamentoTotal: number;
  totalPedidos: number;
  ticketMedio: number;
  totalClientes: number;
  produtosVendidos: number;
  margem: number;
  roas: number;
  roi: number;
}

export interface FilterState {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  produto: string;
  cidade: string;
  canal: string;
  status: string;
}
