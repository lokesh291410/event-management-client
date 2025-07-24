import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '../store/slices/authSlice'
import { 
  ChartBarIcon, 
  CalendarIcon, 
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'

const AdminAnalyticsPage = () => {
  const user = useSelector(selectUser)
  const [analytics, setAnalytics] = useState({})
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState('')

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
      fetchAnalyticsData()
    }
  }, [user])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      // Fetch admin events
      const eventsResponse = await authAPI.get(`/admin/events?adminId=${user.id}`)
      const adminEvents = eventsResponse.data?.data || []
      setEvents(adminEvents)

      // Fetch analytics for each event
      const eventAnalytics = {}
      for (const event of adminEvents) {
        try {
          const statsResponse = await authAPI.get(`/admin/event/${event.id}/statistics?adminId=${user.id}`)
          eventAnalytics[event.id] = {
            event: event,
            stats: statsResponse.data?.data || {}
          }
        } catch (error) {
          console.error(`Failed to fetch analytics for event ${event.id}:`, error)
          eventAnalytics[event.id] = {
            event: event,
            stats: {}
          }
        }
      }
      setAnalytics(eventAnalytics)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch analytics data')
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

  // Calculate overall stats
  const overallStats = {
    totalEvents: events.length,
    totalBookings: Object.values(analytics).reduce((sum, item) => 
      sum + (item.stats.totalBookings || 0), 0),
    totalRevenue: Object.values(analytics).reduce((sum, item) => 
      sum + (item.stats.totalRevenue || 0), 0),
    averageBookingRate: events.length > 0 ? 
      Object.values(analytics).reduce((sum, item) => {
        const capacity = item.event?.totalSeats || 1
        const bookings = item.stats.totalBookings || 0
        return sum + (bookings / capacity)
      }, 0) / events.length * 100 : 0
  }

  const selectedEventData = selectedEvent ? analytics[selectedEvent] : null

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading analytics</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchAnalyticsData}
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                View detailed analytics and reports for your events
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900">{overallStats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{overallStats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${overallStats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Avg. Booking Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{overallStats.averageBookingRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Selector */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event for Detailed Analytics
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} - {formatDate(event.date)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedEventData ? (
          <div className="space-y-6">
            {/* Event Details */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Event Details: {selectedEventData.event.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Event Date</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDate(selectedEventData.event.date)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Location</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedEventData.event.location}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Capacity</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedEventData.event.totalSeats || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Price</div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${selectedEventData.event.price || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Statistics */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Event Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedEventData.stats.totalBookings || 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedEventData.stats.confirmedBookings || 0}
                    </div>
                    <div className="text-sm text-gray-500">Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedEventData.stats.pendingBookings || 0}
                    </div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedEventData.stats.cancelledBookings || 0}
                    </div>
                    <div className="text-sm text-gray-500">Cancelled</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${(selectedEventData.stats.totalRevenue || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {selectedEventData.stats.waitlistCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">Waitlist Count</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">
                      {((selectedEventData.stats.totalBookings || 0) / (selectedEventData.event.totalSeats || 1) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Booking Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Event Selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select an event from the dropdown above to view detailed analytics.
              </p>
            </div>
          </div>
        )}

        {/* Events Performance Overview */}
        <div className="bg-white shadow rounded-lg mt-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Events Performance Overview
            </h3>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(analytics).map((item) => {
                    const bookingRate = ((item.stats.totalBookings || 0) / (item.event.totalSeats || 1)) * 100
                    return (
                      <tr key={item.event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.event.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.event.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.event.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.stats.totalBookings || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.event.totalSeats || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            {bookingRate >= 80 ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                            ) : bookingRate >= 50 ? (
                              <ChartBarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            {bookingRate.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(item.stats.totalRevenue || 0).toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalyticsPage
