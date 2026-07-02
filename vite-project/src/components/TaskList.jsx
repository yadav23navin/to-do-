import { useTasks } from '../hooks/useTasks.js'

function TaskList({
  tasks,
  emptyMessage = 'No tasks found.',
  showButton = false
}) {
  const { toggleStatus } = useTasks()

  if (tasks.length === 0) {                             // checks if the tasks array is empty.
    return <p className="task-meta">{emptyMessage}</p>
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (                                                                  // loops through the tasks array and renders each task as an article element. Each task is displayed with its title, description, status, category, priority, and due date. The task's status is visually represented by a colored dot (green for completed tasks and red for pending tasks).
        <article className="task-item" key={task.id}>                                       {/* Each task is displayed as an article element with a unique key based on its id. This helps React efficiently update the DOM when tasks change.*/}
          <span
            className={`task-dot ${task.status === 'Completed' ? 'task-dot-complete' : 'task-dot-pending'}`}  // usin ternary operator to conditionally apply a CSS class based on the task's status. If the task is completed, it applies the 'task-dot-complete' class; otherwise, it applies the 'task-dot-pending' class.
            aria-hidden="true"                                                                // te above code is showing a colored dot next to each task to visually indicate its status. The 'aria-hidden="true"' attribute is used to hide this visual indicator from screen readers, as it is purely decorative and does not convey any additional information about the task's content.
          />
          <div className="task-details">                                                       {/*contains all the textual information about the task, including its title, description, status, category, priority, and due date.*/}
            <div className="task-row">
              <h3>{task.title}</h3>
              <span className="task-status">{task.status}</span>                               {/*displays the task's status (e.g., "Completed" or "Pending") next to the task title.*/}
            </div>

            <p>{task.description}</p>                                                           {/*displays the task's description below the title and status.*/}

            <div className="task-tags">                                                           {/*displays additional information about the task, such as its category, priority, and due date, in a visually grouped manner.*/}
              <span>{task.category}</span>                                                        {/*displays the task's category (e.g., "Work", "Personal") as a tag next to the priority and due date.*/}
              <span>{task.priority}</span>
              <span>Due {task.dueDate}</span>

              {showButton && (
                <button
                  className="task-action"
                  type="button"
                  onClick={() => toggleStatus(task.id)}
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default TaskList