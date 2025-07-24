import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser } from '../store/slices/authSlice'
import { notifyWaitlist } from '../store/slices/waitlistSlice'
import { 
  UsersIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'

const AdminBookingsPage = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const [bookings, setBookings] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notifyLoading, setNotifyLoading] = useState({})
  const [selectedEvent, setSelectedEvent] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
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
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      // First fetch admin events
      const eventsResponse = await authAPI.get(`/admin/events?adminId=${user.id}`)
      const adminEvents = eventsResponse.data?.data || []
      setEvents(adminEvents)

      // Then fetch bookings for each event
      const allBookings = []
      for (const event of adminEvents) {
        try {
          const bookingsResponse = await authAPI.get(`/admin/event/${event.id}/bookings?adminId=${user.id}`)
          const eventBookings = bookingsResponse.data?.data || []
          allBookings.push(...eventBookings.map(booking => ({
            ...booking,
            event: event
          })))
        } catch (error) {
          console.error(`Failed to fetch bookings for event ${event.id}:`, error)
        }
      }
      setBookings(allBookings)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch bookings data')
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

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEvent = selectedEvent === '' || booking.event?.id?.toString() === selectedEvent
    const matchesStatus = statusFilter === '' || booking.status?.toUpperCase() === statusFilter.toUpperCase()
    
    return matchesSearch && matchesEvent && matchesStatus
  })

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status?.toUpperCase() === 'CONFIRMED').length,
    pendingBookings: bookings.filter(b => b.status?.toUpperCase() === 'PENDING').length,
    cancelledBookings: bookings.filter(b => b.status?.toUpperCase() === 'CANCELLED').length
  }

  const handleNotifyWaitlist = async (eventId) => {
    setNotifyLoading(prev => ({ ...prev, [eventId]: true }))
    try {
      await dispatch(notifyWaitlist({ eventId, adminId: user.id })).unwrap()
      alert('Waitlist notified successfully!')
    } catch (error) {
      console.error('Failed to notify waitlist:', error)
      alert('Failed to notify waitlist: ' + error)
    } finally {
      setNotifyLoading(prev => ({ ...prev, [eventId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading bookings</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchAdminData}
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all event bookings
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
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.confirmedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Cancelled</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.cancelledBookings}</p>
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
                    placeholder="Search by user or event..."
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

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Waitlist Management */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Waitlist Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(event => {
                const eventBookings = bookings.filter(b => b.event?.id === event.id)
                const availableSeats = event.totalSeats - eventBookings.filter(b => b.status?.toUpperCase() === 'CONFIRMED').length
                return (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Available Seats: {availableSeats}</p>
                      <p>Total Capacity: {event.totalSeats}</p>
                    </div>
                    <button
                      onClick={() => handleNotifyWaitlist(event.id)}
                      disabled={notifyLoading[event.id] || availableSeats > 0}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {notifyLoading[event.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <BellIcon className="h-4 w-4 mr-2" />
                      )}
                      Notify Waitlist
                    </button>
                    {availableSeats > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Waitlist notification available when event is full
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Bookings ({filteredBookings.length})
              </h3>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                <p className="mt-1 text-sm text-gray-500">No bookings match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {booking.user?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.user?.name || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.event?.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.event?.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.event?.date ? formatDate(booking.event.date) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.numberOfSeats || 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{booking.status || 'PENDING'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.bookingDate ? formatDate(booking.bookingDate) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBookingsPage
