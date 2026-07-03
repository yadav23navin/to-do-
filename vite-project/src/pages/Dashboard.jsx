import { Link } from 'react-router-dom'
import '../App.css'
import TotalTasks from './TotalTasks.jsx'
import CompletedTasks from './CompletedTasks.jsx'
import PendingTask from './PendingTask.jsx'

function Dashboard() {
  return (
    <>
      <div className="dashboard-actions">
        <Link className="button button-primary" to="/add-tasks">
          Add Task
        </Link>
      </div>

      <section 
            className="summary-grid" 
            aria-label="Task summary">
        <TotalTasks showList={false} />
        <PendingTask showList={false} />
        <CompletedTasks showList={false} />
      </section>
    </>
  )
}

export default Dashboard
