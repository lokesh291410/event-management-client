import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchUpcomingEvents, 
  fetchEventsByCategory, 
  searchEvents,
  selectUpcomingEvents, 
  selectEventsLoading, 
  selectEventsError,
  selectEventsFilters,
  setFilters
} from '../store/slices/eventsSlice'
import { 
  CalendarIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const EventsPage = () => {
  const dispatch = useDispatch()
  const events = useSelector(selectUpcomingEvents)
  const loading = useSelector(selectEventsLoading)
  const error = useSelector(selectEventsError)
  const filters = useSelector(selectEventsFilters)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const categories = [
    'WORKSHOP',
    'CONFERENCE', 
    'HACKATHON',
    'MEETUP',
    'WEBINAR',
    'SEMINAR'
  ]

  useEffect(() => {
    dispatch(fetchUpcomingEvents())
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      dispatch(searchEvents(searchTerm.trim()))
      dispatch(setFilters({ searchKeyword: searchTerm.trim() }))
    } else {
      dispatch(fetchUpcomingEvents())
      dispatch(setFilters({ searchKeyword: '' }))
    }
  }

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category)
    if (category) {
      dispatch(fetchEventsByCategory(category))
      dispatch(setFilters({ category }))
    } else {
      dispatch(fetchUpcomingEvents())
      dispatch(setFilters({ category: '' }))
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    dispatch(setFilters({ category: '', searchKeyword: '' }))
    dispatch(fetchUpcomingEvents())
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Events</h1>
        <p className="text-gray-600">Find workshops, conferences, hackathons, and more</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by category:</span>
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Active Filters */}
          {(filters.searchKeyword || filters.category) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {filters.searchKeyword && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{filters.searchKeyword}"
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Category: {filters.category}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {event.category}
                      </span>
                      {event.status && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        <span>{event.availableSeats || 0} left</span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>

                  {/* Description */}
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(event.date, event.time)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 flex-shrink-0" />
                      <span>{formatTime(event.time)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">
                        {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}
                      </span>
                    </div>
                  </div>

                  {/* Organizer */}
                  {event.organizerName && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Organized by <span className="font-medium">{event.organizerName}</span>
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">
              {filters.searchKeyword || filters.category 
                ? 'Try adjusting your search criteria or filters'
                : 'Check back later for new events!'
              }
            </p>
            {(filters.searchKeyword || filters.category) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage
