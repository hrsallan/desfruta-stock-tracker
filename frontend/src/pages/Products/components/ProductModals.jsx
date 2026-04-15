import { Package, Pencil, Trash2 } from 'lucide-react'

export function ProductCadastrarModal({ form, onConfirm, onCancel, submitting }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 440,
        boxShadow: '0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
        animation: 'modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={20} style={{ color: '#059669' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Confirmar cadastro</h3>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Revise os dados antes de registrar</p>
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Nome', value: form.nome },
            { label: 'Status', value: form.status },
            { label: 'Preço PF', value: form.precoPF ? `R$ ${form.precoPF}` : '—' },
            { label: 'Preço CNPJ', value: form.precoCNPJ ? `R$ ${form.precoCNPJ}` : '—' },
            { label: 'Quantidade (Kg)', value: form.quantidade ? `${form.quantidade} Kg` : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{value || '—'}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} disabled={submitting} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13.5, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={submitting} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: submitting ? 'rgba(5,150,105,0.5)' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 14px rgba(16,185,129,0.25)', transition: 'all 0.15s' }}>
            {submitting ? <><span className="spinner" aria-hidden="true" style={{ width: 14, height: 14, borderWidth: 2 }} /> Cadastrando...</> : <><Package size={15} /> Confirmar cadastro</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  )
}

export function ProductAtualizarModal({ form, onConfirm, onCancel, updating }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 440,
        boxShadow: '0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
        animation: 'modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(234,179,8,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Pencil size={20} style={{ color: '#ca8a04' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Confirmar atualização</h3>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Revise os dados antes de atualizar</p>
          </div>
        </div>

        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Nome', value: form.nome },
            { label: 'Status', value: form.status },
            { label: 'Preço PF', value: form.precoPF ? `R$ ${form.precoPF}` : '—' },
            { label: 'Preço CNPJ', value: form.precoCNPJ ? `R$ ${form.precoCNPJ}` : '—' },
            { label: 'Quantidade (Kg)', value: form.quantidade ? `${form.quantidade} Kg` : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, color: '#92400e', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{value || '—'}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} disabled={updating} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13.5, fontWeight: 600, cursor: updating ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={updating} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: updating ? 'rgba(202,138,4,0.5)' : 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: updating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 14px rgba(234,179,8,0.3)', transition: 'all 0.15s' }}>
            {updating ? <><span className="spinner" aria-hidden="true" style={{ width: 14, height: 14, borderWidth: 2 }} /> Atualizando...</> : <><Pencil size={15} /> Confirmar atualização</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  )
}

export function ProductDeletarModal({ nome, onConfirm, onCancel, deleting }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 420,
        boxShadow: '0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
        animation: 'modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Trash2 size={20} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Confirmar exclusão</h3>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748b', marginTop: 2 }}>Esta ação não pode ser desfeita</p>
          </div>
        </div>

        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: 13.5, color: '#7f1d1d', lineHeight: 1.6 }}>
            Tem certeza que deseja deletar o produto <strong style={{ color: '#991b1b' }}>{nome}</strong>?
            <br /><span style={{ fontSize: 12, color: '#b91c1c', opacity: 0.85 }}>O registro será removido permanentemente do sistema.</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} disabled={deleting} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13.5, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={deleting} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: deleting ? 'rgba(239,68,68,0.4)' : 'linear-gradient(135deg, #f87171, #ef4444)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 14px rgba(239,68,68,0.25)', transition: 'all 0.15s' }}>
            {deleting ? <><span className="spinner" aria-hidden="true" style={{ width: 14, height: 14, borderWidth: 2 }} /> Deletando...</> : <><Trash2 size={15} /> Sim, deletar</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  )
}
