import { Navigate } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AuthProvider } from '../../features/auth/AuthContext'
import { useAuth } from '../../features/auth/authState'
import { LoadingScreen } from '../../shared/components/Feedback'

function AuthenticatedApp() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? <AppLayout /> : <Navigate to="/login" replace />
}

export function ProtectedRoute() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}
