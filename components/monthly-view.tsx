"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Check, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { Habit } from "@/types/habit"
import { cn } from "@/lib/utils"
import { getHabitStatus } from "@/lib/habit-utils"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface MonthlyViewProps {
  habits: Habit[]
  toggleHabitCompletion: (habitId: string, date: string) => void
  onDeleteHabit: (id: string) => void
  onUpdateHabit: (habit: Habit) => void
}

// Helper function to get frequency label
const getFrequencyLabel = (threshold: number): string => {
  switch (threshold) {
    case 1:
      return "Every day"
    case 2:
      return "Every 2 days"
    case 3:
      return "Every 3 days"
    case 7:
      return "Weekly"
    case 14:
      return "Bi-weekly"
    case 30:
      return "Monthly"
    default:
      return `Every ${threshold} days`
  }
}

export function MonthlyView({ habits = [], toggleHabitCompletion, onDeleteHabit, onUpdateHabit }: MonthlyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (editingHabitId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingHabitId])

  const startEditing = (habit: Habit) => {
    setEditingHabitId(habit.id)
    setEditingName(habit.name)
  }

  const saveHabitName = () => {
    if (editingHabitId) {
      const habitToUpdate = habits.find((h) => h.id === editingHabitId)
      if (habitToUpdate && editingName.trim() !== "") {
        onUpdateHabit({
          ...habitToUpdate,
          name: editingName.trim(),
        })
      }
      setEditingHabitId(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveHabitName()
    } else if (e.key === "Escape") {
      setEditingHabitId(null)
    }
  }

  const deleteHabit = (habit: Habit) => {
    setShowDeleteDialog(true)
    setSelectedHabit(habit)
  }

  const onConfirmDeleteHabit = () => {
    if (selectedHabit) {
      onDeleteHabit(selectedHabit.id)
      setShowDeleteDialog(false)
    }
  }

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const formatDateString = (date: Date) => {
    return format(date, "yyyy-MM-dd")
  }

  const isDateCompleted = (habit: Habit, date: Date) => {
    const dateStr = formatDateString(date)
    return habit.completedDates.includes(dateStr)
  }

  const getStatusClass = (habit: Habit, date: Date) => {
    const status = getHabitStatus(habit, date)

    if (isDateCompleted(habit, date)) {
      return `bg-${habit.color}-100 border-${habit.color}-500 border-2`
    }

    switch (status) {
      case "on-track":
        return "bg-green-50"
      case "at-risk":
        return "bg-yellow-50"
      case "missed":
        return "bg-red-50"
      default:
        return ""
    }
  }

  // Group habits by frequency (threshold)
  const groupedHabits = habits.reduce<Record<number, Habit[]>>((acc, habit) => {
    const threshold = habit.threshold
    if (!acc[threshold]) {
      acc[threshold] = []
    }
    acc[threshold].push(habit)
    return acc
  }, {})

  // Sort thresholds in ascending order
  const sortedThresholds = Object.keys(groupedHabits)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <Card>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This habit <em>{selectedHabit?.name}</em> and its history cannot be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDeleteHabit} className="cursor-pointer">
              Delete Habit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          {sortedThresholds.map((threshold) => (
            <div key={threshold} className="mb-8">
              <h3 className="text-lg font-semibold mb-2">{getFrequencyLabel(threshold)}</h3>
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="text-left p-2 font-medium text-sm w-[200px]">Habit</th>
                    {monthDays.map((day) => (
                      <th key={day.toString()} className="text-center p-1 font-medium text-xs">
                        <div className="flex flex-col items-center">
                          <span>{format(day, "EEE")}</span>
                          <span>{format(day, "d")}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupedHabits[threshold].map((habit) => (
                    <tr key={habit.id} className="border-t">
                      <td className="p-2 font-medium">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-grow">
                            <div className={`w-3 h-3 rounded-full bg-${habit.color}-500 mr-2 flex-shrink-0`} />
                            {editingHabitId === habit.id ? (
                              <Input
                                ref={inputRef}
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={saveHabitName}
                                onKeyDown={handleKeyDown}
                                className="h-8 py-1 px-2 text-sm"
                              />
                            ) : (
                              <span
                                className="truncate cursor-pointer hover:text-primary transition-colors"
                                onDoubleClick={() => startEditing(habit)}
                                title="Double-click to edit"
                              >
                                {habit.name}
                              </span>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEditing(habit)} className="cursor-pointer">
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => deleteHabit(habit)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                      {monthDays.map((day) => (
                        <td key={day.toString()} className="p-1 text-center">
                          <button
                            onClick={() => toggleHabitCompletion(habit.id, formatDateString(day))}
                            className={cn(
                              "w-8 h-8 rounded-md mx-auto flex items-center justify-center",
                              getStatusClass(habit, day),
                              "hover:bg-muted transition-colors",
                            )}
                          >
                            {isDateCompleted(habit, day) && <Check className={`h-4 w-4 text-${habit.color}-500`} />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-50 border border-muted mr-2"></div>
            <span>On Track</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-50 border border-muted mr-2"></div>
            <span>At Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-50 border border-muted mr-2"></div>
            <span>Missed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

