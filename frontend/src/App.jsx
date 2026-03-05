import { useState } from 'react'
import logo from './assets/logo.svg'
import './global.css'
import api from './api/axiosInstance' // Certifique-se que o caminho está correto
import { ToastViewport } from './components/Toast'

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
      <path d="M4 4l16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function App() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados para capturar os dados do usuário
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // ===== Toasts (notificações) =====
  const [toasts, setToasts] = useState([])

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const notify = ({ type = 'info', title, message, duration }) => {
    const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)

    setToasts((prev) => {
      const next = [...prev, { id, type, title, message: String(message ?? ''), duration }]
      // evita empilhar infinito
      return next.slice(-3)
    })

    return id
  }

  const getApiErrorMessage = (error) => {
    const data = error?.response?.data
    if (!data) return error?.message || 'Erro ao realizar login.'

    if (typeof data === 'string') return data
    if (typeof data === 'object') {
      return (
        data.message ||
        data.msg ||
        data.error ||
        data.detail ||
        data.mensagem ||
        'Usuário ou senha inválidos.'
      )
    }

    return 'Usuário ou senha inválidos.'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Faz o POST para o seu backend Flask
      const response = await api.post('/login', {
        username: username,
        password: password
      })

      // Sucesso: Salva o token no localStorage
      localStorage.setItem('token', response.data.access_token)
      notify({
        type: 'success',
        title: 'Sucesso',
        message: 'Login realizado com sucesso!',
        duration: 3200,
      })
      console.log('Token recebido:', response.data.access_token)

    } catch (error) {
      console.error('Erro no login:', error)
      notify({
        type: 'error',
        title: 'Erro',
        message: getApiErrorMessage(error),
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />

      <header className="header">
        <img src={logo} alt="Logo Desfruta" />
      </header>

      <form onSubmit={handleSubmit}>
        <div className="inputContainer">
          <label htmlFor="user">NAME</label>
          <input 
            type="text" 
            name="user" 
            id="user" 
            placeholder="Gabriel Ogura"
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
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

        <button className="button" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              <span>Carregando...</span>
            </>
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