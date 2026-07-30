import { Link } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks.js'
import { useToast } from '../hooks/useToast.js'
function TaskList({
  tasks,
  emptyMessage = 'No tasks found.',
  showButton = false
}) {
  const { toggleStatus, deleteTask } = useTasks()
  const toast = useToast()

  if (tasks.length === 0) {
    return <p className="task-meta">{emptyMessage}</p>
  }

  function handleDelete(id) {
    toast.confirm('Delete this task? This cannot be undone.', () => {
      deleteTask(id)
    })
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className="task-item" key={task.id}>
          <span
            className={`task-dot ${task.status === 'Completed' ? 'task-dot-complete' : 'task-dot-pending'}`}
            aria-hidden="true"
          />
          <div className="task-details">
            <div className="task-row">
              <h3>{task.title}</h3>
              <span className="task-status">{task.status}</span>
            </div>

            <div
              className="task-description"
              dangerouslySetInnerHTML={{
                __html: task.description,
              }}
            />

            <div className="task-tags">
              <span>{task.category}</span>
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

              <Link
                to={`/edit-task/${task.id}`}
                className="task-action"
              >
                Edit
              </Link>

              <button
                className="task-action task-action-danger"
                type="button"
                onClick={() => handleDelete(task.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default TaskList