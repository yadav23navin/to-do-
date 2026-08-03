import { FaListUl } from 'react-icons/fa'
import TaskList from '../components/TaskList.jsx'
import { useTasks } from '../hooks/useTasks.js'

function TotalTasks({ showList = true }) {
  const taskContext = useTasks()
  const totalTasks = taskContext.totalTasks
  const filteredTasks = taskContext.filteredTasks

  return (
    <div className="task-summary" id="total-tasks">
      <div className="summary-icon summary-icon-total"><FaListUl /></div>
      <h2>Total Tasks</h2>
      <p className="task-count">{totalTasks.length}</p>
      {showList && <TaskList tasks={filteredTasks} />}
    </div>
  )
}

export default TotalTasks