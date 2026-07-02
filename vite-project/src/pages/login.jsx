import {Link, useNavigate } from 'react-router-dom'
import '../App.css'

function Login() {
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    localStorage.setItem('isLoggedIn', 'true')
    navigate('/dashboard') 
  }

  return (
    <main className="page auth-page"> 
      <section className="panel form-panel login">
        <p className="eyebrow">Welcome back</p>
        <h1>Login </h1> 
        <form className="form" onSubmit={handleSubmit}> 
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
          <button className="button button-primary" type="submit">Login</button>
        </form>
        <p className="auth-link">
            Don't have an account?{' '}
            <Link to="/register">Register</Link>
        </p>
        
      </section>
    </main>
  )
}


export default Login
