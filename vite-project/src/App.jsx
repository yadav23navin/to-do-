import { Link } from 'react-router-dom'
import './App.css'

function App() {
  return (  
    <main className="page home-page">
      <section className="panel home-panel">
        
        <h1>Welcome</h1>
        <p className="page-copy">Create an account or login</p>

        <nav className="nav-actions" aria-label="Main navigation">
          <Link className="button button-primary" to="/login">Login</Link>
          <Link className="button button-secondary" to="/register">Register</Link>
         
        </nav>
      </section>
    </main>
  )
}
export default App
