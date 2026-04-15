export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatKgValue(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '-- Kg'
  return `${numeric.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} Kg`
}

export function formatValidade(v) {
  if (!v) return '--'
  const d = new Date(v)
  if (isNaN(d)) return v
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function parseCurrencyInput(value) {
  if (!value) return null
  const cleaned = String(value).replace(/[R$\s]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return Number.isFinite(num) ? num : null
}

export function normalizeTableRows(data) {
  if (!Array.isArray(data)) return []
  return data.map((item) => ({
    product: item.sabor ?? item.product ?? item.nome ?? '',
    pricePF:
      item.preco_pf != null
        ? `R$ ${Number(item.preco_pf).toFixed(2).replace('.', ',')}`
        : item.pricePF ?? '--',
    priceCNPJ:
      item.preco_cnpj != null
        ? `R$ ${Number(item.preco_cnpj).toFixed(2).replace('.', ',')}`
        : item.priceCNPJ ?? '--',
    quantity: item.quantidade_kg != null ? `${item.quantidade_kg} Kg` : item.quantity ?? '--',
    status:
      item.disponivel === true || item.disponivel === 1
        ? 'Ativo'
        : item.disponivel === false || item.disponivel === 0
        ? 'Inativo'
        : item.status ?? '--',
    _sabor: item.sabor ?? item.product ?? item.nome ?? '',
  }))
}

export function normalizeStockRows(data) {
  if (!Array.isArray(data)) return []
  return data.map((item) => ({
    product: item.sabor ?? item.produto ?? item.product ?? item.nome ?? '—',
    validade: item.validade ?? item.data_validade ?? item.expiry ?? null,
    precoPF:
      item.preco_pf != null
        ? `R$ ${Number(item.preco_pf).toFixed(2).replace('.', ',')}`
        : null,
    precoCNPJ:
      item.preco_cnpj != null
        ? `R$ ${Number(item.preco_cnpj).toFixed(2).replace('.', ',')}`
        : null,
    quantity: item.quantidade_kg != null ? `${item.quantidade_kg} Kg` : item.quantity ?? null,
    status:
      item.disponivel === true || item.disponivel === 1
        ? 'Disponível'
        : item.disponivel === false || item.disponivel === 0
        ? 'Indisponível'
        : item.status ?? null,
  }))
}
