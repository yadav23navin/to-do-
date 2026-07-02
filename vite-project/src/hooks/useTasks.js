//this is custom hook, it reads data from TasksContext and returns it. 
import { useContext } from 'react'
import { TasksContext } from './tasksContext.js'

export function useTasks() {                    // custom hook, it make it easy for any component to access the task data stored in TasksContext.
  const context = useContext(TasksContext)      // it will read the current context value from TasksContext. The useContext hook allows components to subscribe to context changes, so when the context value updates, the component will re-render with the new data.  

  if (!context) {                               // thows error if component is not wrapped inside the TasksProvider. This ensures that the useTasks hook is only used within the appropriate context, preventing potential bugs and ensuring that the necessary data is available for the component to function correctly. 
    throw new Error('useTasks must be used inside TasksProvider')
  }

  return context
}
