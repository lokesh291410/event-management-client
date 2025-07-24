import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Async thunks for bookings
export const bookEvent = createAsyncThunk(
  'bookings/bookEvent',
  async ({ eventId, userId, seats }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/user/book/${eventId}/${userId}/${seats}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Booking failed')
    }
  }
)

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async ({ bookingId, userId }, { rejectWithValue }) => {
    try {
      await api.post(`/user/cancel/${bookingId}/${userId}`)
      return bookingId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking')
    }
  }
)

export const fetchBookingDetails = createAsyncThunk(
  'bookings/fetchDetails',
  async ({ bookingId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/details/${bookingId}/${userId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking details')
    }
  }
)

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/bookings/${userId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings')
    }
  }
)

// Admin thunks
export const fetchEventBookings = createAsyncThunk(
  'bookings/fetchEventBookings',
  async ({ eventId, adminId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/event/${eventId}/bookings?adminId=${adminId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event bookings')
    }
  }
)

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    eventBookings: [],
    currentBooking: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearBookings: (state) => {
      state.bookings = []
      state.eventBookings = []
      state.currentBooking = null
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Book event
      .addCase(bookEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bookEvent.fulfilled, (state, action) => {
        state.loading = false
        state.bookings.push(action.payload)
      })
      .addCase(bookEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Cancel booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(booking => booking.id !== action.payload)
        state.loading = false
      })
      // Fetch booking details
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.currentBooking = action.payload
        state.loading = false
      })
      // Fetch user bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch event bookings (admin)
      .addCase(fetchEventBookings.fulfilled, (state, action) => {
        state.eventBookings = action.payload
        state.loading = false
      })
  },
})

export const { clearError, clearBookings, clearCurrentBooking } = bookingsSlice.actions

// Selectors
export const selectBookings = (state) => state.bookings.bookings
export const selectEventBookings = (state) => state.bookings.eventBookings
export const selectCurrentBooking = (state) => state.bookings.currentBooking
export const selectBookingsLoading = (state) => state.bookings.loading
export const selectBookingsError = (state) => state.bookings.error

export default bookingsSlice.reducer
