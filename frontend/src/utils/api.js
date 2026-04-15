export function extractApiMessage(data) {
  if (!data) return null
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    const first = data.find((v) => typeof v === 'string')
    return first || null
  }
  if (typeof data === 'object') {
    const keys = ['message', 'msg', 'detail', 'error', 'description', 'title']
    for (const k of keys) {
      const v = data[k]
      if (typeof v === 'string' && v.trim()) return v
      if (Array.isArray(v)) {
        const first = v.find((x) => typeof x === 'string')
        if (first) return first
      }
      if (v && typeof v === 'object') {
        const nested = extractApiMessage(v)
        if (nested) return nested
      }
    }
    for (const v of Object.values(data)) {
      if (typeof v === 'string' && v.trim()) return v
    }
  }
  return null
}

export function getTokenFromResponse(data) {
  if (!data || typeof data !== 'object') return null
  return data.access_token || data.token || data.accessToken || null
}

export function getDisplayNameFromResponse(data, fallback = '') {
  if (!data || typeof data !== 'object') return fallback

  const candidates = [
    data.nome,
    data.name,
    data.full_name,
    data.fullName,
    data.usuario,
    data?.user?.nome,
    data?.user?.name,
    data?.user?.full_name,
    data?.user?.fullName,
    data?.user?.usuario,
    data?.profile?.nome,
    data?.profile?.name,
    data?.profile?.full_name,
    data?.profile?.fullName,
    data?.data?.nome,
    data?.data?.name,
    data?.data?.full_name,
    data?.data?.fullName,
    data.username,
    data?.user?.username,
    data?.profile?.username,
    data?.data?.username,
    typeof data.user === 'string' ? data.user : null,
  ]

  const match = candidates.find((value) => typeof value === 'string' && value.trim())
  return match?.trim() || fallback
}

export function getRoleFromResponse(data) {
  if (!data || typeof data !== 'object') return ''
  const candidates = [
    data.role, data.cargo,
    data?.user?.role, data?.user?.cargo,
    data?.profile?.role, data?.profile?.cargo,
    data?.data?.role, data?.data?.cargo,
  ]
  const match = candidates.find((v) => typeof v === 'string' && v.trim())
  return match?.trim().toLowerCase() || ''
}
