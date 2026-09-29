export interface Task {
  id: number
  columnId: number
  title: string
  description: string | null
  position: number
  assigneeId: number | null
  assigneeName: string | null
  createdById: number
  createdAt: string
  updatedAt: string
}
