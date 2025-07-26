import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Create a public API instance for non-authenticated requests
const publicAPI = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Create an authenticated API instance
const authAPI = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth interceptor only to the authenticated API
authAPI.interceptors.request.use((config) => {
  // Use sessionStorage only (tab-specific authentication)
  const credentials = sessionStorage.getItem('authCredentials')
  if (credentials) {
    config.headers.Authorization = `Basic ${credentials}`
  }
  return config
})

// Public event endpoints (no authentication required)
export const fetchUpcomingEvents = createAsyncThunk(
  'events/fetchUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicAPI.get('/events/published')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events')
    }
  }
)

export const fetchAllEvents = createAsyncThunk(
  'events/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicAPI.get('/events')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events')
    }
  }
)

export const fetchEventDetails = createAsyncThunk(
  'events/fetchDetails',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await publicAPI.get(`/events/${eventId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event details')
    }
  }
)

export const fetchAdminEventDetails = createAsyncThunk(
  'events/fetchAdminDetails',
  async ({ eventId, adminId }, { rejectWithValue }) => {
    try {
      const response = await authAPI.get(`/admin/event/${eventId}?adminId=${adminId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin event details')
    }
  }
)

export const fetchEventCategories = createAsyncThunk(
  'events/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicAPI.get('/events/categories')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories')
    }
  }
)

// User authenticated event endpoints
export const fetchUserUpcomingEvents = createAsyncThunk(
  'events/fetchUserUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.get('/user/events/upcoming')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user events')
    }
  }
)

export const searchEvents = createAsyncThunk(
  'events/search',
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await publicAPI.get(`/events/published/search?keyword=${keyword}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed')
    }
  }
)

export const fetchEventsByCategory = createAsyncThunk(
  'events/fetchByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await authAPI.get(`/user/events/category?category=${category}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events by category')
    }
  }
)

// Admin event endpoints
export const createEvent = createAsyncThunk(
  'events/create',
  async ({ eventData, adminId }, { rejectWithValue }) => {
    try {
      const response = await authAPI.post(`/admin/event?adminId=${adminId}`, eventData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create event')
    }
  }
)

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ eventId, eventData, adminId }, { rejectWithValue }) => {
    try {
      const response = await authAPI.put(`/admin/event/${eventId}?adminId=${adminId}`, eventData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update event')
    }
  }
)

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async ({ eventId, adminId }, { rejectWithValue }) => {
    try {
      await authAPI.delete(`/admin/event/${eventId}?adminId=${adminId}`)
      return eventId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete event')
    }
  }
)

export const publishEvent = createAsyncThunk(
  'events/publish',
  async ({ eventId, adminId }, { rejectWithValue }) => {
    try {
      const response = await authAPI.post(`/admin/event/${eventId}/publish?adminId=${adminId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to publish event')
    }
  }
)

export const cancelEvent = createAsyncThunk(
  'events/cancel',
  async ({ eventId, adminId, reason }, { rejectWithValue }) => {
    try {
      const response = await authAPI.post(`/admin/event/${eventId}/cancel?adminId=${adminId}&reason=${reason}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel event')
    }
  }
)

export const fetchAdminEvents = createAsyncThunk(
  'events/fetchAdminEvents',
  async (adminId, { rejectWithValue }) => {
    try {
      const response = await authAPI.get(`/admin/events?adminId=${adminId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin events')
    }
  }
)

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    upcomingEvents: [],
    adminEvents: [],
    selectedEvent: null,
    categories: [],
    loading: false,
    error: null,
    searchResults: [],
    searchLoading: false,
    filters: {
      category: '',
      location: '',
      dateRange: '',
      priceRange: ''
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearEvents: (state) => {
      state.events = []
      state.upcomingEvents = []
      state.adminEvents = []
      state.selectedEvent = null
      state.searchResults = []
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload
    },
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchLoading = false
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        location: '',
        dateRange: '',
        priceRange: ''
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch upcoming events
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.loading = false
        state.upcomingEvents = action.payload
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch all events
      .addCase(fetchAllEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.loading = false
        state.events = action.payload
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch event details
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selectedEvent = action.payload
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch admin event details
      .addCase(fetchAdminEventDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminEventDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selectedEvent = action.payload
      })
      .addCase(fetchAdminEventDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch categories
      .addCase(fetchEventCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      
      // Search events
      .addCase(searchEvents.pending, (state) => {
        state.searchLoading = true
        state.error = null
      })
      .addCase(searchEvents.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload
        state.upcomingEvents = action.payload // Update the main events list for display
      })
      .addCase(searchEvents.rejected, (state, action) => {
        state.searchLoading = false
        state.error = action.payload
      })
      
      // Fetch events by category
      .addCase(fetchEventsByCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventsByCategory.fulfilled, (state, action) => {
        state.loading = false
        state.upcomingEvents = action.payload // Update the main events list for display
      })
      .addCase(fetchEventsByCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false
        state.adminEvents.push(action.payload)
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.adminEvents.findIndex(event => event.id === action.payload.id)
        if (index !== -1) {
          state.adminEvents[index] = action.payload
        }
      })
      
      // Delete event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.adminEvents = state.adminEvents.filter(event => event.id !== action.payload)
      })
      
      // Fetch admin events
      .addCase(fetchAdminEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminEvents.fulfilled, (state, action) => {
        state.loading = false
        state.adminEvents = action.payload
      })
      .addCase(fetchAdminEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearEvents, setSelectedEvent, clearSearchResults, setFilters, clearFilters } = eventsSlice.actions

// Selectors
export const selectEvents = (state) => state.events.events
export const selectUpcomingEvents = (state) => state.events.upcomingEvents
export const selectAdminEvents = (state) => state.events.adminEvents
export const selectSelectedEvent = (state) => state.events.selectedEvent
export const selectCurrentEvent = (state) => state.events.selectedEvent // Alias for compatibility
export const selectEventCategories = (state) => state.events.categories
export const selectEventsLoading = (state) => state.events.loading
export const selectEventsError = (state) => state.events.error
export const selectSearchResults = (state) => state.events.searchResults
export const selectSearchLoading = (state) => state.events.searchLoading
export const selectEventsFilters = (state) => state.events.filters

export default eventsSlice.reducer
