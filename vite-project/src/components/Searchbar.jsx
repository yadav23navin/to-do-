import { useNavigate } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks.js'

function Searchbar() {
  const { search, setSearch } = useTasks()
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    navigate('/total-tasks')             // once user gets updated search value, it navigates to total-tasks page where the search results are displayed.
  }

  return (
    <form className="searchbar" role="search" onSubmit={handleSubmit}>
      <label htmlFor="dashboard-search"></label>

      <input
        id="dashboard-search"
        name="search"
        type="search"
        placeholder="Search tasks..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <button
        className="icon-button"
        type="submit"
        aria-label="Search"
      >
        S
      </button>
    </form>
  )
}

export default Searchbar
