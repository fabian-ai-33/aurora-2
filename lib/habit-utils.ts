import type { Habit } from "@/types/habit"
import { differenceInDays, parseISO, startOfDay } from "date-fns"

type HabitStatus = "on-track" | "at-risk" | "missed" | "future"

export function getHabitStatus(habit: Habit, date: Date): HabitStatus {
  const today = startOfDay(new Date())
  const targetDate = startOfDay(date)

  // If the date is in the future, return "future"
  if (differenceInDays(targetDate, today) > 0) {
    return "future"
  }

  // If the habit was completed on this date, it's on track
  const dateStr = date.toISOString().split("T")[0]
  if (habit.completedDates.includes(dateStr)) {
    return "on-track"
  }

  // Find the most recent completion date before the target date
  const completedDatesBeforeTarget = habit.completedDates
    .filter((d) => differenceInDays(targetDate, parseISO(d)) >= 0)
    .map((d) => parseISO(d))
    .sort((a, b) => b.getTime() - a.getTime())

  const mostRecentCompletion = completedDatesBeforeTarget[0]

  // If no previous completions, check against the threshold
  if (!mostRecentCompletion) {
    // If the habit should have been done by now based on threshold
    if (differenceInDays(today, targetDate) > habit.threshold) {
      return "missed"
    }
    // Otherwise it's at risk
    return "at-risk"
  }

  // Calculate days since last completion
  const daysSinceCompletion = differenceInDays(targetDate, mostRecentCompletion)

  // If days since completion exceeds threshold, it's missed
  if (daysSinceCompletion > habit.threshold) {
    return "missed"
  }

  // If days since completion is close to threshold (within 20%), it's at risk
  if (daysSinceCompletion > habit.threshold * 0.8) {
    return "at-risk"
  }

  // Otherwise it's on track
  return "on-track"
}

