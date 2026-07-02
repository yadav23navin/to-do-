import { useNavigate } from 'react-router-dom'
import '../App.css'

function Profile() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    navigate('/login')
  }

  return (
    <>
      <div className="Logout">
        <button
          className="button button-secondary"
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <section className="work-panel profile-page">
        <h2>Profile</h2>
        <p className="task-meta">
          Welcome to your TaskFlow workspace.
        </p>
      </section>
    </>
  )
}

export default Profile
