import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createEvent, updateEvent, fetchAdminEventDetails } from '../store/slices/eventsSlice'
import { selectUser } from '../store/slices/authSlice'
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

const CreateEventPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const { id } = useParams()
  const isEditMode = Boolean(id)
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    location: '',
    totalSeats: 50,
    category: 'WORKSHOP',
    price: 0,
    organizerName: '',
    organizerEmail: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const categories = [
    'WORKSHOP',
    'CONFERENCE', 
    'HACKATHON',
    'MEETUP',
    'WEBINAR',
    'SEMINAR'
  ]

  // Fetch event data when in edit mode
  useEffect(() => {
    const fetchEventData = async () => {
      if (isEditMode && id && user?.id) {
        setIsLoading(true)
        try {
          const result = await dispatch(fetchAdminEventDetails({ eventId: id, adminId: user.id })).unwrap()
          setEventData({
            title: result.title || '',
            description: result.description || '',
            date: result.date || '',
            time: result.time || '',
            endDate: result.endDate || '',
            endTime: result.endTime || '',
            location: result.location || '',
            totalSeats: result.totalSeats || 50,
            category: result.category || 'WORKSHOP',
            price: result.price || 0,
            organizerName: result.organizerName || '',
            organizerEmail: result.organizerEmail || ''
          })
        } catch (error) {
          console.error('Failed to fetch event data:', error)
          navigate('/admin-dashboard')
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchEventData()
  }, [isEditMode, id, user?.id, dispatch, navigate])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setEventData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (isEditMode) {
        await dispatch(updateEvent({ 
          eventId: id,
          eventData, 
          adminId: user.id 
        })).unwrap()
      } else {
        await dispatch(createEvent({ 
          eventData, 
          adminId: user.id 
        })).unwrap()
      }
      
      navigate('/admin-dashboard')
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} event:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit Event' : 'Create New Event'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update the event details' : 'Fill in the details to create a new event'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading event data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event title"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your event..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={eventData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={eventData.location}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Event location"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="date"
                value={eventData.date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                name="time"
                value={eventData.time}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={eventData.endDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={eventData.endTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Capacity and Pricing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Seats *
              </label>
              <input
                type="number"
                name="totalSeats"
                value={eventData.totalSeats}
                onChange={handleChange}
                required
                min="1"
                max="10000"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={eventData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Organizer Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organizer Name *
              </label>
              <input
                type="text"
                name="organizerName"
                value={eventData.organizerName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your name or organization"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organizer Email *
              </label>
              <input
                type="email"
                name="organizerEmail"
                value={eventData.organizerEmail}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@example.com"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin-dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : (isEditMode ? 'Update Event' : 'Create Event')
              }
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}

export default CreateEventPage
