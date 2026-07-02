import { useMemo, useState } from 'react'
import initialTasks from '../data/tasks.json'       //importing the json data from the tasks.json file. This data serves as the initial state for the tasks in the application, providing a predefined set of tasks that can be displayed and managed within the app.
import { TasksContext } from './tasksContext.js'

function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(initialTasks)   
  const [search, setSearch] = useState('')                         // import json data and set it as the initial state for tasks. The useState hook is used to manage the state of tasks, allowing for dynamic updates and re-rendering of components that consume this context.  
  const value = useMemo(() => {

    {/*when addTask(formData) calls below function runs*/}
    const addTask = (newTask) => {
      setTasks((currentTasks) => [
        ...currentTasks,
        {
          ...newTask,
          id: currentTasks.length + 1,
        },
      ])
    }

    const toggleStatus = (id) => {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id ? { ...task, status: 'Completed' } : task
        )
      )
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

    return {                                                                  // this is the context valu any components can acess this value by using useContext hook. The value object contains the current state of tasks, a function to update the tasks, and filtered lists of total, pending, and completed tasks. This allows any component that consumes this context to access and manipulate the task data as needed.
      tasks,
      setTasks,                                                                    
      totalTasks: tasks,                               // // function to update the tasks state,
      pendingTasks,
      completedTasks,
      search,
      setSearch,
      addTask,
      toggleStatus,

      filteredTasks,
      filteredPendingTasks,
      filteredCompletedTasks,
      
    }
  }, [tasks, search])                                                                  // this stores the value object in memory and only recalculates it when the tasks state changes. This optimization prevents unnecessary re-renders of components that consume this context, improving performance.

  return (
    <TasksContext.Provider value={value}>                                        {/*this provides all value or data to the children so all will share same data*/}
      {children}
    </TasksContext.Provider>
  )
}

export default TasksProvider
