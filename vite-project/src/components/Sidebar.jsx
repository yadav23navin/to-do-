import { NavLink } from 'react-router-dom'
import { FaTh, FaListUl, FaClock, FaCheckCircle, FaUser } from 'react-icons/fa'

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="brand">
        <span className="brand-mark">T</span>
        <div>
          <p className="brand-title">TaskFlow</p>
          <p className="brand-subtitle">Workspace</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        <NavLink className="sidebar-link" to="/dashboard"><FaTh /> Dashboard</NavLink>
        <NavLink className="sidebar-link" to="/total-tasks"><FaListUl /> Total</NavLink>
        <NavLink className="sidebar-link" to="/pending-tasks"><FaClock /> Pending</NavLink>
        <NavLink className="sidebar-link" to="/completed-tasks"><FaCheckCircle /> Completed</NavLink>
        <NavLink className="sidebar-link" to="/profile"><FaUser /> Profile</NavLink>
      </nav>
    </div>
  )
}

export default Sidebar