import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchEventDetails,
  fetchAdminEventDetails,
  selectCurrentEvent,
  selectEventsLoading 
} from '../store/slices/eventsSlice'
import { 
  bookEvent
} from '../store/slices/bookingsSlice'
import { 
  joinWaitlist 
} from '../store/slices/waitlistSlice'
import { selectUser } from '../store/slices/authSlice'
import { 
  CalendarIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  UserCircleIcon,
  EnvelopeIcon,
  TicketIcon
} from '@heroicons/react/24/outline'

const EventDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const event = useSelector(selectCurrentEvent)
  const loading = useSelector(selectEventsLoading)
  const user = useSelector(selectUser)
  
  const [seatsToBook, setSeatsToBook] = useState(1)
  const [isBooking, setIsBooking] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Helper function to fetch event details based on user role
  const fetchEventData = () => {
    if (id) {
      if (user?.role === 'ROLE_ADMIN') {
        dispatch(fetchAdminEventDetails({ eventId: id, adminId: user.id }))
      } else {
        dispatch(fetchEventDetails(id))
      }
    }
  }

  useEffect(() => {
    fetchEventData()
  }, [dispatch, id, user])

  const formatDate = (dateString, timeString) => {
    const date = new Date(`${dateString}T${timeString}`)
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

  const handleBookEvent = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setIsBooking(true)
    try {
      await dispatch(bookEvent({
        eventId: id,
        userId: user.id,
        seats: seatsToBook
      })).unwrap()
      
      setShowBookingModal(false)
      // Refresh event details to get updated seat count
      fetchEventData()
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsBooking(false)
    }
  }

  const handleJoinWaitlist = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      await dispatch(joinWaitlist({
        eventId: id,
        userId: user.id,
        seats: seatsToBook
      })).unwrap()
      
      setShowBookingModal(false)
    } catch (error) {
      console.error('Failed to join waitlist:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'PUBLISHED': 'bg-green-100 text-green-800',
      'ONGOING': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'DRAFT': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const canBook = event?.status === 'PUBLISHED' && (event?.availableSeats || 0) > 0
  const isFull = event?.availableSeats === 0

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
        <p className="text-gray-600 mt-2">The event you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {event.category}
              </span>
              {event.status && (
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500">
                <UsersIcon className="h-4 w-4 mr-1" />
                <span>{event.availableSeats || 0} / {event.totalSeats} seats available</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
          
          {event.description && (
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {event.description}
            </p>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Date</p>
                  <p className="text-gray-600">{formatDate(event.date, event.time)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Time</p>
                  <p className="text-gray-600">
                    {formatTime(event.time)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Price</p>
                  <p className="text-gray-600 text-lg font-semibold">
                    {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UsersIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Capacity</p>
                  <p className="text-gray-600">{event.totalSeats} total seats</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        {user && !user.role?.includes('ADMIN') && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-medium text-gray-900">
                  {canBook ? 'Book this event' : isFull ? 'Event is full' : 'Booking unavailable'}
                </h3>
                <p className="text-gray-600">
                  {canBook 
                    ? 'Reserve your spot now!' 
                    : isFull 
                    ? 'Join the waitlist to be notified if seats become available'
                    : 'This event is not available for booking'
                  }
                </p>
              </div>
              
              <div className="flex space-x-3">
                {canBook ? (
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
                  >
                    Book Now
                  </button>
                ) : isFull ? (
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 font-medium"
                  >
                    Join Waitlist
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Organizer Information */}
      {event.organizerName && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Organizer</h2>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 rounded-full p-3">
              <UserCircleIcon className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{event.organizerName}</p>
              {event.organizerEmail && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>{event.organizerEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <TicketIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {canBook ? 'Book Event' : 'Join Waitlist'}
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 mb-4">
                    How many seats would you like to {canBook ? 'book' : 'request'}?
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of seats
                    </label>
                    <select
                      value={seatsToBook}
                      onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>

                  {canBook && event.price > 0 && (
                    <div className="bg-gray-50 rounded p-3 mb-4">
                      <p className="text-sm text-gray-600">
                        Total: ${(event.price * seatsToBook).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={canBook ? handleBookEvent : handleJoinWaitlist}
                    disabled={isBooking}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking 
                      ? (canBook ? 'Booking...' : 'Joining...') 
                      : (canBook ? 'Confirm Booking' : 'Join Waitlist')
                    }
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

export default EventDetailsPage
