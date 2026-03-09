import { useMemo, useState } from 'react'

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
  { key: 'home', label: 'Menu Principal', icon: Home },
  { key: 'products', label: 'Gerenciar Produtos', icon: Package },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'stock', label: 'Gerenciar Estoque', icon: Warehouse },
  { key: 'employees', label: 'Funcionários', icon: Users },
]

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

    // fallback: busca qualquer string legível
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

  // Se já tem token, entra direto no menu
  if (token) {
    return (
      <MainLayout
        onLogout={() => {
          localStorage.removeItem('token')
          setToken(null)
        }}
      />
    )
  }

  return <LoginPage onAuthed={(t) => setToken(t)} />
}

function LoginPage({ onAuthed }) {
  const [showPassword, setShowPassword] = useState(false)
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  function notify(next) {
    setToast({ id: (globalThis.crypto?.randomUUID?.() || String(Date.now())), ...next })
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
      // Ajuste a rota se seu backend usar outra (ex.: /auth/api/login)
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
      notify({ type: 'success', title: 'Login realizado', message: 'Bem-vindo!' })

      // “Redireciona” para o menu principal (SPA)
      onAuthed(accessToken)
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

function PageContent({ activeKey }) {
  const title = useMemo(() => {
    const item = NAV.find((n) => n.key === activeKey)
    return item?.label ?? 'Menu Principal'
  }, [activeKey])

  return (
    <div className="content">
      <div className="contentHeader">
        <div>
          <h1 className="h1">{title}</h1>
          <p className="muted">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.
          </p>
        </div>

        <div className="topActions">
          <div className="search">
            <Search size={18} />
            <input placeholder="Pesquisar..." />
          </div>

          <button className="iconBtn" aria-label="Notificações">
            <Bell size={18} />
          </button>

          <div className="avatar" title="Usuário">
            <span>AS</span>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="cardTitle">Resumo</div>
          <div className="cardValue">1.248</div>
          <div className="cardHint">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
        </div>

        <div className="card">
          <div className="cardTitle">Indicadores</div>
          <div className="cardValue accent">R$ 18.940</div>
          <div className="cardHint">Lorem ipsum dolor sit amet, sed do eiusmod tempor.</div>
        </div>

        <div className="card">
          <div className="cardTitle">Alertas</div>
          <div className="cardValue warn">3</div>
          <div className="cardHint">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2 className="h2">Atividade recente</h2>
          <button className="btn">Ver tudo</button>
        </div>

        <div className="table">
          <div className="row head">
            <span>Data</span>
            <span>Ação</span>
            <span>Status</span>
          </div>

          {Array.from({ length: 6 }).map((_, i) => (
            <div className="row" key={i}>
              <span>2026-03-0{i + 1}</span>
              <span>Lorem ipsum dolor sit amet</span>
              <span>
                <span className={cx('pill', i % 3 === 0 ? 'ok' : i % 3 === 1 ? 'mid' : 'bad')}>
                  {i % 3 === 0 ? 'Concluído' : i % 3 === 1 ? 'Em andamento' : 'Pendente'}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MainLayout({ onLogout }) {
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('home')

  return (
    <div className="layout">
      <aside className={cx('sidebar', collapsed && 'collapsed')}>
        <div className="brand">
          <div className="brandLogo">
            <img src={logo} alt="Desfruta" />
          </div>

          {!collapsed && (
            <div className="brandText">
              <div className="brandName">Desfruta</div>
              <div className="brandSub">Stock Tracker</div>
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
          </button>
        </div>
      </aside>

      <main className="main">
        <PageContent activeKey={active} />
      </main>
    </div>
  )
}
