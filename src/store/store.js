import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import eventsReducer from './slices/eventsSlice'
import bookingsReducer from './slices/bookingsSlice'
import waitlistReducer from './slices/waitlistSlice'
import feedbackReducer from './slices/feedbackSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    bookings: bookingsReducer,
    waitlist: waitlistReducer,
    feedback: feedbackReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store
