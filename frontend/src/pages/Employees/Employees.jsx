import { useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import api from '../../api/axiosInstance'
import Toast from '../../components/Toast'
import { MiniMetric, SectionCard } from '../../components/Cards'
import { Field, SelectField } from '../../components/FormFields'
import { extractApiMessage } from '../../utils/api'
import { cx } from '../../utils/formatters'
import { EmployeeConfirmModal, EmployeeDeleteModal } from './components/EmployeeModals'
import { PasswordField } from './components/PasswordField'
import './Employees.css'

export function EmployeesPage() {
  const [metrics, setMetrics] = useState({ loading: true, error: false, total: null, ativos: null, cargos: null })
  const [rows, setRows] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ nome: '', username: '', password: '', role: 'Funcionário', empresa: 'Desfruta Polpas' })
  const [showConfirm, setShowConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function notify(next) {
    setToast({ id: globalThis.crypto?.randomUUID?.() || String(Date.now()), ...next })
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleClear() {
    setForm({ nome: '', username: '', password: '', role: 'Funcionário', empresa: 'Desfruta Polpas' })
  }

  function handleCadastrarClick() {
    const { nome, username, password, role, empresa } = form
    if (!nome.trim() || !username.trim() || !password.trim() || !role.trim() || !empresa.trim()) {
      notify({ type: 'error', title: 'Campos obrigatórios', message: 'Preencha todos os campos antes de cadastrar.' })
      return
    }
    setShowConfirm(true)
  }

  async function handleConfirm() {
    if (submitting) return
    setSubmitting(true)
    try {
      await api.post('/api/funcionarios/cadastrar', {
        nome: form.nome.trim(),
        username: form.username.trim(),
        password: form.password,
        role: form.role.trim(),
        empresa: form.empresa.trim(),
      })
      notify({ type: 'success', title: 'Funcionário cadastrado', message: `${form.nome.trim()} foi registrado com sucesso.` })
      handleClear()
      setShowConfirm(false)
      await reloadTabela()
      await reloadMetrics()
    } catch (err) {
      const msg = extractApiMessage(err?.response?.data) || err?.message || 'Erro ao cadastrar funcionário.'
      notify({ type: 'error', title: 'Erro ao cadastrar', message: msg })
      setShowConfirm(false)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDeletarClick() {
    if (!form.username.trim()) {
      notify({ type: 'error', title: 'Campo obrigatório', message: 'Preencha o campo Usuário para deletar.' })
      return
    }
    setShowDeleteConfirm(true)
  }

  async function handleConfirmDelete() {
    if (deleting) return
    setDeleting(true)
    try {
      await api.delete('/api/funcionarios/deletar', {
        data: { username: form.username.trim(), password: form.password || undefined },
      })
      notify({ type: 'success', title: 'Funcionário deletado', message: `${form.username.trim()} foi removido com sucesso.` })
      handleClear()
      setShowDeleteConfirm(false)
      await reloadTabela()
      await reloadMetrics()
    } catch (err) {
      const msg = extractApiMessage(err?.response?.data) || err?.message || 'Erro ao deletar funcionário.'
      notify({ type: 'error', title: 'Erro ao deletar', message: msg })
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  async function reloadMetrics() {
    try {
      const res = await api.get('/api/funcionarios/metricas')
      const data = res?.data ?? {}
      setMetrics({
        loading: false, error: false,
        total:  data.total_funcionarios ?? null,
        ativos: data.funcionarios_ativos ?? null,
        cargos: data.total_cargos ?? null,
      })
    } catch {
      setMetrics({ loading: false, error: true, total: null, ativos: null, cargos: null })
    }
  }

  async function reloadTabela() {
    try {
      const res = await api.get('/api/funcionarios/tabela')
      setRows(Array.isArray(res?.data?.dados) ? res.data.dados : [])
    } catch {
      setRows([])
    } finally {
      setTableLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    async function loadMetrics() {
      try {
        const res = await api.get('/api/funcionarios/metricas')
        if (ignore) return
        const data = res?.data ?? {}
        setMetrics({
          loading: false, error: false,
          total:  data.total_funcionarios ?? null,
          ativos: data.funcionarios_ativos ?? null,
          cargos: data.total_cargos ?? null,
        })
      } catch {
        if (ignore) return
        setMetrics({ loading: false, error: true, total: null, ativos: null, cargos: null })
      }
    }

    async function loadTabela() {
      try {
        const res = await api.get('/api/funcionarios/tabela')
        if (ignore) return
        setRows(Array.isArray(res?.data?.dados) ? res.data.dados : [])
      } catch {
        if (ignore) return
        setRows([])
      } finally {
        if (!ignore) setTableLoading(false)
      }
    }

    loadMetrics()
    loadTabela()
    return () => { ignore = true }
  }, [])

  function isAtivo(ultimoAcesso) {
    if (!ultimoAcesso) return false
    const ultimo = new Date(ultimoAcesso)
    if (isNaN(ultimo)) return false
    return (Date.now() - ultimo.getTime()) / (1000 * 60 * 60) < 24
  }

  function formatAcesso(ultimoAcesso) {
    if (!ultimoAcesso) return '—'
    const d = new Date(ultimoAcesso)
    if (isNaN(d)) return ultimoAcesso
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const val = (v) => metrics.loading ? 'Carregando...' : metrics.error ? '--' : String(v ?? '--')

  return (
    <div className="pageStack">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {showConfirm && (
        <EmployeeConfirmModal
          form={form}
          submitting={submitting}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <EmployeeDeleteModal
          username={form.username}
          deleting={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <div className="metricGrid compactMetrics">
        <MiniMetric title="Funcionários Cadastrados" value={val(metrics.total)}  detail="Total de funcionários no sistema" />
        <MiniMetric title="Funcionários Ativos"      value={val(metrics.ativos)} detail="Com acesso nas últimas 24h" />
        <MiniMetric title="Quantidade de Cargos"     value={val(metrics.cargos)} detail="Cargos distintos cadastrados" />
      </div>

      <SectionCard title="Cadastro de funcionário" subtitle="Preencha os campos para registrar um novo funcionário no sistema.">
        <div className="filtersGrid">
          <Field label="Nome"    placeholder="Nome completo"   value={form.nome}     onChange={(v) => handleFormChange('nome', v)} />
          <Field label="Usuário" placeholder="Nome de usuário" value={form.username} onChange={(v) => handleFormChange('username', v)} />
          <PasswordField label="Senha" placeholder="Senha de acesso" value={form.password} onChange={(v) => handleFormChange('password', v)} />
          <SelectField label="Cargo"   value={form.role}   onChange={(v) => handleFormChange('role', v)}   options={['Funcionário', 'Gerente']}    placeholder={false} />
          <SelectField label="Empresa" value={form.empresa} onChange={(v) => handleFormChange('empresa', v)} options={['Desfruta Polpas']}          placeholder={false} />
        </div>

        <div className="sectionActions">
          <button className="btn" onClick={handleCadastrarClick} disabled={submitting || deleting}>
            <Plus size={15} />
            Cadastrar funcionário
          </button>
          <button className="dangerBtn" onClick={handleDeletarClick} disabled={submitting || deleting}>
            <Trash2 size={15} />
            {deleting ? 'Deletando...' : 'Deletar funcionário'}
          </button>
          <button className="ghostBtn" onClick={handleClear} disabled={submitting || deleting}>
            <X size={15} />
            Limpar campos
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Tabela de Funcionários" subtitle="Visualização completa dos funcionários cadastrados na plataforma.">
        <div className="table modernTable employeesTable">
          <div className="row head rowEmployees">
            <span>Nome</span>
            <span>Usuário</span>
            <span>Empresa</span>
            <span>Cargo</span>
            <span>Último Acesso</span>
            <span>Status</span>
          </div>

          {tableLoading && (
            <div className="row rowEmployees">
              <span style={{ gridColumn: '1 / -1', opacity: 0.5, padding: '4px 0' }}>Carregando...</span>
            </div>
          )}

          {!tableLoading && rows.length === 0 && (
            <div className="row rowEmployees">
              <span style={{ gridColumn: '1 / -1', opacity: 0.5, padding: '4px 0' }}>Nenhum dado disponível.</span>
            </div>
          )}

          {!tableLoading && rows.map((row, idx) => {
            const ativo = isAtivo(row.ultimo_acesso)
            return (
              <div className="row rowEmployees" key={idx}>
                <span>{row.nome ?? '—'}</span>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>@{row.username ?? '—'}</span>
                <span>{row.empresa ?? '—'}</span>
                <span>{row.role ?? '—'}</span>
                <span>{formatAcesso(row.ultimo_acesso)}</span>
                <span>
                  <span className={cx('pill', ativo ? 'ok' : 'bad')}>
                    {ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}
