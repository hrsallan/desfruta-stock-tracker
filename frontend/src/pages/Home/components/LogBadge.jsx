const LOG_BADGE = {
  add:      { label: 'Adicionado', bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  cadastro: { label: 'Cadastrado', bg: '#f3e8ff', color: '#6b21a8', dot: '#a855f7' },
  delete:   { label: 'Deletado',   bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  retirar:  { label: 'Retirado',   bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
  venda:    { label: 'Vendido',    bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  vencido:  { label: 'Vencido',    bg: '#1e293b', color: '#f1f5f9', dot: '#94a3b8' },
  edit:     { label: 'Editado',    bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  neutral:  { label: 'Ação',       bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
}

function detectLogType(acao) {
  if (!acao) return 'neutral'
  const s = acao.toLowerCase()
  const first = s.trim().split(/[\s·]+/)[0]
  if (first === 'adicionar') return 'add'
  if (first === 'retirar') return 'retirar'
  if (first === 'venda') return 'venda'
  if (first === 'vencido') return 'vencido'
  if (s.includes('cadastr')) return 'cadastro'
  if (s.includes('delet') || s.includes('remov') || s.includes('exclu') || s.includes('cancel') || s.includes('inativ')) return 'delete'
  if (s.includes('adicion') || s.includes('cri') || s.includes('insert') || s.includes('novo') || s.includes('nova') || s.includes('entrada')) return 'add'
  if (s.includes('atualiz') || s.includes('edit') || s.includes('alter') || s.includes('modif') || s.includes('ajust') || s.includes('atuali')) return 'edit'
  return 'neutral'
}

export function LogBadge({ acao }) {
  const type = detectLogType(acao)
  const { label, bg, color, dot } = LOG_BADGE[type]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999,
      background: bg, color,
      fontSize: 11.5, fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      {label}
    </span>
  )
}
