import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authState'
import { subscribeToAuth } from './data/authSessionRepository'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(
    () =>
      subscribeToAuth((nextUser) => {
        setUser(nextUser)
        setLoading(false)
      }),
    [],
  )

  const value = useMemo(() => ({ user, loading }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
