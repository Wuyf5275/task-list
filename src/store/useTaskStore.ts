import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Task {
  id: string
  title: string
  assignee: string
  progress: number
  deadline: string
  notes: string
  isCompleted: boolean
}

interface TaskState {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  reorderTasks: (reorderedIncomplete: Task[]) => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => {
      // Helper to enforce incomplete first, complete last
      const enforceOrder = (tasks: Task[]) => {
        const incomplete = tasks.filter(t => !t.isCompleted)
        const complete = tasks.filter(t => t.isCompleted)
        return [...incomplete, ...complete]
      }

      return {
        tasks: [],
        addTask: (task) =>
          set((state) => ({
            tasks: enforceOrder([
              { ...task, id: crypto.randomUUID(), isCompleted: task.progress === 100 },
              ...state.tasks,
            ]),
          })),
        updateTask: (id, updatedTask) =>
          set((state) => {
            const newTasks = state.tasks.map((task) => {
              if (task.id === id) {
                const newTask = { ...task, ...updatedTask }
                if (updatedTask.progress !== undefined) {
                  if (updatedTask.progress === 100) newTask.isCompleted = true
                  else if (task.progress === 100 && updatedTask.progress < 100) newTask.isCompleted = false
                }
                return newTask
              }
              return task
            })
            return { tasks: enforceOrder(newTasks) }
          }),
        deleteTask: (id) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          })),
        toggleTask: (id) =>
          set((state) => {
            const newTasks = state.tasks.map((task) => {
              if (task.id === id) {
                const newCompleted = !task.isCompleted
                return { 
                  ...task, 
                  isCompleted: newCompleted,
                  progress: newCompleted ? 100 : (task.progress === 100 ? 0 : task.progress)
                }
              }
              return task
            })
            return { tasks: enforceOrder(newTasks) }
          }),
        reorderTasks: (newOrder) =>
          set(() => ({
            tasks: enforceOrder(newOrder)
          })),
      }
    },
    {
      name: 'widget-task-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
