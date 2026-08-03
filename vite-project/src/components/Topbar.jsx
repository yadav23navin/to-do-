import Searchbar from './Searchbar.jsx'

function Topbar() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
  const firstName = currentUser?.name?.split(' ')[0] || 'there'

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Overview</p>
        <h1>Welcome, {firstName}!</h1>
      </div>

      <div className="topbar-actions">
        <Searchbar />
      </div>
    </header>
  )
}

export default Topbar