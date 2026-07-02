import { createContext } from 'react'

// This context is the shared place where task data will be stored.
// TasksProvider puts data inside it, and useTasks reads data from it.
export const TasksContext = createContext(null)
