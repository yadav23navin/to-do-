import TaskList from '../components/TaskList.jsx'
import { useTasks } from '../hooks/useTasks.js'

function CompletedTasks({ showList = true }) {
  const { completedTasks, filteredCompletedTasks } = useTasks()

  return (
    <div className="task-summary" id="completed-tasks">
      <h2>Completed Tasks</h2>
      <p className="task-count">{completedTasks.length}</p>
      {showList && (
        <TaskList
          tasks={filteredCompletedTasks}
          emptyMessage="No completed tasks yet."
        />
      )}
    </div>
  )
}

export default CompletedTasks
