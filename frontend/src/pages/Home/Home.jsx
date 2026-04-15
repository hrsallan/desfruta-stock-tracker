import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axiosInstance'
import { MetricCard } from '../../components/Cards'
import { HOME_METRICS } from '../../constants/nav'
import { extractApiMessage } from '../../utils/api'
import { formatKgValue } from '../../utils/formatters'
import { RecentActivityTable } from './components/RecentActivityTable'
import './Home.css'

export function HomePage() {
  const [metrics, setMetrics] = useState({ loading: true, error: '', totalKg: 0, disponiveis: 0, total: 0 })
  const [faturamentoLoading, setFaturamentoLoading] = useState(true)
  const [faturamento, setFaturamento] = useState(null)


  useEffect(() => {
    let ignore = false

    async function loadMetrics() {
      try {
        const res = await api.get('/api/menu/metrics')
        if (ignore) return
        const data       = res?.data ?? {}
        const quantidade = data?.quantidade ?? {}
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

    async function loadFaturamento() {
      try {
        const res = await api.get('/api/dashboard/faturamento')
        if (ignore) return
        const data = res?.data ?? {}
        setFaturamento(data?.dados ?? 0)
      } catch {
        if (ignore) return
        setFaturamento(null)
      } finally {
        if (!ignore) setFaturamentoLoading(false)
      }
    }

    loadMetrics()
    loadFaturamento()
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
      if (item.key === 'billing') {
        if (faturamentoLoading) return {...item, value: 'Carregando...', hint: 'Consultando faturamento.'}
        if (faturamento == null) return {...item, value: '--', hint: 'Não foi possível carregar o faturamento.'}
        return {
          ...item,
          label: 'Faturamento mensal',
          value: `R$${Number(faturamento).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
          hint: 'Total faturado no mês atual'
        }
      }
      return item
    })
  }, [metrics, faturamento, faturamentoLoading])

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
