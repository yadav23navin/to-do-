import TaskList from '../components/TaskList.jsx'
import { useTasks } from '../hooks/useTasks.js'

function TotalTasks({ showList = true }) {

  // the below 3 lines run when search and add task navigate to this page. It gets the values from the TasksProvider context and stores them in a variable. The useTasks hook is used to access the context values, which include the totalTasks array and the filteredTasks array. These arrays are then used to display the total number of tasks and the list of tasks in the component. 
  const taskContext = useTasks()                  // Get all the values stored in TasksProvider

  // Store only the totalTasks array in a variable
  const totalTasks = taskContext.totalTasks
  const filteredTasks = taskContext.filteredTasks

  return (
    <div className="task-summary" id="total-tasks">
      <h2>Total Tasks</h2>

      {/* Displays the total number of tasks */}
      <p className="task-count">
        {totalTasks.length}                {/* Displays the total number of tasks in the task summary section. The length property of the totalTasks array is used to get the count of tasks, which is then rendered inside a paragraph element with the class "task-count".  */} 
      </p>

      {/* Displays the list of tasks only when showList is true */}
      {showList && (
        <TaskList tasks={filteredTasks} />      /*this lines runs after the bove mentioned 3 lines for displaying the list of tasks. */
      )}

    </div>
  )
}

export default TotalTasks
