"use client"

import { useState, useEffect } from "react"
import type { Habit } from "@/types/habit"

import { MonthlyView } from "@/components/monthly-view"
import { CreateHabitButton } from "@/components/create-habit-button"

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    // Load habits from localStorage if available
    if (typeof window !== "undefined") {
      const savedHabits = localStorage.getItem("habits")
      return savedHabits ? JSON.parse(savedHabits) : []
    }
    return []
  })

  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
  }, [habits])

  const addHabit = (habit: Habit) => {
    setHabits([...habits, habit])
  }

  const updateHabit = (updatedHabit: Habit) => {
    setHabits(habits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)))
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id))
    if (selectedHabit?.id === id) {
      setSelectedHabit(null)
    }
  }

  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          const completedDates = habit.completedDates || []
          const dateIndex = completedDates.indexOf(date)

          if (dateIndex === -1) {
            // Add date if not already completed
            return {
              ...habit,
              completedDates: [...completedDates, date],
            }
          } else {
            // Remove date if already completed
            return {
              ...habit,
              completedDates: completedDates.filter((d) => d !== date),
            }
          }
        }
        return habit
      }),
    )
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Habit Tracker</h1>
      <div className="space-y-6">
        {habits.length == 0 ?
          <div className="flex flex-col items-center justify-center px-4 py-12">
            <div className="mx-auto max-w-md space-y-4 text-center">
              <div className="flex items-center justify-center">
                {/* <BanIcon className="h-16 w-16 text-red-500" /> */}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">No Habits Added</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Get started by adding a new habit to track your progress.
              </p>

              <CreateHabitButton
                onAddHabit={addHabit}
                habits={habits}
              />
            </div>
          </div>
          :
          <>
            <CreateHabitButton
              onAddHabit={addHabit}
              habits={habits}
            />
            <MonthlyView
              habits={habits}
              toggleHabitCompletion={toggleHabitCompletion}
              onDeleteHabit={deleteHabit}
              onUpdateHabit={updateHabit}
            />
          </>
        }
      </div>
    </main>
  )
}

