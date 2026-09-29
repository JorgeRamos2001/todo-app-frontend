import type { Task } from '@/api/tasks'

export interface Column {
  id: number
  name: string
  position: number
  tasks: Task[]
}
