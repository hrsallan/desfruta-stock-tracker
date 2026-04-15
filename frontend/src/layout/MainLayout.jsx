import { useEffect, useMemo, useState } from 'react'
import { Menu } from 'lucide-react'
import { cx } from '../utils/formatters'
import { NAV, EMPLOYEES_ROLES } from '../constants/nav'
import { Sidebar } from './Sidebar'
import { PageContent } from './PageContent'
import api from '../api/axiosInstance'

const MOBILE_BREAKPOINT = 860

export function MainLayout({ onLogout, userName, userRole }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('home')
  const [userPhoto, setUserPhoto] = useState(null)

  useEffect(() => {
    api.get('/api/me').then((res) => {
      const data = res?.data ?? {}
      const photo =
        data.photo ?? data.foto ?? data.avatar ?? data.picture ?? data.image_url ??
        data?.profile?.photo ?? data?.profile?.avatar ?? data?.user?.photo ?? data?.user?.avatar ?? null
      if (photo && typeof photo === 'string') setUserPhoto(photo)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        // Voltou pro desktop: fecha gaveta
        setMobileOpen(false)
      } else {
        // Entrou no mobile: reseta collapsed pra não interferir no CSS
        setCollapsed(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const canSeeEmployees = EMPLOYEES_ROLES.includes(userRole?.toLowerCase?.() || '')

  const visibleNav = useMemo(
    () => NAV.filter((item) => item.key !== 'employees' || canSeeEmployees),
    [canSeeEmployees]
  )

  const safeActive = visibleNav.find((item) => item.key === active) ? active : 'home'

  function handleNavigate(key) {
    setActive(key)
    setMobileOpen(false)
  }

  return (
    <div className={cx('layout', collapsed && 'isCollapsed')}>
      <Sidebar
        visibleNav={visibleNav}
        activeKey={safeActive}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        userName={userName}
        userRole={userRole}
        userPhoto={userPhoto}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main className="main">
        <header className="mobileTopbar">
          <button
            className="mobileMenuBtn"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        </header>

        <PageContent activeKey={safeActive} userName={userName} userRole={userRole} />
      </main>
    </div>
  )
}
