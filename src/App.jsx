import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { setUser, setLoading } from './store/slices/authSlice'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import EventsPage from './pages/EventsPage'
import EventDetailsPage from './pages/EventDetailsPage'
import BookingsPage from './pages/BookingsPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminBookingsPage from './pages/AdminBookingsPage'
import AdminAnalyticsPage from './pages/AdminAnalyticsPage'
import AdminFeedbackPage from './pages/AdminFeedbackPage'
import UserDashboard from './pages/UserDashboard'
import CreateEventPage from './pages/CreateEventPage'
import WaitlistPage from './pages/WaitlistPage'
import FeedbackPage from './pages/FeedbackPage'
import './App.css'

// Component to handle authentication initialization
function AppContent() {
  useEffect(() => {
    // Check if user is logged in this specific tab (sessionStorage only)
    const savedUser = sessionStorage.getItem('user')
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      store.dispatch(setUser(parsedUser))
    } else {
      // No session in this tab - user needs to login
      store.dispatch(setLoading(false))
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* User Routes */}
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/events/:id/edit" element={<CreateEventPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
            
            {/* Legacy admin route - redirect to new admin dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
