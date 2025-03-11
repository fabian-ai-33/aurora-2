export interface Habit {
    id: string
    name: string
    threshold: number // Number of days between expected completions
    color: string
    completedDates: string[] // Array of dates in format "YYYY-MM-DD"
    createdAt: Date
  }
  
  