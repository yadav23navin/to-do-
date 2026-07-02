import TaskList from '../components/TaskList.jsx'
import { useTasks } from '../hooks/useTasks.js'

function PendingTask({ showList = true }) {
  const { pendingTasks, filteredPendingTasks } = useTasks()

  return (
    <div className="task-summary" id="pending-tasks">
      <h2>Pending Tasks</h2>
      <p className="task-count">{pendingTasks.length}</p>
      {showList && (
        <TaskList
        tasks={filteredPendingTasks}
        emptyMessage="No pending tasks left."
        showButton={true}
      />
      )}
    </div>
  )
}

export default PendingTask
