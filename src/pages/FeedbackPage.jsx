import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChatBubbleLeftRightIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { 
  submitFeedback, 
  fetchUserFeedback, 
  selectFeedbackLoading, 
  selectFeedbackError,
  selectUserFeedback
} from '../store/slices/feedbackSlice'
import { 
  fetchUserBookings, 
  selectBookings 
} from '../store/slices/bookingsSlice'
import { selectUser } from '../store/slices/authSlice'

const FeedbackPage = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const bookings = useSelector(selectBookings)
  const userFeedback = useSelector(selectUserFeedback)
  const loading = useSelector(selectFeedbackLoading)
  const error = useSelector(selectFeedbackError)

  const [feedback, setFeedback] = useState({
    eventId: '',
    rating: 0,
    comment: '',
    suggestions: '',
    wouldRecommend: true
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Fetch user's bookings and feedback on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserBookings(user.id))
      dispatch(fetchUserFeedback(user.id))
    }
  }, [dispatch, user?.id])

  // Get attended events (confirmed bookings for past events)
  const attendedEvents = bookings.filter(booking => 
    booking.status === 'Confirmed' && 
    new Date(`${booking.eventDate}T${booking.eventTime}`) < new Date()
  )

  // Get events that haven't been reviewed yet
  const eventsToReview = attendedEvents.filter(booking => 
    !userFeedback.some(feedback => feedback.eventId === booking.eventId)
  )

  const handleRatingClick = (rating) => {
    setFeedback(prev => ({ ...prev, rating }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.id) return

    setSubmitting(true)
    setSubmitSuccess(false)

    try {
      await dispatch(submitFeedback({
        userId: user.id,
        feedbackData: {
          eventId: feedback.eventId,
          rating: feedback.rating,
          comment: feedback.comment,
          suggestions: feedback.suggestions,
          wouldRecommend: feedback.wouldRecommend
        }
      })).unwrap()

      // Reset form and show success
      setFeedback({
        eventId: '',
        rating: 0,
        comment: '',
        suggestions: '',
        wouldRecommend: true
      })
      setSubmitSuccess(true)

      // Refresh feedback list
      dispatch(fetchUserFeedback(user.id))
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Feedback</h1>
        <p className="text-gray-600">Share your experience and help improve future events</p>
      </div>

      {/* Feedback Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {submitSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-700">Thank you! Your feedback has been submitted successfully.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event
            </label>
            <select
              value={feedback.eventId}
              onChange={(e) => setFeedback(prev => ({ ...prev, eventId: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={eventsToReview.length === 0}
            >
              <option value="">
                {eventsToReview.length === 0 
                  ? "No events available to review" 
                  : "Choose an event to review..."
                }
              </option>
              {eventsToReview.map((booking) => (
                <option key={booking.eventId} value={booking.eventId}>
                  {booking.eventTitle} - {formatDate(booking.eventDate)}
                </option>
              ))}
            </select>
            {eventsToReview.length === 0 && attendedEvents.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                You need to attend an event before you can leave feedback.
              </p>
            )}
            {eventsToReview.length === 0 && attendedEvents.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                You have already provided feedback for all your attended events.
              </p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="text-2xl focus:outline-none"
                >
                  {star <= feedback.rating ? (
                    <StarIconSolid className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your experience..."
            />
          </div>

          {/* Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggestions for Improvement
            </label>
            <textarea
              value={feedback.suggestions}
              onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What could be improved?"
            />
          </div>

          {/* Recommendation */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={feedback.wouldRecommend}
                onChange={(e) => setFeedback(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                I would recommend this event to others
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || eventsToReview.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      {/* Previous Feedback */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Previous Feedback</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : userFeedback.length > 0 ? (
          <div className="space-y-6">
            {userFeedback.map((feedbackItem) => (
              <div key={feedbackItem.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {feedbackItem.eventTitle}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(feedbackItem.eventDate).toLocaleDateString()} • {feedbackItem.eventLocation}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIconSolid
                            key={star}
                            className={`h-4 w-4 ${
                              star <= feedbackItem.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {feedbackItem.rating}/5 stars
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Submitted: {new Date(feedbackItem.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                {feedbackItem.comment && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Review:</h4>
                    <p className="text-gray-600">{feedbackItem.comment}</p>
                  </div>
                )}

                {feedbackItem.suggestions && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Suggestions:</h4>
                    <p className="text-gray-600">{feedbackItem.suggestions}</p>
                  </div>
                )}

                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    {feedbackItem.wouldRecommend ? '✓' : '✗'} Would recommend to others
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No feedback submitted yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Attend an event and share your experience!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FeedbackPage
