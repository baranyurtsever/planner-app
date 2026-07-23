import { AuthProvider } from '../../features/auth/AuthContext'
import { AuthPage } from '../../features/auth/pages/AuthPage'

export function AuthRoute({ mode }) {
  return (
    <AuthProvider>
      <AuthPage mode={mode} />
    </AuthProvider>
  )
}
