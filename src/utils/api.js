import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Create a separate instance for public endpoints (no auth required)
const publicAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to add auth headers
api.interceptors.request.use(
  (config) => {
    // Use sessionStorage only (tab-specific authentication)
    const credentials = sessionStorage.getItem('authCredentials')
    if (credentials) {
      config.headers.Authorization = `Basic ${credentials}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('user')
      localStorage.removeItem('authCredentials')
      window.location.href = '/login'
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.'
    }
    
    return Promise.reject(error)
  }
)

// User API endpoints
export const userAPI = {
  // Event discovery - using public endpoints (no auth required)
  getUpcomingEvents: () => publicAPI.get('/events/published'),
  getEventsByCategory: (category) => publicAPI.get(`/events/published?category=${category}`),
  searchEvents: (keyword) => publicAPI.get(`/events/published?search=${keyword}`),
  getEventDetails: (eventId) => publicAPI.get(`/events/${eventId}`),
  
  // Booking management - requires authentication
  bookEvent: (eventId, userId, seats) => api.post(`/user/book/${eventId}/${userId}/${seats}`),
  cancelBooking: (bookingId, userId) => api.post(`/user/cancel/${bookingId}/${userId}`),
  getBookingDetails: (bookingId, userId) => api.get(`/user/details/${bookingId}/${userId}`),
  getUserBookings: (userId) => api.get(`/user/bookings/${userId}`),
  
  // Waitlist operations - requires authentication
  joinWaitlist: (eventId, userId, seats) => api.post(`/user/waitlist/${eventId}/${userId}/${seats}`),
  getUserWaitlist: (userId) => api.get(`/user/waitlist/${userId}`),
  removeFromWaitlist: (waitlistId, userId) => api.delete(`/user/waitlist/${waitlistId}/${userId}`),
  
  // Feedback system - requires authentication
  submitFeedback: (userId, feedback) => api.post(`/user/feedback/${userId}`, feedback),
  getUserFeedback: (userId) => api.get(`/user/feedback/${userId}`),
}

// Admin API endpoints
export const adminAPI = {
  // Event management
  createEvent: (adminId, event) => api.post(`/admin/event?adminId=${adminId}`, event),
  updateEvent: (eventId, adminId, event) => api.put(`/admin/event/${eventId}?adminId=${adminId}`, event),
  deleteEvent: (eventId, adminId) => api.delete(`/admin/event/${eventId}?adminId=${adminId}`),
  publishEvent: (eventId, adminId) => api.post(`/admin/event/${eventId}/publish?adminId=${adminId}`),
  cancelEvent: (eventId, adminId) => api.post(`/admin/event/${eventId}/cancel?adminId=${adminId}`),
  
  // Analytics & monitoring
  getEventStatistics: (eventId, adminId) => api.get(`/admin/event/${eventId}/statistics?adminId=${adminId}`),
  getEventBookings: (eventId, adminId) => api.get(`/admin/event/${eventId}/bookings?adminId=${adminId}`),
  getEventWaitlist: (eventId, adminId) => api.get(`/admin/event/${eventId}/waitlist?adminId=${adminId}`),
  getEventFeedback: (eventId, adminId) => api.get(`/admin/event/${eventId}/feedback?adminId=${adminId}`),
  getAdminEvents: (adminId) => api.get(`/admin/events?adminId=${adminId}`),
  
  // Waitlist management
  notifyWaitlist: (eventId, adminId) => api.post(`/admin/event/${eventId}/notify-waitlist?adminId=${adminId}`),
}

export const EVENT_CATEGORIES = [
  'WORKSHOP',
  'CONFERENCE',
  'HACKATHON',
  'MEETUP',
  'WEBINAR',
  'SEMINAR'
]

export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

export const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED'
}

export default api
