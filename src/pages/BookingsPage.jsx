import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchUserBookings, 
  cancelBooking,
  selectBookings, 
  selectBookingsLoading, 
  selectBookingsError 
} from '../store/slices/bookingsSlice'
import { fetchEventDetails } from '../store/slices/eventsSlice'
import { selectUser } from '../store/slices/authSlice'
import { 
  CalendarIcon, 
  MapPinIcon, 
  TicketIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const BookingsPage = () => {
  const dispatch = useDispatch()
  const bookings = useSelector(selectBookings)
  const loading = useSelector(selectBookingsLoading)
  const error = useSelector(selectBookingsError)
  const user = useSelector(selectUser)
  
  const [cancellingId, setCancellingId] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [eventDetails, setEventDetails] = useState({}) // Store event details by eventId

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserBookings(user.id))
    }
  }, [dispatch, user?.id])

  // Debug booking IDs
  useEffect(() => {
    if (bookings.length > 0) {
      console.log('Booking IDs:', bookings.map(b => ({ id: b.id, hasId: !!b.id })))
      console.log(bookings)
      const duplicateIds = bookings.filter((booking, index, arr) => 
        arr.findIndex(b => b.id === booking.id) !== index
      )
      if (duplicateIds.length > 0) {
        console.warn('Duplicate booking IDs found:', duplicateIds)
      }
    }
  }, [bookings])

  // Fetch event details for each booking
  useEffect(() => {
    const fetchEventDetailsForBookings = async () => {
      if (bookings.length > 0) {
        const eventPromises = bookings.map(async (booking) => {
          if (!eventDetails[booking.eventId]) {
            try {
              const eventData = await dispatch(fetchEventDetails(booking.eventId)).unwrap()
              return { eventId: booking.eventId, data: eventData }
            } catch (error) {
              console.error(`Failed to fetch event ${booking.eventId}:`, error)
              return { eventId: booking.eventId, data: null }
            }
          }
          return null
        })

        const results = await Promise.all(eventPromises)
        const newEventDetails = { ...eventDetails }
        
        results.forEach(result => {
          if (result) {
            newEventDetails[result.eventId] = result.data
          }
        })
        
        setEventDetails(newEventDetails)
      }
    }

    fetchEventDetailsForBookings()
  }, [bookings, dispatch])

  const handleCancelBooking = async (booking) => {
    setCancellingId(`${booking.eventId}-${booking.bookingdate}`)
    try {
      await dispatch(cancelBooking({ 
        eventId: booking.eventId, 
        userId: user.id 
      })).unwrap()
      setShowCancelModal(false)
      setSelectedBooking(null)
    } catch (error) {
      console.error('Failed to cancel booking:', error)
    } finally {
      setCancellingId(null)
    }
  }

  const openCancelModal = (booking) => {
    setSelectedBooking(booking)
    setShowCancelModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
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

  const getStatusColor = (status) => {
    const colors = {
      'CONFIRMED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const isEventPast = (eventDate) => {
    if (!eventDate) return false
    const eventDateTime = new Date(eventDate)
    return eventDateTime < new Date()
  }

  const canCancelBooking = (booking) => {
    return booking.status === 'Confirmed' && !isEventPast(booking.bookingdate)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={`skeleton-${i}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your event bookings and view details</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <div
              key={`booking-${booking.eventId}-${index}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    {/* Event Title and Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {booking.eventTitle || 'Event Title'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            Booking for Event #{booking.eventId}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{formatDate(eventDetails[booking.eventId]?.date || booking.bookingdate)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{formatTime(eventDetails[booking.eventId]?.time || booking.bookingtime)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {eventDetails[booking.eventId]?.location || 'Loading location...'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <TicketIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{booking.numberOfSeats} seat(s)</span>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span className="font-medium">
                          {eventDetails[booking.eventId]?.price ? 
                            `Total: $${(eventDetails[booking.eventId].price * booking.numberOfSeats).toFixed(2)}` :
                            'Total: Loading...'
                          }
                        </span>
                      </div>
                      {booking.bookingdate && (
                        <span>
                          Booked on: {new Date(booking.bookingdate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col gap-2">
                    <Link
                      to={`/events/${booking.eventId}`}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Event
                    </Link>
                    
                    {canCancelBooking(booking) && (
                      <button
                        onClick={() => openCancelModal(booking)}
                        disabled={cancellingId === `${booking.eventId}-${booking.bookingdate}`}
                        className="inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingId === `${booking.eventId}-${booking.bookingdate}` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                        ) : (
                          <XMarkIcon className="h-4 w-4 mr-2" />
                        )}
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-4">
            You haven't booked any events yet. Start exploring!
          </p>
          <Link
            to="/events"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Events
          </Link>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Cancel Booking
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to cancel your booking for "{selectedBooking.eventTitle}"?
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowCancelModal(false)
                      setSelectedBooking(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={() => handleCancelBooking(selectedBooking)}
                    disabled={cancellingId === `${selectedBooking.eventId}-${selectedBooking.bookingdate}`}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancellingId === `${selectedBooking.eventId}-${selectedBooking.bookingdate}` ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingsPage
