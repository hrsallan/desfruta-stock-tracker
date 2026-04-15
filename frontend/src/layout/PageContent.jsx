import { useMemo } from 'react'
import { NAV } from '../constants/nav'
import { HomePage } from '../pages/Home/Home'
import { ProductsPage } from '../pages/Products/Products'
import { DashboardPage } from '../pages/Dashboard/Dashboard'
import { StockPage } from '../pages/Stock/Stock'
import { EmployeesPage } from '../pages/Employees/Employees'

export function PageContent({ activeKey }) {
  const current = useMemo(() => NAV.find((item) => item.key === activeKey) ?? NAV[0], [activeKey])

  return (
    <div className="content">
      <div className="contentHeader">
        <div>
          <h1 className="h1">{current.label}</h1>
          <p className="muted">{current.description}</p>
        </div>
      </div>

      {activeKey === 'home'      && <HomePage />}
      {activeKey === 'products'  && <ProductsPage />}
      {activeKey === 'dashboard' && <DashboardPage />}
      {activeKey === 'stock'     && <StockPage />}
      {activeKey === 'employees' && <EmployeesPage />}
    </div>
  )
}
