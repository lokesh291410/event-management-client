import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAdmin = () => {
    return user?.role === 'ROLE_ADMIN'
  }

  const isAuthenticated = () => {
    return !!user
  }

  const value = {
    user,
    login,
    logout,
    isAdmin,
    isAuthenticated,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
