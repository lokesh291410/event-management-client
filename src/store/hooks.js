import { useDispatch, useSelector } from 'react-redux'
import { useMemo } from 'react'

// Custom hook to combine useDispatch and useSelector
export const useAppDispatch = () => useDispatch()

export const useAppSelector = useSelector

// Custom hook for auth state
export const useAuth = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)
  
  return useMemo(() => ({
    ...auth,
    dispatch,
    isAdmin: auth.user?.role === 'ADMIN',
  }), [auth, dispatch])
}

// Custom hook for events state
export const useEvents = () => {
  const dispatch = useAppDispatch()
  const events = useAppSelector((state) => state.events)
  
  return useMemo(() => ({
    ...events,
    dispatch,
  }), [events, dispatch])
}

// Custom hook for bookings state
export const useBookings = () => {
  const dispatch = useAppDispatch()
  const bookings = useAppSelector((state) => state.bookings)
  
  return useMemo(() => ({
    ...bookings,
    dispatch,
  }), [bookings, dispatch])
}

// Custom hook for waitlist state
export const useWaitlist = () => {
  const dispatch = useAppDispatch()
  const waitlist = useAppSelector((state) => state.waitlist)
  
  return useMemo(() => ({
    ...waitlist,
    dispatch,
  }), [waitlist, dispatch])
}

// Custom hook for feedback state
export const useFeedback = () => {
  const dispatch = useAppDispatch()
  const feedback = useAppSelector((state) => state.feedback)
  
  return useMemo(() => ({
    ...feedback,
    dispatch,
  }), [feedback, dispatch])
}
