import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks.js'

const initialForm = {
  title: '',
  description: '',
  category: '',
  priority: 'Low',
  status: 'Pending',
  dueDate: '',
}

function AddTask() {
  const navigate = useNavigate()
  const { addTask } = useTasks()

  
  const [formData, setFormData] = useState(initialForm)             // this state variable holds the current values of the form fields. 

  // the below function runs when user type in the form.
  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  // Runs when the form is submitted
  function handleSubmit(event) {
    event.preventDefault() // Prevents page refresh

    addTask(formData) // Adds the task
    setFormData(initialForm) // Clears the form
    navigate('/total-tasks') // Goes to Total Tasks page once gets updated value from task provider context.
  }

  return (
    <section className=" add-task-page">
      <h2>Add New Task</h2>

      <form className="form" onSubmit={handleSubmit}>
        {/* Title */}
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          
        />

        {/* Description */}
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
          
        />

        {/* Category */}
        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          type="text"
          value={formData.category}
          onChange={handleChange}
          
        />

        {/* Priority */}
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        {/* Status */}
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Due Date */}
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          
        />

        <button className="button button-primary" 
        type="submit">
          Add Task
        </button>
      </form>
    </section>
  )
}

export default AddTask
