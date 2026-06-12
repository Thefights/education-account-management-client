import AuthContext from '@/configs/AuthContext'
import { useContext } from 'react'

/**
 * @typedef {Object} AuthState
 * @property {string} [role]
 * @property {string|number} [id]
 * @property {string} [name]
 * @property {string} [email]
 */

/**
 * @returns {{
 *  accessToken?: string,
 *  auth: AuthState,
 *  error: Error|null,
 * 	login: (tokens: string|{accessToken?: string}) => Promise<void>,
 * 	logout: () => void,
 *  initialized: boolean,
 *  refreshAuth: () => Promise<void>
 * }}
 */
export default function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
