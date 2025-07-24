import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchUserWaitlist, 
  removeFromWaitlist,
  selectUserWaitlist, 
  selectWaitlistLoading, 
  selectWaitlistError 
} from '../store/slices/waitlistSlice'
import { selectUser } from '../store/slices/authSlice'
import { 
  ClockIcon, 
  CalendarIcon, 
  MapPinIcon,
  XMarkIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

const WaitlistPage = () => {
  const dispatch = useDispatch()
  const waitlist = useSelector(selectUserWaitlist)
  const loading = useSelector(selectWaitlistLoading)
  const error = useSelector(selectWaitlistError)
  const user = useSelector(selectUser)

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserWaitlist(user.id))
    }
  }, [dispatch, user?.id])

  const handleRemoveFromWaitlist = (waitlistId) => {
    dispatch(removeFromWaitlist({ waitlistId, userId: user.id }))
  }

  const formatDate = (dateString, timeString) => {
    const date = new Date(`${dateString}T${timeString}`)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      'WAITING': 'bg-yellow-100 text-yellow-800',
      'NOTIFIED': 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Waitlist</h1>
        <p className="text-gray-600">Events you're waiting to get into</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Waitlist Items */}
      {waitlist.length > 0 ? (
        <div className="space-y-4">
          {waitlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.event?.title || 'Event Title'}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(item.event?.date, item.event?.time)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.event?.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <UsersIcon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.seatsRequested} seat(s) requested</span>
                    </div>
                  </div>

                  {item.status === 'NOTIFIED' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                      <p className="text-blue-800 text-sm font-medium">
                        🎉 Great news! You've been notified that seats are available. Book now!
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <button
                    onClick={() => handleRemoveFromWaitlist(item.id)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Remove from Waitlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No waitlist entries</h3>
          <p className="text-gray-600">
            You're not on any waitlists at the moment.
          </p>
        </div>
      )}
    </div>
  )
}

export default WaitlistPage
