import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import api from '../../api/axiosInstance'
import Toast from '../../components/Toast'
import { MiniMetric, SectionCard } from '../../components/Cards'
import { Field } from '../../components/FormFields'
import { extractApiMessage } from '../../utils/api'
import { cx, normalizeTableRows, parseCurrencyInput } from '../../utils/formatters'
import { ProductAtualizarModal, ProductCadastrarModal, ProductDeletarModal } from './components/ProductModals'
import './Products.css'

export function ProductsPage() {
  const [rows, setRows] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [metrics, setMetrics] = useState({ loading: true, error: false, total: null, disponiveis: null, porcentagem: null })
  const [showCadastrarConfirm, setShowCadastrarConfirm] = useState(false)
  const [showDeletarConfirm, setShowDeletarConfirm] = useState(false)
  const [showAtualizarConfirm, setShowAtualizarConfirm] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [form, setForm] = useState({ nome: '', precoPF: '', precoCNPJ: '', quantidade: '' })

  function notify(next) {
    setToast({ id: globalThis.crypto?.randomUUID?.() || String(Date.now()), ...next })
  }

  async function loadTable(ignore) {
    setTableLoading(true)
    try {
      const res = await api.get('/api/produtos/tabela')
      if (ignore?.current) return
      const data = res?.data?.dados ?? res?.data?.data ?? res?.data ?? []
      setRows(normalizeTableRows(data))
    } catch {
      if (ignore?.current) return
      setRows(normalizeTableRows())
    } finally {
      if (!ignore?.current) setTableLoading(false)
    }
  }

  async function loadMetrics(ignore) {
    try {
      const res = await api.get('/api/produtos/metricas')
      if (ignore?.current) return
      const data = res?.data ?? {}
      setMetrics({
        loading: false, error: false,
        total: data.total ?? null,
        disponiveis: data.disponiveis ?? null,
        porcentagem: data.porcentagem ?? null,
      })
    } catch {
      if (ignore?.current) return
      setMetrics({ loading: false, error: true, total: null, disponiveis: null, porcentagem: null })
    }
  }

  useEffect(() => {
    const ignore = { current: false }
    loadTable(ignore)
    loadMetrics(ignore)
    return () => { ignore.current = true }
  }, [])

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleClear() {
    setForm({ nome: '', precoPF: '', precoCNPJ: '', quantidade: '' })
  }

  function handleCadastrarClick() {
    const sabor = form.nome.trim()
    const preco_pf = parseCurrencyInput(form.precoPF)
    const preco_cnpj = parseCurrencyInput(form.precoCNPJ)
    const quantidade_kg = parseCurrencyInput(form.quantidade)
    if (!sabor) { notify({ type: 'error', title: 'Campo obrigatório', message: 'Informe o nome do produto.' }); return }
    if (preco_pf === null) { notify({ type: 'error', title: 'Campo inválido', message: 'Informe um Preço PF válido (ex: 6,50).' }); return }
    if (preco_cnpj === null) { notify({ type: 'error', title: 'Campo inválido', message: 'Informe um Preço CNPJ válido (ex: 5,80).' }); return }
    if (quantidade_kg === null) { notify({ type: 'error', title: 'Campo inválido', message: 'Informe a Quantidade em Kg válida (ex: 18,70).' }); return }
    setShowCadastrarConfirm(true)
  }

  async function handleConfirmCadastrar() {
    if (submitting) return
    const sabor = form.nome.trim()
    const preco_pf = parseCurrencyInput(form.precoPF)
    const preco_cnpj = parseCurrencyInput(form.precoCNPJ)
    const quantidade_kg = parseCurrencyInput(form.quantidade)
    setSubmitting(true)
    try {
      await api.post('/api/produtos/cadastrar', { sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel: 'Ativo' })
      notify({ type: 'success', title: 'Produto cadastrado', message: `${sabor} foi cadastrado com sucesso.` })
      handleClear()
      setShowCadastrarConfirm(false)
      await loadTable({ current: false })
      await loadMetrics({ current: false })
    } catch (err) {
      const msg = extractApiMessage(err?.response?.data) || err?.message || 'Erro ao cadastrar produto.'
      notify({ type: 'error', title: 'Erro ao cadastrar', message: msg })
      setShowCadastrarConfirm(false)
    } finally {
      setSubmitting(false)
    }
  }

  function handleAtualizarClick() {
    const sabor = form.nome.trim()
    const preco_pf = parseCurrencyInput(form.precoPF)
    const preco_cnpj = parseCurrencyInput(form.precoCNPJ)
    const quantidade_kg = parseCurrencyInput(form.quantidade)
    if (!sabor) { notify({ type: 'error', title: 'Campo obrigatório', message: 'Informe o nome do produto a ser atualizado.' }); return }
    if (preco_pf === null) { notify({ type: 'error', title: 'Campo inválido', message: 'Informe um Preço PF válido (ex: 6,50).' }); return }
    if (preco_cnpj === null) { notify({ type: 'error', title: 'Campo inválido', message: 'Informe um Preço CNPJ válido (ex: 5,80).' }); return }
    if (quantidade_kg === null) { notify({ type: 'error', title: 'Campo inválido', message: 'Informe a Quantidade em Kg válida (ex: 18,70).' }); return }
    setShowAtualizarConfirm(true)
  }

  async function handleConfirmAtualizar() {
    if (updating) return
    const sabor = form.nome.trim()
    const preco_pf = parseCurrencyInput(form.precoPF)
    const preco_cnpj = parseCurrencyInput(form.precoCNPJ)
    const quantidade_kg = parseCurrencyInput(form.quantidade)
    setUpdating(true)
    try {
      await api.put('/api/produtos/atualizar', { sabor, preco_pf, preco_cnpj, quantidade_kg, disponivel: 'Ativo' })
      notify({ type: 'success', title: 'Produto atualizado', message: `${sabor} foi atualizado com sucesso.` })
      handleClear()
      setShowAtualizarConfirm(false)
      await loadTable({ current: false })
      await loadMetrics({ current: false })
    } catch (err) {
      const msg = extractApiMessage(err?.response?.data) || err?.message || 'Erro ao atualizar produto.'
      notify({ type: 'error', title: 'Erro ao atualizar', message: msg })
      setShowAtualizarConfirm(false)
    } finally {
      setUpdating(false)
    }
  }

  function handleDeletarClick() {
    const sabor = form.nome.trim()
    if (!sabor) { notify({ type: 'error', title: 'Campo obrigatório', message: 'Informe o nome do produto a ser deletado.' }); return }
    setShowDeletarConfirm(true)
  }

  async function handleConfirmDeletar() {
    if (deleting) return
    const sabor = form.nome.trim()
    setDeleting(true)
    setDeletingId(sabor)
    try {
      await api.delete('/api/produtos/deletar', { data: { sabor } })
      notify({ type: 'success', title: 'Produto removido', message: `${sabor} foi deletado com sucesso.` })
      handleClear()
      setShowDeletarConfirm(false)
      await loadTable({ current: false })
      await loadMetrics({ current: false })
    } catch (err) {
      const msg = extractApiMessage(err?.response?.data) || err?.message || 'Erro ao deletar produto.'
      notify({ type: 'error', title: 'Erro ao deletar', message: msg })
      setShowDeletarConfirm(false)
    } finally {
      setDeleting(false)
      setDeletingId(null)
    }
  }

  const metricTotal       = metrics.loading ? 'Carregando...' : metrics.error ? '--' : String(metrics.total ?? '--')
  const metricAtivos      = metrics.loading ? 'Carregando...' : metrics.error ? '--' : String(metrics.disponiveis ?? '--')
  const metricPorcentagem = metrics.loading ? 'Carregando...' : metrics.error ? '--' : metrics.porcentagem != null ? `${metrics.porcentagem}%` : '--'
  const isDeleting        = deletingId !== null

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {showCadastrarConfirm && (
        <ProductCadastrarModal
          form={form}
          submitting={submitting}
          onConfirm={handleConfirmCadastrar}
          onCancel={() => setShowCadastrarConfirm(false)}
        />
      )}

      {showAtualizarConfirm && (
        <ProductAtualizarModal
          form={form}
          updating={updating}
          onConfirm={handleConfirmAtualizar}
          onCancel={() => setShowAtualizarConfirm(false)}
        />
      )}

      {showDeletarConfirm && (
        <ProductDeletarModal
          nome={form.nome.trim()}
          deleting={deleting}
          onConfirm={handleConfirmDeletar}
          onCancel={() => setShowDeletarConfirm(false)}
        />
      )}

      <div className="metricGrid compactMetrics">
        <MiniMetric title="Produtos cadastrados"   value={metricTotal}       detail="Total de produtos no sistema" />
        <MiniMetric title="Produtos Ativos"        value={metricAtivos}      detail="Produtos disponíveis para venda" />
      </div>

      <SectionCard title="Cadastro Rápido" subtitle="Cadastro completo do produto, contendo todos os campos necessários.">
        <div className="filtersGrid">
          <Field label="Nome do Produto" placeholder="Nome do produto" value={form.nome} onChange={(v) => handleFormChange('nome', v)} />
          <Field label="Quantidade (Kg)" placeholder="18,70" type="text" value={form.quantidade} onChange={(v) => handleFormChange('quantidade', v)} />
          <Field label="Preço PF" placeholder="6,50" type="text" value={form.precoPF} onChange={(v) => handleFormChange('precoPF', v)} />
          <Field label="Preço CNPJ" placeholder="5,80" type="text" value={form.precoCNPJ} onChange={(v) => handleFormChange('precoCNPJ', v)} />
        </div>

        <div className="sectionActions">
          <button className="btn" onClick={handleCadastrarClick} disabled={submitting || isDeleting || deleting || updating}>
            <Plus size={15} />
            {submitting ? 'Cadastrando...' : 'Novo produto'}
          </button>
          <button className="warningBtn" onClick={handleAtualizarClick} disabled={updating || submitting || isDeleting || deleting}>
            <Pencil size={15} />
            {updating ? 'Atualizando...' : 'Atualizar produto'}
          </button>
          <button className="dangerBtn" onClick={handleDeletarClick} disabled={isDeleting || submitting || deleting || updating}>
            <Trash2 size={15} />
            {deleting ? 'Deletando...' : 'Deletar produto'}
          </button>
          <button className="ghostBtn" onClick={handleClear} disabled={submitting || isDeleting || deleting}>
            <X size={15} />
            Limpar campos
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Tabela base de produtos" subtitle="Clique no ícone de lixeira para deletar um produto diretamente pela tabela.">
        <div className="table modernTable productsTable">
          <div className="row head rowProducts">
            <span>Produto</span>
            <span>Preço PF</span>
            <span>Preço CNPJ</span>
            <span>Quantidade (Kg)</span>
            <span>Status</span>
          </div>

          {tableLoading ? (
            <div className="row" style={{ justifyContent: 'center', padding: '1.5rem', color: 'var(--text-muted, #888)' }}>
              Carregando produtos...
            </div>
          ) : rows.length === 0 ? (
            <div className="row" style={{ justifyContent: 'center', padding: '1.5rem', color: 'var(--text-muted, #888)' }}>
              Nenhum produto cadastrado.
            </div>
          ) : (
            rows.map((row) => (
              <div
                className="row rowProducts"
                key={row._sabor || row.product}
              >
                <span>{row.product}</span>
                <span>{row.pricePF}</span>
                <span>{row.priceCNPJ}</span>
                <span>{row.quantity}</span>
                <span>
                  <span className={cx('pill', row.status === 'Ativo' ? 'ok' : 'mid')}>{row.status}</span>
                </span>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </>
  )
}
