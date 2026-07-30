import { useEffect, useMemo, useState } from 'react'
import { TasksContext } from './tasksContext.js'
import { useToast } from '../hooks/useToast.js'

const API_URL = 'http://localhost:5000/api/tasks'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Called whenever any task request comes back with a 401 — meaning the
// token is missing, expired, or invalid. This does NOT delete any task
// data (tasks.json on the server is completely untouched); it only clears
// the stale login session on this device and sends the user back to the
// login page so they can prove who they are again.
function handleSessionExpired(toast) {
  localStorage.removeItem('token')
  localStorage.removeItem('currentUser')
  toast.error('Your session has expired. Please log in again.')
  // Full page redirect (not React Router navigate) since this can be
  // triggered from anywhere, including outside a component's render path.
  window.location.href = '/login'
}

function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(API_URL, {
          headers: getAuthHeaders(),
        })

        if (res.status === 401) {
          handleSessionExpired(toast)
          return
        }
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`)

        const data = await res.json()
        setTasks(data)
      } catch (err) {
        setError(err.message)
        toast.error('Could not load tasks. Is the server running?')
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => {
    const addTask = async (newTask) => {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newTask),
        })

        if (res.status === 401) {
          handleSessionExpired(toast)
          return
        }

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody.message || `Failed to add task (status ${res.status})`)
        }

        const createdTask = await res.json()
        setTasks((currentTasks) => [...currentTasks, createdTask])
        toast.success('Task added')
        return createdTask
      } catch (err) {
        setError(err.message)
        toast.error(err.message)
        throw err
      }
    }

    const updateTask = async (id, updatedFields) => {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updatedFields),
        })

        if (res.status === 401) {
          handleSessionExpired(toast)
          return
        }

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody.message || `Failed to update task (status ${res.status})`)
        }

        const updatedTask = await res.json()
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === id ? updatedTask : task))
        )
        toast.success('Task updated')
        return updatedTask
      } catch (err) {
        setError(err.message)
        toast.error(err.message)
        throw err
      }
    }

    const toggleStatus = async (id) => {
      return updateTask(id, { status: 'Completed' })
    }

    const deleteTask = async (id) => {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        })

        if (res.status === 401) {
          handleSessionExpired(toast)
          return
        }

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody.message || `Failed to delete task (status ${res.status})`)
        }

        setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id))
        toast.success('Task deleted')
      } catch (err) {
        setError(err.message)
        toast.error(err.message)
        throw err
      }
    }

    const completedTasks = tasks.filter((task) => task.status === 'Completed')
    const pendingTasks = tasks.filter((task) => task.status !== 'Completed')
    const searchText = search.toLowerCase().trim()

    const filterTasks = (taskList) => taskList.filter((task) =>
      `${task.title} ${task.description} ${task.category} ${task.priority} ${task.status} ${task.dueDate}`
        .toLowerCase()
        .includes(searchText)
    )

    const filteredTasks = filterTasks(tasks)
    const filteredPendingTasks = filterTasks(pendingTasks)
    const filteredCompletedTasks = filterTasks(completedTasks)

    return {
      tasks,
      setTasks,
      totalTasks: tasks,
      pendingTasks,
      completedTasks,
      search,
      setSearch,
      loading,
      error,
      addTask,
      updateTask,
      toggleStatus,
      deleteTask,

      filteredTasks,
      filteredPendingTasks,
      filteredCompletedTasks,
    }
  }, [tasks, search, loading, error, toast])

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  )
}

export default TasksProvider