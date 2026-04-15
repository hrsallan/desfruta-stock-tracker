import { useEffect, useState } from 'react'
import { LoginPage } from './pages/Login/Login'
import { MainLayout } from './layout/MainLayout'
import { resolveUserInfo } from './utils/user'
import './global.css'

export function App() {
  const [token, setToken]           = useState(() => localStorage.getItem('token'))
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('display_name') || 'Usuário do sistema')
  const [userRole, setUserRole]     = useState(() => (localStorage.getItem('user_role') || '').toLowerCase())

  useEffect(() => {
    if (!token) return
    let ignore = false

    resolveUserInfo(localStorage.getItem('display_name') || 'Usuário do sistema').then(({ name, role }) => {
      if (ignore) return
      localStorage.setItem('display_name', name)
      localStorage.setItem('user_role', role.toLowerCase())
      setDisplayName(name)
      setUserRole(role.toLowerCase())
    })
    return () => { ignore = true }
  }, [token])

  useEffect (() => {
    function handleExpired() {
      setToken(null)
      setDisplayName('Usuário do sistema')
      setUserRole('')
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  if (token) {
    return (
      <MainLayout
        userName={displayName}
        userRole={userRole}
        onLogout={() => {
          localStorage.removeItem('token')
          localStorage.removeItem('display_name')
          localStorage.removeItem('user_role')
          setToken(null)
          setDisplayName('Usuário do sistema')
          setUserRole('')
        }}
      />
    )
  }

  return (
    <LoginPage
      onAuthed={(nextToken, nextDisplayName, nextRole) => {
        setToken(nextToken)
        setDisplayName(nextDisplayName)
        setUserRole(nextRole || '')
      }}
    />
  )
}
