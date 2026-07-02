import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar.jsx"
import Topbar from "../components/Topbar.jsx"

function MainLayout() {
  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}       

export default MainLayout
