export interface SubtaskCreateDto {
  text: string
  completed: boolean
  task_id: string
}

export interface Subtask extends SubtaskCreateDto {
  id: string
}
