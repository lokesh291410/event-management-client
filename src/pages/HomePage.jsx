import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUpcomingEvents, selectUpcomingEvents, selectEventsLoading } from '../store/slices/eventsSlice'
import { selectIsAuthenticated, selectUser, selectIsAdmin } from '../store/slices/authSlice'
import { 
  CalendarIcon, 
  UsersIcon, 
  ClockIcon, 
  SparklesIcon,
  ArrowRightIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const HomePage = () => {
  const dispatch = useDispatch()
  const events = useSelector(selectUpcomingEvents)
  const loading = useSelector(selectEventsLoading)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const isAdmin = useSelector(selectIsAdmin)

  useEffect(() => {
    // Always fetch events for the homepage, authentication not required for viewing
    dispatch(fetchUpcomingEvents())
  }, [dispatch])

  // Redirect authenticated users to their appropriate dashboards
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin-dashboard" replace />
    } else {
      return <Navigate to="/user-dashboard" replace />
    }
  }

  const featuredEvents = events.slice(0, 3)

  const features = [
    {
      icon: CalendarIcon,
      title: 'Easy Event Discovery',
      description: 'Find workshops, conferences, hackathons, and more in one place'
    },
    {
      icon: UsersIcon,
      title: 'Smart Booking',
      description: 'Book events instantly with real-time seat availability'
    },
    {
      icon: ClockIcon,
      title: 'Waitlist Management',
      description: 'Join waitlists and get notified when seats become available'
    },
    {
      icon: SparklesIcon,
      title: 'Rate & Review',
      description: 'Share feedback and help improve future events'
    }
  ]

  const formatDate = (dateString, timeString) => {
    const date = new Date(`${dateString}T${timeString}`)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">EventHub</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover amazing events, book instantly, and connect with like-minded people. 
              Your gateway to workshops, conferences, hackathons, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Sign In</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                to="/signup"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EventHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to discover, book, and manage your event experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="text-center group">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of event enthusiasts and never miss an opportunity
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <span>Sign Up Now</span>
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage
