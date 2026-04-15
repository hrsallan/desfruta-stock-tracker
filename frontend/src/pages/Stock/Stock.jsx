import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus, Search, X } from 'lucide-react'
import api from '../../api/axiosInstance'
import { MiniMetric, SectionCard } from '../../components/Cards'
import { SelectField } from '../../components/FormFields'
import { cx, formatValidade, normalizeStockRows } from '../../utils/formatters'
import './Stock.css'
import { extractApiMessage } from '../../utils/api'
import Toast from '../../components/Toast'

function ProductDropdown({ value, onChange, options, loading }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))

  function select(opt) {
    onChange(opt)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="prodDropdown" ref={ref}>
      <button
        type="button"
        className={`prodDropdownTrigger${open ? ' open' : ''}`}
        onClick={() => !loading && setOpen((v) => !v)}
        disabled={loading}
      >
        <span className={value ? 'prodDropdownValue' : 'prodDropdownPlaceholder'}>
          {loading ? 'Carregando produtos...' : value || 'Selecionar produto...'}
        </span>
        <ChevronDown size={15} className={`prodDropdownChevron${open ? ' rotated' : ''}`} />
      </button>

      {open && (
        <div className="prodDropdownMenu">
          <div className="prodDropdownSearch">
            <Search size={13} />
            <input
              autoFocus
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')}>
                <X size={12} />
              </button>
            )}
          </div>
          <ul className="prodDropdownList">
            {filtered.length === 0 ? (
              <li className="prodDropdownEmpty">Nenhum produto encontrado</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt}
                  className={`prodDropdownItem${opt === value ? ' selected' : ''}`}
                  onClick={() => select(opt)}
                >
                  {opt}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export function StockPage() {
  const [rows, setRows] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [tableError, setTableError] = useState(false)
  const [metrics, setMetrics] = useState({ loading: true, error: false, saldo: null, entradas: null, saidas: null })
  const [stockForm, setStockForm] = useState({ produto: '', validade: '', quantidade: '', acao: '', tipo: '' })
  const [productOptions, setProductOptions] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  function handleStockFormChange(field, value) {
    setStockForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleStockClear() {
    setStockForm({ produto: '', validade: '', quantidade: '', acao: '', tipo: '' })
  }

  function notify(next) {
    setToast({ id: globalThis.crypto?.randomUUID?.() || String(Date.now()), ...next })
  }

  async function handleStockSalvar() {
    if (submitting) return
      const produto = stockForm.produto
      const quantidade_kg = stockForm.quantidade
      const validade = stockForm.validade
      const acao = stockForm.acao
      const tipo = stockForm.tipo
      if (acao === 'Venda' && !tipo) {
        notify({ type: 'error', title: 'Campo obrigatório', message: 'Selecione o tipo (PF ou CNPJ) para registrar uma venda.'})
        return
      }
      setSubmitting(true)
    try {
      await api.post('/api/estoque/movimentacoes', {sabor: produto, quantidade_kg, validade, acao, tipo})
      notify({ type: 'success', title: 'Produto salvo', message: `${produto} foi salvo com sucesso.`})
      handleStockClear()
      await loadTable({ current: false })
      await loadMetrics({ current: false })
    } catch (err) {
      const msg = extractApiMessage(err?.response?.data) || err?.message || 'Erro ao salvar produto.'
      notify({type: 'error', title: 'Erro ao salvar', message: msg})
    } finally {
      setSubmitting(false)
    }
  }

  async function loadProducts(ignore) {
    setProductsLoading(true)
    try {
      const res = await api.get('/api/estoque/produtos')
      if (ignore?.current) return
      const data = res?.data?.dados ?? res?.data?.data ?? res?.data ?? []
      setProductOptions(Array.isArray(data) ? data : [])
    } catch {
      if (ignore?.current) return
      setProductOptions([])
    } finally {
      if (!ignore?.current) setProductsLoading(false)
    }
  }

  async function loadTable(ignore) {
    setTableLoading(true)
    setTableError(false)
    try {
      const res = await api.get('/api/estoque/tabela')
      if (ignore?.current) return
      const data = res?.data?.dados ?? res?.data?.data ?? res?.data ?? []
      setRows(normalizeStockRows(Array.isArray(data) ? data : []))
    } catch {
      if (ignore?.current) return
      setTableError(true)
      setRows([])
    } finally {
      if (!ignore?.current) setTableLoading(false)
    }
  }

  async function loadMetrics(ignore) {
    try {
      const res = await api.get('/api/estoque/metricas')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setMetrics({
        loading: false, error: false,
        saldo:    data.saldo_total    ?? data.saldo    ?? null,
        entradas: data.entradas_hoje  ?? data.entradas ?? null,
        saidas:   data.saidas_hoje    ?? data.saidas   ?? null,
      })
    } catch {
      if (ignore?.current) return
      setMetrics({ loading: false, error: true, saldo: null, entradas: null, saidas: null })
    }
  }

  useEffect(() => {
    const ignore = { current: false }
    loadTable(ignore)
    loadMetrics(ignore)
    loadProducts(ignore)
    return () => { ignore.current = true }
  }, [])

  function fmtKg(v) {
    if (v == null) return '--'
    const n = Number(v)
    return Number.isFinite(n) ? `${n.toLocaleString('pt-BR')} Kg` : String(v)
  }

  const mVal = (raw) => metrics.loading ? 'Carregando...' : metrics.error ? '--' : fmtKg(raw)

  const [tableFilter, setTableFilter] = useState('Visão Geral')

  const filterOptions = ['Visão Geral', 'Disponível', 'Indisponível', 'Vencido']
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filterOpen])

  const tableFilterSelect = (
    <div className="stockFilterWrapper" ref={filterRef}>
      <span className="stockFilterLabel">Filtrar por</span>
      <div className="prodDropdown" style={{ minWidth: 160 }}>
        <button
          type="button"
          className={`prodDropdownTrigger${filterOpen ? ' open' : ''}`}
          style={{ height: 38, fontSize: 13, borderRadius: 10, padding: '0 12px' }}
          onClick={() => setFilterOpen((v) => !v)}
        >
          <span className="prodDropdownValue">{tableFilter}</span>
          <ChevronDown size={14} className={`prodDropdownChevron${filterOpen ? ' rotated' : ''}`} />
        </button>
        {filterOpen && (
          <div className="prodDropdownMenu">
            <ul className="prodDropdownList" style={{ padding: '6px' }}>
              {filterOptions.map((opt) => (
                <li
                  key={opt}
                  className={`prodDropdownItem${opt === tableFilter ? ' selected' : ''}`}
                  onClick={() => { setTableFilter(opt); setFilterOpen(false) }}
                >
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="pageStack">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="metricGrid compactMetrics">
        <MiniMetric title="Total de Produtos em Kg" value={mVal(metrics.saldo)}    detail="Somatório de todos os produtos em estoque (kg)" />
        <MiniMetric title="Entradas hoje" value={mVal(metrics.entradas)} detail="Movimentação recebida no dia" />
        <MiniMetric title="Saídas hoje"   value={mVal(metrics.saidas)}   detail="Pedidos e baixas operacionais" />
      </div>

      <SectionCard title="Registrar Movimentação" subtitle="Selecione o produto, quantidade e o tipo de ação a ser registrada.">
        <div className="filtersGrid">
          <div className="field">
            <span>Produto</span>
            <ProductDropdown
              value={stockForm.produto}
              onChange={(v) => handleStockFormChange('produto', v)}
              options={productOptions}
              loading={productsLoading}
            />
          </div>

          {/* <label className="field">
            <span>Validade</span>
            <input type="date" value={stockForm.validade} onChange={(e) => handleStockFormChange('validade', e.target.value)} />
          </label> */}

          <label className="field">
            <span>Quantidade (Kg)</span>
            <input type="text" placeholder="Ex: 50,00" value={stockForm.quantidade} onChange={(e) => handleStockFormChange('quantidade', e.target.value)} />
          </label>

          <SelectField
            label="Ação"
            value={stockForm.acao}
            onChange={(v) => handleStockFormChange('acao', v)}
            options={['Adicionar', 'Retirar', 'Venda', 'Vencido']}
            placeholder="Selecionar ação..."
          />

        {stockForm.acao === 'Venda' && (
          <SelectField
            label="Tipo"
            value={stockForm.tipo}
            onChange={(v) => handleStockFormChange('tipo', v)}
            options={['Pessoa Física (PF)', 'Pessoa Jurídica (CNPJ)']}
            placeholder="Selecionar tipo..."
          />
        )}
        </div>

        <div className="sectionActions">
          <button className="btn" onClick={handleStockSalvar}>
            <Plus size={15} />
            Salvar Alterações
          </button>
          <button className="ghostBtn" onClick={handleStockClear}>
            <X size={15} />
            Limpar Campos
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Tabela de Estoque" subtitle="Visualização completa dos produtos em estoque, preços e disponibilidade." headerAction={tableFilterSelect}>
        <div className="table modernTable stockTable">
          <div className="row head rowStock">
            <span>Produto</span>
            {/* <span>Validade</span> */}
            <span>Preço PF</span>
            <span>Preço CNPJ</span>
            <span>Quantidade (Kg)</span>
            <span>Status</span>
          </div>

          {tableLoading && (
            <div className="row rowStock">
              <span style={{ gridColumn: '1 / -1', opacity: 0.5, padding: '4px 0' }}>Carregando estoque...</span>
            </div>
          )}

          {!tableLoading && tableError && (
            <div className="row rowStock">
              <span style={{ gridColumn: '1 / -1', color: 'var(--red, #e55)', padding: '4px 0' }}>
                Não foi possível carregar os dados do estoque.
              </span>
            </div>
          )}

          {!tableLoading && !tableError && (() => {
            const filtered = tableFilter === 'Visão Geral'
              ? rows
              : rows.filter((r) => r.status === tableFilter)
            if (filtered.length === 0) return (
              <div className="row rowStock">
                <span style={{ gridColumn: '1 / -1', opacity: 0.5, padding: '4px 0' }}>Nenhum produto disponível.</span>
              </div>
            )
            return filtered.map((row) => (
              <div className="row rowStock" key={row.product}>
                <span>{row.product}</span>
                {/* <span>{formatValidade(row.validade)}</span> */}
                <span>{row.precoPF   ?? '--'}</span>
                <span>{row.precoCNPJ ?? '--'}</span>
                <span>{row.quantity  ?? '--'}</span>
                <span>
                  <span className={cx('pill', row.status === 'Disponível' ? 'ok' : row.status === 'Indisponível' ? 'bad' : row.status ? 'mid' : '')}>
                    {row.status ?? '--'}
                  </span>
                </span>
              </div>
            ))
          })()}
        </div>
      </SectionCard>
    </div>
  )
}
