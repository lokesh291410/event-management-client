import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUpcomingEvents, selectUpcomingEvents, selectEventsLoading } from '../store/slices/eventsSlice'
import { fetchUserBookings, selectBookings, selectBookingsLoading } from '../store/slices/bookingsSlice'
import { selectUser } from '../store/slices/authSlice'
import { 
  CalendarIcon, 
  UsersIcon, 
  ClockIcon, 
  SparklesIcon,
  ArrowRightIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TicketIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

const UserDashboard = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const events = useSelector(selectUpcomingEvents)
  const bookings = useSelector(selectBookings)
  const eventsLoading = useSelector(selectEventsLoading)
  const bookingsLoading = useSelector(selectBookingsLoading)

  useEffect(() => {
    dispatch(fetchUpcomingEvents())
    if (user?.id) {
      dispatch(fetchUserBookings(user.id))
    }
  }, [dispatch, user])

  const recentEvents = events.slice(0, 4)
  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.event?.eventDate) > new Date()
  ).slice(0, 3)

  const stats = {
    totalBookings: bookings.length,
    upcomingEvents: upcomingBookings.length,
    completedEvents: bookings.filter(booking => 
      new Date(booking.event?.eventDate) < new Date()
    ).length
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

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || user?.username}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Discover amazing events and manage your bookings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TicketIcon className="h-8 w-8 text-blue-600" />
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
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Upcoming Events</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HeartIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Attended</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completedEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link
            to="/events"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Browse Events</h3>
                <p className="text-gray-600 text-sm">Find your next event</p>
              </div>
            </div>
          </Link>

          <Link
            to="/bookings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-green-300"
          >
            <div className="flex items-center space-x-3">
              <TicketIcon className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">My Bookings</h3>
                <p className="text-gray-600 text-sm">Manage your bookings</p>
              </div>
            </div>
          </Link>

          <Link
            to="/waitlist"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-orange-300"
          >
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Waitlist</h3>
                <p className="text-gray-600 text-sm">Check your waiting list</p>
              </div>
            </div>
          </Link>

          <Link
            to="/feedback"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300"
          >
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Feedback</h3>
                <p className="text-gray-600 text-sm">Rate your experiences</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Bookings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Upcoming Bookings
                </h3>
                <Link
                  to="/bookings"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View all
                </Link>
              </div>

              {bookingsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{booking.event?.title}</h4>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{formatDate(booking.event?.eventDate)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPinIcon className="h-4 w-4" />
                              <span>{booking.event?.location}</span>
                            </div>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming bookings</h3>
                  <p className="mt-1 text-sm text-gray-500">Start by browsing available events.</p>
                  <div className="mt-6">
                    <Link
                      to="/events"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Events
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Events */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recommended Events
                </h3>
                <Link
                  to="/events"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View all
                </Link>
              </div>

              {eventsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{formatDate(event.eventDate)} at {formatTime(event.eventTime)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPinIcon className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {event.price > 0 ? `$${event.price}` : 'Free'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {event.capacity - (event.totalBookings || 0)} seats left
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No events available</h3>
                  <p className="mt-1 text-sm text-gray-500">Check back later for new events!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
