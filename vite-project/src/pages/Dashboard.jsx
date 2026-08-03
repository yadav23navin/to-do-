import { Link } from 'react-router-dom'
import '../App.css'
import TotalTasks from './TotalTasks.jsx'
import CompletedTasks from './CompletedTasks.jsx'
import PendingTask from './PendingTask.jsx'
import { useTasks } from '../hooks/useTasks.js'

function Dashboard() {
  const { totalTasks } = useTasks()

  return (
    <>
      <div className="dashboard-actions">
        <Link className="button button-primary" to="/add-tasks">
          Add Task
        </Link>
      </div>

      <section className="summary-grid" aria-label="Task summary">
        <TotalTasks showList={false} />
        <PendingTask showList={false} />
        <CompletedTasks showList={false} />
      </section>

      {totalTasks.length === 0 && (
        <div className="empty-state">
          <p>No tasks yet — add your first task to get started.</p>
          <Link className="button button-primary" to="/add-tasks">
            Add Task
          </Link>
        </div>
      )}
    </>
  )
}

export default Dashboard