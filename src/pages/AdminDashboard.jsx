import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchAdminEvents, 
  publishEvent, 
  cancelEvent,
  deleteEvent,
  selectAdminEvents, 
  selectEventsLoading, 
  selectEventsError 
} from '../store/slices/eventsSlice'
import { selectUser } from '../store/slices/authSlice'
import { 
  PlusIcon, 
  CalendarIcon, 
  UsersIcon, 
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const events = useSelector(selectAdminEvents)
  const loading = useSelector(selectEventsLoading)
  const error = useSelector(selectEventsError)
  
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAdminEvents(user.id))
    }
  }, [dispatch, user])

  const handlePublishEvent = async (eventId) => {
    setActionLoading(prev => ({ ...prev, [`publish_${eventId}`]: true }))
    try {
      await dispatch(publishEvent({ eventId, adminId: user.id })).unwrap()
      dispatch(fetchAdminEvents(user.id)) // Refresh events
    } catch (error) {
      console.error('Failed to publish event:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [`publish_${eventId}`]: false }))
    }
  }

  const handleCancelEvent = async (eventId) => {
    const reason = prompt('Please provide a reason for cancellation:')
    if (!reason) return
    
    setActionLoading(prev => ({ ...prev, [`cancel_${eventId}`]: true }))
    try {
      await dispatch(cancelEvent({ eventId, adminId: user.id, reason })).unwrap()
      dispatch(fetchAdminEvents(user.id)) // Refresh events
    } catch (error) {
      console.error('Failed to cancel event:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [`cancel_${eventId}`]: false }))
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }
    
    setActionLoading(prev => ({ ...prev, [`delete_${eventId}`]: true }))
    try {
      await dispatch(deleteEvent({ eventId, adminId: user.id })).unwrap()
      dispatch(fetchAdminEvents(user.id)) // Refresh events
    } catch (error) {
      console.error('Failed to delete event:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete_${eventId}`]: false }))
    }
  }

  // Calculate stats from events
  const stats = {
    totalEvents: events.length,
    publishedEvents: events.filter(e => e.status === 'PUBLISHED').length,
    draftEvents: events.filter(e => e.status === 'DRAFT').length,
    totalBookings: events.reduce((sum, event) => sum + ((event.totalSeats - event.availableSeats) || 0), 0)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'DRAFT':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      case 'CANCELLED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.firstName || 'Admin'}! Manage your events and bookings.
              </p>
            </div>
            <Link
              to="/create-event"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Published</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.publishedEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Drafts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.draftEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                My Events
              </h3>
              <div className="flex space-x-2">
                <Link
                  to="/create-event"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  New Event
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading events...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading events</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first event.</p>
                <div className="mt-6">
                  <Link
                    to="/create-event"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Event
                  </Link>
                </div>
              </div>
            ) : (
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
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacity
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <CalendarIcon className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {event.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {event.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(event.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {getStatusIcon(event.status)}
                            <span className="ml-1">{event.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(event.totalSeats - event.availableSeats) || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.totalSeats}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/events/${event.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Event"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/events/${event.id}/edit`}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit Event"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                            {event.status === 'DRAFT' && (
                              <button
                                onClick={() => handlePublishEvent(event.id)}
                                disabled={actionLoading[`publish_${event.id}`]}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Publish Event"
                              >
                                {actionLoading[`publish_${event.id}`] ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                ) : (
                                  <PlayIcon className="h-5 w-5" />
                                )}
                              </button>
                            )}
                            {(event.status === 'PUBLISHED' || event.status === 'DRAFT') && (
                              <button
                                onClick={() => handleCancelEvent(event.id)}
                                disabled={actionLoading[`cancel_${event.id}`]}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Cancel Event"
                              >
                                {actionLoading[`cancel_${event.id}`] ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                ) : (
                                  <XMarkIcon className="h-5 w-5" />
                                )}
                              </button>
                            )}
                            <button
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              onClick={() => handleDeleteEvent(event.id)}
                              disabled={actionLoading[`delete_${event.id}`]}
                              title="Delete Event"
                            >
                              {actionLoading[`delete_${event.id}`] ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                              ) : (
                                <TrashIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/bookings"
            className="relative block w-full bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
          >
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Manage Bookings</h3>
                <p className="text-sm text-gray-500">View and manage all event bookings</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="relative block w-full bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
          >
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-500">View detailed analytics and reports</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/feedback"
            className="relative block w-full bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
          >
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Feedback</h3>
                <p className="text-sm text-gray-500">Review event feedback and ratings</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
