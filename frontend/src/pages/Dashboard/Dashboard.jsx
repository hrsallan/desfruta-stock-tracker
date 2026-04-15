import api from '../../api/axiosInstance'
import { useEffect, useState } from 'react'
import { MiniMetric, SectionCard } from '../../components/Cards'
import { DASHBOARD_SUMMARY } from '../../constants/nav'
import './Dashboard.css'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
  const [faturamentoAnualLoading, setFaturamentoAnualLoading] = useState(true)
  const [faturamentoAnual, setFaturamentoAnual] = useState(null)

  const variacao_faturamento = faturamento != null && faturamentoAnterior ? (( faturamento - faturamentoAnterior) / faturamentoAnterior) * 100 : null
  
  const [ticketMedioLoading, setTicketMedioLoading] = useState(true)
  const [ticketMedio, setTicketMedio] = useState(null)
  const [ticketMedioAnteriorLoading, setTicketMedioAnteriorLoading] = useState(true)
  const [ticketMedioAnterior, setTicketMedioAnterior] = useState(null)
  const varacao_ticket_medio = ticketMedio != null && ticketMedioAnterior ? ((ticketMedio - ticketMedioAnterior) / ticketMedioAnterior) * 100 : null

  const [top5ProdutosLoading, setTop5ProdutosLoading] = useState(true)
  const [top5Produtos, setTop5Produtos] = useState(null)

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

  async function loadFaturamentoAnual(ignore) {
    setFaturamentoAnualLoading(true)
    try{
      const res = await api.get('/api/dashboard/faturamento_anual')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setFaturamentoAnual(data?.dados ?? 0)
    } catch {
      if (ignore?.current) return
      setFaturamentoAnual(null)
    } finally {
      if (!ignore?.current) setFaturamentoAnualLoading(false)
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

  async function loadTop5Produtos(ignore) {
    setTop5ProdutosLoading(true)
    try{
      const res = await api.get('/api/dashboard/top5-produtos')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setTop5Produtos(data?.dados ?? 0)
    } catch {
      if (ignore?.current) return
      setTop5Produtos(null)
    } finally {
      if (!ignore?.current) setTop5ProdutosLoading(false)
    }
  }

  useEffect(() => {
    const ignore = { current: false }
    loadVolume(ignore)
    loadVolumeAnterior(ignore)

    loadFaturamento(ignore)
    loadFaturamentoPorTipo(ignore)
    loadFaturamentoAnterior(ignore)
    loadFaturamentoAnual(ignore)

    loadTicketMedioAnterior(ignore)
    loadTicketMedio(ignore)

    loadTop5Produtos(ignore)
    return () => { ignore.current = true }
  }, [])

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  const dadosGrafico = meses.map((nome, i) =>{
    const mes = String(i + 1).padStart(2, '0')
    const encontrado = (faturamentoAnual ?? []).find(([m]) => m === mes)
    return { name: nome, value: encontrado ? encontrado[1] : 0}
  })

  return (
    <div className="pageStack">
      <div className="metricGrid compactMetrics">
        <MiniMetric
          title="Volume vendido"
          value={volumeLoading ? 'Carregando...' : volumeKg != null ? `${Number(volumeKg).toLocaleString('pt-BR')} Kg` : '--'}
          detail={volumeKgAnterior != null && volumeKgAnterior > 0
            ? <>Mês anterior: <strong style={{ color: '#f97316', fontSize: 'inherit'}}>{Number(volumeKgAnterior).toLocaleString('pt-BR')} Kg</strong></>
            : "Sem dados do mês anterior"
          }
          />
        <MiniMetric
          title="Faturamento mensal"
          value={faturamentoLoading ? 'Carregando...' : faturamento != null ? `R$${Number(faturamento).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '--'}
          detail={faturamentoAnterior != null && faturamentoAnterior > 0
            ? <>Mês anterior: <strong style={{ color: '#f97316', fontSize: 'inherit'}}>R${Number(faturamentoAnterior).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></>
            : "Sem dados do mês anterior"
          }
        />
        <MiniMetric
          title="Ticket Médio"
          value={ticketMedioLoading ? 'Carregando...' : ticketMedio != null ? `R$${Number(ticketMedio).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '--'}
          detail={ticketMedioAnterior != null && ticketMedioAnterior > 0
            ? <>Mês anterior: <strong style={{ color: '#f97316', fontSize: 'inherit'}}>R${Number(ticketMedioAnterior).toLocaleString('pt-BR',{minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></>
            : "Sem dados do mês anterior"
          }
        />
      </div>

      <div className="splitGrid twoColsTop">
        <SectionCard title="Faturamento PF vs CNPJ" subtitle="Distribuição do faturamento por tipo de cliente no mês atual" className="pizzaCard">
          <div style={{ flex: 1 }}>
            {faturamentoPorTipoLoading ? (
              <p>Carregando...</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
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

        <SectionCard title="Top 5 produtos do mês" subtitle="Produtos mais vendidos em Kg no mês atual">
          {top5ProdutosLoading ? (
            <p>Carregando...</p>
          ) : !top5Produtos || top5Produtos.length === 0 ? (
            <p>Sem vendas este mês.</p>
          ) : (
            <div className="summaryList">
              {top5Produtos.map(([sabor, total], i) => (
                <div className="summaryItem" key={sabor}>
                  <span>{i + 1}. {sabor}</span>
                  <strong>{Number(total).toLocaleString('pt-BR')} Kg</strong>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div>
        <SectionCard title="Faturamento do ano" subtitle="Faturamento mensal consolidado do ano atual">
          {faturamentoAnualLoading ? (
            <p>Carregando...</p>
          ) : (
            <>
              <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </svg>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGrafico} margin={{ left: 10, right: 10, bottom: 10 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor='end'
                    height={45}
                    />
                  <YAxis
                    tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`}
                    ticks={[5000, 10000, 15000, 20000]}
                    width={50}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v) => `R$${Number(v).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`} />
                  <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
