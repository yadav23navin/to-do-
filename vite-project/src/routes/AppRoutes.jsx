import { Navigate, Route, Routes } from 'react-router-dom'
import App from '../App'
import Login from '../pages/login.jsx'
import Register from '../pages/Register.jsx'
import VerifyOtp from '../pages/VerifyOtp.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Profile from '../pages/profile.jsx'
import TotalTasks from '../pages/TotalTasks.jsx'
import PendingTask from '../pages/PendingTask.jsx'
import CompletedTasks from '../pages/CompletedTasks.jsx'
import MainLayout from '../Layout/MainLayout.jsx'
import TasksProvider from '../hooks/TasksProvider.jsx'
import AddTasks from '../pages/AddTasks.jsx'
import EditTask from '../pages/EditTasks.jsx'
import ForgotPassword from '../pages/ForgotPassword.jsx'
import ResetPassword from '../pages/ResetPassword.jsx'


function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <ProtectedRoute>
            <TasksProvider>
              <MainLayout />
            </TasksProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/total-tasks" element={<TotalTasks />} />
        <Route path="/pending-tasks" element={<PendingTask />} />
        <Route path="/completed-tasks" element={<CompletedTasks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-tasks" element={<AddTasks />} />
        <Route path="/edit-task/:id" element={<EditTask />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes