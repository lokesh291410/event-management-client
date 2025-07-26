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
        // Check content type first to determine how to parse the response
        const contentType = response.headers.get('content-type')
        let errorMessage = 'Signup failed'
        
        try {
          if (contentType && contentType.includes('application/json')) {
            // Parse as JSON
            const errorData = await response.json()
            console.log('Error data from backend:', errorData) // Debug log
            errorMessage = errorData.message || errorData.error || errorData.title || 'Signup failed'
          } else {
            // Parse as text
            const errorText = await response.text()
            console.log('Error text from backend:', errorText) // Debug log
            errorMessage = errorText || response.statusText || 'Signup failed'
          }
          
          console.log('Extracted error message:', errorMessage) // Debug log
          
        } catch (parseError) {
          console.log('Response parsing failed:', parseError) // Debug log
          // If parsing fails, use a generic message
          errorMessage = '❌ Signup failed. Please check your information and try again.'
        }
        
        // Make specific error messages more user-friendly (outside the try-catch)
        if (errorMessage.toLowerCase().includes('email already exists')) {
          errorMessage = '❌ This email address is already registered. Please use a different email or try logging in.'
        } else if (errorMessage.toLowerCase().includes('username already exists')) {
          errorMessage = '❌ This username is already taken. Please choose a different username.'
        } else if (errorMessage.toLowerCase().includes('email')) {
          errorMessage = '❌ There was an issue with your email address. Please check and try again.'
        } else if (errorMessage.toLowerCase().includes('username')) {
          errorMessage = '❌ There was an issue with your username. Please choose a different one.'
        }
        
        throw new Error(errorMessage)
      }
      
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const userData = await response.json()
        return userData
      } else {
        const message = await response.text()
        return { success: true, message }
      }
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
