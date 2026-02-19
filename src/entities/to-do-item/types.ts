export interface ToDoItemPayload {
  text: string
  completed: boolean
  description: string
}

export interface ToDoItem extends ToDoItemPayload {
  id: string
}
