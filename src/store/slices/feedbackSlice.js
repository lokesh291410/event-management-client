import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Async thunks for feedback
export const submitFeedback = createAsyncThunk(
  'feedback/submit',
  async ({ userId, feedbackData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/user/feedback/${userId}`, feedbackData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback')
    }
  }
)

export const fetchUserFeedback = createAsyncThunk(
  'feedback/fetchUserFeedback',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/feedback/${userId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feedback')
    }
  }
)

// Admin thunks
export const fetchEventFeedback = createAsyncThunk(
  'feedback/fetchEventFeedback',
  async ({ eventId, adminId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/event/${eventId}/feedback?adminId=${adminId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event feedback')
    }
  }
)

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    userFeedback: [],
    eventFeedback: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearFeedback: (state) => {
      state.userFeedback = []
      state.eventFeedback = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit feedback
      .addCase(submitFeedback.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.loading = false
        state.userFeedback.push(action.payload)
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch user feedback
      .addCase(fetchUserFeedback.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserFeedback.fulfilled, (state, action) => {
        state.loading = false
        state.userFeedback = action.payload
      })
      .addCase(fetchUserFeedback.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch event feedback (admin)
      .addCase(fetchEventFeedback.fulfilled, (state, action) => {
        state.eventFeedback = action.payload
        state.loading = false
      })
  },
})

export const { clearError, clearFeedback } = feedbackSlice.actions

// Selectors
export const selectUserFeedback = (state) => state.feedback.userFeedback
export const selectEventFeedback = (state) => state.feedback.eventFeedback
export const selectFeedbackLoading = (state) => state.feedback.loading
export const selectFeedbackError = (state) => state.feedback.error

export default feedbackSlice.reducer
