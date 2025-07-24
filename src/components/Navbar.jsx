import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser, selectUser, selectIsAuthenticated, selectIsAdmin } from '../store/slices/authSlice'
import { 
  CalendarIcon, 
  HomeIcon, 
  TicketIcon, 
  ClockIcon, 
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/')
  }

  const navLinks = [
    {
      name: isAdmin ? 'Dashboard' : 'Home',
      path: isAdmin ? '/admin-dashboard' : (isAuthenticated ? '/user-dashboard' : '/'),
      icon: HomeIcon,
      show: true
    },
    {
      name: 'Browse Events',
      path: '/events',
      icon: CalendarIcon,
      show: isAuthenticated && !isAdmin
    },
    {
      name: 'Create Event',
      path: '/create-event',
      icon: CalendarIcon,
      show: isAuthenticated && isAdmin
    },
    {
      name: 'My Bookings',
      path: '/bookings',
      icon: TicketIcon,
      show: isAuthenticated && !isAdmin
    },
    {
      name: 'Manage Bookings',
      path: '/admin/bookings',
      icon: TicketIcon,
      show: isAuthenticated && isAdmin
    },
    {
      name: 'Waitlist',
      path: '/waitlist',
      icon: ClockIcon,
      show: isAuthenticated && !isAdmin
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: Cog6ToothIcon,
      show: isAuthenticated && isAdmin
    },
    {
      name: 'Feedback',
      path: '/feedback',
      icon: ChatBubbleLeftRightIcon,
      show: isAuthenticated && !isAdmin
    },
    {
      name: 'All Feedback',
      path: '/admin/feedback',
      icon: ChatBubbleLeftRightIcon,
      show: isAuthenticated && isAdmin
    }
  ]

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">EventHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks
              .filter(link => link.show)
              .map((link) => {
                const IconComponent = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                )
              })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-gray-700">
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="font-medium">{user?.name || user?.email}</span>
                  {isAdmin && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-3">
          <div className="flex flex-wrap gap-2">
            {navLinks
              .filter(link => link.show)
              .map((link) => {
                const IconComponent = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-sm"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
