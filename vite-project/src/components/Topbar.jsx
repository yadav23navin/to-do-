import Searchbar from './Searchbar.jsx'

function Topbar() {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Overview</p>
        <h1>Welcome !</h1>
      </div>

      <div className="topbar-actions">
        <Searchbar />
        
      </div>
    </header>
  )
}

export default Topbar
