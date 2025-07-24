import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../store/slices/authSlice'
import { 
  ChatBubbleLeftRightIcon, 
  StarIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import axios from 'axios'

const AdminFeedbackPage = () => {
  const user = useSelector(selectUser)
  const [feedback, setFeedback] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Create authenticated API instance
  const authAPI = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  authAPI.interceptors.request.use((config) => {
    const credentials = localStorage.getItem('authCredentials')
    if (credentials) {
      config.headers.Authorization = `Basic ${credentials}`
    }
    return config
  })

  useEffect(() => {
    if (user?.id) {
      fetchFeedbackData()
    }
  }, [user])

  const fetchFeedbackData = async () => {
    try {
      setLoading(true)
      // First fetch admin events
      const eventsResponse = await authAPI.get(`/admin/events?adminId=${user.id}`)
      const adminEvents = eventsResponse.data?.data || []
      setEvents(adminEvents)

      // Then fetch feedback for each event
      const allFeedback = []
      for (const event of adminEvents) {
        try {
          const feedbackResponse = await authAPI.get(`/admin/event/${event.id}/feedback?adminId=${user.id}`)
          const eventFeedback = feedbackResponse.data?.data || []
          allFeedback.push(...eventFeedback.map(fb => ({
            ...fb,
            event: event
          })))
        } catch (error) {
          console.error(`Failed to fetch feedback for event ${event.id}:`, error)
        }
      }
      setFeedback(allFeedback)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch feedback data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      i < rating ? (
        <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="h-5 w-5 text-gray-300" />
      )
    ))
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Filter feedback based on search and filters
  const filteredFeedback = feedback.filter(fb => {
    const matchesSearch = 
      fb.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.suggestions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEvent = selectedEvent === '' || fb.event?.id?.toString() === selectedEvent
    const matchesRating = ratingFilter === '' || fb.rating?.toString() === ratingFilter
    
    return matchesSearch && matchesEvent && matchesRating
  })

  // Calculate stats
  const stats = {
    totalFeedback: feedback.length,
    averageRating: feedback.length > 0 ? 
      feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedback.length : 0,
    recommendationRate: feedback.length > 0 ? 
      (feedback.filter(fb => fb.wouldRecommend).length / feedback.length) * 100 : 0,
    responseRate: events.length > 0 ? (feedback.length / events.length) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading feedback...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading feedback</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchFeedbackData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Feedback</h1>
              <p className="mt-1 text-sm text-gray-500">
                Review feedback and ratings from event attendees
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Total Feedback</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalFeedback}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageRating.toFixed(1)}/5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HeartIcon className="h-8 w-8 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Would Recommend</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.recommendationRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FunnelIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Response Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.responseRate.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search feedback..."
                  />
                </div>
              </div>

              {/* Event Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Events</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Feedback ({filteredFeedback.length})
              </h3>
            </div>

            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback found</h3>
                <p className="mt-1 text-sm text-gray-500">No feedback matches your current filters.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredFeedback.map((fb) => (
                  <div key={fb.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{fb.event?.title}</h4>
                        <p className="text-sm text-gray-500">
                          by {fb.user?.name || 'Anonymous'} • {fb.feedbackDate ? formatDate(fb.feedbackDate) : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(fb.rating || 0)}
                        </div>
                        <span className={`text-sm font-medium ${getRatingColor(fb.rating || 0)}`}>
                          {fb.rating || 0}/5
                        </span>
                      </div>
                    </div>

                    {fb.comment && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Comment:</h5>
                        <p className="text-gray-600 bg-gray-50 rounded-md p-3">
                          "{fb.comment}"
                        </p>
                      </div>
                    )}

                    {fb.suggestions && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Suggestions:</h5>
                        <p className="text-gray-600 bg-blue-50 rounded-md p-3">
                          {fb.suggestions}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          Event Date: {fb.event?.date ? formatDate(fb.event.date) : 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Location: {fb.event?.location || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {fb.wouldRecommend ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <HeartIcon className="h-3 w-3 mr-1" />
                            Would Recommend
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Would Not Recommend
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminFeedbackPage
