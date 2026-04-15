import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { cx } from '../utils/formatters'
import { UserProfileCard } from './UserProfileCard'
import logo from '../assets/logo.svg'

export function Sidebar({ visibleNav, activeKey, onNavigate, onLogout, userName, userRole, userPhoto, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  return (
    <>
      <div
        className={cx('sidebarOverlay', mobileOpen && 'visible')}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={cx('sidebar', collapsed && 'collapsed', mobileOpen && 'mobileOpen')}>
        <div className="sidebarInner">

          <div className="brandRow">
            <div className="brand">
              <div className="brandLogo">
                <img src={logo} alt="Desfruta" />
              </div>
              {!collapsed && (
                <div className="brandText">
                  <div className="brandName">Desfruta</div>
                </div>
              )}
            </div>

            <button
              className="collapseBtn desktopOnly"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
              title={collapsed ? 'Expandir' : 'Recolher'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <div className="sidebarBody">
            <nav className="nav">
              {visibleNav.map((item) => {
                const Icon = item.icon
                const isActive = item.key === activeKey

                return (
                  <button
                    key={item.key}
                    className={cx('navItem', isActive && 'active')}
                    onClick={() => onNavigate(item.key)}
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
              <UserProfileCard
                userName={userName}
                userRole={userRole}
                userPhoto={userPhoto}
                collapsed={collapsed}
              />
              <div className="sidebarFooterDivider" />
              <button className="logoutBtn" onClick={onLogout} aria-label="Sair" title="Sair">
                <LogOut size={18} />
                {!collapsed && <span>Sair</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
