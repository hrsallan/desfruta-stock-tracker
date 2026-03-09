import { useEffect, useMemo, useState } from 'react'

import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Users,
  Warehouse,
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
    value: '248.730 Kg',
    hint: 'Base pronta para receber o somatório vindo do endpoint de estoque consolidado.',
    tone: 'green',
  },
  {
    key: 'availability',
    label: 'Variações disponíveis',
    value: '14/20',
    hint: 'Integração ativa com /api/menu/produtos-disponiveis para mostrar disponíveis/total.',
    tone: 'orange',
  },
  {
    key: 'billing',
    label: 'Faturamento mensal',
    value: 'R$ 186.400',
    hint: 'Estrutura preparada para consolidar o mês corrente e comparar com o anterior.',
    tone: 'dark',
  },
]

const RECENT_ACTIVITY = [
  { date: '09/03/2026 08:12', action: 'Entrada de lote de banana prata', status: 'Concluído' },
  { date: '09/03/2026 08:47', action: 'Ajuste de peso no item Abacaxi Pérola', status: 'Em andamento' },
  { date: '09/03/2026 09:03', action: 'Conferência de estoque do setor hortifruti', status: 'Pendente' },
  { date: '09/03/2026 09:18', action: 'Atualização de preço em produtos premium', status: 'Concluído' },
  { date: '09/03/2026 10:02', action: 'Cadastro de nova variação de manga palmer', status: 'Em andamento' },
  { date: '09/03/2026 10:16', action: 'Validação de inventário do CD principal', status: 'Pendente' },
]

const PRODUCTS_ROWS = [
  {
    product: 'Banana Prata',
    category: 'Frutas',
    unit: 'Kg',
    price: 'R$ 6,50',
    status: 'Ativo',
    integration: 'GET /api/products',
  },
  {
    product: 'Abacaxi Pérola',
    category: 'Frutas',
    unit: 'Kg',
    price: 'R$ 7,90',
    status: 'Rascunho',
    integration: 'POST /api/products',
  },
  {
    product: 'Tomate Italiano',
    category: 'Legumes',
    unit: 'Kg',
    price: 'R$ 8,20',
    status: 'Ativo',
    integration: 'PATCH /api/products/:id',
  },
  {
    product: 'Uva Vitória',
    category: 'Frutas Premium',
    unit: 'Bandeja',
    price: 'R$ 14,00',
    status: 'Ativo',
    integration: 'DELETE /api/products/:id',
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

const EMPLOYEE_ROWS = [
  {
    name: 'Amanda Souza',
    role: 'Analista de Estoque',
    unit: 'CD Principal',
    profile: 'Operacional',
    status: 'Ativo',
  },
  {
    name: 'Bruno Lima',
    role: 'Supervisor',
    unit: 'Loja Centro',
    profile: 'Gestão',
    status: 'Ativo',
  },
  {
    name: 'Carla Mendes',
    role: 'Compradora',
    unit: 'Matriz',
    profile: 'Financeiro',
    status: 'Férias',
  },
  {
    name: 'Diego Alves',
    role: 'Estoquista',
    unit: 'Loja Norte',
    profile: 'Operacional',
    status: 'Ativo',
  },
]

const API_BLUEPRINTS = {
  home: [
    'GET /api/home/summary',
    'GET /api/home/activity/recent',
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

function normalizeAvailabilityData(data) {
  const source = data?.dados ?? data?.data ?? data ?? {}
  const disponiveis = Number(source?.disponiveis ?? source?.disponivel ?? source?.available ?? 0)
  const total = Number(source?.total ?? source?.total_variacoes ?? source?.variacoes_total ?? 0)

  return {
    disponiveis: Number.isFinite(disponiveis) ? disponiveis : 0,
    total: Number.isFinite(total) ? total : 0,
  }
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

              {!collapsed && (
                <div className="hintBox">
                  <div className="hintTitle">Base pronta para API</div>
                  <div className="hintText">
                    Cada aba já está estruturada com cards, tabelas e blocos para conectar endpoints.
                  </div>
                </div>
              )}
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
          <div className="search">
            <Search size={18} />
            <input placeholder={`Pesquisar em ${current.label.toLowerCase()}...`} />
          </div>

          <button className="iconBtn" aria-label="Notificações">
            <Bell size={18} />
          </button>

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
  const [availability, setAvailability] = useState({
    loading: true,
    error: '',
    disponiveis: 0,
    total: 0,
  })

  useEffect(() => {
    let ignore = false

    async function loadAvailability() {
      try {
        const res = await api.get('/api/menu/produtos-disponiveis')
        const parsed = normalizeAvailabilityData(res?.data)

        if (ignore) return
        setAvailability({
          loading: false,
          error: '',
          ...parsed,
        })
      } catch (err) {
        if (ignore) return

        setAvailability({
          loading: false,
          error: extractApiMessage(err?.response?.data) || 'Não foi possível carregar as variações disponíveis.',
          disponiveis: 0,
          total: 0,
        })
      }
    }

    loadAvailability()

    return () => {
      ignore = true
    }
  }, [])

  const homeMetrics = useMemo(() => {
    return HOME_METRICS.map((item) => {
      if (item.key !== 'availability') return item

      if (availability.loading) {
        return {
          ...item,
          value: 'Carregando...',
          hint: 'Consultando a API /api/menu/produtos-disponiveis.',
        }
      }

      if (availability.error) {
        return {
          ...item,
          value: '--',
          hint: availability.error,
        }
      }

      return {
        ...item,
        value: `${availability.disponiveis}/${availability.total}`,
        hint: `Variações com estoque disponível em relação ao total cadastrado na API.`,
      }
    })
  }, [availability])

  return (
    <>
      <section className="heroCard">
        <div>
          <span className="eyebrow">Painel principal</span>
          <h2 className="heroTitle">Resumo central da operação com card de disponibilidade ligado à API.</h2>
          <p className="heroText">
            Este bloco foi desenhado para ser a entrada do sistema, destacando peso total em Kg,
            quantidade de variações disponíveis, faturamento mensal e o histórico recente da operação.
          </p>
        </div>

        <div className="heroBadges">
          <span className="softBadge">Visão diária</span>
          <span className="softBadge">Consolidação mensal</span>
          <span className="softBadge">API aplicada</span>
        </div>
      </section>

      <div className="metricGrid">
        {homeMetrics.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </div>

      <ApiBlueprintCard
        title="Integração sugerida para o menu principal"
        items={API_BLUEPRINTS.home}
        notes={[
          'O card de variações disponíveis já consome o endpoint autenticado /api/menu/produtos-disponiveis.',
          'Popular a tabela de atividade com paginação ou limite de registros.',
          'Adicionar loading e tratamento de erro na busca inicial.',
        ]}
      />

      <RecentActivityTable />
    </>
  )
}

function ProductsPage() {
  return (
    <>
      <div className="metricGrid compactMetrics">
        <MiniMetric title="Produtos cadastrados" value="1.284" detail="Base mockada para futura listagem da API" />
        <MiniMetric title="Categorias ativas" value="18" detail="Pode vir de /api/products/categories" />
        <MiniMetric title="Itens em rascunho" value="07" detail="Bom para sinalizar cadastros incompletos" />
      </div>

      <div className="splitGrid twoColsTop">
        <SectionCard title="Filtros e cadastro rápido" subtitle="Estrutura-base para busca, categoria, unidade e status.">
          <div className="filtersGrid">
            <Field label="Produto" placeholder="Nome ou SKU" />
            <Field label="Categoria" placeholder="Selecione uma categoria" />
            <Field label="Unidade" placeholder="Kg, caixa, bandeja..." />
            <Field label="Status" placeholder="Ativo, rascunho, inativo" />
          </div>

          <div className="sectionActions">
            <button className="btn">Novo produto</button>
            <button className="ghostBtn">Limpar filtros</button>
          </div>
        </SectionCard>

        <ApiBlueprintCard
          title="Blueprint de endpoints"
          items={API_BLUEPRINTS.products}
          notes={[
            'Tabela pronta para listagem paginada.',
            'Formulário pode enviar multipart se houver imagem do produto.',
            'Recomendado centralizar validações antes do POST e PATCH.',
          ]}
        />
      </div>

      <SectionCard title="Tabela base de produtos" subtitle="Estrutura visual pronta para receber paginação, ordenação e ações por linha.">
        <div className="table modernTable productsTable">
          <div className="row head rowProducts">
            <span>Produto</span>
            <span>Categoria</span>
            <span>Unidade</span>
            <span>Preço</span>
            <span>Status</span>
            <span>Integração</span>
          </div>

          {PRODUCTS_ROWS.map((row) => (
            <div className="row rowProducts" key={`${row.product}-${row.integration}`}>
              <span>{row.product}</span>
              <span>{row.category}</span>
              <span>{row.unit}</span>
              <span>{row.price}</span>
              <span>
                <span className={cx('pill', row.status === 'Ativo' ? 'ok' : 'mid')}>{row.status}</span>
              </span>
              <span className="monoText">{row.integration}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  )
}

function DashboardPage() {
  return (
    <>
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

      <ApiBlueprintCard
        title="Integração sugerida para análises"
        items={API_BLUEPRINTS.dashboard}
        notes={[
          'Separar dados de cards e gráficos em endpoints independentes melhora desempenho.',
          'Ideal usar parâmetros de período e unidade no backend.',
          'Adicionar cache local para evitar consultas repetidas em filtros iguais.',
        ]}
      />
    </>
  )
}

function StockPage() {
  return (
    <>
      <div className="metricGrid compactMetrics">
        <MiniMetric title="Saldo total" value="38.940 Kg" detail="Consolidado do estoque atual" />
        <MiniMetric title="Entradas hoje" value="4.280 Kg" detail="Movimentação recebida no dia" />
        <MiniMetric title="Saídas hoje" value="3.860 Kg" detail="Pedidos e baixas operacionais" />
      </div>

      <div className="splitGrid twoColsTop">
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

        <ApiBlueprintCard
          title="Integração sugerida para estoque"
          items={API_BLUEPRINTS.stock}
          notes={[
            'Útil separar saldo consolidado de movimentações detalhadas.',
            'Entradas e saídas podem usar o mesmo form com tipo de movimento.',
            'Alertas de ruptura podem ser calculados no backend ou no frontend.',
          ]}
        />
      </div>
    </>
  )
}

function EmployeesPage() {
  return (
    <>
      <div className="metricGrid compactMetrics">
        <MiniMetric title="Funcionários ativos" value="42" detail="Total em operação" />
        <MiniMetric title="Perfis cadastrados" value="05" detail="Operacional, gestão, compras, etc." />
        <MiniMetric title="Unidades com equipe" value="06" detail="Distribuição da força de trabalho" />
      </div>

      <div className="splitGrid twoColsTop">
        <SectionCard title="Base de colaboradores" subtitle="Tabela preparada para integrar permissões, cargo e situação atual.">
          <div className="table modernTable employeesTable">
            <div className="row head rowEmployees">
              <span>Nome</span>
              <span>Cargo</span>
              <span>Unidade</span>
              <span>Perfil</span>
              <span>Status</span>
            </div>

            {EMPLOYEE_ROWS.map((row) => (
              <div className="row rowEmployees" key={`${row.name}-${row.unit}`}>
                <span>{row.name}</span>
                <span>{row.role}</span>
                <span>{row.unit}</span>
                <span>{row.profile}</span>
                <span>
                  <span className={cx('pill', row.status === 'Ativo' ? 'ok' : 'mid')}>{row.status}</span>
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Perfis e permissões" subtitle="Base visual para controlar acessos por módulo.">
          <div className="permissionList">
            <div className="permissionItem">
              <strong>Operacional</strong>
              <span>Acesso a estoque, produtos e atividades recentes.</span>
            </div>
            <div className="permissionItem">
              <strong>Gestão</strong>
              <span>Acesso completo a dashboard, faturamento e relatórios.</span>
            </div>
            <div className="permissionItem">
              <strong>Financeiro</strong>
              <span>Consulta de faturamento, custos e fechamento mensal.</span>
            </div>
          </div>
        </SectionCard>
      </div>

      <ApiBlueprintCard
        title="Integração sugerida para funcionários"
        items={API_BLUEPRINTS.employees}
        notes={[
          'Separar autenticação de cadastro de colaboradores ajuda na manutenção.',
          'Recomendado trazer permissões junto com o perfil de acesso.',
          'Pode ser interessante cachear a lista de perfis para formulários.',
        ]}
      />
    </>
  )
}

function RecentActivityTable() {
  return (
    <SectionCard title="Atividade recente" subtitle="Tabela mantida conforme solicitado, pronta para leitura do backend.">
      <div className="table modernTable activityTable">
        <div className="row head rowActivity">
          <span>Data</span>
          <span>Ação</span>
          <span>Status</span>
        </div>

        {RECENT_ACTIVITY.map((item) => (
          <div className="row rowActivity" key={`${item.date}-${item.action}`}>
            <span>{item.date}</span>
            <span>{item.action}</span>
            <span>
              <span
                className={cx(
                  'pill',
                  item.status === 'Concluído' ? 'ok' : item.status === 'Em andamento' ? 'mid' : 'bad',
                )}
              >
                {item.status}
              </span>
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

function ApiBlueprintCard({ title, items, notes }) {
  return (
    <section className="panel apiPanel">
      <div className="panelHeader innerGap">
        <div>
          <h2 className="h2">{title}</h2>
          <p className="sectionSubtitle">Pontos sugeridos para integrar as futuras APIs.</p>
        </div>
      </div>

      <div className="apiList">
        {items.map((item) => (
          <div className="apiItem" key={item}>
            <span className="apiMethod">API</span>
            <code>{item}</code>
          </div>
        ))}
      </div>

      <ul className="apiNotes">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  )
}

function Field({ label, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="text" placeholder={placeholder} />
    </label>
  )
}
