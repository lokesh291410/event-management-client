import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Async thunk for signup
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async ({ username, name, email, password, role }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          name,
          email,
          password,
          role: role || 'USER'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Signup failed')
      }
      
      const userData = await response.json()
      return userData
    } catch (error) {
      return rejectWithValue(error.message || 'Signup failed')
    }
  }
)

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      // Use the new login API endpoint
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })
      
      if (!response.ok) {
        throw new Error('Login request failed')
      }
      
      const loginResponse = await response.json()
      
      if (!loginResponse.success) {
        throw new Error(loginResponse.message || 'Invalid credentials')
      }
      
      // Create the user data from the login response
      const userData = {
        id: loginResponse.userId,
        email: loginResponse.email,
        username: loginResponse.username,
        name: loginResponse.name,
        role: loginResponse.role
      }
      
      // Create credentials for basic auth (for existing API calls)
      const credentials = btoa(`${username}:${password}`)
      
      // Store credentials and user data in sessionStorage (tab-specific only)
      sessionStorage.setItem('authCredentials', credentials)
      sessionStorage.setItem('user', JSON.stringify(userData))
      
      return userData
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    // Clear sessionStorage only (tab-specific)
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('authCredentials')
    // Clear other slices on logout
    dispatch({ type: 'events/clearEvents' })
    dispatch({ type: 'bookings/clearBookings' })
    dispatch({ type: 'waitlist/clearWaitlist' })
    dispatch({ type: 'feedback/clearFeedback' })
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.loading = false
    },
    clearAuth: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup cases
      .addCase(signupUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Don't auto-login after signup, let user login manually
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })
  },
})

export const { clearError, setUser, clearAuth, setLoading } = authSlice.actions

// Selectors
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsAdmin = (state) => state.auth.user?.role === 'ROLE_ADMIN'
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
