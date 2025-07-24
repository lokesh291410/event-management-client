import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Async thunks for waitlist
export const joinWaitlist = createAsyncThunk(
  'waitlist/join',
  async ({ eventId, userId, seats }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/user/waitlist/${eventId}/${userId}/${seats}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join waitlist')
    }
  }
)

export const fetchUserWaitlist = createAsyncThunk(
  'waitlist/fetchUserWaitlist',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/waitlist/${userId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch waitlist')
    }
  }
)

export const removeFromWaitlist = createAsyncThunk(
  'waitlist/remove',
  async ({ waitlistId, userId }, { rejectWithValue }) => {
    try {
      await api.delete(`/user/waitlist/${waitlistId}/${userId}`)
      return waitlistId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from waitlist')
    }
  }
)

// Admin thunks
export const fetchEventWaitlist = createAsyncThunk(
  'waitlist/fetchEventWaitlist',
  async ({ eventId, adminId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/event/${eventId}/waitlist?adminId=${adminId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event waitlist')
    }
  }
)

export const notifyWaitlist = createAsyncThunk(
  'waitlist/notify',
  async ({ eventId, adminId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/event/${eventId}/notify-waitlist?adminId=${adminId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to notify waitlist')
    }
  }
)

const waitlistSlice = createSlice({
  name: 'waitlist',
  initialState: {
    userWaitlist: [],
    eventWaitlist: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearWaitlist: (state) => {
      state.userWaitlist = []
      state.eventWaitlist = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Join waitlist
      .addCase(joinWaitlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(joinWaitlist.fulfilled, (state, action) => {
        state.loading = false
        state.userWaitlist.push(action.payload)
      })
      .addCase(joinWaitlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch user waitlist
      .addCase(fetchUserWaitlist.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserWaitlist.fulfilled, (state, action) => {
        state.loading = false
        state.userWaitlist = action.payload
      })
      .addCase(fetchUserWaitlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Remove from waitlist
      .addCase(removeFromWaitlist.fulfilled, (state, action) => {
        state.userWaitlist = state.userWaitlist.filter(item => item.id !== action.payload)
        state.loading = false
      })
      // Fetch event waitlist (admin)
      .addCase(fetchEventWaitlist.fulfilled, (state, action) => {
        state.eventWaitlist = action.payload
        state.loading = false
      })
      // Notify waitlist
      .addCase(notifyWaitlist.fulfilled, (state, action) => {
        // Update waitlist statuses after notification
        state.eventWaitlist = state.eventWaitlist.map(item => ({
          ...item,
          status: 'NOTIFIED'
        }))
        state.loading = false
      })
  },
})

export const { clearError, clearWaitlist } = waitlistSlice.actions

// Selectors
export const selectUserWaitlist = (state) => state.waitlist.userWaitlist
export const selectEventWaitlist = (state) => state.waitlist.eventWaitlist
export const selectWaitlistLoading = (state) => state.waitlist.loading
export const selectWaitlistError = (state) => state.waitlist.error

export default waitlistSlice.reducer
