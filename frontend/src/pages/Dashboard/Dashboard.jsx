import api from '../../api/axiosInstance'
import { useEffect, useState } from 'react'
import { MiniMetric, SectionCard } from '../../components/Cards'
import { DASHBOARD_SUMMARY } from '../../constants/nav'
import './Dashboard.css'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function DashboardPage() {
  const [volumeLoading, setVolumeLoading] = useState(true)
  const [volumeKg, setVolumeKg] = useState(null)
  const [volumeAnteriorLoading, setVolumeAnteriorLoading] = useState(true)
  const [volumeKgAnterior, setVolumeKgAnterior] = useState(null)
  const variacao_volume_kg = volumeKg != null && volumeKgAnterior ? ((volumeKg - volumeKgAnterior) / volumeKgAnterior) * 100 : null

  const [faturamentoLoading, setFaturamentoLoading] = useState(true)
  const [faturamento, setFaturamento] = useState(null)
  const [faturamentoPorTipoLoading, setFaturamentoPorTipoLoading] = useState(true)
  const [faturamentoPorTipo, setFaturamentoPorTipo] = useState(null)
  const [faturamentoAnteriorLoading, setFaturamentoAnteriorLoading] = useState(true)
  const [faturamentoAnterior, setFaturamentoAnterior] = useState(null)
  const variacao_faturamento = faturamento != null && faturamentoAnterior ? (( faturamento - faturamentoAnterior) / faturamentoAnterior) * 100 : null
  
  const [ticketMedioLoading, setTicketMedioLoading] = useState(true)
  const [ticketMedio, setTicketMedio] = useState(null)
  const [ticketMedioAnteriorLoading, setTicketMedioAnteriorLoading] = useState(true)
  const [ticketMedioAnterior, setTicketMedioAnterior] = useState(null)
  const varacao_ticket_medio = ticketMedio != null && ticketMedioAnterior ? ((ticketMedio - ticketMedioAnterior) / ticketMedioAnterior) * 100 : null

  async function loadVolume(ignore) {
    setVolumeLoading(true)
    try {
      const res = await api.get('/api/dashboard/volume-vendido')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setVolumeKg(data.dados ?? 0)
    } catch {
      if (ignore?.current) return
      setVolumeKg(null)
    } finally {
      if (!ignore?.current) setVolumeLoading(false)
    }
  }

  async function loadVolumeAnterior(ignore) {
    setVolumeAnteriorLoading(true)
    try {
      const res = await api.get('/api/dashboard/volume-vendido-anterior')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setVolumeKgAnterior(data.dados ?? 0)
    } catch {
      if (ignore?.current) return
      setVolumeKgAnterior(null)
    } finally {
      if (!ignore?.current) setVolumeAnteriorLoading(false)
    }
  }

  async function loadFaturamento(ignore) {
    setFaturamentoLoading(true)
    try {
      const res = await api.get('/api/dashboard/faturamento')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setFaturamento(data.dados ?? 0)
    } catch {
      if (ignore?.current) return
      setFaturamento(null)
    } finally {
      if (!ignore?.current) setFaturamentoLoading(false)
    }
  }

  async function loadFaturamentoPorTipo(ignore) {
    setFaturamentoPorTipoLoading(true)
    try {
      const res = await api.get('/api/dashboard/faturamento-por-tipo')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setFaturamentoPorTipo(data.dados ?? 0)
    } catch {
      if (ignore?.current) return
      setFaturamentoPorTipo(null)
    } finally {
      if (!ignore?.current) setFaturamentoPorTipoLoading(false)
    }
  }

  async function loadFaturamentoAnterior(ignore) {
    setFaturamentoAnteriorLoading(true)
    try {
      const res = await api.get('/api/dashboard/faturamento-anterior')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setFaturamentoAnterior(data?.dados ?? 0)
    } catch {
      if (ignore?.current) return
      setFaturamentoAnterior(null)
    } finally {
      if (!ignore?.current) setFaturamentoAnteriorLoading(false)
    }
  }

  async function loadTicketMedio(ignore) {
    setTicketMedioLoading(true)
    try {
      const res = await api.get('/api/dashboard/ticket_medio')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setTicketMedio(data.dados ?? 0)
    } catch {
      if (ignore?.current) return
      setTicketMedio(null)
    } finally {
      if (!ignore?.current) setTicketMedioLoading(false)
    }
  }

  async function loadTicketMedioAnterior(ignore) {
    setTicketMedioAnteriorLoading(true)
    try {
      const res = await api.get('/api/dashboard/ticket_medio-anterior')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setTicketMedioAnterior(data?.dados ?? 0)
    } catch {
      if (ignore.current) return
      setTicketMedio(null)
    } finally {
      if (!ignore?.current) setTicketMedioAnteriorLoading(false)
    }
  }

  useEffect(() => {
    const ignore = { current: false }
    loadVolume(ignore)
    loadVolumeAnterior(ignore)

    loadFaturamento(ignore)
    loadFaturamentoPorTipo(ignore)
    loadFaturamentoAnterior(ignore)

    loadTicketMedioAnterior(ignore)
    loadTicketMedio(ignore)
    return () => { ignore.current = true }
  }, [])

  return (
    <div className="pageStack">
      <div className="metricGrid compactMetrics">
        <MiniMetric
          title="Volume vendido"
          value={volumeLoading ? 'Carregando...' : volumeKg != null ? `${Number(volumeKg).toLocaleString('pt-BR')} Kg` : '--'}
          detail={
            variacao_volume_kg != null
            ? <span style={{ color: variacao_volume_kg >= 0 ? 'green' : 'red' }}>
                {variacao_volume_kg >= 0 ? '+' : ''}{variacao_volume_kg.toFixed(1)}% vs mês anterior
              </span>
            : "Sem dados do mês anterior"
          }
          />
        <MiniMetric
          title="Faturamento mensal"
          value={faturamentoLoading ? 'Carregando...' : faturamento != null ? `R$${Number(faturamento).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '--'}
          detail={
            variacao_faturamento != null
            ? <span style={{ color: variacao_faturamento >= 0 ? 'green' : 'red' }}>
                {variacao_faturamento >= 0 ? '+' : ''}{variacao_faturamento.toFixed(1)}% vs mês anterior
              </span>
            : "Sem dados do mês anterior"
          }
          />
        <MiniMetric
          title="Ticket Médio"
          value={ticketMedioLoading ? 'Carregando...' : ticketMedio != null ? `R$${Number(ticketMedio).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '--'}
          detail={
            varacao_ticket_medio != null
            ? <span style={{ color: varacao_ticket_medio >= 0 ? 'green' : 'red' }}>
                {varacao_ticket_medio >= 0 ? '+' : ''}{varacao_ticket_medio.toFixed(1)}% vs mês anterior
              </span>
            : "Sem dados do mês anterior"
          }
        />
      </div>

      <div className="splitGrid twoColsTop">
        <SectionCard title="Faturamento PF vs CNPJ" subtitle="Distribuição do faturamento por tipo de cliente no mês atual">
          <div>
            {faturamentoPorTipoLoading ? (
              <p>Carregando...</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pessoa Física', value : faturamentoPorTipo?.[0] ?? 0 },
                      { name: 'CNPJ', value : faturamentoPorTipo?.[1] ?? 0},
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={false}
                  >
                    <Cell fill="#22c55e"/>
                    <Cell fill="#f97316"/>
                  </Pie>
                  <Tooltip formatter={(v) => `R$${Number(v).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

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
