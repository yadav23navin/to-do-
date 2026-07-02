import { useNavigate } from 'react-router-dom'
import '../App.css'

function Register() {
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/login')
  }

  return (
    <main className="page auth-page">
      <section className="panel form-panel register">
        <p className="eyebrow">New here?</p>
        <h1>Register Page</h1>
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" required />
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
          <button className="button button-primary" type="submit">Register</button>
        </form>
      </section>
    </main>
  )
}

export default Register
