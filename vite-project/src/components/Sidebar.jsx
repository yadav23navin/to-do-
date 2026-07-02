import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="brand">
        <span className="brand-mark">T</span> {/*inline containner use to style or group small pieces of text.*/}
        <div>
          <p className="brand-title">TaskFlow</p>
          <p className="brand-subtitle">Workspace</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        <NavLink className="sidebar-link" to="/dashboard">Dashboard</NavLink>
        <NavLink className="sidebar-link" to="/total-tasks">Total</NavLink>
        <NavLink className="sidebar-link" to="/pending-tasks">Pending</NavLink>
        <NavLink className="sidebar-link" to="/completed-tasks">Completed</NavLink>
        <NavLink className="sidebar-link" to="/profile">Profile</NavLink>
      </nav>
    </div>
  )
}

export default Sidebar
