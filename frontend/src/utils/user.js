import api from '../api/axiosInstance'
import { getDisplayNameFromResponse, getRoleFromResponse } from './api'

export async function resolveUserInfo(fallbackName = 'Usuário do sistema') {
  try {
    const res = await api.get('/api/me')
    const name = getDisplayNameFromResponse(res?.data, fallbackName) || fallbackName
    const role = getRoleFromResponse(res?.data)
    return { name, role }
  } catch {
    return {
      name: fallbackName,
      role: (localStorage.getItem('user_role') || '').toLowerCase(),
    }
  }
}

export function getInitials(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'US'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function formatRoleLabel(role) {
  if (!role) return ''
  const map = {
    gerente: 'Gerente',
    desenvolvedor: 'Desenvolvedor',
    funcionario: 'Funcionário',
    funcionário: 'Funcionário',
    admin: 'Administrador',
    administrador: 'Administrador',
  }
  return map[role.toLowerCase()] || role.charAt(0).toUpperCase() + role.slice(1)
}
