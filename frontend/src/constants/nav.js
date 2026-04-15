import { Home, LayoutDashboard, Package, Users, Warehouse } from 'lucide-react'

export const NAV = [
  {
    key: 'home',
    label: 'Menu Principal',
    icon: Home,
    description: 'Visão geral com indicadores, status operacional e atividade recente.',
  },
  {
    key: 'products',
    label: 'Gerenciar Produtos',
    icon: Package,
    description: 'Base de cadastro, filtros, tabela e pontos de integração para os produtos.',
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Resumo analítico, comparativos mensais e gráficos.',
  },
  {
    key: 'stock',
    label: 'Gerenciar Estoque',
    icon: Warehouse,
    description: 'Controle de entradas, saídas, posições de estoque e alertas de reposição.',
  },
  {
    key: 'employees',
    label: 'Funcionários',
    icon: Users,
    description: 'Estrutura de equipe, permissões, status e acompanhamento operacional.',
  },
]

export const HOME_METRICS = [
  {
    key: 'totalKg',
    label: 'Total de Produtos em Kg',
    value: '--',
    hint: 'Integração ativa com /api/menu/metrics.',
    tone: 'green',
  },
  {
    key: 'availability',
    label: 'Variações disponíveis',
    value: '--',
    hint: 'Integração ativa com /api/menu/metrics.',
    tone: 'orange',
  },
  {
    key: 'billing',
    label: 'Faturamento mensal',
    value: 'R$100.000,00',
    hint: 'Estrutura preparada para consolidar o mês corrente e comparar com o anterior.',
    tone: 'dark',
  },
]

export const DASHBOARD_SUMMARY = [
  { label: 'Volume vendido', value: '92.400 Kg', note: '+8,2% vs mês anterior' },
  { label: 'Ticket médio', value: 'R$ 418', note: '+4,1% no período' },
  { label: 'Margem estimada', value: '26%', note: 'Baseada em mix e custo médio' },
]

export const EMPLOYEES_ROLES = ['gerente', 'desenvolvedor']
