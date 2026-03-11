import { useEffect, useMemo, useState } from 'react'

import {
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Trash2,
  Users,
  Warehouse,
  X,
} from 'lucide-react'

import api from './api/axiosInstance'
import Toast from './components/Toast'
import logo from './assets/logo.svg'
import './global.css'

const NAV = [
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
    description: 'Resumo analítico, comparativos mensais e blocos preparados para gráficos.',
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

const HOME_METRICS = [
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
    label: 'Faturamento mensal - Dados Fictícios',
    value: 'R$ 186.400',
    hint: 'Estrutura preparada para consolidar o mês corrente e comparar com o anterior.',
    tone: 'dark',
  },
]



const PRODUCTS_ROWS = [
  {
    product: 'Banana Prata',
    pricePF: 'R$ 6,50',
    priceCNPJ: 'R$ 5,80',
    quantity: '3.250 Kg',
    status: 'Ativo',
  },
  {
    product: 'Abacaxi Pérola',
    pricePF: 'R$ 7,90',
    priceCNPJ: 'R$ 7,00',
    quantity: '780 Kg',
    status: 'Rascunho',
  },
  {
    product: 'Tomate Italiano',
    pricePF: 'R$ 8,20',
    priceCNPJ: 'R$ 7,40',
    quantity: '1.120 Kg',
    status: 'Ativo',
  },
  {
    product: 'Uva Vitória',
    pricePF: 'R$ 14,00',
    priceCNPJ: 'R$ 12,50',
    quantity: '240 Kg',
    status: 'Ativo',
  },
]

const DASHBOARD_SUMMARY = [
  { label: 'Volume vendido', value: '92.400 Kg', note: '+8,2% vs mês anterior' },
  { label: 'Ticket médio', value: 'R$ 418', note: '+4,1% no período' },
  { label: 'Margem estimada', value: '26%', note: 'Baseada em mix e custo médio' },
]

const STOCK_ROWS = [
  {
    product: 'Banana Prata',
    location: 'CD Principal',
    balance: '3.250 Kg',
    min: '1.000 Kg',
    status: 'Saudável',
  },
  {
    product: 'Abacaxi Pérola',
    location: 'Loja Centro',
    balance: '780 Kg',
    min: '900 Kg',
    status: 'Reposição',
  },
  {
    product: 'Tomate Italiano',
    location: 'CD Principal',
    balance: '1.120 Kg',
    min: '1.100 Kg',
    status: 'Atenção',
  },
  {
    product: 'Uva Vitória',
    location: 'Loja Norte',
    balance: '240 Bandejas',
    min: '180 Bandejas',
    status: 'Saudável',
  },
]




const API_BLUEPRINTS = {
  home: [
    'GET /api/menu/metrics',
    'GET /api/logs',
    'GET /api/home/revenue/monthly',
  ],
  products: [
    'GET /api/products',
    'POST /api/products',
    'PATCH /api/products/:id',
    'DELETE /api/products/:id',
  ],
  dashboard: [
    'GET /api/dashboard/overview',
    'GET /api/dashboard/revenue-trend',
    'GET /api/dashboard/top-categories',
  ],
  stock: [
    'GET /api/stock/summary',
    'GET /api/stock/movements',
    'POST /api/stock/entry',
    'POST /api/stock/output',
  ],
  employees: [
    'GET /api/employees',
    'GET /api/employees/permissions',
    'POST /api/employees',
    'PATCH /api/employees/:id/status',
  ],
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function extractApiMessage(data) {
  if (!data) return null
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    const first = data.find((v) => typeof v === 'string')
    return first || null
  }
  if (typeof data === 'object') {
    const keys = ['message', 'msg', 'detail', 'error', 'description', 'title']
    for (const k of keys) {
      const v = data[k]
      if (typeof v === 'string' && v.trim()) return v
      if (Array.isArray(v)) {
        const first = v.find((x) => typeof x === 'string')
        if (first) return first
      }
      if (v && typeof v === 'object') {
        const nested = extractApiMessage(v)
        if (nested) return nested
      }
    }

    for (const v of Object.values(data)) {
      if (typeof v === 'string' && v.trim()) return v
    }
  }
  return null
}

function getTokenFromResponse(data) {
  if (!data || typeof data !== 'object') return null
  return data.access_token || data.token || data.accessToken || null
}

function getDisplayNameFromResponse(data, fallback = '') {
  if (!data || typeof data !== 'object') return fallback

  const candidates = [
    data.name,
    data.full_name,
    data.fullName,
    data.user,
    data.usuario,
    data.nome,
    data?.user?.name,
    data?.user?.full_name,
    data?.user?.fullName,
    data?.user?.usuario,
    data?.user?.nome,
    data?.profile?.name,
    data?.profile?.full_name,
    data?.profile?.fullName,
    data?.profile?.nome,
    data?.data?.name,
    data?.data?.full_name,
    data?.data?.fullName,
    data?.data?.nome,
    data.username,
    data?.user?.username,
    data?.profile?.username,
    data?.data?.username,
  ]

  const match = candidates.find((value) => typeof value === 'string' && value.trim())
  return match?.trim() || fallback
}

async function resolveDisplayName(fallback = 'Usuário do sistema') {
  try {
    const res = await api.get('/api/me')
    return getDisplayNameFromResponse(res?.data, fallback) || fallback
  } catch {
    return fallback
  }
}

function getInitials(fullName = '') {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'US'
  if (parts.length === 1) return parts[0][0].toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}




function formatKgValue(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '-- Kg'

  return `${numeric.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} Kg`
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M4 4l16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('display_name') || 'Usuário do sistema')

  useEffect(() => {
    if (!token) return

    let ignore = false

    resolveDisplayName(localStorage.getItem('display_name') || 'Usuário do sistema').then((resolvedName) => {
      if (ignore) return
      localStorage.setItem('display_name', resolvedName)
      setDisplayName(resolvedName)
    })

    return () => {
      ignore = true
    }
  }, [token])

  if (token) {
    return (
      <MainLayout
        userName={displayName}
        onLogout={() => {
          localStorage.removeItem('token')
          localStorage.removeItem('display_name')
          setToken(null)
          setDisplayName('Usuário do sistema')
        }}
      />
    )
  }

  return (
    <LoginPage
      onAuthed={(nextToken, nextDisplayName) => {
        setToken(nextToken)
        setDisplayName(nextDisplayName)
      }}
    />
  )
}

function LoginPage({ onAuthed }) {
  const [showPassword, setShowPassword] = useState(false)
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  function notify(next) {
    setToast({ id: globalThis.crypto?.randomUUID?.() || String(Date.now()), ...next })
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (loading) return

    if (!user.trim() || !password) {
      notify({ type: 'error', title: 'Campos obrigatórios', message: 'Preencha usuário e senha.' })
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/api/login', {
        username: user,
        user,
        password,
      })

      const data = res?.data
      const accessToken = getTokenFromResponse(data)

      if (!accessToken) {
        notify({
          type: 'error',
          title: 'Login falhou',
          message: 'A API respondeu, mas não retornou access_token.',
        })
        return
      }

      localStorage.setItem('token', accessToken)

      const fallbackName = getDisplayNameFromResponse(data, user.trim()) || 'Usuário do sistema'
      const displayName = await resolveDisplayName(fallbackName)

      localStorage.setItem('display_name', displayName)
      notify({ type: 'success', title: 'Login realizado', message: `Bem-vindo, ${displayName}!` })
      onAuthed(accessToken, displayName)
    } catch (err) {
      const data = err?.response?.data
      const msg = extractApiMessage(data) || err?.message || 'Erro ao autenticar.'
      notify({ type: 'error', title: 'Erro no login', message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <header className="header">
        <img src={logo} alt="Logo Desfruta" />
      </header>

      <form onSubmit={handleLogin}>
        <div className="inputContainer">
          <label htmlFor="user">NAME</label>
          <input
            type="text"
            name="user"
            id="user"
            placeholder="Gabriel Ogura"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="inputContainer">
          <label htmlFor="password">PASSWORD</label>

          <div className="passwordWrap">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              placeholder="***********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button
              type="button"
              className="passwordToggle"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setShowPassword((v) => !v)}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <button className="button" disabled={loading}>
          {loading ? (
            <span className="btnInner">
              <span className="spinner" aria-hidden="true" />
              Entrando...
            </span>
          ) : (
            'Login'
          )}
        </button>

        <div className="footer">
          <a href="#">Esqueceu a Senha?</a>
        </div>
      </form>
    </div>
  )
}

function MainLayout({ onLogout, userName }) {
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('home')

  return (
    <div className={cx('layout', collapsed && 'isCollapsed')}>
      <aside className={cx('sidebar', collapsed && 'collapsed')}>
        <div className="sidebarInner">
          <div className="brand">
            <div className="brandLogo">
              <img src={logo} alt="Desfruta" />
            </div>

            {!collapsed && (
              <div className="brandText">
                <div className="brandName">Desfruta</div>
              </div>
            )}

            <button
              className="collapseBtn"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
              title={collapsed ? 'Expandir' : 'Recolher'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <div className="sidebarBody">
            <nav className="nav">
              {NAV.map((item) => {
                const Icon = item.icon
                const isActive = item.key === active

                return (
                  <button
                    key={item.key}
                    className={cx('navItem', isActive && 'active')}
                    onClick={() => setActive(item.key)}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="navIcon">
                      <Icon size={18} />
                    </span>
                    {!collapsed && <span className="navLabel">{item.label}</span>}
                    {!collapsed && isActive && <span className="activeDot" />}
                  </button>
                )
              })}
            </nav>

            <div className="sidebarFooter">
              <button className="logoutBtn" onClick={onLogout} aria-label="Sair" title="Sair">
                <LogOut size={18} />
                {!collapsed && <span>Sair</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <PageContent activeKey={active} userName={userName} />
      </main>
    </div>
  )
}

function PageContent({ activeKey, userName }) {
  const current = useMemo(() => NAV.find((item) => item.key === activeKey) ?? NAV[0], [activeKey])
  const userInitials = getInitials(userName)

  return (
    <div className="content">
      <div className="contentHeader">
        <div>
          <h1 className="h1">{current.label}</h1>
          <p className="muted">{current.description}</p>
        </div>

        <div className="topActions">
          <div className="avatar" title={userName || 'Usuário'} aria-label={`Avatar de ${userName || 'usuário'}`}>
            <span>{userInitials}</span>
          </div>
        </div>
      </div>

      {activeKey === 'home' && <HomePage />}
      {activeKey === 'products' && <ProductsPage />}
      {activeKey === 'dashboard' && <DashboardPage />}
      {activeKey === 'stock' && <StockPage />}
      {activeKey === 'employees' && <EmployeesPage />}
    </div>
  )
}

function HomePage() {
  const [metrics, setMetrics] = useState({ loading: true, error: '', totalKg: 0, disponiveis: 0, total: 0 })

  useEffect(() => {
    let ignore = false

    async function loadMetrics() {
      try {
        const res = await api.get('/api/menu/metrics')
        if (ignore) return
        const data        = res?.data ?? {}
        const quantidade  = data?.quantidade ?? {}
        setMetrics({
          loading:     false,
          error:       '',
          totalKg:     Number(data?.kg_disponiveis ?? 0),
          disponiveis: Number(quantidade?.disponiveis ?? 0),
          total:       Number(quantidade?.total ?? 0),
        })
      } catch (err) {
        if (ignore) return
        setMetrics({
          loading: false,
          error: extractApiMessage(err?.response?.data) || 'Não foi possível carregar os indicadores.',
          totalKg: 0, disponiveis: 0, total: 0,
        })
      }
    }

    loadMetrics()
    return () => { ignore = true }
  }, [])

  const homeMetrics = useMemo(() => {
    return HOME_METRICS.map((item) => {
      if (item.key === 'totalKg') {
        if (metrics.loading) return { ...item, value: 'Carregando...', hint: 'Consultando /api/menu/metrics.' }
        if (metrics.error)   return { ...item, value: '--', hint: metrics.error }
        return { ...item, value: formatKgValue(metrics.totalKg), hint: 'Total de Kg disponível retornado pela API.' }
      }
      if (item.key === 'availability') {
        if (metrics.loading) return { ...item, value: 'Carregando...', hint: 'Consultando /api/menu/metrics.' }
        if (metrics.error)   return { ...item, value: '--', hint: metrics.error }
        return { ...item, value: `${metrics.disponiveis}/${metrics.total}`, hint: 'Variações disponíveis em relação ao total cadastrado.' }
      }
      return item
    })
  }, [metrics])

  return (
    <div className="pageStack">
      <section className="heroCard">
        <div>
          <span className="eyebrow">Painel principal</span>
          <h2 className="heroTitle">Gestão de estoque, produtos e operação em tempo real.</h2>
          <p className="heroText">
            Acompanhe o total de Kg disponível, variações ativas e faturamento mensal
            diretamente dos dados do banco.
          </p>
        </div>

        <div className="heroBadges">
          <span className="softBadge">Estoque</span>
          <span className="softBadge">Produtos</span>
          <span className="softBadge">Operação</span>
        </div>
      </section>

      <div className="metricGrid">
        {homeMetrics.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </div>

      <RecentActivityTable />
    </div>
  )
}

function normalizeTableRows(data) {
  if (!Array.isArray(data)) return []
  return data.map((item) => ({
    product: item.sabor ?? item.product ?? item.nome ?? '',
    pricePF: item.preco_pf != null ? `R$ ${Number(item.preco_pf).toFixed(2).replace('.', ',')}` : item.pricePF ?? '--',
    priceCNPJ: item.preco_cnpj != null ? `R$ ${Number(item.preco_cnpj).toFixed(2).replace('.', ',')}` : item.priceCNPJ ?? '--',
    quantity: item.quantidade_kg != null ? `${item.quantidade_kg} Kg` : item.quantity ?? '--',
    status: item.disponivel === true || item.disponivel === 1 ? 'Ativo' : item.disponivel === false || item.disponivel === 0 ? 'Inativo' : item.status ?? '--',
    _sabor: item.sabor ?? item.product ?? item.nome ?? '',
  }))
}

function parseCurrencyInput(value) {
  if (!value) return null
  const cleaned = String(value).replace(/[R$\s]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return Number.isFinite(num) ? num : null
}

function ProductsPage() {
  const [rows, setRows] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [metrics, setMetrics] = useState({ loading: true, error: false, total: null, disponiveis: null, porcentagem: null })

  function notify(next) {
    setToast({ id: globalThis.crypto?.randomUUID?.() || String(Date.now()), ...next })
  }

  async function loadTable(ignore) {
    setTableLoading(true)
    try {
      const res = await api.get('/api/produtos/tabela')
      if (ignore?.current) return
      const data = res?.data?.dados ?? res?.data?.data ?? res?.data ?? []
      setRows(normalizeTableRows(data))
    } catch {
      if (ignore?.current) return
      setRows(normalizeTableRows())
    } finally {
      if (!ignore?.current) setTableLoading(false)
    }
  }

  async function loadMetrics(ignore) {
    try {
      const res = await api.get('/api/produtos/metricas')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setMetrics({
        loading: false,
        error: false,
        total: data.total ?? null,
        disponiveis: data.disponiveis ?? null,
        porcentagem: data.porcentagem ?? null,
      })
    } catch {
      if (ignore?.current) return
      setMetrics({ loading: false, error: true, total: null, disponiveis: null, porcentagem: null })
    }
  }

  useEffect(() => {
    const ignore = { current: false }
    loadTable(ignore)
    loadMetrics(ignore)
    return () => { ignore.current = true }
  }, [])

  const [form, setForm] = useState({ nome: '', status: 'Ativo', precoPF: '', precoCNPJ: '', quantidade: '' })

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleClear() {
    setForm({ nome: '', status: 'Ativo', precoPF: '', precoCNPJ: '', quantidade: '' })
  }

  async function handleCadastrar() {
    if (submitting) return

    const sabor = form.nome.trim()
    const preco_pf = parseCurrencyInput(form.precoPF)
    const preco_cnpj = parseCurrencyInput(form.precoCNPJ)
    const quantidade_kg = parseCurrencyInput(form.quantidade)
    const disponivel = form.status === 'Ativo'

    if (!sabor) {
      notify({ type: 'error', title: 'Campo obrigatório', message: 'Informe o nome do produto.' })
      return
    }
    if (preco_pf === null) {
      notify({ type: 'error', title: 'Campo inválido', message: 'Informe um Preço PF válido (ex: 6,50).' })
      return
    }
    if (preco_cnpj === null) {
      notify({ type: 'error', title: 'Campo inválido', message: 'Informe um Preço CNPJ válido (ex: 5,80).' })
      return
    }
    if (quantidade_kg === null) {
      notify({ type: 'error', title: 'Campo inválido', message: 'Informe a Quantidade em Kg válida (ex: 18,70).' })
      return
    }

    setSubmitting(true)
    try {
      await api.post('/api/produtos/cadastrar', { sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel })
      notify({ type: 'success', title: 'Produto cadastrado', message: `"${sabor}" foi cadastrado com sucesso.` })
      handleClear()
      await loadTable({ current: false })
      await loadMetrics({ current: false })
    } catch (err) {
      const msg = extractApiMessage(err?.response?.data) || err?.message || 'Erro ao cadastrar produto.'
      notify({ type: 'error', title: 'Erro ao cadastrar', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(row) {
    const sabor = row._sabor || row.product
    if (!sabor) return
    setDeletingId(sabor)
    try {
      await api.delete('/api/produtos/deletar', { data: { sabor } })
      notify({ type: 'success', title: 'Produto removido', message: `"${sabor}" foi deletado com sucesso.` })
      await loadTable({ current: false })
      await loadMetrics({ current: false })
    } catch (err) {
      const msg = extractApiMessage(err?.response?.data) || err?.message || 'Erro ao deletar produto.'
      notify({ type: 'error', title: 'Erro ao deletar', message: msg })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeleteByForm() {
    const sabor = form.nome.trim()
    if (!sabor) {
      notify({ type: 'error', title: 'Campo obrigatório', message: 'Informe o nome do produto a ser deletado.' })
      return
    }
    setDeletingId(sabor)
    try {
      await api.delete('/api/produtos/deletar', { data: { sabor } })
      notify({ type: 'success', title: 'Produto removido', message: `"${sabor}" foi deletado com sucesso.` })
      handleClear()
      await loadTable({ current: false })
      await loadMetrics({ current: false })
    } catch (err) {
      const msg = extractApiMessage(err?.response?.data) || err?.message || 'Erro ao deletar produto.'
      notify({ type: 'error', title: 'Erro ao deletar', message: msg })
    } finally {
      setDeletingId(null)
    }
  }

  const metricTotal = metrics.loading ? 'Carregando...' : metrics.error ? '--' : String(metrics.total ?? '--')
  const metricAtivos = metrics.loading ? 'Carregando...' : metrics.error ? '--' : String(metrics.disponiveis ?? '--')
  const metricPorcentagem = metrics.loading ? 'Carregando...' : metrics.error ? '--' : metrics.porcentagem != null ? `${metrics.porcentagem}%` : '--'
  const isDeleting = deletingId !== null

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="metricGrid compactMetrics">
        <MiniMetric title="Produtos cadastrados"    value={metricTotal}      detail="Total de produtos no sistema" />
        <MiniMetric title="Produtos Ativos"          value={metricAtivos}     detail="Produtos disponíveis para venda" />
        <MiniMetric title="Taxa de produtos ativos"  value={metricPorcentagem} detail="Percentual de produtos ativos" />
      </div>

      <SectionCard title="Cadastro Rápido" subtitle="Cadastro completo do produto, contendo todos os campos necessários.">
        <div className="filtersGrid">
          <Field label="Nome do Produto" placeholder="Nome do produto" value={form.nome} onChange={(v) => handleFormChange('nome', v)} />
          <Field label="Status" placeholder="Ativo, Inativo" value={form.status} onChange={(v) => handleFormChange('status', v)} />
          <Field label="Preço PF" placeholder="6,50" type="text" value={form.precoPF} onChange={(v) => handleFormChange('precoPF', v)} />
          <Field label="Preço CNPJ" placeholder="5,80" type="text" value={form.precoCNPJ} onChange={(v) => handleFormChange('precoCNPJ', v)} />
          <Field label="Quantidade (Kg)" placeholder="18,70" type="text" value={form.quantidade} onChange={(v) => handleFormChange('quantidade', v)} />
        </div>

        <div className="sectionActions">
          <button className="btn" onClick={handleCadastrar} disabled={submitting || isDeleting}>
            <Plus size={15} />
            {submitting ? 'Cadastrando...' : 'Novo produto'}
          </button>
          <button className="dangerBtn" onClick={handleDeleteByForm} disabled={isDeleting || submitting}>
            <Trash2 size={15} />
            {isDeleting && deletingId === form.nome.trim() ? 'Deletando...' : 'Deletar produto'}
          </button>
          <button className="ghostBtn" onClick={handleClear} disabled={submitting || isDeleting}>
            <X size={15} />
            Limpar campos
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Tabela base de produtos" subtitle="Clique no ícone de lixeira para deletar um produto diretamente pela tabela.">
        <div className="table modernTable productsTable">
          <div className="row head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
            <span>Produto</span>
            <span>Preço PF</span>
            <span>Preço CNPJ</span>
            <span>Quantidade (Kg)</span>
            <span>Status</span>
          </div>

          {tableLoading ? (
            <div className="row" style={{ justifyContent: 'center', padding: '1.5rem', color: 'var(--text-muted, #888)' }}>
              Carregando produtos...
            </div>
          ) : rows.length === 0 ? (
            <div className="row" style={{ justifyContent: 'center', padding: '1.5rem', color: 'var(--text-muted, #888)' }}>
              Nenhum produto cadastrado.
            </div>
          ) : (
            rows.map((row) => (
              <div
                className="row"
                key={row._sabor || row.product}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', alignItems: 'center' }}
              >
                <span>{row.product}</span>
                <span>{row.pricePF}</span>
                <span>{row.priceCNPJ}</span>
                <span>{row.quantity}</span>
                <span>
                  <span className={cx('pill', row.status === 'Ativo' ? 'ok' : 'mid')}>{row.status}</span>
                </span>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </>
  )
}

function DashboardPage() {
  return (
    <div className="pageStack">
      <div className="metricGrid compactMetrics">
        {DASHBOARD_SUMMARY.map((item) => (
          <MiniMetric key={item.label} title={item.label} value={item.value} detail={item.note} />
        ))}
      </div>

      <div className="splitGrid twoColsTop">
        <SectionCard title="Área reservada para gráficos" subtitle="Blocos prontos para conectar bibliotecas como Recharts ou ApexCharts.">
          <div className="chartPlaceholder tall">
            <div className="chartBars">
              <span style={{ height: '42%' }} />
              <span style={{ height: '65%' }} />
              <span style={{ height: '58%' }} />
              <span style={{ height: '84%' }} />
              <span style={{ height: '76%' }} />
              <span style={{ height: '92%' }} />
              <span style={{ height: '70%' }} />
            </div>
            <div className="chartLegend">
              <span>Jan</span>
              <span>Fev</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>Mai</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="KPIs comparativos" subtitle="Bom para ranking, mix por categoria e metas mensais.">
          <div className="summaryList">
            <div className="summaryItem">
              <span>Meta do mês</span>
              <strong>82%</strong>
            </div>
            <div className="summaryItem">
              <span>Categoria líder</span>
              <strong>Frutas frescas</strong>
            </div>
            <div className="summaryItem">
              <span>Melhor unidade</span>
              <strong>CD Principal</strong>
            </div>
            <div className="summaryItem">
              <span>Pior ruptura</span>
              <strong>Loja Norte</strong>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function StockPage() {
  return (
    <div className="pageStack">
      <div className="metricGrid compactMetrics">
        <MiniMetric title="Saldo total" value="38.940 Kg" detail="Consolidado do estoque atual" />
        <MiniMetric title="Entradas hoje" value="4.280 Kg" detail="Movimentação recebida no dia" />
        <MiniMetric title="Saídas hoje" value="3.860 Kg" detail="Pedidos e baixas operacionais" />
      </div>

      <SectionCard title="Posição de estoque" subtitle="Tabela central para saldos, mínimos, localização e alertas.">
        <div className="table modernTable stockTable">
          <div className="row head rowStock">
            <span>Produto</span>
            <span>Local</span>
            <span>Saldo</span>
            <span>Mínimo</span>
            <span>Status</span>
          </div>

          {STOCK_ROWS.map((row) => (
            <div className="row rowStock" key={`${row.product}-${row.location}`}>
              <span>{row.product}</span>
              <span>{row.location}</span>
              <span>{row.balance}</span>
              <span>{row.min}</span>
              <span>
                <span
                  className={cx(
                    'pill',
                    row.status === 'Saudável' ? 'ok' : row.status === 'Reposição' ? 'bad' : 'mid',
                  )}
                >
                  {row.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function EmployeesPage() {
  const [metrics, setMetrics] = useState({ loading: true, error: false, total: null, ativos: null, cargos: null })
  const [rows, setRows] = useState([])
  const [tableLoading, setTableLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadMetrics() {
      try {
        const res = await api.get('/api/funcionarios/metricas')
        if (ignore) return
        const data = res?.data ?? {}
        setMetrics({
          loading: false,
          error: false,
          total:  data.total_funcionarios ?? null,
          ativos: data.funcionarios_ativos ?? null,
          cargos: data.total_cargos ?? null,
        })
      } catch {
        if (ignore) return
        setMetrics({ loading: false, error: true, total: null, ativos: null, cargos: null })
      }
    }

    async function loadTabela() {
      try {
        const res = await api.get('/api/funcionarios/tabela')
        if (ignore) return
        setRows(Array.isArray(res?.data?.dados) ? res.data.dados : [])
      } catch {
        if (ignore) return
        setRows([])
      } finally {
        if (!ignore) setTableLoading(false)
      }
    }

    loadMetrics()
    loadTabela()
    return () => { ignore = true }
  }, [])

  function isAtivo(ultimoAcesso) {
    if (!ultimoAcesso) return false
    const ultimo = new Date(ultimoAcesso)
    if (isNaN(ultimo)) return false
    const diffHoras = (Date.now() - ultimo.getTime()) / (1000 * 60 * 60)
    return diffHoras < 24
  }

  function formatAcesso(ultimoAcesso) {
    if (!ultimoAcesso) return '—'
    const d = new Date(ultimoAcesso)
    if (isNaN(d)) return ultimoAcesso
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const val = (v) => metrics.loading ? 'Carregando...' : metrics.error ? '--' : String(v ?? '--')

  return (
    <div className="pageStack">
      <div className="metricGrid compactMetrics">
        <MiniMetric title="Funcionários Cadastrados" value={val(metrics.total)}  detail="Total de funcionários no sistema" />
        <MiniMetric title="Funcionários Ativos"      value={val(metrics.ativos)} detail="Com acesso nas últimas 24h" />
        <MiniMetric title="Quantidade de Cargos"     value={val(metrics.cargos)} detail="Cargos distintos cadastrados" />
      </div>

      <SectionCard title="Tabela de Funcionários" subtitle="Visualização completa dos funcionários cadastrados na plataforma.">
        <div className="table modernTable employeesTable">
          <div className="row head rowEmployees">
            <span>Nome</span>
            <span>Empresa</span>
            <span>Cargo</span>
            <span>Último Acesso</span>
            <span>Status</span>
          </div>

          {tableLoading && (
            <div className="row rowEmployees">
              <span style={{ gridColumn: '1 / -1', opacity: 0.5, padding: '4px 0' }}>Carregando...</span>
            </div>
          )}

          {!tableLoading && rows.length === 0 && (
            <div className="row rowEmployees">
              <span style={{ gridColumn: '1 / -1', opacity: 0.5, padding: '4px 0' }}>Nenhum dado disponível.</span>
            </div>
          )}

          {!tableLoading && rows.map((row, idx) => {
            const ativo = isAtivo(row.ultimo_acesso)
            return (
              <div className="row rowEmployees" key={idx}>
                <span>{row.nome ?? '—'}</span>
                <span>{row.empresa ?? '—'}</span>
                <span>{row.role ?? '—'}</span>
                <span>{formatAcesso(row.ultimo_acesso)}</span>
                <span>
                  <span className={cx('pill', ativo ? 'ok' : 'bad')}>
                    {ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard title="Cadastro de funcionário" subtitle="Preencha os campos para registrar um novo funcionário no sistema.">
        <div className="filtersGrid">
          <Field label="Nome"    placeholder="Nome completo"   value="" onChange={() => {}} />
          <Field label="Usuário" placeholder="Nome de usuário" value="" onChange={() => {}} />
          <Field label="Senha"   placeholder="Senha de acesso" type="password" value="" onChange={() => {}} />
          <Field label="Cargo"   placeholder="Ex: Estoquista"  value="" onChange={() => {}} />
          <Field label="Empresa" placeholder="Ex: Desfruta CD" value="" onChange={() => {}} />
        </div>

        <div className="sectionActions">
          <button className="btn" disabled>
            <Plus size={15} />
            Cadastrar funcionário
          </button>
          <button className="ghostBtn" disabled>
            <X size={15} />
            Limpar campos
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

function detectLogType(acao) {
  if (!acao) return 'neutral'
  const s = acao.toLowerCase()
  if (
    s.includes('delet') || s.includes('remov') || s.includes('exclu') ||
    s.includes('cancel') || s.includes('inativ')
  ) return 'delete'
  if (
    s.includes('adicion') || s.includes('cadastr') || s.includes('cri') ||
    s.includes('insert') || s.includes('novo') || s.includes('nova') ||
    s.includes('entrada')
  ) return 'add'
  if (
    s.includes('atualiz') || s.includes('edit') || s.includes('alter') ||
    s.includes('modif') || s.includes('ajust') || s.includes('atuali')
  ) return 'edit'
  return 'neutral'
}

const LOG_BADGE = {
  add:     { label: 'Adicionado', bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  delete:  { label: 'Deletado',   bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  edit:    { label: 'Editado',    bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  neutral: { label: 'Ação',       bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
}

function LogBadge({ acao }) {
  const type = detectLogType(acao)
  const { label, bg, color, dot } = LOG_BADGE[type]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 999,
      background: bg,
      color,
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: dot,
        flexShrink: 0,
      }} />
      {label}
    </span>
  )
}

function RecentActivityTable() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api
      .get('/api/logs')
      .then((res) => {
        const dados = res.data?.dados
        setLogs(Array.isArray(dados) ? dados : [])
      })
      .catch(() => {
        setError('Não foi possível carregar os logs.')
        setLogs([])
      })
      .finally(() => setLoading(false))
  }, [])

  function formatTimestamp(ts) {
    if (!ts) return '—'
    const d = new Date(ts)
    if (isNaN(d)) return ts
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <SectionCard title="Atividade recente" subtitle="Logs de ações dos usuários carregados da API.">
      <div className="table modernTable activityTable">
        <div className="row head rowActivity">
          <span>Data</span>
          <span>Usuário</span>
          <span>Ação</span>
        </div>

        {loading && (
          <div className="row rowActivity">
            <span style={{ gridColumn: '1 / -1', opacity: 0.5, padding: '4px 0' }}>Carregando...</span>
          </div>
        )}

        {!loading && error && (
          <div className="row rowActivity">
            <span style={{ gridColumn: '1 / -1', color: 'var(--red, #e55)' }}>{error}</span>
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="row rowActivity">
            <span style={{ gridColumn: '1 / -1', opacity: 0.5, padding: '4px 0' }}>Nenhum dado disponível.</span>
          </div>
        )}

        {!loading &&
          !error &&
          logs.map((item, idx) => (
            <div className="row rowActivity" key={idx}>
              <span>{formatTimestamp(item.timestamp)}</span>
              <span>{item.nome_usuario ?? '—'}</span>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.acao ?? '—'}
                </span>
                <LogBadge acao={item.acao} />
              </span>
            </div>
          ))}
      </div>
    </SectionCard>
  )
}

function MetricCard({ label, value, hint, tone = 'green' }) {
  return (
    <article className={cx('metricCard', `tone-${tone}`)}>
      <span className="metricLabel">{label}</span>
      <strong className="metricValue">{value}</strong>
      <p className="metricHint">{hint}</p>
    </article>
  )
}

function MiniMetric({ title, value, detail }) {
  return (
    <article className="miniMetric">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}

function SectionCard({ title, subtitle, children }) {
  return (
    <section className="panel sectionCard">
      <div className="panelHeader innerGap">
        <div>
          <h2 className="h2">{title}</h2>
          {subtitle ? <p className="sectionSubtitle">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}


function Field({ label, placeholder, type = 'text', value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </label>
  )
}
